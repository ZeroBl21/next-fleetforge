CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE vehicle_brand (
  id INT PRIMARY KEY, 
  name VARCHAR(50) NOT NULL
);

CREATE TABLE vehicle_category (
  id INT PRIMARY KEY, 
  name VARCHAR(50) NOT NULL, 
  description VARCHAR(255)
);

CREATE TABLE vehicle_type (
  id INT PRIMARY KEY, 
  name VARCHAR(50) NOT NULL
);

CREATE TABLE fuel_efficiency (
  id INT PRIMARY KEY, 
  name VARCHAR(20) NOT NULL
);

CREATE TABLE vehicle (
  id INT PRIMARY KEY, 
  vehicle_type_id INT, 
  category_id INT, 
  brand_id INT, 
  max_load_capacity DECIMAL(7, 2) NOT NULL, 
  security_score INT, 
  model VARCHAR(50) NOT NULL, 
  FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_type(id),
  FOREIGN KEY (category_id) REFERENCES vehicle_category(id),
  FOREIGN KEY (brand_id) REFERENCES vehicle_brand(id)
);

CREATE TABLE electric_vehicle (
  id INT PRIMARY KEY, 
  battery_capacity DECIMAL(7, 2) NOT NULL, 
  charging_time INT NOT NULL, 
  FOREIGN KEY (id) REFERENCES vehicle(id)
);

CREATE TABLE gas_gasoline_vehicles (
  id INT PRIMARY KEY, 
  tank_capacity DECIMAL(7, 2) NOT NULL, 
  FOREIGN KEY (id) REFERENCES vehicle(id)
);

CREATE TABLE vehicle_efficiency (
  vehicle_id INT, 
  efficiency_id INT, 
  efficiency_value DECIMAL(5, 2) NOT NULL, 
  PRIMARY KEY (vehicle_id, efficiency_id), 
  FOREIGN KEY (vehicle_id) REFERENCES vehicle(id), 
  FOREIGN KEY (efficiency_id) REFERENCES fuel_efficiency(id)
);

CREATE TABLE route (
  id SERIAL PRIMARY KEY, 
  origin GEOMETRY(Point), 
  destination GEOMETRY(Point), 
  date TIMESTAMP, 
  duration VARCHAR(50), 
  distance VARCHAR(50)
);

CREATE TABLE trip_state (
  id INT PRIMARY KEY, 
  name VARCHAR(50) NOT NULL
);

CREATE TABLE trip (
  id SERIAL PRIMARY KEY, 
  departure_date TIMESTAMP, 
  arrival_date TIMESTAMP, 
  state_id INT, 
  approximate_cost DECIMAL(10, 2), 
  final_cost DECIMAL(10, 2), 
  vehicle_id INT, 
  route_id INT, 
  temperature INT, 
  weight DECIMAL(7, 2), 
  FOREIGN KEY (state_id) REFERENCES trip_state(id), 
  FOREIGN KEY (vehicle_id) REFERENCES vehicle(id), 
  FOREIGN KEY (route_id) REFERENCES route(id)
);

CREATE TABLE weight_range (
  id INT PRIMARY KEY, 
  min_weight DECIMAL(7, 2) NOT NULL, 
  max_weight DECIMAL(7, 2) NOT NULL, 
  efficiency_adjustment DECIMAL(5, 2) NOT NULL
);

CREATE TABLE temperature_range (
  id INT PRIMARY KEY, 
  min_temperature INT NOT NULL, 
  max_temperature INT NOT NULL, 
  efficiency_adjustment DECIMAL(5, 2) NOT NULL
);

CREATE TABLE state_transition (
  id INT PRIMARY KEY, 
  initial_state_id INT, 
  final_state_id INT, 
  FOREIGN KEY (initial_state_id) REFERENCES trip_state(id), 
  FOREIGN KEY (final_state_id) REFERENCES trip_state(id)
);

CREATE TABLE toll (
  id INT PRIMARY KEY, 
  category_id INT, 
  average_price DECIMAL(10, 2) NOT NULL, 
  validity_date DATE NOT NULL, 
  FOREIGN KEY (category_id) REFERENCES vehicle_category(id)
);

CREATE TABLE trip_detail (
  id INT PRIMARY KEY, 
  trip_id INT, 
  weight_adjustment_id INT, 
  temperature_adjustment_id INT, 
  tolls_quantity INT DEFAULT 0, 
  toll_id INT, 
  other_details TEXT, 
  FOREIGN KEY (trip_id) REFERENCES trip(id), 
  FOREIGN KEY (weight_adjustment_id) REFERENCES weight_range(id), 
  FOREIGN KEY (temperature_adjustment_id) REFERENCES temperature_range(id), 
  FOREIGN KEY (toll_id) REFERENCES toll(id)
);

CREATE TABLE fuel_price (
  id INT PRIMARY KEY,
  fuel_type VARCHAR(50) NOT NULL,
  validity_date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  CONSTRAINT currency_check CHECK (currency IN ('USD', 'DOP'))
);
