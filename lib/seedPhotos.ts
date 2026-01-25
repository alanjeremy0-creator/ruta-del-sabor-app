
import { db } from "./firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

// Mock photos for our categories
const MOCK_PHOTOS = {
    taco: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    coffee: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    cocktail: "https://images.unsplash.com/photo-1536935338788-843bb6d88460?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sushi: "https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    food: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
};

export async function seedMockPhotos() {
    console.log("Adding mock photos...");
    try {
        const placesRef = collection(db, "places");
        const snapshot = await getDocs(placesRef);

        const updates = snapshot.docs.map(async (placeDoc) => {
            const place = placeDoc.data();
            const category = place.category || "food";
            const mockPhoto = MOCK_PHOTOS[category as keyof typeof MOCK_PHOTOS] || MOCK_PHOTOS.food;

            await updateDoc(doc(db, "places", placeDoc.id), {
                photoReference: mockPhoto
            });
            console.log(`Updated ${place.name} with photo`);
        });

        await Promise.all(updates);
        console.log("Done updating photos!");
        return true;
    } catch (error) {
        console.error("Error seeding photos:", error);
        return false;
    }
}
