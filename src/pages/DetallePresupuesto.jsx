import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { getAuth, updateCurrentUser } from "firebase/auth";
import SubirFoto from "../components/SubirFoto";

const PresupuestoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [presupuesto, setPresupuesto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    estado: "",
    observaciones: "",
    productos: [],
    imagenes: [],
  });

  const auth = getAuth();
    const [imagenAmpliada, setImagenAmpliada] = useState(null);

  useEffect(() => {
    const fetchPresupuesto = async () => {
      setLoading(true);
      const docRef = doc(db, "presupuestos", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPresupuesto({ id: docSnap.id, ...data });
        setFormData({
          estado: data.estado || "",
          observaciones: data.observaciones || "",
          productos: data.productos || [],
          imagenes: data.imagenes || [],
          
        });
      } else {
        alert("Presupuesto no encontrado");
        navigate("/presupuestos");
      }
      setLoading(false);
    };

    fetchPresupuesto();
  }, [id, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductoChange = (index, field, value) => {
    const nuevosProductos = [...formData.productos];
    nuevosProductos[index][field] = value;
    setFormData((prev) => ({ ...prev, productos: nuevosProductos }));
  };

  const agregarProducto = () => {
    setFormData((prev) => ({
      ...prev,
      productos: [...prev.productos, { tipo: "", ancho: 0, alto: 0, cantidad: 1, precio: 0 }],
    }));
  };

  const eliminarProducto = (index) => {
    setFormData((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index),
    }));
  };

  const calcularTotal = () => {
    return formData.productos.reduce((acc, p) => {
      const ancho = parseFloat(p.ancho) || 0;
      const alto = parseFloat(p.alto) || 0;
      const cantidad = parseInt(p.cantidad) || 1;
      const precio = parseFloat(p.precio) || 0;
      return acc + ancho * alto * cantidad * precio;
    }, 0);
  };

  const handleGuardar = async () => {
    // Validar
    if (formData.productos.length === 0) {
      alert("Debe agregar al menos un producto.");
      return;
    }

    try {
        const user = auth.currentUser;
        
      setLoading(true);
      const docRef = doc(db, "presupuestos", id);
      await updateDoc(docRef, {
        estado: formData.estado,
        observaciones: formData.observaciones,
        productos: formData.productos,
        imagenes: formData.imagenes, 
        total: calcularTotal(),
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });
      alert("Presupuesto actualizado");
      setPresupuesto({ ...presupuesto, ...formData, total: calcularTotal() });
      setEditMode(false);
    } catch (error) {
      console.error("Error al actualizar presupuesto:", error);
      alert("Error al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando...</p>;

  if (!presupuesto) return null;



  return (
    
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Detalle de Presupuesto</h1>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Estado</label>
        {editMode ? (
          <select
            value={formData.estado}
            onChange={(e) => handleInputChange("estado", e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="presupuestado">Presupuestado</option>
            <option value="pendiente">Pendiente</option>
            <option value="vendido">Vendido</option>
            <option value="listo para instalar">Listo para instalar</option>
          </select>
        ) : (
          <p>{presupuesto.estado}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Observaciones</label>
        {editMode ? (
          <textarea
            value={formData.observaciones}
            onChange={(e) => handleInputChange("observaciones", e.target.value)}
            className="border p-2 rounded w-full"
            rows={4}
          />
        ) : (
          <p>{presupuesto.observaciones || "-"}</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Productos</h2>
        {editMode ? (
          <>
            {formData.productos.map((p, i) => (
              <div
                key={i}
                className="border rounded p-4 mb-4 space-y-3 relative"
              >
                <button
                  type="button"
                  className="absolute top-2 right-2 text-red-600 hover:underline"
                  onClick={() => eliminarProducto(i)}
                >
                  Eliminar
                </button>

                <div>
                  <label className="block font-semibold mb-1">Tipo</label>
                  <input
                    type="text"
                    value={p.tipo}
                    onChange={(e) => handleProductoChange(i, "tipo", e.target.value)}
                    className="border p-2 rounded w-full"
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
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Precio unitario ($)</label>
                  <input
                    type="number"
                    value={p.precio}
                    onChange={(e) => handleProductoChange(i, "precio", e.target.value)}
                    className="border p-2 rounded w-full"
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
          </>
        ) : (
          <table className="w-full text-sm border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Tipo</th>
                <th className="p-2 border">Ancho (m)</th>
                <th className="p-2 border">Alto (m)</th>
                <th className="p-2 border">Cantidad</th>
                <th className="p-2 border">Precio unitario ($)</th>
                <th className="p-2 border">Subtotal ($)</th>
              </tr>
            </thead>
            <tbody>
              {presupuesto.productos.map((p, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2 border">{p.tipo}</td>
                  <td className="p-2 border">{p.ancho}</td>
                  <td className="p-2 border">{p.alto}</td>
                  <td className="p-2 border">{p.cantidad}</td>
                  <td className="p-2 border">${p.precio.toFixed(2)}</td>
                  <td className="p-2 border">
                    ${(
                      (parseFloat(p.ancho) || 0) *
                      (parseFloat(p.alto) || 0) *
                      (parseInt(p.cantidad) || 1) *
                      (parseFloat(p.precio) || 0)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-1">Total</label>
        <input
          type="number"
          value={calcularTotal().toFixed(2)}
          readOnly
          className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
        />
      </div>

      <div className="flex gap-4">
        {editMode ? (
          <>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                // Revertir cambios en formData al estado actual del presupuesto
                setFormData({
                  estado: presupuesto.estado || "",
                  observaciones: presupuesto.observaciones || "",
                  productos: presupuesto.productos || [],
                  imagenes: presupuesto.imagenes || [],
                });
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Editar
          </button>
          
        )}

         <div>
          <h2 className="font-semibold">Historial:</h2>
          <p className="text-sm text-gray-600">
            Creado por: {presupuesto.createdBy} el {presupuesto.createdAt?.toDate?.().toLocaleString() || "-"}
          </p>
          <p className="text-sm text-gray-600">
            Última modificación por: {presupuesto.updatedBy} el {presupuesto.updatedAt?.toDate?.().toLocaleString() || "-"}
          </p>
        </div>
      </div>


 {editMode ? (
  <SubirFoto
    imagenes={formData.imagenes}
    onUpload={(url) =>
      setFormData((prev) => ({
        ...prev,
        imagenes: [...prev.imagenes, url],
      }))
    }
    onRemove={(url) =>
      setFormData((prev) => ({
        ...prev,
        imagenes: prev.imagenes.filter((img) => img !== url),
      }))
    }
  />
  
) : (
  Array.isArray(formData.imagenes) && formData.imagenes.length > 0 && (
    <div className="mt-6">
      <h2 className="font-semibold mb-2">Imágenes</h2>
      <div className="flex flex-wrap gap-3">
        {formData.imagenes.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`img-${i}`}
            onClick={() => setImagenAmpliada(url)}
            className="w-24 h-24 object-cover rounded cursor-pointer transition-transform hover:scale-105"
          />
        ))}
      </div>
    </div>
  )
)}

{imagenAmpliada && (
  <div
    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
    onClick={() => setImagenAmpliada(null)}
  >
    <img
      src={imagenAmpliada}
      alt="Imagen ampliada"
      className="max-w-full max-h-full rounded shadow-lg"
      onClick={(e) => e.stopPropagation()} // evita cerrar si clicás sobre la imagen
    />
    <button
      className="absolute top-4 right-4 text-white text-2xl font-bold"
      onClick={() => setImagenAmpliada(null)}
    >
      ×
    </button>
  </div>
)}

    </DashboardLayout>
  );
};

export default PresupuestoDetalle;
