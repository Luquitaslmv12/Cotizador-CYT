import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/DashboardLayout";
import SubirFoto from "../components/SubirFoto";
import { uploadImage } from "../lib/cloudinary";




// Componente simplificado para seleccionar cliente (reemplazalo por tu autocomplete si querés)
const SelectCliente = ({ clientes, clienteId, setClienteId }) => (
  <select
    value={clienteId}
    onChange={(e) => setClienteId(e.target.value)}
    className="border p-2 rounded w-full"
  >
    {clientes.map((c) => (
      <option key={c.id} value={c.id}>
        {c.nombre}
      </option>
    ))}
  </select>
);

// Autocomplete producto básico (podés mejorarlo)
const ProductoAutocomplete = ({ value, onSelect }) => {
  const [input, setInput] = useState(value || "");
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    if (input.length < 2) {
      setResultados([]);
      return;
    }

    const fetchProductos = async () => {
      const q = query(
        collection(db, "productos"),
        orderBy("nombre"),
        where("nombre", ">=", input),
        where("nombre", "<=", input + "\uf8ff"),
        limit(5)
      );
      const snapshot = await getDocs(q);
      setResultados(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchProductos();
  }, [input]);

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Buscar producto..."
        className="border p-2 rounded w-full"
      />
      {resultados.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded w-full max-h-40 overflow-auto">
          {resultados.map((prod) => (
            <li
              key={prod.id}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => {
                onSelect(prod);
                setInput(prod.nombre);
                setResultados([]);
              }}
            >
              {prod.nombre} - ${prod.precio.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const NuevoPresupuesto = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [productos, setProductos] = useState([
    { tipo: "", ancho: "", alto: "", cantidad: 1, precio: 0, productoId: "" },
  ]);
  const [estado, setEstado] = useState("presupuestado");
  const [observaciones, setObservaciones] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();

  // Traer clientes para select
  useEffect(() => {
    const fetchClientes = async () => {
      const q = query(collection(db, "clientes"), orderBy("nombre"));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClientes(lista);
      if (lista.length > 0) setClienteId(lista[0].id);
    };
    fetchClientes();
  }, []);

  // Actualiza producto en arreglo productos
  const handleProductoChange = (index, field, value) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index][field] = value;
    setProductos(nuevosProductos);
  };

  // Seleccionar producto con autocomplete y cargar precio
  const handleProductoSelect = (index, producto) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index].productoId = producto.id;
    nuevosProductos[index].tipo = producto.nombre;
    nuevosProductos[index].precio = producto.precio;
    setProductos(nuevosProductos);
  };

  // Agregar y eliminar producto
  const agregarProducto = () => {
    setProductos([...productos, { tipo: "", ancho: "", alto: "", cantidad: 1, precio: 0, productoId: "" }]);
  };

  const eliminarProducto = (index) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  // Calcular total sumando ancho*alto*cantidad*precio
  const calcularTotal = () => {
    return productos.reduce((acc, p) => {
      const ancho = parseFloat(p.ancho) || 0;
      const alto = parseFloat(p.alto) || 0;
      const cantidad = parseInt(p.cantidad) || 1;
      const precio = parseFloat(p.precio) || 0;
      return acc + ancho * alto * cantidad * precio;
    }, 0);
  };

  // Recibe URL imagen subida y la agrega a imágenes
  const handleImagenUpload = (url) => {
    setImagenes([...imagenes, url]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteId) {
      alert("Seleccioná un cliente");
      return;
    }
    if (productos.length === 0) {
      alert("Agregá al menos un producto");
      return;
    }
    // Podrías agregar más validaciones...

    setLoading(true);
    try {
      const user = auth.currentUser;

      await addDoc(collection(db, "presupuestos"), {
        clienteId,
        productos: productos.map((p) => ({
          productoId: p.productoId,
          tipo: p.tipo,
          ancho: Number(p.ancho),
          alto: Number(p.alto),
          cantidad: Number(p.cantidad),
          precio: Number(p.precio),
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
      <h1 className="text-2xl font-semibold mb-4">Nuevo Presupuesto</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Selección cliente */}
        <div>
          <label className="block font-semibold mb-1">Cliente</label>
          <SelectCliente clientes={clientes} clienteId={clienteId} setClienteId={setClienteId} />
        </div>

        {/* Productos */}
        <div>
          <h2 className="font-semibold mb-2">Productos</h2>
          {productos.map((p, i) => (
            <div key={i} className="border rounded p-4 mb-4 space-y-3 relative">
              <button
                type="button"
                className="absolute top-2 right-2 text-red-600 hover:underline"
                onClick={() => eliminarProducto(i)}
                disabled={productos.length === 1}
              >
                Eliminar
              </button>

              <div>
                <label className="block font-semibold mb-1">Producto</label>
                <ProductoAutocomplete
                  value={p.tipo}
                  onSelect={(producto) => handleProductoSelect(i, producto)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Ancho (m)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={p.ancho}
                    onChange={(e) => handleProductoChange(i, "ancho", e.target.value)}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Alto (m)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={p.alto}
                    onChange={(e) => handleProductoChange(i, "alto", e.target.value)}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={p.cantidad}
                    onChange={(e) => handleProductoChange(i, "cantidad", e.target.value)}
                    required
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Precio unitario ($)</label>
                <input
                  type="number"
                  value={p.precio}
                  readOnly
                  className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subtotal ($)</label>
                <input
                  type="number"
                  value={(
                    (parseFloat(p.ancho) || 0) *
                    (parseFloat(p.alto) || 0) *
                    (parseInt(p.cantidad) || 1) *
                    (parseFloat(p.precio) || 0)
                  ).toFixed(2)}
                  readOnly
                  className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={agregarProducto}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Agregar producto
          </button>
        </div>

        {/* Estado */}
        <div>
          <label className="block font-semibold mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="presupuestado">Presupuestado</option>
            <option value="pendiente">Pendiente</option>
            <option value="vendido">Vendido</option>
            <option value="listo_para_instalar">Listo para instalar</option>
          </select>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block font-semibold mb-1">Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="border p-2 rounded w-full"
            rows={4}
          />
        </div>

        {/* Subir imágenes */}
    <div>
  <label className="block font-semibold mb-1">Imágenes</label>
  
  {/* Simplemente insertá el componente aquí, sin botón envolvente */}
  <SubirFoto onUpload={(url) => setImagenes((prev) => [...prev, url])} />
    

  <div className="flex space-x-4 mt-4 overflow-x-auto">
    {imagenes.map((url, i) => (
      <img key={i} src={url} alt={`Imagen ${i + 1}`} className="h-20 rounded" />
    ))}
  </div>
</div>
        {/* Total */}
        <div>
          <label className="block font-semibold mb-1">Total</label>
          <input
            type="number"
            value={calcularTotal().toFixed(2)}
            readOnly
            className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Guardando..." : "Crear Presupuesto"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default NuevoPresupuesto;
