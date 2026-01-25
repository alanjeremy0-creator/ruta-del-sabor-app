
import { db } from "./firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export async function deleteAllVisits() {
    console.log("🔥 Starting data cleanup...");
    const visitsRef = collection(db, "visits");
    const snapshot = await getDocs(visitsRef);

    if (snapshot.empty) {
        console.log("✅ No visits to delete.");
        return;
    }

    console.log(`🗑️ Deleting ${snapshot.size} legacy visits...`);

    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "visits", d.id)));
    await Promise.all(deletePromises);

    console.log("✨ All legacy visits deleted. Schema is clean.");
}
