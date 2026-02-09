"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { X, Heart } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { PixelConfetti } from "@/components/ui/PixelConfetti";
import { categoryIcons, FoodIcon } from "@/components/ui/FoodIcons";
import { FoodEmblem } from "@/components/ui/FoodEmblem";
import { getVisitById, getPlace, completeVisit, type Visit, type Place, type Rating } from "@/lib/firestore";
import { useUser } from "@/hooks/useUser";
import { PhotoUploadModal } from "@/components/ui/PhotoUploadModal";
import { useToast } from "@/contexts/ToastContext";
import { sendPushNotification } from "@/app/actions/push";

interface HydratedVisit {
    id: string;
    place: Place;
    visitDate: Date;
    status: "planned" | "completed";
    ratings: Record<string, Rating>;
}

export default function RatePage({ params }: { params: Promise<{ visitId: string }> }) {
    const router = useRouter();
    const { visitId } = use(params);
    const { user, isLoading: userLoading } = useUser();
    const { showToast } = useToast();

    const [visit, setVisit] = useState<HydratedVisit | null>(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    // Fetch the visit and its place data
    useEffect(() => {
        async function fetchVisit() {
            if (!visitId) {
                setLoading(false);
                return;
            }

            try {
                const visitData = await getVisitById(visitId);

                if (!visitData) {
                    console.error("Visit not found:", visitId);
                    setLoading(false);
                    return;
                }

                const placeData = await getPlace(visitData.placeId);

                if (!placeData) {
                    console.error("Place not found:", visitData.placeId);
                    setLoading(false);
                    return;
                }

                setVisit({
                    id: visitData.id,
                    place: placeData,
                    visitDate: visitData.visitDate.toDate(),
                    status: visitData.status,
                    ratings: visitData.ratings || {},
                });
            } catch (error) {
                console.error("Error fetching visit:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchVisit();
    }, [visitId]);

    const handleSubmit = async () => {
        console.log("Submit clicked. State:", { rating, visitId: visit?.id, userId: user?.id, isSubmitting });

        if (rating === 0) {
            console.warn("Rating is 0, aborting");
            return;
        }
        if (!visit || !user) {
            console.error("Missing visit or user", { visit, user });
            return;
        }

        setIsSubmitting(true);

        try {
            console.log("Calling completeVisit...");
            await completeVisit(visit.id, user.id as "ara" | "jeremy", rating, notes);
            console.log("completeVisit success");

            // --- SEND PUSH NOTIFICATION ---
            const otherUserId = user.id === "ara" ? "jeremy" : "ara";
            const placeName = visit.place.name;
            const notificationTitle = `⭐ ${user.name} ya dio su veredicto...`;
            const notificationBody = `¿Le gustó ${placeName}? Entra a ver qué dijo y cuánto le puso. 🫣`;

            sendPushNotification(otherUserId, notificationTitle, notificationBody, { url: `/rate/${visit.id}` })
                .catch(err => console.error("Failed to send push:", err));
            // ------------------------------

            showToast("¡Gracias por calificar! ⭐", "success");
            setShowConfetti(true);
            setIsSubmitting(false);

            // Instead of success immediately, show modal
            setShowPhotoModal(true);
            // Logic continues in modal callbacks
            /*
                        setShowSuccess(true);
                        setTimeout(() => {
                            router.push("/");
                        }, 3000);
            */
        } catch (error) {
            console.error("Error completing visit:", error);
            alert("Error al guardar la calificación. Checa la consola.");
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        router.push("/");
    };

    if (loading || userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base">
                <FoodEmblem size={64} className="animate-bounce" />
            </div>
        );
    }

    if (!visit || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <p className="text-xl font-space font-bold mb-4">
                    {!visit ? "Visita no encontrada 😢" : "No estás identificado 👤"}
                </p>
                <button onClick={() => router.push("/")} className="btn-pixel">
                    Regresar al inicio
                </button>
            </div>
        );
    }

    // Check if user already rated
    const hasRated = !!visit.ratings[user.id];

    // Get the icon component
    const IconComponent = categoryIcons[visit.place.category] || FoodIcon;

    // Success Screen with Confetti
    if (showSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-base relative overflow-hidden">
                <PixelConfetti isActive={true} />

                {/* Success Animation */}
                <div className="text-center z-10 animate-success-pop">
                    <div className="mb-6 relative">
                        <Heart
                            className="w-24 h-24 text-pink mx-auto animate-pulse"
                            fill="currentColor"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl animate-bounce">💕</span>
                        </div>
                    </div>
                    <h2 className="font-space font-bold text-2xl text-pink mb-2 animate-fade-in">
                        ¡Ya lo criticamos!
                    </h2>
                    <p className="text-lg text-muted animate-fade-in" style={{ animationDelay: "0.3s" }}>
                        Fue genial comer contigo amor 💌
                    </p>
                </div>

                <style jsx>{`
                    @keyframes success-pop {
                        0% { transform: scale(0); opacity: 0; }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .animate-success-pop {
                        animation: success-pop 0.5s ease-out forwards;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-dark border-b border-border">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                    <h1 className="font-space font-bold text-lg">¿Qué tal estuvo?</h1>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 hover:bg-surface flex items-center justify-center pixel-border"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-lg mx-auto p-4">
                {/* Place Info */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <IconComponent size={64} />
                    </div>
                    <h2 className="font-space font-bold text-2xl mb-1">
                        {visit.place.name}
                    </h2>
                    <p className="text-muted text-sm">
                        {visit.place.address}
                    </p>
                </div>

                {hasRated ? (
                    // User already rated - Show waiting screen or simple success
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">👀</div>
                        <h3 className="font-space font-bold text-xl mb-2">¡Tu parte está lista!</h3>
                        <p className="text-muted text-sm px-8">
                            Ahora debemos esperar a que tu pareja califique para ver el resultado final. ¡No arruines la sorpresa! 🤫
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="btn-pixel mt-8"
                        >
                            Volver al Mapa
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Star Rating */}
                        <div className="text-center mb-8">
                            <p className="text-muted text-sm mb-4">
                                Toca las estrellas para calificar
                            </p>
                            <div className="flex justify-center">
                                <StarRating
                                    value={rating}
                                    onChange={setRating}
                                    size="lg"
                                />
                            </div>
                            {rating > 0 && (
                                <p className="mt-3 font-space font-bold text-gold">
                                    {rating === 5 && "¡Muy de fuego! 🌟🔥🤯"}
                                    {rating === 4 && "¡Estuvo bien! 😋"}
                                    {rating === 3 && "Está equis 🥱"}
                                    {rating === 2 && "Mejor una maruchan 😒"}
                                    {rating === 1 && "¡Iugh! 🤢, cierren ese negocio ⚠️"}
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="mb-8">
                            <label className="text-xs text-muted uppercase tracking-widest block mb-2">
                                Una ligera nota pa acordarnos de por que calificamos así 😉 (no es afuerza eh!)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="La salsa verde pica mucho, pedir agua..."
                                rows={3}
                                className="w-full p-3 border-2 border-border bg-surface focus:outline-none focus:border-pink resize-none pixel-border text-primary placeholder:text-muted"
                            />
                        </div>

                        {/* Submit Button */}
                        {rating > 0 && !isSubmitting ? (
                            <div className="sparkle-button-wrapper w-full">
                                <span className="sparkle-star sparkle-star-1">✦</span>
                                <span className="sparkle-star sparkle-star-2">✦</span>
                                <span className="sparkle-star sparkle-star-3" style={{ color: "var(--pixel-pink)" }}>★</span>
                                <span className="sparkle-star sparkle-star-4">✦</span>
                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-4 font-bold uppercase tracking-wide btn-pixel"
                                    style={{ background: "var(--pixel-gold)", color: "#0D0B1E" }}
                                >
                                    Calificar ¡YA! 🤙
                                </button>
                            </div>
                        ) : (
                            <button
                                disabled
                                className="w-full py-4 font-bold uppercase tracking-wide bg-border text-muted cursor-not-allowed pixel-border"
                            >
                                {isSubmitting ? "Guardando..." : "Calificar ¡YA! 🤙"}
                            </button>
                        )}
                    </>
                )}
            </main>

            <PixelConfetti isActive={showConfetti} />

            {/* Photo Modal Integration */}
            {visit && (
                <PhotoUploadModal
                    isOpen={showPhotoModal}
                    visitId={visit.id}
                    onClose={() => {
                        setShowPhotoModal(false);
                        setShowSuccess(true); // Show success screen after modal
                        setTimeout(() => router.push("/"), 2500);
                    }}
                    onSuccess={() => {
                        setShowPhotoModal(false);
                        setShowSuccess(true); // Show success screen after modal
                        setTimeout(() => router.push("/"), 2500);
                    }}
                />
            )}
        </div>
    );
}
