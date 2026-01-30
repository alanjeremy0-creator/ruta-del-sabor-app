
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
// Using the same config approach as debug_visits_v2.ts since we are in raw node script land
import 'dotenv/config';

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

async function removeDuplicateVisits() {
    console.log("Cleanup: Removing duplicate visits...");
    try {
        const visitsRef = collection(db, "visits");
        const snapshot = await getDocs(visitsRef);

        if (snapshot.empty) {
            console.log("No visits found.");
            return;
        }

        const groups: Record<string, any[]> = {};

        // Group by Place + Date + Status
        // We'll create a key based on these.
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const dateStr = data.visitDate?.toDate?.()?.toISOString() || 'no-date';
            const key = `${data.placeId}_${dateStr}_${data.status}`;

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push({ id: doc.id, ...data });
        });

        for (const key of Object.keys(groups)) {
            const group = groups[key];
            if (group.length > 1) {
                console.log(`Found ${group.length} duplicates for key: ${key}`);
                // Keep the one with 'pending' confirmationStatus if possible, or just the first/latest one.
                // Logic: 
                // 1. Prefer ConfirmationStatus != undefined
                // 2. Prefer Latest created (if createdAt exists)? Or just keep one arbitrary.

                // Let's sort to keep the "most complete" one. 
                // We'll prioritize the one that has proposedBy set properly.
                group.sort((a, b) => {
                    const aScore = (a.confirmationStatus ? 1 : 0) + (a.proposedBy ? 1 : 0);
                    const bScore = (b.confirmationStatus ? 1 : 0) + (b.proposedBy ? 1 : 0);
                    return bScore - aScore; // Descending score
                });

                const keeper = group[0];
                const duplicates = group.slice(1);

                console.log(`  -> Keeping: ${keeper.id} (Score matches details)`);

                for (const dupe of duplicates) {
                    console.log(`  -> Deleting duplicate: ${dupe.id}`);
                    await deleteDoc(doc(db, "visits", dupe.id));
                }
            }
        }

    } catch (e) {
        console.error("Error in cleanup script:", e);
    }
}

removeDuplicateVisits().then(() => {
    console.log("Cleanup complete.");
    process.exit(0);
});
