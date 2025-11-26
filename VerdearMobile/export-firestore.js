import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

// COLE AQUI SEU firebaseConfig (do firebase.ts)
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

async function exportFirestore() {
  const exportData = {};
  const collections = ["users", "chats"]; // ❇️ Ajuste caso tenha mais coleções

  for (const col of collections) {
    const snap = await getDocs(collection(db, col));
    exportData[col] = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  fs.writeFileSync("firestore-export.json", JSON.stringify(exportData, null, 2));
  console.log("🔥 Exportação concluída! Veja o arquivo firestore-export.json");
}

exportFirestore();
