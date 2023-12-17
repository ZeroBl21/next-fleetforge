"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Vehicle = {
  id: number;
  vehicle_type: string;
  category: string;
  brand: string;
  max_load_capacity: number;
  model: string;
  fuel_efficiency: number;
  fuel_cost: number;
  efficiency_type: string;
};

// Column definitions
export const columns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "max_load_capacity",
    header: "Max Load Capacity",
  },
  {
    accessorKey: "vehicle_type",
    header: "Vehicle Type",
  },
  {
    accessorKey: "category",
    header: "Vehicle Category",
  },
  {
    accessorKey: "brand",
    header: "Vehicle Brand",
  },
  {
    accessorKey: "fuel_efficiency",
    header: "Fuel Efficiency",
  },
  {
    accessorKey: "fuel_cost",
    header: "Fuel Cost",
  },
  {
    accessorKey: "efficiency_type", // Added efficiency_type column
    header: "Efficiency Type",
  },
];
