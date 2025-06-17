import React from "react";
import Navbar from "./Navbar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-4 max-w-5xl mx-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
