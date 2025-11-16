import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

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

// Para React Native, usamos getAuth diretamente
// A persistência é gerenciada automaticamente pelo Firebase
let auth;

if (Platform.OS === 'web') {
  // Para web, usa getAuth padrão
  auth = getAuth(app);
} else {
  // Para mobile (Android/iOS), também usa getAuth
  // O Firebase SDK já gerencia a persistência no mobile
  auth = getAuth(app);

  // Se quiser configuração adicional de persistência no futuro:
  // import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
  // import AsyncStorage from '@react-native-async-storage/async-storage';
  // auth = initializeAuth(app, {
  //   persistence: getReactNativePersistence(AsyncStorage)
  // });
}

export { auth };

// Exporta Firestore para usar nas telas
export const db = getFirestore(app);
