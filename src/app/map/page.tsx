import { z } from 'zod';
import dynamic from 'next/dynamic'
import { decode } from "@googlemaps/polyline-codec";

import { Skeleton } from "@/components/ui/skeleton"
import MapForm from "@/components/map-form"

import { DataTable } from './data-table'
import { Vehicle, columns } from './columns'

import pool from '@/db/db'

const URL: string = process.env.MAPS_API_URL!
const API_KEY: string = process.env.MAPS_API_KEY!

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

async function getRoute({ org, des, ...rest }: any) {
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
});

async function getVehiclesWithFuelCost(params: z.infer<typeof vehicleFuelCostSchema>) {
  try {
    const result = vehicleFuelCostSchema.safeParse(params)
    if (!result.success) return;

    const { weight, distance, roadType, vehicleType } = result.data

    // Step 1: Search for vehicles in the database
    const vehicleQuery = await pool.query(`
      SELECT
        v.id,
        vt.name AS vehicle_type,
        vc.name AS category,
        vb.name AS brand,
        v.max_load_capacity,
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
    `, [weight, roadType, vehicleType]);

    const fuelPriceQuery = await pool.query(`
      SELECT price
      FROM fuel_price
      WHERE fuel_type = 'Gasolina Premium'
      ORDER BY validity_date DESC
      LIMIT 1
    `);

    // Step 2: Reduce the MPG based on efficiency adjustment for the road type
    const vehicles = await Promise.all(vehicleQuery.rows.map(async vehicle => {

      // Get the original efficiency value from the database
      const originalEfficiency = vehicle.fuel_efficiency;

      // Step 3: Check if the weight falls within any weight range
      const weightRangeQuery = await pool.query(`
        SELECT efficiency_adjustment
        FROM weight_range
        WHERE min_weight <= $1 AND max_weight >= $1
      `, [weight]);

      // If there is a matching weight range, apply the adjustment
      const efficiencyAdjustment = weightRangeQuery.rows[0]?.efficiency_adjustment || 0;
      const adjustedEfficiency = originalEfficiency * (1 - efficiencyAdjustment / 100);

      // Calculate fuel cost
      const fuelCost = (distance / adjustedEfficiency) * fuelPriceQuery.rows[0]?.price || 0;

      return {
        id: vehicle.id,
        vehicle_type: vehicle.vehicle_type,
        category: vehicle.category,
        brand: vehicle.brand,
        max_load_capacity: vehicle.max_load_capacity,
        model: vehicle.model,
        fuel_efficiency: adjustedEfficiency.toFixed(4),
        fuel_cost: fuelCost.toFixed(4),
        efficiency_type: roadType,
      };
    }));

    return vehicles;
  } catch (error) {
    console.error('Error calculating vehicle fuel cost:', error);
    throw error;
  } finally {
    // Handle connection management if needed
  }
}

async function Page({ searchParams }: any) {
  let route
  let data: Vehicle[] = []

  const Map = dynamic(
    () => import('@/components/map'), // replace '@components/map' with your component's location
    {
      loading: () => <Skeleton className="relative h-[60dvh] w-1/2" />,
      ssr: false,
    } // This line is important. It's what prevents server-side render
  )

  if (searchParams.org && searchParams.des) {
    route = await getRoute(searchParams).catch(e => e);
  }

  if (searchParams.w && searchParams.vt && route?.summary) {
    //@ts-ignore
    data = await getVehiclesWithFuelCost(
      {
        weight: searchParams.w,
        distance: route?.summary.distance,
        roadType: route.summary.road,
        vehicleType: searchParams.vt
      }
    )
  }

  return (
    <div>
      <section className='flex gap-2 flex-col sm:flex-row'>
        <div className='sm:w-1/2'>
          <MapForm />
        </div>
        <Map route={route} />
      </section>

      <div className="mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Page;

