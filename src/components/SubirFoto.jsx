import React, { useState, useRef } from "react";
import { uploadFile } from "../lib/cloudinary";
import { X, Trash2, Mic, StopCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SubirFoto = ({ imagenes = [], onUpload, onRemove }) => {
  const [files, setFiles] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // Drag & Drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (droppedFiles.length === 0) {
      setError("Solo se permiten archivos de imagen.");
      return;
    }
    setFiles((prev) => [...prev, ...droppedFiles]);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (selected.length === 0) {
      setError("Seleccioná solo archivos de imagen.");
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
    setError(null);
  };

  // Audio grabación
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Tu navegador no soporta grabación de audio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.current.start();
      setRecording(true);
      setError(null);
    } catch (err) {
      setError("No se pudo iniciar la grabación.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const handleUploadAll = async () => {
    if (files.length === 0 && !audioBlob) return;
    setLoading(true);

    try {
      // subir imágenes
      for (const file of files) {
        const url = await uploadFile(file, "image");
        if (onUpload) onUpload({ url, details, type: "image" });
      }
      // subir audio si existe
      if (audioBlob) {
        const urlAudio = await uploadFile(audioBlob, "audio");
        if (onUpload) onUpload({ url: urlAudio, details, type: "audio" });
      }
      setFiles([]);
      setAudioBlob(null);
      setAudioUrl(null);
      setDetails("");
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error al subir uno o más archivos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-gray-50 shadow-md max-w-xl mx-auto">
      <label className="block mb-3 text-lg font-semibold text-gray-700">
        Seleccionar imágenes o arrastrar aquí
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="mb-5 w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors relative"
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          aria-label="Seleccionar imágenes"
        />
        <p className="text-gray-600 select-none pointer-events-none">
          Arrastrá tus imágenes aquí o hacé clic para seleccionar
        </p>
      </div>

      {/* Detalles */}
      <label className="block mb-2 font-semibold text-gray-700">Detalles</label>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={3}
        placeholder="Agregá algún detalle o comentario..."
        className="w-full mb-5 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        aria-label="Detalles de las imágenes o audio"
      />

      {/* Error */}
      {error && (
        <p className="mb-4 text-red-600 font-medium flex items-center gap-2" role="alert">
          <X size={18} />
          {error}
        </p>
      )}

      {/* Imágenes seleccionadas */}
      {files.length > 0 && (
        <>
          <p className="font-semibold mb-3 text-gray-800">Imágenes seleccionadas:</p>
          <div className="flex flex-wrap gap-4 mb-5">
            {files.map((file, index) => (
              <motion.div
                key={index}
                className="relative w-28 h-28 rounded-lg overflow-hidden shadow-sm"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md"
                  aria-label="Eliminar archivo seleccionado"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Grabación audio */}
      <div className="mb-5">
        <p className="font-semibold mb-2 text-gray-700">Grabar audio (opcional):</p>
        {!recording && !audioUrl && (
          <button
            onClick={startRecording}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-md"
            aria-label="Comenzar grabación de audio"
          >
            <Mic size={20} /> Comenzar grabación
          </button>
        )}
        {recording && (
          <button
            onClick={stopRecording}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 rounded-md hover:bg-yellow-600 shadow-md"
            aria-label="Detener grabación de audio"
          >
            <StopCircle size={20} /> Detener grabación
          </button>
        )}
        {audioUrl && (
          <div className="mt-3 flex items-center gap-4">
            <audio controls src={audioUrl} className="rounded-md" />
            <button
              onClick={handleRemoveAudio}
              className="p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md"
              aria-label="Eliminar audio grabado"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Botón subir */}
      <motion.button
        type="button"
        onClick={handleUploadAll}
        disabled={loading || (files.length === 0 && !audioBlob)}
        whileHover={{ scale: loading ? 1 : 1.05 }}
        whileTap={{ scale: loading ? 1 : 0.95 }}
        className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
          loading || (files.length === 0 && !audioBlob)
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
        }`}
        aria-label="Subir archivos seleccionados"
      >
        {loading ? "Subiendo..." : "Subir archivos"}
      </motion.button>

      {/* Modal imagen ampliada */}
      <AnimatePresence>
        {imagenAmpliada && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
            onClick={() => setImagenAmpliada(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={imagenAmpliada}
              alt="Imagen ampliada"
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <button
              className="absolute top-6 right-6 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 shadow-lg text-gray-800"
              onClick={() => setImagenAmpliada(null)}
              aria-label="Cerrar imagen ampliada"
            >
              <X size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubirFoto;
