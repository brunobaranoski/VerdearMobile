import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyALCGlMhkKdVcrp5nG0FQCxmdlzk8uwiJg",
  authDomain: "verdear-mobile.firebaseapp.com",
  projectId: "verdear-mobile",
  storageBucket: "verdear-mobile.firebasestorage.app",
  messagingSenderId: "841906024667",
  appId: "1:841906024667:web:ad5897ba03aeefe5381cfe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// LISTA DE TODAS AS COLEÇÕES DO SEU FIRESTORE
const collectionsToExport = [
  "users",
  "chats",
  "orders",
  "products",
  "reviews",
  "ratings",
  "messages"
];

async function exportFirestore() {
  const exportData = {};

  console.log("📦 Exportando coleções do Firestore...");

  for (const colName of collectionsToExport) {
    try {
      const snap = await getDocs(collection(db, colName));
      exportData[colName] = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(` → ${colName}: ${snap.size} documentos`);
    } catch (err) {
      console.log(` ⚠️ Falha ao exportar ${colName}:`, err.message);
    }
  }

  fs.writeFileSync("firestore-export.json", JSON.stringify(exportData, null, 2));
  console.log("🔥 Exportação concluída com sucesso!");
  console.log("📁 Arquivo gerado: firestore-export.json");
}

exportFirestore();
