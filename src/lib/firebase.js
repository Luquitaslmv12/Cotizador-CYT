import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgM6ngvSCKg1EErN0ABNSN4cZzhRh_alg",
  authDomain: "cotizador-cyt.firebaseapp.com",
  projectId: "cotizador-cyt",
  storageBucket: "cotizador-cyt.firebasestorage.app",
  messagingSenderId: "521318051266",
  appId: "1:521318051266:web:8463f4f10fbdbefa17ba5b"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
