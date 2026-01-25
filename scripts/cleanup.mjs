
// Script to clean up all visits before production
import { initializeApp } from "firebase/app";
import { collection, getDocs, deleteDoc, doc, getFirestore } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Manually load .env.local because we are running a script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env.local");

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/"/g, ""); // basic parsing
        }
    });
    console.log("✅ Loaded environment variables from .env.local");
} else {
    console.warn("⚠️ .env.local not found, relying on process.env");
}

// Firebase config - same as in lib/firebase.ts
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

async function deleteAllVisits() {
    console.log("🔥 Starting data cleanup for production...");
    const visitsRef = collection(db, "visits");
    const snapshot = await getDocs(visitsRef);

    if (snapshot.empty) {
        console.log("✅ No visits to delete. Database is already clean!");
        return;
    }

    console.log(`🗑️ Deleting ${snapshot.size} visits...`);

    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "visits", d.id)));
    await Promise.all(deletePromises);

    console.log("✨ All visits deleted! Database is ready for production.");
}

deleteAllVisits()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Error:", err);
        process.exit(1);
    });
