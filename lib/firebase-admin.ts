
import admin from 'firebase-admin';

// Only initialize if credentials are available (skips during build time)
const hasCredentials =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length && hasCredentials) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Handle escaped newlines in private key
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin Initialized');
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

// Create a lazy getter for db to avoid errors during build
const getDb = () => {
    if (!admin.apps.length) {
        throw new Error('Firebase Admin not initialized. Check environment variables.');
    }
    return admin.firestore();
};

// For backwards compatibility, export db as a getter
const db = new Proxy({} as admin.firestore.Firestore, {
    get: (_, prop) => {
        const firestore = getDb();
        const value = (firestore as any)[prop];
        return typeof value === 'function' ? value.bind(firestore) : value;
    }
});

export { db };
