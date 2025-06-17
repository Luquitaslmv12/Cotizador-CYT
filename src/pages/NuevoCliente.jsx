import React, { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

const NuevoCliente = () => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) return alert("El nombre es obligatorio");

    setLoading(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, "clientes"), {
        nombre,
        telefono,
        direccion,
        email,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
      alert("Cliente creado!");
      navigate("/clientes");
    } catch (error) {
      console.error("Error creando cliente:", error);
      alert("Error al crear cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Nuevo Cliente</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block font-semibold mb-1">Nombre*</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Teléfono</label>
          <input
            type="tel"
            className="border p-2 rounded w-full"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Dirección</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            className="border p-2 rounded w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Guardando..." : "Crear Cliente"}
        </button>
      </form>
    </DashboardLayout>
  );
};

export default NuevoCliente;
