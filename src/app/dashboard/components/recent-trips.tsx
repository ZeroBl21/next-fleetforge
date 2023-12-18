import { format, startOfMonth, endOfMonth } from 'date-fns';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import pool from '@/db/db';

export async function RecentSales() {
  const top10 = await getLast10Trips()
  const trips = await countTripsThisMonth()

  return (
    <Card className="flex flex-col md:block col-span-3 lg:max-h-[50vh] overflow-auto">
      <CardHeader>
        <CardTitle>Viajes Recientes</CardTitle>
        <CardDescription>
          has hecho {trips} viajes este mes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {top10.map((sale) => (
            <RecentSaleItem
              key={sale.id} // Assuming each sale has a unique identifier
              vehicleName={sale.vehicle_name}
              state={sale.state_name}
              weight={sale.weight}
              departureDate={sale.departure_date}
              approximatedCost={sale.approximate_cost}
            />
          ))}
        </div >
      </CardContent>
    </Card>
  )
}

function RecentSaleItem({ vehicleName, approximatedCost, state, weight, departureDate }: any) {
  return (
    <div className="flex items-center">
      <Avatar className="h-9 w-9">
        <AvatarImage src="/truck.png" className='invert' alt="Avatar" />
        <AvatarFallback>IN</AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-md font-medium leading-none">{vehicleName}</p>
        <div className='flex gap-2'>
          <p className="text-sm text-muted-foreground">{`Weight: ${weight} lbs`}</p>
          <p className="text-sm text-muted-foreground">{`State: ${state}`}</p>
        </div>
        <p className="text-sm text-muted-foreground">{`Departure Date: ${format(departureDate, "LLL dd, y")}`}</p>
      </div>
      <div className="ml-auto font-medium">{`+${approximatedCost}`}</div>
    </div>
  );
};

// Function to get the 10 last trips
async function getLast10Trips() {
  try {
    const last10TripsQuery = await pool.query(`
      SELECT
        t.id,
        t.departure_date,
        t.arrival_date,
        ts.name AS state_name, -- Added state name
        t.approximate_cost,
        t.final_cost,
        v.model AS vehicle_name, -- Added vehicle name
        t.route_id,
        t.temperature,
        t.weight
      FROM trip t
      JOIN trip_state ts ON t.state_id = ts.id -- Join with trip_state to get state name
      JOIN vehicle v ON t.vehicle_id = v.id -- Join with vehicle to get vehicle name
      ORDER BY t.departure_date DESC
      LIMIT 10;
    `);

    const last10Trips = last10TripsQuery.rows;

    return last10Trips;
  } catch (error) {
    console.error('Error fetching last 10 trips:', error);
    throw error;
  }
}

// Function to count trips in the current month
async function countTripsThisMonth() {
  try {
    // Get the start and end dates of the current month
    const currentDate = new Date();
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);

    const countTripsQuery = await pool.query(`
      SELECT COUNT(*) AS trip_count
      FROM trip
      WHERE departure_date >= $1 AND departure_date <= $2;
    `, [startDate, endDate]);

    const tripCount = countTripsQuery.rows[0]?.trip_count || 0;

    return tripCount;
  } catch (error) {
    console.error('Error counting trips this month:', error);
    throw error;
  }
}


