"use server"

import { z } from 'zod';
import { decode } from "@googlemaps/polyline-codec";

import pool from '@/db/db'

const URL: string = process.env.MAPS_API_URL!
const API_KEY: string = process.env.MAPS_API_KEY!
// const WEATHER_API: string = process.env.WEATHER_API_URL!

const WEATHER_API: string =
  "https://api.open-meteo.com/v1/forecast?current=temperature_2m,apparent_temperature&forecast_days=1"

const locationSchema = z.object({
  origin: z.string().refine(data => {
    const regex = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
    return regex.test(data);
  }, {
    message: "Origin must be two comma-separated floats with an optional space."
  }),
  destiny: z.string().refine(data => {
    const regex = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
    return regex.test(data);
  }),
});

type Opts = {
  coordinates: [number, number][];
  units: string
  elevation?: string;
  options?: {
    avoid_features?: string[];
  };
  preference?: string;
};

export async function getWeather({ lat, lng }: any) {
  try {
    const URL = WEATHER_API + '&' + new URLSearchParams({
      latitude: lat,
      longitude: lng
    }).toString()

    const response = await fetch(URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    })
    if (!response.ok) {
      console.error(response.statusText)
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const json = await response.json()

    return Math.floor(json?.current?.temperature_2m) || 32
  } catch (e: any) {
    console.error('Error during fetch:', e.message);
    return 32
  }
}

export async function getRoute({ org, des, ...rest }: any) {
  const result = locationSchema.safeParse({ origin: org, destiny: des })
  if (!result.success) {
    console.error("invalid points")
    return
  }

  try {
    const [orgLat, orgLng] = org.split(',').map(parseFloat);
    const [desLat, desLng] = des.split(',').map(parseFloat);

    const opts: Opts = { coordinates: [[orgLng, orgLat], [desLng, desLat]], units: "km" }
    if (rest.pref) {
      opts.preference = rest.pref;
    }
    if (rest.avo !== 'highways') {
      opts.options = opts.options || {};
      opts.options.avoid_features = ["highways"];
    }

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Authorization': API_KEY
      },
      body: JSON.stringify(opts)
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const json = await response.json()
    const decodedRoute = decode(json.routes[0].geometry)
    json.decodedRoute = decodedRoute
    json.summary = json.routes[0].summary
    json.summary.road = rest.avo === "highways" ? "highways" : "average"
    json.origin = [json.metadata.query.coordinates[0][1], json.metadata.query.coordinates[0][0]]
    json.destiny = [json.metadata.query.coordinates[1][1], json.metadata.query.coordinates[1][0]]

    return json
  } catch (e: any) {
    console.error('Error during fetch:', e.message);
    return { error: e.message }
  }
}

const vehicleFuelCostSchema = z.object({
  weight: z.coerce.number().min(0),
  distance: z.coerce.number(),
  roadType: z.string(),
  vehicleType: z.enum(["all", "electric", "gas", "gasoline"]),
  fuelType: z.string(),
  temperature: z.number(),
  priority: z.string().optional(),
});

async function getVehicles(weight: number, roadType: string, vehicleType: string) {
  const query = `
    SELECT
      v.id,
      vt.name AS vehicle_type,
      vc.name AS category,
      vb.name AS brand,
      v.max_load_capacity,
      v.security_score,
      v.model,
      ve.efficiency_value AS fuel_efficiency
    FROM vehicle v
    JOIN vehicle_type vt ON v.vehicle_type_id = vt.id
    JOIN vehicle_category vc ON v.category_id = vc.id
    JOIN vehicle_brand vb ON v.brand_id = vb.id
    JOIN vehicle_efficiency ve ON v.id = ve.vehicle_id
    JOIN fuel_efficiency fe ON ve.efficiency_id = fe.id
    WHERE v.max_load_capacity >= $1
      AND fe.name = $2
      AND ($3 = 'all' OR vt.name = $3);
  `;
  const result = await pool.query(query, [weight, roadType, vehicleType]);
  return result.rows;
}

async function getEfficiencyAdjustment(weight: number, temperature: number) {
  const weightRangeQuery = await pool.query(`
      SELECT efficiency_adjustment
      FROM weight_range
      WHERE min_weight <= $1 AND max_weight >= $1
      `, [weight]);
  const weightAdjustment = +weightRangeQuery.rows[0]?.efficiency_adjustment || 0;

  const temperatureRangeQuery = await pool.query(`
      SELECT efficiency_adjustment
      FROM temperature_range
      WHERE min_temperature <= $1 AND max_temperature >= $1
      `, [temperature]);
  const temperatureAdjustment = +temperatureRangeQuery.rows[0]?.efficiency_adjustment || 0;

  return weightAdjustment + temperatureAdjustment
}

export async function getVehiclesWithFuelCost(params: z.infer<typeof vehicleFuelCostSchema>) {
  try {
    const result = vehicleFuelCostSchema.safeParse(params)
    if (!result.success) return;

    let { weight, distance, roadType, vehicleType, fuelType, temperature, priority } = result.data

    // Search for vehicles in the database
    const vehicleQuery = await getVehicles(weight, roadType, vehicleType);

    const fuelPriceQuery = await pool.query(`
      SELECT price
      FROM fuel_price
      WHERE fuel_type = $1
      ORDER BY validity_date DESC
      LIMIT 1
      `, [fuelType]);

    const efficiencyAdjustment = await getEfficiencyAdjustment(weight, temperature)

    // Reduce the MPG based on efficiency adjustment for the road type
    const vehicles = vehicleQuery.map(vehicle => {

      // Get the original efficiency
      const originalEfficiency = vehicle.fuel_efficiency;

      // If there is a matching weight range, apply the adjustment
      const adjustedEfficiency = originalEfficiency * (1 - efficiencyAdjustment / 100);


      // Calculate fuel cost
      const fuelCost = (distance / adjustedEfficiency) * fuelPriceQuery.rows[0]?.price || 0;

      return {
        id: vehicle.id,
        vehicle_type: vehicle.vehicle_type,
        category: vehicle.category,
        brand: vehicle.brand,
        max_load_capacity: vehicle.max_load_capacity,
        security_score: vehicle.security_score,
        model: vehicle.model,
        fuel_efficiency: adjustedEfficiency.toFixed(4),
        fuel_cost: fuelCost.toFixed(4),
        efficiency_type: roadType,
      };
    });

    switch (priority) {
      case 'security':
        vehicles.sort((a, b) => b.security_score - a.security_score);
        break;
      case 'efficiency':
        vehicles.sort((a, b) => parseFloat(b.fuel_efficiency) - parseFloat(a.fuel_efficiency));
        break;
      default:
        vehicles.sort((a, b) => parseFloat(a.fuel_cost) - parseFloat(b.fuel_cost));
        break;
    }

    return vehicles;
  } catch (error) {
    console.error('Error calculating vehicle fuel cost:', error);
    throw error;
  }
}
