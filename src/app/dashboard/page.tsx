import { Metadata } from "next"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Overview } from "./components/overview"
import { RecentSales } from "./components/recent-trips"
import { Statistics } from "./components/statistics"

import pool from "@/db/db"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Este es el Dashboard donde se ven los datos recietes de la app",
}

export default async function DashboardPage() {
  const test = await getTripsData()

  return (
    <>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </div>
          <div className="space-y-4">
            <Statistics />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Gastos</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview data={test} />
                </CardContent>
              </Card>
              <RecentSales />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

async function getTripsData() {
  try {
    const tripsQuery = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('MONTH', departure_date), 'Mon') AS month,
        SUM(approximate_cost) AS total
      FROM trip
      WHERE EXTRACT(YEAR FROM departure_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY month
      ORDER BY MIN(departure_date);
    `);

    return (tripsQuery.rows) || [];
  } catch (error) {
    console.error("Error fetching trip data:", error);
  }
}
