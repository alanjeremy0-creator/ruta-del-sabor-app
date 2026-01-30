import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadVisitPhoto(file: File, visitId: string): Promise<string> {
    if (!file) throw new Error("No file selected");

    // Generate a unique path: visits/{visitId}/{timestamp}_{filename}
    // Using timestamp to avoid collisions if multiple photos are uploaded
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const path = `visits/${visitId}/${timestamp}_${safeName}`;

    const storageRef = ref(storage, path);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading photo:", error);
        throw new Error("Error al subir la imagen");
    }
}
