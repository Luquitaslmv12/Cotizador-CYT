import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Link } from "react-router-dom";

const Clientes = () => {
  return (
    <DashboardLayout>
      <Link
  to="/clientes/nuevo"
  className="inline-block bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700"
>
  + Nuevo Cliente
</Link>
    </DashboardLayout>
  );
};

export default Clientes;
