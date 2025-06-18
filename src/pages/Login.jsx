import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Inicio de sesión exitoso");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center items-center min-h-screen bg-gray-900"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm space-y-6"
        >
          <h2 className="text-2xl font-semibold text-center text-white">
            Iniciar Sesión
          </h2>

          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute top-3 left-3 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "El correo es obligatorio",
                pattern: {
                  value: /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/,
                  message: "Correo no válido",
                },
              })}
              className="pl-10 pr-4 py-2 w-full bg-gray-700 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1 ml-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 6,
                  message: "Mínimo 6 caracteres",
                },
              })}
              className="pl-10 pr-10 py-2 w-full bg-gray-700 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-200 transition"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1 ml-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-xl transition duration-200 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Iniciar sesión"}
          </button>

          {/* Forgot password link */}
          <button
            type="button"
            onClick={() => navigate("/forgotpassword")}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-200 transition"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      </motion.div>
    </>
  );
};

export default Login;
