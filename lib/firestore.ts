import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    setDoc,
    arrayUnion
} from "firebase/firestore";
import { db } from "./firebase";

// Types
export interface Rating {
    userId: "ara" | "jeremy";
    rating: number;
    notes?: string;
    createdAt: Timestamp;
}

export interface Place {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    photoReference?: string;
    category: "taco" | "coffee" | "burger" | "cocktail" | "sushi" | "food";
    createdAt: Timestamp;
}

export interface Visit {
    id: string;
    placeId: string;
    userId: "ara" | "jeremy"; // Creator
    visitDate: Timestamp;
    status: "planned" | "completed";
    confirmationStatus?: 'pending' | 'confirmed'; // New field for Option B
    proposedBy?: "ara" | "jeremy"; // New field for ping-pong
    ratings: Record<string, Rating>; // Map by userId
    photos?: string[]; // Array of photo URLs
    createdAt: Timestamp;
    completedAt?: Timestamp; // Time of first completion? Or update every time?
}

// Places
export async function getPlace(placeId: string): Promise<Place | null> {
    const docRef = doc(db, "places", placeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Place;
    }
    return null;
}

export async function savePlace(place: Omit<Place, "createdAt">): Promise<void> {
    const docRef = doc(db, "places", place.id);
    await setDoc(docRef, {
        ...place,
        createdAt: Timestamp.now(),
    });
}

// Visits
export async function getVisits(): Promise<Visit[]> {
    const visitsRef = collection(db, "visits");
    const q = query(visitsRef, orderBy("visitDate", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Visit[];
}

export async function getPlannedVisits(): Promise<Visit[]> {
    const visitsRef = collection(db, "visits");
    const q = query(
        visitsRef,
        where("status", "==", "planned"),
        orderBy("visitDate", "asc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Visit[];
}

export async function getCompletedVisits(): Promise<Visit[]> {
    const visitsRef = collection(db, "visits");
    const q = query(
        visitsRef,
        where("status", "==", "completed"),
        orderBy("completedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Visit[];
}

export async function getVisitById(visitId: string): Promise<Visit | null> {
    const visitRef = doc(db, "visits", visitId);
    const visitSnap = await getDoc(visitRef);

    if (!visitSnap.exists()) {
        return null;
    }

    return {
        id: visitSnap.id,
        ...visitSnap.data(),
    } as Visit;
}

export async function createVisit(
    visit: Omit<Visit, "id" | "createdAt" | "ratings">
): Promise<string> {
    const visitsRef = collection(db, "visits");
    const docRef = await addDoc(visitsRef, {
        ...visit,
        confirmationStatus: 'pending', // Always pending initially
        proposedBy: visit.userId, // Creator proposes first
        ratings: {}, // Initialize empty ratings
        createdAt: Timestamp.now(),
    });
    return docRef.id;
}

// NEW: Function to handle rescheduling/proposal logic
export async function updateVisitDate(
    visitId: string,
    newDate: Date,
    proposedBy: "ara" | "jeremy"
): Promise<void> {
    const docRef = doc(db, "visits", visitId);
    await updateDoc(docRef, {
        visitDate: Timestamp.fromDate(newDate),
        confirmationStatus: 'pending', // Revert to pending on change
        proposedBy: proposedBy, // Flip responsibility
    });
}

// NEW: Function to confirm a visit
export async function confirmVisit(visitId: string): Promise<void> {
    const docRef = doc(db, "visits", visitId);
    await updateDoc(docRef, {
        confirmationStatus: 'confirmed'
    });
}

export async function completeVisit(
    visitId: string,
    userId: "ara" | "jeremy",
    rating: number,
    notes?: string
): Promise<void> {
    const docRef = doc(db, "visits", visitId);

    // Create the rating object
    const newRating: Rating = {
        userId,
        rating,
        notes,
        createdAt: Timestamp.now()
    };

    // We use dot notation to update just this user's rating in the map
    await updateDoc(docRef, {
        status: "completed", // Always mark as completed (at least partial)
        [`ratings.${userId}`]: newRating,
        completedAt: Timestamp.now(), // Update latest activity
    });
}

export async function addVisitPhoto(visitId: string, photoUrl: string): Promise<void> {
    const docRef = doc(db, "visits", visitId);
    await updateDoc(docRef, {
        photos: arrayUnion(photoUrl)
    });
}

export async function deleteVisit(visitId: string): Promise<void> {
    const docRef = doc(db, "visits", visitId);
    await deleteDoc(docRef);
}

export async function deleteVisitsByPlaceId(placeId: string): Promise<void> {
    const visitsRef = collection(db, "visits");
    const q = query(visitsRef, where("placeId", "==", placeId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((docSnapshot) =>
        deleteDoc(doc(db, "visits", docSnapshot.id))
    );

    await Promise.all(deletePromises);
}

export async function deletePlace(placeId: string): Promise<void> {
    const docRef = doc(db, "places", placeId);
    await deleteDoc(docRef);
}

export async function getVisitsByPlaceId(placeId: string): Promise<Visit[]> {
    const visitsRef = collection(db, "visits");
    const q = query(
        visitsRef,
        where("placeId", "==", placeId)
    );
    const querySnapshot = await getDocs(q);

    const visits = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Visit[];

    // Sort in memory to avoid needing a composite index
    return visits.sort((a, b) => {
        const dateA = a.visitDate?.toMillis() || 0;
        const dateB = b.visitDate?.toMillis() || 0;
        return dateB - dateA;
    });
}

// Utility: Map Google Place types to categories
export function mapGoogleTypeToCategory(
    types: string[]
): Place["category"] {
    const typeMap: Record<string, Place["category"]> = {
        cafe: "coffee",
        bakery: "coffee",
        coffee_shop: "coffee",
        bar: "cocktail",
        night_club: "cocktail",
        meal_takeaway: "burger",
        meal_delivery: "burger",
        fast_food: "burger",
    };

    for (const type of types) {
        if (typeMap[type]) {
            return typeMap[type];
        }
        // Check for taco-related keywords
        if (type.includes("mexican") || type.includes("taco")) {
            return "taco";
        }
        // Check for sushi/japanese
        if (type.includes("japanese") || type.includes("sushi")) {
            return "sushi";
        }
    }

    return "food"; // Default
}
