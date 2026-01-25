
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
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
} else {
    console.warn("⚠️ .env.local not found");
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

async function checkActivity() {
    console.log("🔍 Checking activity for user: 'ara'...");
    const visitsRef = collection(db, "visits");
    const snapshot = await getDocs(visitsRef);

    if (snapshot.empty) {
        console.log("📭 No visits found in the database.");
        return;
    }

    let araActivity = [];

    snapshot.forEach(doc => {
        const data = doc.data();

        // Check if created by Ara
        if (data.userId === "ara") {
            araActivity.push({
                type: "CREATED_PLAN",
                placeId: data.placeId,
                date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : "Unknown date"
            });
        }

        // Check if rated by Ara
        if (data.ratings && data.ratings["ara"]) {
            araActivity.push({
                type: "RATED_VISIT",
                placeId: data.placeId,
                rating: data.ratings["ara"].rating,
                date: "Unknown rating date (timestamp not stored for rating)"
            });
        }
    });

    if (araActivity.length === 0) {
        console.log("❌ No active actions (plans or ratings) found for Ara.");
    } else {
        console.log(`✅ Found ${araActivity.length} actions by Ara:`);
        console.table(araActivity);
    }
}

checkActivity()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
