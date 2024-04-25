import fs from "node:fs"
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import pkg from 'pg';

const { Pool } = pkg

const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: 'santana',
  password: '',
  port: +process.env.DB_PORT,
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlFilePath = './sql/create.sql';
const createSqlPath = join(__dirname, sqlFilePath)

async function setDB() {
  const client = await pool.connect();

  try {
    const sqlQuery = fs.readFileSync(createSqlPath, 'utf8');

    await client.query('BEGIN');

    client.query(sqlQuery)

    await client.query('COMMIT');
  } catch (e) {
    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');
    console.error("Error creating the tables", e);
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

// Reusable function to seed a table
async function seedTable(tableName, data) {
  const client = await pool.connect();
  try {
    // Start a transaction
    await client.query('BEGIN');

    // Truncate the table to clear existing data
    await client.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);

    // Insert new data into the table
    const columns = Object.keys(data[0]);
    const values = data.map(row => {
      return `(${columns.map(column => {
        const value = row[column];
        return value === null ? 'NULL' : `'${value}'`;
      }).join(', ')})`;
    }).join(', ');

    const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${values};`;

    await client.query(insertQuery);

    // Commit the transaction
    await client.query('COMMIT');

    console.log(`Table ${tableName} seeded successfully.`);
  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');
    console.error(`Error seeding table ${tableName}:`, error);
  } finally {
    // Release the client back to the pool
    client.release();
  }
}


const vehicleCategoryData = [
  { id: 1, name: 'Categoría 1', description: 'Vehículos con 2 ejes' },
  { id: 2, name: 'Categoría 2', description: 'Vehículos con 2 ejes más mellizas' },
  { id: 3, name: 'Categoría 3', description: 'Vehículos con 3 y 4 ejes' },
  { id: 4, name: 'Categoría 4', description: 'Vehículos con 5 y 6 ejes' },
  { id: 5, name: 'Categoría 5', description: 'Vehículos con 7 ejes o más' },
];

const vehicleBrandData = [
  { id: 1, name: 'Toyota' },
  { id: 2, name: 'Ford' },
  { id: 3, name: 'Chevrolet' },
  { id: 4, name: 'Honda' },
  { id: 5, name: 'Volkswagen' },
  { id: 6, name: 'Nissan' },
  { id: 7, name: 'Mercedes-Benz' },
  { id: 8, name: 'BMW' },
  { id: 9, name: 'Audi' },
  { id: 10, name: 'Hyundai' },
];

const vehicleTypeData = [
  { id: 1, name: 'electric' },
  { id: 2, name: 'gas' },
  { id: 3, name: 'gasoline' },
];

const fuelEfficiencyData = [
  { id: 1, name: 'city' },
  { id: 2, name: 'highways' },
  { id: 3, name: 'average' },
];

const weightRangeData = [
  { id: 1, min_weight: 0, max_weight: 1000, efficiency_adjustment: 0.00 },
  { id: 2, min_weight: 1001, max_weight: 2000, efficiency_adjustment: 2.50 },
  { id: 3, min_weight: 2001, max_weight: 3000, efficiency_adjustment: 5.00 },
  { id: 4, min_weight: 3001, max_weight: 4000, efficiency_adjustment: 7.50 },
  { id: 5, min_weight: 4001, max_weight: 5000, efficiency_adjustment: 10.00 },
  { id: 6, min_weight: 5001, max_weight: 6000, efficiency_adjustment: 12.50 },
  { id: 7, min_weight: 6001, max_weight: 7000, efficiency_adjustment: 15.00 },
  { id: 8, min_weight: 7001, max_weight: 8000, efficiency_adjustment: 17.50 },
  { id: 9, min_weight: 8001, max_weight: 9000, efficiency_adjustment: 20.00 },
  { id: 10, min_weight: 9001, max_weight: 10000, efficiency_adjustment: 22.50 },
];

const temperatureRangeData = [
  { id: 1, min_temperature: -20, max_temperature: 0, efficiency_adjustment: 0.00 },
  { id: 2, min_temperature: 1, max_temperature: 10, efficiency_adjustment: 1.50 },
  { id: 3, min_temperature: 11, max_temperature: 20, efficiency_adjustment: 3.00 },
  { id: 4, min_temperature: 21, max_temperature: 30, efficiency_adjustment: 4.50 },
  { id: 5, min_temperature: 31, max_temperature: 40, efficiency_adjustment: 6.00 },
  { id: 6, min_temperature: 41, max_temperature: 50, efficiency_adjustment: 7.50 },
  { id: 7, min_temperature: 51, max_temperature: 60, efficiency_adjustment: 9.00 },
  { id: 8, min_temperature: 61, max_temperature: 70, efficiency_adjustment: 10.50 },
  { id: 9, min_temperature: 71, max_temperature: 80, efficiency_adjustment: 12.00 },
  { id: 10, min_temperature: 81, max_temperature: 90, efficiency_adjustment: 13.50 },
];

const routeData = [
  {
    id: 1,
    origin: `POINT(0 0)`,
    destination: `POINT(1 1)`,
    date: '2023-12-17 12:00:00',
    duration: '2 hours',
    distance: '100 km',
  },
  {
    id: 2,
    origin: `POINT(2 2)`,
    destination: `POINT(3 3)`,
    date: '2023-12-18 14:00:00',
    duration: '3 hours',
    distance: '150 km',
  },
];

const tripStateData = [
  { id: 1, name: 'canceled' },
  { id: 2, name: 'finished' },
  { id: 3, name: 'in_progress' },
  { id: 4, name: 'accident' },
  { id: 5, name: 'scheduled' },
  { id: 6, name: 'delayed' },
  { id: 7, name: 'on_hold' },
  { id: 8, name: 'diverted' },
  { id: 9, name: 'completed' },
  { id: 10, name: 'pending_approval' },
];

const stateTransitionData = [
  { id: 1, initial_state_id: 1, final_state_id: 2 },  // canceled -> finished
  { id: 2, initial_state_id: 3, final_state_id: 2 },  // in_progress -> finished
  { id: 3, initial_state_id: 3, final_state_id: 4 },  // in_progress -> accident
  { id: 4, initial_state_id: 5, final_state_id: 3 },  // scheduled -> in_progress
  { id: 5, initial_state_id: 5, final_state_id: 6 },  // scheduled -> delayed
  { id: 6, initial_state_id: 5, final_state_id: 7 },  // scheduled -> on_hold
  { id: 7, initial_state_id: 6, final_state_id: 3 },  // delayed -> in_progress
  { id: 8, initial_state_id: 7, final_state_id: 3 },  // on_hold -> in_progress
  { id: 9, initial_state_id: 8, final_state_id: 3 },  // diverted -> in_progress
  { id: 10, initial_state_id: 3, final_state_id: 2 }, // in_progress -> finished
];

const tollData = [
  { id: 1, category_id: 1, average_price: 5.00, validity_date: '2023-12-31' },
  { id: 2, category_id: 2, average_price: 8.50, validity_date: '2023-12-31' },
  { id: 3, category_id: 3, average_price: 12.00, validity_date: '2023-12-31' },
  { id: 4, category_id: 4, average_price: 15.75, validity_date: '2023-12-31' },
  { id: 5, category_id: 5, average_price: 20.00, validity_date: '2023-12-31' },
];

const fuelPriceData = [
  { id: 1, fuel_type: 'Gasolina Premium', validity_date: '2023-12-17', price: 293.10, currency: 'DOP' },
  { id: 2, fuel_type: 'Gasolina Regular', validity_date: '2023-12-17', price: 274.50, currency: 'DOP' },
  { id: 3, fuel_type: 'Gasoil Optimo', validity_date: '2023-12-17', price: 239.10, currency: 'DOP' },
  { id: 4, fuel_type: 'Gasoil Regular', validity_date: '2023-12-17', price: 221.60, currency: 'DOP' },
  { id: 5, fuel_type: 'Kerosene', validity_date: '2023-12-17', price: 209.90, currency: 'DOP' },
  { id: 6, fuel_type: 'Gas Licuado (GLP)', validity_date: '2023-12-17', price: 132.60, currency: 'DOP' },
  { id: 7, fuel_type: 'Gas Natural (GNV)', validity_date: '2023-12-17', price: 43.97, currency: 'DOP' },
  { id: 8, fuel_type: 'Electricidad', validity_date: '2023-12-17', price: 35.25, currency: 'DOP' }
];

const vehicleData = [
  { id: 1, vehicle_type_id: 1, category_id: 1, brand_id: 1, max_load_capacity: 5000.00, model: 'Camry', security_score: 7 },
  { id: 2, vehicle_type_id: 2, category_id: 2, brand_id: 2, max_load_capacity: 7000.00, model: 'F-150', security_score: 4 },
  { id: 3, vehicle_type_id: 1, category_id: 1, brand_id: 3, max_load_capacity: 6000.00, model: 'Malibu', security_score: 5 },
  { id: 4, vehicle_type_id: 2, category_id: 2, brand_id: 4, max_load_capacity: 8000.00, model: 'Civic', security_score: 6 },
  { id: 5, vehicle_type_id: 1, category_id: 3, brand_id: 5, max_load_capacity: 9000.00, model: 'Jetta', security_score: 3 },
  { id: 6, vehicle_type_id: 2, category_id: 3, brand_id: 6, max_load_capacity: 10000.00, model: 'Altima', security_score: 8 },
  { id: 7, vehicle_type_id: 1, category_id: 4, brand_id: 7, max_load_capacity: 12000.00, model: 'E-Class', security_score: 9 },
  { id: 8, vehicle_type_id: 2, category_id: 4, brand_id: 8, max_load_capacity: 15000.00, model: 'X5', security_score: 2 },
  { id: 9, vehicle_type_id: 1, category_id: 5, brand_id: 9, max_load_capacity: 18000.00, model: 'A4', security_score: 10 },
  { id: 10, vehicle_type_id: 2, category_id: 5, brand_id: 10, max_load_capacity: 20000.00, model: 'Santa Fe', security_score: 1 },
  { id: 11, vehicle_type_id: 1, category_id: 1, brand_id: 1, max_load_capacity: 4800.00, model: 'Corolla', security_score: 6 },
  { id: 12, vehicle_type_id: 2, category_id: 2, brand_id: 2, max_load_capacity: 7200.00, model: 'Ranger', security_score: 4 },
  { id: 13, vehicle_type_id: 1, category_id: 1, brand_id: 3, max_load_capacity: 5600.00, model: 'Impala', security_score: 7 },
  { id: 14, vehicle_type_id: 2, category_id: 2, brand_id: 4, max_load_capacity: 7800.00, model: 'Accord', security_score: 5 },
  { id: 15, vehicle_type_id: 1, category_id: 3, brand_id: 5, max_load_capacity: 8500.00, model: 'Passat', security_score: 8 },
  { id: 16, vehicle_type_id: 2, category_id: 3, brand_id: 6, max_load_capacity: 9800.00, model: 'Maxima', security_score: 3 },
  { id: 17, vehicle_type_id: 1, category_id: 4, brand_id: 7, max_load_capacity: 11200.00, model: 'CLS', security_score: 9 },
  { id: 18, vehicle_type_id: 2, category_id: 4, brand_id: 8, max_load_capacity: 14500.00, model: 'X3', security_score: 2 },
  { id: 19, vehicle_type_id: 1, category_id: 5, brand_id: 9, max_load_capacity: 17500.00, model: 'A6', security_score: 10 },
  { id: 20, vehicle_type_id: 2, category_id: 5, brand_id: 10, max_load_capacity: 19800.00, model: 'Tucson', security_score: 1 },
  { id: 21, vehicle_type_id: 3, category_id: 3, brand_id: 5, max_load_capacity: 8500.00, model: 'Passat', security_score: 8 },
  { id: 22, vehicle_type_id: 3, category_id: 3, brand_id: 6, max_load_capacity: 9800.00, model: 'Maxima', security_score: 3 },
  { id: 23, vehicle_type_id: 3, category_id: 4, brand_id: 7, max_load_capacity: 11200.00, model: 'CLS', security_score: 9 },
  { id: 24, vehicle_type_id: 3, category_id: 4, brand_id: 8, max_load_capacity: 14500.00, model: 'X3', security_score: 2 },
  { id: 25, vehicle_type_id: 3, category_id: 5, brand_id: 9, max_load_capacity: 17500.00, model: 'A6', security_score: 10 },
  { id: 26, vehicle_type_id: 3, category_id: 5, brand_id: 10, max_load_capacity: 19800.00, model: 'Tucson', security_score: 1 }
];

// Data for electric_vehicle table
const electricVehicleData = [
  { id: 1, battery_capacity: 60.00, charging_time: 8 },
  { id: 2, battery_capacity: 75.50, charging_time: 10 },
  { id: 3, battery_capacity: 55.25, charging_time: 6 },
  { id: 4, battery_capacity: 80.00, charging_time: 12 },
  { id: 5, battery_capacity: 65.75, charging_time: 9 },
  { id: 6, battery_capacity: 70.20, charging_time: 7 },
  { id: 7, battery_capacity: 90.50, charging_time: 14 },
  { id: 8, battery_capacity: 78.80, charging_time: 11 },
  { id: 9, battery_capacity: 95.25, charging_time: 16 },
  { id: 10, battery_capacity: 85.00, charging_time: 13 },
];

const gasGasolineVehicleData = [
  { id: 11, tank_capacity: 60.00 },
  { id: 12, tank_capacity: 75.50 },
  { id: 13, tank_capacity: 55.25 },
  { id: 14, tank_capacity: 80.00 },
  { id: 15, tank_capacity: 65.75 },
  { id: 16, tank_capacity: 70.20 },
  { id: 17, tank_capacity: 90.50 },
  { id: 18, tank_capacity: 78.80 },
  { id: 19, tank_capacity: 95.25 },
  { id: 20, tank_capacity: 85.00 },
  { id: 21, tank_capacity: 72.30 },
  { id: 22, tank_capacity: 66.90 },
  { id: 23, tank_capacity: 80.10 },
  { id: 24, tank_capacity: 75.40 },
  { id: 25, tank_capacity: 88.20 },
  { id: 26, tank_capacity: 79.75 }
];

const vehicleEfficiencyData = [];

// Assuming 3 efficiency values for each vehicle
for (let vehicleId = 1; vehicleId <= 25; vehicleId++) {
  for (let efficiencyId = 1; efficiencyId <= 3; efficiencyId++) {
    const efficiencyValue = Math.random() * (10 - 5) + 5; // Random value between 5 and 10
    vehicleEfficiencyData.push({
      vehicle_id: vehicleId,
      efficiency_id: efficiencyId,
      efficiency_value: efficiencyValue,
    });
  }
}

const tripData = [
  {
    id: 1,
    departure_date: '2024-01-23 10:00:00',
    arrival_date: '2024-01-23 18:00:00',
    state_id: 3, // in_progress
    approximate_cost: 500.00,
    final_cost: 480.00,
    vehicle_id: 1,
    route_id: 1,
    temperature: 25,
    weight: 6000.00,
  },
  {
    id: 2,
    departure_date: '2024-02-14 12:00:00',
    arrival_date: '2024-02-14 20:00:00',
    state_id: 2, // finished
    approximate_cost: 700.00,
    final_cost: 680.00,
    vehicle_id: 2,
    route_id: 2,
    temperature: 30,
    weight: 8000.00,
  },
  {
    id: 3,
    departure_date: '2024-03-07 14:00:00',
    arrival_date: '2024-03-07 22:00:00',
    state_id: 4, // canceled
    approximate_cost: 300.00,
    final_cost: 0.00,
    vehicle_id: 3,
    route_id: 2,
    temperature: 22,
    weight: 5000.00,
  },
  {
    id: 4,
    departure_date: '2024-04-17 08:00:00',
    arrival_date: '2024-04-17 16:00:00',
    state_id: 1, // scheduled
    approximate_cost: 600.00,
    final_cost: 0.00,
    vehicle_id: 4,
    route_id: 1,
    temperature: 18,
    weight: 7000.00,
  },
  {
    id: 5,
    departure_date: '2024-05-12 09:00:00',
    arrival_date: '2024-05-12 17:00:00',
    state_id: 2, // finished
    approximate_cost: 800.00,
    final_cost: 780.00,
    vehicle_id: 5,
    route_id: 1,
    temperature: 28,
    weight: 9000.00,
  },
  {
    id: 6,
    departure_date: '2024-06-18 11:00:00',
    arrival_date: '2024-06-18 19:00:00',
    state_id: 3, // in_progress
    approximate_cost: 550.00,
    final_cost: 520.00,
    vehicle_id: 6,
    route_id: 2,
    temperature: 26,
    weight: 6200.00,
  },
  {
    id: 7,
    departure_date: '2024-07-22 15:00:00',
    arrival_date: '2024-07-22 23:00:00',
    state_id: 4, // canceled
    approximate_cost: 400.00,
    final_cost: 0.00,
    vehicle_id: 7,
    route_id: 1,
    temperature: 24,
    weight: 5500.00,
  },
  {
    id: 8,
    departure_date: '2024-08-30 07:00:00',
    arrival_date: '2024-08-30 15:00:00',
    state_id: 1, // scheduled
    approximate_cost: 650.00,
    final_cost: 0.00,
    vehicle_id: 8,
    route_id: 2,
    temperature: 20,
    weight: 7200.00,
  },
  {
    id: 9,
    departure_date: '2024-09-14 08:30:00',
    arrival_date: '2024-09-14 16:30:00',
    state_id: 2, // finished
    approximate_cost: 900.00,
    final_cost: 880.00,
    vehicle_id: 9,
    route_id: 1,
    temperature: 27,
    weight: 7500.00,
  },
  {
    id: 10,
    departure_date: '2024-10-19 13:45:00',
    arrival_date: '2024-10-19 21:45:00',
    state_id: 3, // in_progress
    approximate_cost: 600.00,
    final_cost: 580.00,
    vehicle_id: 10,
    route_id: 1,
    temperature: 22,
    weight: 6800.00,
  },
  {
    id: 11,
    departure_date: '2024-11-25 10:15:00',
    arrival_date: '2024-11-25 18:15:00',
    state_id: 1, // scheduled
    approximate_cost: 750.00,
    final_cost: 0.00,
    vehicle_id: 11,
    route_id: 2,
    temperature: 25,
    weight: 8000.00,
  },
  {
    id: 12,
    departure_date: '2024-12-01 16:00:00',
    arrival_date: '2024-12-01 23:30:00',
    state_id: 2, // finished
    approximate_cost: 700.00,
    final_cost: 680.00,
    vehicle_id: 12,
    route_id: 2,
    temperature: 28,
    weight: 9200.00,
  },
  {
    id: 13,
    departure_date: '2024-01-15 09:30:00',
    arrival_date: '2024-01-15 17:30:00',
    state_id: 2, // finished
    approximate_cost: 550.00,
    final_cost: 530.00,
    vehicle_id: 13,
    route_id: 2,
    temperature: 20,
    weight: 5000.00,
  },
  {
    id: 14,
    departure_date: '2024-02-20 14:00:00',
    arrival_date: '2024-02-20 22:00:00',
    state_id: 1, // scheduled
    approximate_cost: 600.00,
    final_cost: 0.00,
    vehicle_id: 14,
    route_id: 2,
    temperature: 23,
    weight: 7200.00,
  },
  {
    id: 15,
    departure_date: '2024-03-10 11:45:00',
    arrival_date: '2024-03-10 19:45:00',
    state_id: 3, // in_progress
    approximate_cost: 700.00,
    final_cost: 0.00,
    vehicle_id: 15,
    route_id: 2,
    temperature: 26,
    weight: 8500.00,
  },
  {
    id: 16,
    departure_date: '2024-04-05 18:30:00',
    arrival_date: '2024-04-05 02:30:00',
    state_id: 2, // finished
    approximate_cost: 800.00,
    final_cost: 780.00,
    vehicle_id: 16,
    route_id: 2,
    temperature: 30,
    weight: 9600.00,
  },
  {
    id: 17,
    departure_date: '2024-05-12 10:15:00',
    arrival_date: null,
    state_id: 3, // in_progress
    approximate_cost: 600.00,
    final_cost: 0.00,
    vehicle_id: 17,
    route_id: 1,
    temperature: 22,
    weight: 5500.00,
  },
  {
    id: 18,
    departure_date: '2024-06-08 14:45:00',
    arrival_date: null,
    state_id: 3, // in_progress
    approximate_cost: 720.00,
    final_cost: 0.00,
    vehicle_id: 18,
    route_id: 1,
    temperature: 25,
    weight: 6800.00,
  },
  {
    id: 19,
    departure_date: '2024-07-20 12:30:00',
    arrival_date: null,
    state_id: 3, // in_progress
    approximate_cost: 850.00,
    final_cost: 0.00,
    vehicle_id: 19,
    route_id: 1,
    temperature: 28,
    weight: 7200.00,
  },
  {
    id: 20,
    departure_date: '2024-08-15 09:00:00',
    arrival_date: null,
    state_id: 3, // in_progress
    approximate_cost: 900.00,
    final_cost: 0.00,
    vehicle_id: 20,
    route_id: 1,
    temperature: 26,
    weight: 8000.00,
  },
];

const tripDetailData = [
  {
    id: 1,
    trip_id: 1,
    weight_adjustment_id: 2,
    temperature_adjustment_id: 3,
    tolls_quantity: 2,
    toll_id: 1,
    other_details: 'Additional details for trip 1',
  },
  {
    id: 2,
    trip_id: 2,
    weight_adjustment_id: 1,
    temperature_adjustment_id: 5,
    tolls_quantity: 1,
    toll_id: 2,
    other_details: 'Additional details for trip 2',
  },
];

(async () => {
  await setDB()

  await seedTable('vehicle_category', vehicleCategoryData);
  await seedTable('vehicle_brand', vehicleBrandData);
  await seedTable('vehicle_type', vehicleTypeData);
  await seedTable('fuel_efficiency', fuelEfficiencyData);
  await seedTable('weight_range', weightRangeData);
  await seedTable('temperature_range', temperatureRangeData);
  await seedTable('route', routeData);
  await seedTable('trip_state', tripStateData);
  await seedTable('state_transition', stateTransitionData);
  await seedTable('toll', tollData);
  await seedTable('fuel_price', fuelPriceData);
  await seedTable('vehicle', vehicleData);
  await seedTable('electric_vehicle', electricVehicleData);
  await seedTable('gas_gasoline_vehicles', gasGasolineVehicleData);
  await seedTable('vehicle_efficiency', vehicleEfficiencyData);
  await seedTable('trip', tripData);
  await seedTable('trip_detail', tripDetailData);

  console.log('All tables has been seeded!')
})();
