const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteVisit() {
    const visitsRef = collection(db, 'visits');
    const q = query(visitsRef, where('status', '==', 'planned'));
    const snap = await getDocs(q);

    for (const d of snap.docs) {
        const data = d.data();
        console.log('Deleting visit:', d.id);
        await deleteDoc(doc(db, 'visits', d.id));
        console.log('Deleted!');
    }
}

deleteVisit().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
