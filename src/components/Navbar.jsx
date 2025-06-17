import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../lib/firebase";

const Navbar = () => {
  const handleLogout = () => auth.signOut();

  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
      <Link to="/dashboard" className="font-bold text-xl">ToldosApp</Link>
      <div className="flex gap-4">
        <Link to="/dashboard" className="hover:underline">Inicio</Link>
        <Link to="/presupuestos" className="hover:underline">Presupuestos</Link>
        <Link to="/clientes" className="hover:underline">Clientes</Link>
        <Link to="/nuevo" className="hover:underline">Nuevo presup</Link>
        
        <button onClick={handleLogout} className="text-red-400 hover:underline">Salir</button>
      </div>
    </nav>
  );
};

export default Navbar;
