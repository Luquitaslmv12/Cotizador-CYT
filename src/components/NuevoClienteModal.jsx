// NuevoClienteModal.jsx
import React, { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const NuevoClienteModal = ({ onClose, onCreated }) => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) return alert("El nombre es obligatorio");

    setLoading(true);
    try {
      const user = auth.currentUser;
      const docRef = await addDoc(collection(db, "clientes"), {
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
      onCreated({ id: docRef.id, nombre, telefono, direccion, email });
      onClose();
    } catch (error) {
      console.error("Error creando cliente:", error);
      alert("Error al crear cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Nuevo Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Nombre*</label>
            <input
              type="text"
              className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-white"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Teléfono</label>
            <input
              type="tel"
              className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-white"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Dirección</label>
            <input
              type="text"
              className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-white"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Email</label>
            <input
              type="email"
              className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? "Guardando..." : "Crear Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoClienteModal;
