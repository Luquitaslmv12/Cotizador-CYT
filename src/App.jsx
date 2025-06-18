import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Presupuestos from "./pages/Presupuestos";
import Clientes from "./pages/Clientes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./routes/PrivateRoute";
import NuevoPresupuesto from "./pages/NuevoPresupuesto";
import DetallePresupuesto from "./pages/DetallePresupuesto";
import NuevoCliente from "./pages/NuevoCliente";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route
          path="/presupuestos"
          element={<PrivateRoute><Presupuestos /></PrivateRoute>}
        />
        <Route
          path="/presupuestos/:id"
          element={<PrivateRoute><DetallePresupuesto /></PrivateRoute>}
        />
        <Route
          path="/clientes"
          element={<PrivateRoute><Clientes /></PrivateRoute>}
        />
        <Route
          path="/nuevo"
          element={<PrivateRoute><NuevoPresupuesto /></PrivateRoute>}
        />
        <Route
         path="/clientes/nuevo"
         element={<PrivateRoute><NuevoCliente /></PrivateRoute>}
         />

         <Route
         path="/forgotpassword"
         element={<ForgotPassword />} 
         />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
