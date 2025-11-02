import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALCGlMhkKdVcrp5nG0FQCxmdlzk8uwiJg",
  authDomain: "verdear-mobile.firebaseapp.com",
  projectId: "verdear-mobile",
  storageBucket: "verdear-mobile.firebasestorage.app",
  messagingSenderId: "841906024667",
  appId: "1:841906024667:web:ad5897ba03aeefe5381cfe"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta Auth e Firestore para usar nas telas
export const auth = getAuth(app);
export const db = getFirestore(app);
