import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import pool from "@/db/db";

export async function Statistics() {
  const expenses = await getLastMonthTripCostAndDifference()
  const trips = await getCountAndDifference()
  const weight = await getLastTransportedWeightAndDifference()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <InfoCard
        title="Gasto Aproximado"
        amount={`+${expenses.currentMonthTotalCost}`}
        percentageChange={`${expenses.costPercentageDifference}% desde el mes pasado`}
      />
      <InfoCard
        title="Subscriptions"
        amount="+2350"
        percentageChange="+180.1% desde el mes pasado"
      />
      <InfoCard
        title="Peso Transportado"
        amount={`+${weight.currentMonthTotalWeight}`}
        percentageChange={`${weight.weightPercentageDifference}% desde el mes pasado`}
      />
      <InfoCard
        title="Viajes En Progreso"
        amount={trips.currentMonthCount}
        percentageChange={`${trips.percentageDifference}% desde el mes pasado`}
      />
    </div>
  )
}

function InfoCard({ title, amount, percentageChange }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{amount}</div>
        <p className="text-xs text-muted-foreground">{percentageChange}</p>
      </CardContent>
    </Card>
  );
};

function calculatePercentageDifference(previousValue: number, currentValue: number) {
  if (+previousValue === 0) {
    previousValue = 1
  }

  return (((currentValue - previousValue) / previousValue) * 100).toFixed(2);
}

async function getLastMonthTripCostAndDifference() {
  try {
    // Get last month's total approximate_cost
    const lastMonthTotalCostQuery = await pool.query(`
      SELECT SUM(approximate_cost) AS total_cost
      FROM trip
      WHERE EXTRACT(MONTH FROM departure_date) = EXTRACT(MONTH FROM CURRENT_DATE) - 1
        AND EXTRACT(YEAR FROM departure_date) = EXTRACT(YEAR FROM CURRENT_DATE);
    `);
    const lastMonthTotalCost = lastMonthTotalCostQuery.rows[0]?.total_cost || 0;

    // Get current month's total approximate_cost
    const currentMonthTotalCostQuery = await pool.query(`
      SELECT SUM(approximate_cost) AS total_cost
      FROM trip
      WHERE EXTRACT(MONTH FROM departure_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM departure_date) = EXTRACT(YEAR FROM CURRENT_DATE);
    `);
    const currentMonthTotalCost = currentMonthTotalCostQuery.rows[0]?.total_cost || 0;

    // Calculate the percentage difference
    const costPercentageDifference = calculatePercentageDifference(
      lastMonthTotalCost,
      currentMonthTotalCost
    );

    return {
      lastMonthTotalCost,
      currentMonthTotalCost,
      costPercentageDifference,
    };
  } catch (error) {
    console.error('Error retrieving last month trip cost:', error);
    throw error;
  }
}

async function getCountAndDifference() {
  try {
    // Get the count of trips for the current month
    const currentMonthQuery = await pool.query(`
      SELECT COUNT(*) AS count
      FROM trip
      WHERE EXTRACT(YEAR FROM departure_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM departure_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND state_id NOT IN (SELECT id FROM trip_state WHERE name IN ('Cancelled', 'Accident'));
    `);

    const currentMonthCount = currentMonthQuery.rows[0]?.count || 0;

    // Get the count of trips for the previous month
    const previousMonthQuery = await pool.query(`
      SELECT COUNT(*) AS count
      FROM trip
      WHERE EXTRACT(YEAR FROM departure_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM departure_date) = EXTRACT(MONTH FROM CURRENT_DATE) - 1
        AND state_id NOT IN (SELECT id FROM trip_state WHERE name IN ('Cancelled', 'Accident'));
    `);

    const previousMonthCount = previousMonthQuery.rows[0]?.count || 0;

    // Calculate the percentage difference
    const percentageDifference = calculatePercentageDifference(previousMonthCount, currentMonthCount);

    return {
      currentMonthCount,
      previousMonthCount,
      percentageDifference,
    };
  } catch (error) {
    console.error('Error fetching trips count:', error);
    throw error;
  }
}

async function getLastTransportedWeightAndDifference() {
  try {
    // Get the total transported weight for the current month
    const currentMonthTotalWeightQuery = await pool.query(`
      SELECT SUM(weight) AS total_weight
      FROM trip
      WHERE EXTRACT(MONTH FROM departure_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM departure_date) = EXTRACT(YEAR FROM CURRENT_DATE);
    `);
    const currentMonthTotalWeight = currentMonthTotalWeightQuery.rows[0]?.total_weight || 0;

    // Get the total transported weight for the last month
    const lastMonthTotalWeightQuery = await pool.query(`
      SELECT SUM(weight) AS total_weight
      FROM trip
      WHERE EXTRACT(MONTH FROM departure_date) = EXTRACT(MONTH FROM CURRENT_DATE) - 1
        AND EXTRACT(YEAR FROM departure_date) = EXTRACT(YEAR FROM CURRENT_DATE);
    `);
    const lastMonthTotalWeight = lastMonthTotalWeightQuery.rows[0]?.total_weight || 0;

    // Calculate the percentage difference
    const weightPercentageDifference = calculatePercentageDifference(
      lastMonthTotalWeight,
      currentMonthTotalWeight
    );

    return {
      currentMonthTotalWeight,
      lastMonthTotalWeight,
      weightPercentageDifference,
    };
  } catch (error) {
    console.error('Error retrieving last transported weight:', error);
    throw error;
  }
}
