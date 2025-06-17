import React from "react";
import DashboardLayout from "../components/DashboardLayout";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Bienvenido al Panel</h1>
      <p>Acá vas a poder gestionar presupuestos, clientes y más.</p>
    </DashboardLayout>
  );
};

export default Dashboard;
