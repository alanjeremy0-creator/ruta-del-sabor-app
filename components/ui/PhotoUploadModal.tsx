"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Camera, Plus, Trash2 } from "lucide-react";
import { uploadVisitPhoto } from "@/lib/storage";
import { addVisitPhoto, deleteVisitPhoto } from "@/lib/firestore";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useToast } from "@/contexts/ToastContext";
import { useUser } from "@/hooks/useUser";
import { sendPushNotification } from "@/app/actions/push";

interface PhotoUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    visitId: string;
    onSuccess: () => void;
    initialMode?: 'view' | 'upload';
    existingPhotos?: string[];
    placeName?: string; // Added for notification
}

export function PhotoUploadModal({
    isOpen,
    onClose,
    visitId,
    onSuccess,
    initialMode = 'upload',
    existingPhotos = [],
    placeName = "un lugar"
}: PhotoUploadModalProps) {
    const { user } = useUser();
    const [mode, setMode] = useState<'view' | 'upload'>(initialMode);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const [mounted, setMounted] = useState(false); // Added mounted state

    // Reset/Sync state when opened
    useEffect(() => {
        setMounted(true); // Set mounted to true when component mounts
        if (isOpen) {
            setMode(initialMode);
            setSelectedFile(null);
            setPreviewUrl(null);
            setCurrentPhotoIndex(0);
        }
    }, [isOpen, initialMode]);

    if (!isOpen || !mounted) return null; // Modified conditional render

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpload = async () => {
        if (!visitId || !selectedFile) return;

        setIsUploading(true);
        setUploadProgress(0);
        try {
            // 1. Upload to Storage with progress tracking
            const downloadUrl = await uploadVisitPhoto(selectedFile, visitId, (progress) => {
                setUploadProgress(progress);
            });

            // 2. Save URL to Firestore
            await addVisitPhoto(visitId, downloadUrl);

            // --- SEND PUSH NOTIFICATION: NEW PHOTO ---
            if (user) {
                const otherUserId = user.id === "ara" ? "jeremy" : "ara";
                const notificationTitle = "📸 ¡Mira tu fotuca!";
                const notificationBody = `${user.name} subió un recuerdo de ${placeName}. ¡Nos vemos tan genial! Te amo ❤️`;

                sendPushNotification(otherUserId, notificationTitle, notificationBody, { url: "/" })
                    .catch(err => console.error("Failed to send push:", err));
            }
            // -----------------------------------------

            // 3. Success
            showToast("¡Recuerdo guardado! 📸", "success");
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Error al subir la foto 😢");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleDeletePhoto = async () => {
        if (!visitId || existingPhotos.length === 0) return;

        const photoToDelete = existingPhotos[currentPhotoIndex];
        // Removing confirm dialog for better UX/Reliability
        // const confirmDelete = window.confirm("¿Eliminar este recuerdo? 🥺 Esta acción no se puede deshacer.");
        // if (!confirmDelete) return;

        setIsDeleting(true);
        try {
            await deleteVisitPhoto(visitId, photoToDelete);
            // Adjust index if needed
            if (currentPhotoIndex >= existingPhotos.length - 1 && currentPhotoIndex > 0) {
                setCurrentPhotoIndex(currentPhotoIndex - 1);
            }
            showToast("Foto eliminada", "success");
            onSuccess(); // Refresh data
        } catch (error) {
            console.error("Error deleting photo:", error);
            alert("Error al eliminar la foto 😢");
        } finally {
            setIsDeleting(false);
        }
    };

    // Use Portal to break out of parent containers (PlaceCard has overflow-hidden)
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="card-pixel w-full max-w-md relative animate-scale-in border-2 border-[var(--pixel-pink)] bg-[#0f1020] shadow-2xl shadow-[var(--pixel-pink)]/20">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-white z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={24} />
                </button>

                {mode === 'view' && existingPhotos.length > 0 ? (
                    /* --- VIEW MODE --- */
                    <div className="px-6 pb-6 pt-12 text-center space-y-6">
                        <div className="space-y-2">
                            <h2 className="font-space font-bold text-2xl text-[var(--pixel-pink)]">
                                Recuerdos 📸
                            </h2>
                            <p className="text-sm text-gray-300">
                                {existingPhotos.length} {existingPhotos.length === 1 ? 'foto' : 'fotos'} de este momento
                            </p>
                        </div>

                        {/* Gallery Carousel */}
                        <div className="relative aspect-square w-full bg-black rounded-xl overflow-hidden border border-gray-700 group">
                            <Image
                                src={existingPhotos[currentPhotoIndex]}
                                alt="Recuerdo"
                                fill
                                className="object-contain"
                            />

                            {/* Navigation controls (if multiple) */}
                            {existingPhotos.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentPhotoIndex(curr => (curr - 1 + existingPhotos.length) % existingPhotos.length)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={() => setCurrentPhotoIndex(curr => (curr + 1) % existingPhotos.length)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                                    >
                                        →
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Dots Indicator */}
                        {existingPhotos.length > 1 && (
                            <div className="flex justify-center gap-2">
                                {existingPhotos.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentPhotoIndex ? 'bg-[var(--pixel-pink)]' : 'bg-gray-700'}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-4 space-y-3 flex flex-col">
                            <div className="sparkle-button-wrapper self-center w-full">
                                <span className="sparkle-star sparkle-star-1" style={{ color: "#22d3d1" }}>✦</span>
                                <span className="sparkle-star sparkle-star-2" style={{ color: "#22d3d1" }}>✦</span>
                                <span className="sparkle-star sparkle-star-3" style={{ color: "#06b6d4" }}>★</span>
                                <span className="sparkle-star sparkle-star-4" style={{ color: "#22d3d1" }}>✦</span>
                                <button
                                    onClick={() => setMode('upload')}
                                    className="btn-pixel text-sm w-full flex items-center justify-center gap-2"
                                    style={{ background: "#06b6d4", color: "#0f172a" }}
                                >
                                    <Plus size={16} />
                                    <span>Agregar otro recuerdo</span>
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    console.log("Delete button clicked");
                                    handleDeletePhoto();
                                }}
                                disabled={isDeleting}
                                className="btn-pixel-outline mt-2 text-[var(--pixel-pink)] border-[var(--pixel-pink)] hover:bg-[var(--pixel-pink)]/10 text-xs w-full flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? "Eliminando..." : (
                                    <>
                                        <Trash2 size={16} />
                                        Eliminar esta foto
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* --- UPLOAD MODE --- */
                    <div className="px-6 pb-6 pt-12 text-center space-y-6">
                        <div className="space-y-2">
                            <h2 className="font-space font-bold text-2xl text-[var(--pixel-pink)]">
                                {existingPhotos.length > 0 ? "Agregar Recuerdo" : "¡Recuerdo Desbloqueado! 📸"}
                            </h2>
                            <p className="text-sm text-gray-300">
                                {existingPhotos.length > 0
                                    ? "Sube otra fotito, que no se pierdan 💖"
                                    : "¿Se tomaron una fotito? Súbela para que no se nos olvide lo guapos que nos veíamos."
                                }
                            </p>
                        </div>

                        {/* Image Preview / Upload Area */}
                        <div
                            onClick={!selectedFile ? triggerFileInput : undefined}
                            className={`
                                border-2 border-dashed rounded-xl p-8 transition-all relative overflow-hidden group
                                ${previewUrl ? 'border-[var(--pixel-cyan)] bg-black' : 'border-gray-600 bg-surface/50 hover:bg-surface/80 cursor-pointer'}
                            `}
                        >
                            {previewUrl ? (
                                <div className="relative aspect-square w-full">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-contain"
                                    />
                                    {/* Change photo button overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={triggerFileInput}
                                            className="btn-pixel text-xs"
                                        >
                                            Cambiar foto
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-gray-400 py-4">
                                    <div className="p-4 rounded-full bg-white/5 pixel-border">
                                        <Camera size={32} className="text-[var(--pixel-pink)]" />
                                    </div>
                                    <span className="text-sm font-medium">Toca para seleccionar</span>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            {selectedFile ? (
                                <div className="space-y-2">
                                    <button
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                        className="w-full btn-pixel py-3 flex items-center justify-center gap-2 font-bold text-lg disabled:opacity-70"
                                        style={{ background: "var(--pixel-cyan)", color: "#000" }}
                                    >
                                        {isUploading ? (
                                            <span className="flex items-center gap-2">
                                                📡 Subiendo... {Math.round(uploadProgress)}%
                                            </span>
                                        ) : (
                                            <>
                                                <Upload size={20} />
                                                Guardar Recuerdo
                                            </>
                                        )}
                                    </button>
                                    {/* Progress Bar */}
                                    {isUploading && (
                                        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[var(--pixel-pink)] to-[var(--pixel-cyan)] transition-all duration-300 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {existingPhotos.length > 0 && (
                                        <button
                                            onClick={() => setMode('view')}
                                            className="text-sm text-muted hover:text-white"
                                        >
                                            ← Cancelar y ver fotos
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="text-sm text-muted hover:text-white underline decoration-dotted"
                                    >
                                        {existingPhotos.length > 0 ? "Cerrar" : "Omitir por ahora (qué aburrido 🙄)"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
