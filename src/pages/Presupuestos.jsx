import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "react-router-dom";

const Presupuestos = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [presSnap, cliSnap] = await Promise.all([
        getDocs(query(collection(db, "presupuestos"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "clientes")))
      ]);

      const clientesMap = {};
      cliSnap.docs.forEach(doc => {
        clientesMap[doc.id] = doc.data().nombre;
      });

      const presupuestosConCliente = presSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          clienteNombre: clientesMap[data.clienteId] || "Sin cliente",
        };
      });

      setPresupuestos(presupuestosConCliente);
      setClientes(cliSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const filtrados = presupuestos.filter((p) => {
    const coincideEstado = filtroEstado ? p.estado === filtroEstado : true;
    const coincideNombre = p.clienteNombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstado && coincideNombre;
  });

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Presupuestos</h1>

      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todos los estados</option>
          <option value="presupuestado">Presupuestado</option>
          <option value="pendiente">Pendiente</option>
          <option value="vendido">Vendido</option>
          <option value="listo_para_instalar">Listo para instalar</option>
        </select>

        <input
          type="text"
          placeholder="Buscar por cliente"
          className="border p-2 rounded"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm">
          <thead>
            <tr className="text-left border-b bg-gray-100">
              <th className="p-2">Cliente</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Total</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-blue-600 hover:underline">
                  <Link to={`/presupuestos/${p.id}`}>{p.clienteNombre}</Link>
                </td>
                <td className="p-2">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    p.estado === "vendido" ? "bg-green-100 text-green-800" :
                    p.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" :
                    p.estado === "listo_para_instalar" ? "bg-purple-100 text-purple-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {p.estado}
                  </span>
                </td>
                <td className="p-2">${p.total?.toLocaleString()}</td>
                <td className="p-2">
                  {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : "-"}
                </td>
                <td className="p-2 space-x-2">
                  <Link to={`/presupuestos/${p.id}`} className="text-blue-500 hover:underline text-xs">Ver</Link>
                  <Link to={`/presupuestos/${p.id}/editar`} className="text-yellow-600 hover:underline text-xs">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtrados.length === 0 && (
        <p className="text-center mt-4 text-gray-500">No hay presupuestos que coincidan.</p>
      )}
    </DashboardLayout>
  );
};

export default Presupuestos;
