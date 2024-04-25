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
    accessorKey: "brand",
    header: "Vehicle Brand",
  },
  {
    accessorKey: "category",
    header: "Vehicle Category",
  },
  {
    accessorKey: "vehicle_type",
    header: "Fuel Type",
  },
  {
    accessorKey: "fuel_efficiency",
    header: "Fuel Efficiency",
  },
  {
    accessorKey: "efficiency_type", // Added efficiency_type column
    header: "Efficiency Type",
  },
  {
    accessorKey: "fuel_cost",
    header: "Fuel Cost",
  },
  {
    accessorKey: "max_load_capacity",
    header: "Max Load Capacity",
  },
  {
    accessorKey: "security_score",
    header: "Security Score",
  },
];
