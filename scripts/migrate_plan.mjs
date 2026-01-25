
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, doc, updateDoc, query, where } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Manually load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env.local");

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/"/g, "");
        }
    });
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migratePlan() {
    console.log("🔍 Buscando el plan activo...");
    const visitsRef = collection(db, "visits");
    // Find the active 'planned' visit
    const q = query(visitsRef, where("status", "==", "planned"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log("❌ No se encontró ningún plan activo.");
        return;
    }

    // Assume the first one is the target (since there should be only one)
    const visitDoc = snapshot.docs[0];
    const visitData = visitDoc.data();

    console.log(`✅ Plan encontrado: ID ${visitDoc.id}`);
    console.log(`📍 Lugar ID: ${visitData.placeId}`);

    console.log("🔄 Actualizando a estado 'Propuesta Pendiente'...");

    const docRef = doc(db, "visits", visitDoc.id);
    await updateDoc(docRef, {
        confirmationStatus: 'pending',
        proposedBy: 'ara' // Ara created it, so she is the proposer
    });

    console.log("✨ ¡Listo! El plan ahora está esperando confirmación de Jeremy.");
}

migratePlan()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
