import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadVisitPhoto(
    file: File,
    visitId: string,
    onProgress?: (progress: number) => void
): Promise<string> {
    console.log("[Storage] Starting upload:", { fileName: file.name, fileSize: file.size, visitId });

    if (!file) throw new Error("No file selected");

    // Generate a unique path: visits/{visitId}/{timestamp}_{filename}
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const path = `visits/${visitId}/${timestamp}_${safeName}`;

    console.log("[Storage] Upload path:", path);
    console.log("[Storage] Storage bucket:", storage.app.options.storageBucket);

    try {
        const storageRef = ref(storage, path);
        console.log("[Storage] Created storage ref:", storageRef.fullPath);

        return new Promise((resolve, reject) => {
            const uploadTask = uploadBytesResumable(storageRef, file);
            console.log("[Storage] Upload task created");

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log("[Storage] Progress:", progress.toFixed(1) + "%");
                    onProgress?.(progress);
                },
                (error) => {
                    console.error("[Storage] Upload ERROR:", error.code, error.message);
                    reject(new Error(`Error al subir: ${error.message}`));
                },
                async () => {
                    console.log("[Storage] Upload complete, getting download URL...");
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log("[Storage] Download URL obtained:", downloadURL.substring(0, 50) + "...");
                        resolve(downloadURL);
                    } catch (error) {
                        console.error("[Storage] Error getting download URL:", error);
                        reject(new Error("Error al obtener URL de la imagen"));
                    }
                }
            );
        });
    } catch (error) {
        console.error("[Storage] Error creating ref or starting upload:", error);
        throw error;
    }
}

/**
 * Delete a photo from Firebase Storage using its download URL
 */
export async function deleteVisitPhotoFromStorage(photoUrl: string): Promise<void> {
    console.log("[Storage] Starting delete for:", photoUrl.substring(0, 80) + "...");

    try {
        // Extract the storage path from the download URL
        // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media&token=...
        const url = new URL(photoUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)/);

        if (!pathMatch) {
            throw new Error("Could not extract path from URL");
        }

        // Decode the path (it's URL encoded)
        const storagePath = decodeURIComponent(pathMatch[1]);
        console.log("[Storage] Extracted path:", storagePath);

        const { deleteObject } = await import("firebase/storage");
        const storageRef = ref(storage, storagePath);

        await deleteObject(storageRef);
        console.log("[Storage] File deleted successfully");
    } catch (error) {
        console.error("[Storage] Error deleting file:", error);
        throw error;
    }
}

