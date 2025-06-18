import React, { useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import SubirFoto from "../components/SubirFoto";

import ClienteBuscador from "../components/ClienteBuscador";
import NuevoClienteModal from "../components/NuevoClienteModal";

const NuevoPresupuesto = () => {
  const [cliente, setCliente] = useState(null);
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);

  const [productos, setProductos] = useState([
    { tipo: "", ancho: "", alto: "", cantidad: 1, productoId: "" },
  ]);
  const [estado, setEstado] = useState("presupuestado");
  const [observaciones, setObservaciones] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const auth = getAuth();
  const navigate = useNavigate();

  const handleProductoChange = (index, field, value) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index][field] = value;
    setProductos(nuevosProductos);
  };

  const agregarProducto = () => {
    setProductos([...productos, { tipo: "", ancho: "", alto: "", cantidad: 1, productoId: "" }]);
  };

  const eliminarProducto = (index) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return productos.reduce((acc, p) => {
      const ancho = parseFloat(p.ancho) || 0;
      const alto = parseFloat(p.alto) || 0;
      const cantidad = parseInt(p.cantidad) || 1;
      return acc + ancho * alto * cantidad;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteSeleccionado) {
  alert("Seleccioná un cliente");
  return;
}
    if (productos.length === 0) {
      alert("Agregá al menos un producto");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;

      await addDoc(collection(db, "presupuestos"), {
        clienteId: clienteSeleccionado.id,
        productos: productos.map((p) => ({
          productoId: p.productoId,
          tipo: p.tipo,
          ancho: Number(p.ancho),
          alto: Number(p.alto),
          cantidad: Number(p.cantidad),
        })),
        total: calcularTotal(),
        estado,
        observaciones,
        imagenes,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      });

      alert("Presupuesto creado exitosamente");
      navigate("/presupuestos");
    } catch (error) {
      console.error("Error al crear presupuesto:", error);
      alert("Error al crear presupuesto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6 text-white">Nuevo Presupuesto</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg shadow-lg"
      >
        {/* Buscador Cliente */}
        <div>
          <label className="block mb-2 text-white font-semibold text-lg">
            Cliente
          </label>
          <ClienteBuscador
  value={clienteSeleccionado}
  onSelectCliente={(cliente) => {
    setClienteSeleccionado(cliente);
  }}
  onNuevoCliente={() => setMostrarModalCliente(true)}
/>
          {clienteSeleccionado && (
  <div className="mt-2 text-sm text-green-400 flex items-center gap-2">
    Cliente seleccionado: <strong>{clienteSeleccionado.nombre}</strong>
    <button
      type="button"
      className="ml-2 text-red-400 hover:text-red-600 text-xs"
      onClick={() => setClienteSeleccionado(null)}
    >
      ✕
    </button>
  </div>
)}
        </div>

        {/* Productos */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Productos</h2>
          {productos.map((p, i) => (
            <div
              key={i}
              className="bg-gray-800 p-4 rounded mb-4 relative flex flex-col md:flex-row md:items-center md:space-x-4"
            >
              <button
                type="button"
                onClick={() => eliminarProducto(i)}
                disabled={productos.length === 1}
                className="absolute top-2 right-2 text-red-500 hover:text-red-400 font-bold"
              >
                &times;
              </button>

              <input
                type="text"
                placeholder="Tipo de producto"
                value={p.tipo}
                onChange={(e) => handleProductoChange(i, "tipo", e.target.value)}
                required
                className="mb-2 md:mb-0 flex-1 rounded border border-gray-600 bg-gray-700 p-2 text-white"
              />

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ancho (m)"
                value={p.ancho}
                onChange={(e) => handleProductoChange(i, "ancho", e.target.value)}
                required
                className="mb-2 md:mb-0 w-28 rounded border border-gray-600 bg-gray-700 p-2 text-white"
              />

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Alto (m)"
                value={p.alto}
                onChange={(e) => handleProductoChange(i, "alto", e.target.value)}
                required
                className="mb-2 md:mb-0 w-28 rounded border border-gray-600 bg-gray-700 p-2 text-white"
              />

              <input
                type="number"
                min="1"
                placeholder="Cantidad"
                value={p.cantidad}
                onChange={(e) => handleProductoChange(i, "cantidad", e.target.value)}
                required
                className="w-20 rounded border border-gray-600 bg-gray-700 p-2 text-white"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={agregarProducto}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            + Agregar producto
          </button>
        </div>

        {/* Estado */}
        <div>
          <label className="block mb-2 font-semibold text-white">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
          >
            <option value="presupuestado">Presupuestado</option>
            <option value="pendiente">Pendiente</option>
            <option value="vendido">Vendido</option>
            <option value="listo_para_instalar">Listo para instalar</option>
          </select>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block mb-2 font-semibold text-white">Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
            rows={4}
          />
        </div>

        {/* Imágenes */}
        <div>
          <label className="block mb-2 font-semibold text-white">Imágenes</label>
          <SubirFoto onUpload={({ url }) => setImagenes((prev) => [...prev, url])} />
          <div className="flex space-x-4 mt-4 overflow-x-auto">
            {imagenes.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Imagen ${i + 1}`}
                className="h-20 rounded"
              />
            ))}
          </div>
        </div>

        {/* Total */}
        <div>
          <label className="block mb-2 font-semibold text-white">Total (m²)</label>
          <input
            type="number"
            value={calcularTotal().toFixed(2)}
            readOnly
            className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded text-white font-semibold"
          >
            {loading ? "Guardando..." : "Crear Presupuesto"}
          </button>
        </div>
      </form>

      {mostrarModalCliente && (
        <NuevoClienteModal
          onClose={() => setMostrarModalCliente(false)}
          onCreated={(nuevoCliente) => {
            setCliente(nuevoCliente);
            setMostrarModalCliente(false);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default NuevoPresupuesto;
