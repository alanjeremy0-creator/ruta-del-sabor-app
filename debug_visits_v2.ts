
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
// We hardcode config here to avoid importing issues with dotenv/paths in this raw script environment if needed
// Or we assume standard module resolution works. 
// Given the previous lint error "firebaseConfig not exported", we probably need to check lib/firebase.ts exports.
// But for now let's just use the known config if we can, or rely on environment variables if loading them correctly.

// Actually, let's try to import specifically from the file, assuming it exports 'db' or 'app' or 'firebaseConfig'.
// If not exported, we can't import.

// Let's redefine the config here for safety in a standalone script context
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if env vars are present (requires dotenv)
import 'dotenv/config';

// Re-initialize with process.env loaded
const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(config);
const db = getFirestore(app);

async function checkAndFixVisits() {
    console.log("Checking visits (v2)...");
    try {
        const visitsRef = collection(db, "visits");
        const snapshot = await getDocs(visitsRef);

        if (snapshot.empty) {
            console.log("No visits found.");
            return;
        }

        for (const visitDoc of snapshot.docs) {
            const data = visitDoc.data();
            console.log(`Visit ID: ${visitDoc.id}`);
            console.log(`  Status: ${data.status}`);
            console.log(`  Confirmation: ${data.confirmationStatus} (Type: ${typeof data.confirmationStatus})`);

            // Force update logic:
            // logic: if status is 'planned' andconfirmationStatus is NOT explicitly 'pending', force it.
            // This covers 'confirmed', undefined, null, etc.
            if (data.status === 'planned' && data.confirmationStatus !== 'pending') {
                console.log("  -> FIXING: Forcing to pending status.");
                await updateDoc(doc(db, "visits", visitDoc.id), {
                    confirmationStatus: 'pending',
                    proposedBy: data.userId || 'ara'
                });
                console.log("  -> Fixed.");
            } else {
                console.log("  -> OK (already pending or completed)");
            }
        }
    } catch (e) {
        console.error("Error in script:", e);
    }
}

checkAndFixVisits().then(() => process.exit(0));
