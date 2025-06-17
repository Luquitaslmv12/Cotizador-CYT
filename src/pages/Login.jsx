import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/dashboard");
  } catch (err) {
    console.error(err);
  }
};

  return (
    <form onSubmit={handleLogin} className="p-4 flex flex-col gap-2">
      <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
      <button type="submit" className="bg-green-500 text-white px-4 py-2">Iniciar sesión</button>
    </form>
  );
};

export default Login;
