import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

const ClienteBuscador = ({ value, onSelectCliente, onNuevoCliente }) => {
  const [clientes, setClientes] = useState([]);
  const [input, setInput] = useState("");
  const [resultados, setResultados] = useState([]);
  const [showResultados, setShowResultados] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "clientes"), (snapshot) => {
      const datos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(datos);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (input.length < 2) {
      setResultados([]);
      return;
    }

    const filtrados = clientes.filter((c) =>
      `${c.nombre ?? ""} ${c.apellido ?? ""}`
        .toLowerCase()
        .includes(input.toLowerCase())
    );
    setResultados(filtrados);
    setShowResultados(true);
  }, [input, clientes]);

  const handleSelect = (cliente) => {
    onSelectCliente(cliente);
    setInput(cliente.nombre); // o `${cliente.nombre} ${cliente.apellido}`
    setShowResultados(false);
  };

  const limpiarSeleccion = () => {
    onSelectCliente(null);
    setInput("");
    setResultados([]);
    setShowResultados(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center bg-gray-900 border border-gray-600 rounded-md">
        <input
          type="text"
          placeholder="Buscar cliente..."
          className="flex-grow px-4 py-2 bg-gray-900 text-white focus:outline-none rounded-l-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {value && (
          <button
            type="button"
            onClick={limpiarSeleccion}
            className="px-3 text-red-400 hover:text-red-300 text-xl"
            title="Quitar cliente"
          >
            &times;
          </button>
        )}
      </div>

      {showResultados && resultados.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md max-h-48 overflow-auto text-white shadow-lg">
          {resultados.map((cliente) => (
            <li
              key={cliente.id}
              className="px-4 py-2 cursor-pointer hover:bg-indigo-600"
              onClick={() => handleSelect(cliente)}
            >
              {cliente.nombre} {cliente.apellido ?? ""}
            </li>
          ))}
        </ul>
      )}

      {input.length >= 2 && resultados.length === 0 && (
        <div className="flex justify-between items-center text-gray-400 mt-2">
          <span>No se encontró cliente</span>
          <button
            onClick={onNuevoCliente}
            className="text-indigo-400 hover:underline"
            type="button"
          >
            Nuevo Cliente
          </button>
        </div>
      )}
    </div>
  );
};

export default ClienteBuscador;
