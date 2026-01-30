
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { firebaseConfig } from "./lib/firebase";

// Initialize Firebase (reusing checks from lib/firebase if possible, but raw here for script)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAndFixVisits() {
    console.log("Checking visits...");
    const visitsRef = collection(db, "visits");
    const snapshot = await getDocs(visitsRef);

    if (snapshot.empty) {
        console.log("No visits found.");
        return;
    }

    for (const visitDoc of snapshot.docs) {
        const data = visitDoc.data();
        console.log(`Visit ID: ${visitDoc.id}`);
        console.log(`  Place ID: ${data.placeId}`);
        console.log(`  Date: ${data.visitDate?.toDate()}`);
        console.log(`  Status: ${data.status}`);
        console.log(`  Confirmation Status: ${data.confirmationStatus}`);
        console.log(`  Proposed By: ${data.proposedBy}`);
        console.log("-----------------------------------");

        // Fix for the specific problem: If it's planned but has no confirmation info
        if (data.status === 'planned' && (data.confirmationStatus === 'confirmed' || !data.confirmationStatus)) {
            console.log(`  -> FLAGGED: This visit looks like the one stuck in confirmed/legacy state.`);

            // We will FORCE update this to pending to fix the user's issue immediately
            console.log(`  -> FIXING: Updating to 'pending' and proposedBy='ara' (assuming Ara created it based on user context)`);

            try {
                await updateDoc(doc(db, "visits", visitDoc.id), {
                    confirmationStatus: 'pending',
                    proposedBy: data.userId || 'ara' // Default to creator
                });
                console.log("  -> SUCCESS: Visit updated.");
            } catch (e) {
                console.error("  -> ERROR updating visit:", e);
            }
        }
    }
}

checkAndFixVisits().then(() => {
    console.log("Done.");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
