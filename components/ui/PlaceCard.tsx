"use client";

import { useState } from "react";

import { StarRating } from "./StarRating";
import { categoryIcons } from "./FoodIcons";
import { DEFAULT_USERS } from "@/hooks/useUser";
import Image from "next/image";
import Link from "next/link";
import { PhotoUploadModal } from "./PhotoUploadModal";
import { useGooglePlacePhoto } from "@/hooks/useGooglePlacePhoto";

export interface Place {
    id: string;
    name: string;
    address: string;
    category: "taco" | "coffee" | "burger" | "cocktail" | "sushi" | "food";
    lat?: number;
    lng?: number;
    photoReference?: string;
}

export interface Rating {
    userId: "ara" | "jeremy";
    rating: number;
    notes?: string;
}

export interface Visit {
    id: string;
    place: Place;
    userId: "ara" | "jeremy"; // Creator
    visitDate: Date;
    status: "planned" | "completed";
    confirmationStatus?: 'pending' | 'confirmed';
    proposedBy?: "ara" | "jeremy";
    ratings: Record<string, Rating>;
    photos?: string[];
}

interface PlaceCardProps {
    visit: Visit;
    currentUserId?: string; // To know who is viewing
    onRate?: (visitId: string) => void;
    users?: Record<string, { id: string; name: string; avatarUrl: string }>; // Custom avatars from localStorage
}

export function PlaceCard({ visit, currentUserId, onRate, users }: PlaceCardProps) {
    const { place, status, ratings, visitDate } = visit;
    const isPast = new Date(visitDate) < new Date(); // Simple check, buffer handled in parent
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [photoModalMode, setPhotoModalMode] = useState<'view' | 'upload'>('view');
    const [imageError, setImageError] = useState(false);

    // Use custom avatars if provided, otherwise fall back to defaults
    const araUser = users?.ara || DEFAULT_USERS.ara;
    const jeremyUser = users?.jeremy || DEFAULT_USERS.jeremy;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "short",
        }).format(new Date(date));
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat("es-MX", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(new Date(date));
    };

    // Calculate Average
    const ratingValues = Object.values(ratings);
    const hasRatings = ratingValues.length > 0;
    const averageRating = hasRatings
        ? ratingValues.reduce((acc, r) => acc + r.rating, 0) / ratingValues.length
        : 0;

    // Check individual completion
    const araRating = ratings["ara"];
    const jeremyRating = ratings["jeremy"];

    // Icon
    const IconComponent = categoryIcons[place.category] || categoryIcons.food;

    const googlePhotoUrl = useGooglePlacePhoto(place.id, place.photoReference);

    return (
        <article className="card-pixel rounded-none overflow-hidden card-glow transition-all mb-4">
            {/* Header */}
            <div className="p-4 pb-3 flex items-start gap-4">
                <div className="w-14 h-14 flex-shrink-0 rounded-lg border border-border overflow-hidden relative">
                    {googlePhotoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={googlePhotoUrl}
                            alt={place.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface/50">
                            <IconComponent size={32} className="opacity-50" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-space font-bold text-lg text-primary leading-tight">
                        {place.name}
                    </h3>
                    <p className="text-sm text-muted mt-1 line-clamp-2">
                        {place.address || "Toluca, México"}
                    </p>
                </div>
            </div>

            {/* Date/Time */}
            <div className="px-4 pb-3 flex items-center gap-4 border-b border-border/50">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-pink">📅</span>
                    <span className="text-muted capitalize">{formatDate(visitDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-pink">🕐</span>
                    <span className="text-muted">{formatTime(visitDate)}</span>
                </div>
            </div>

            {/* Photo Memories Section */}
            {visit.photos && visit.photos.length > 0 && (
                <div className="px-4 pb-3 border-b border-border/50">
                    <button
                        onClick={() => {
                            setPhotoModalMode('view');
                            setShowPhotoModal(true);
                        }}
                        className="w-full"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-pink text-sm">💕</span>
                            <span className="text-xs font-bold text-muted uppercase tracking-wider">
                                Nuestros Recuerdos ({visit.photos.length})
                            </span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {visit.photos.slice(0, 4).map((photoUrl, idx) => (
                                <div
                                    key={idx}
                                    className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-border hover:border-pink transition-colors"
                                >
                                    <Image
                                        src={photoUrl}
                                        alt={`Recuerdo ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    {idx === 3 && visit.photos && visit.photos.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">+{visit.photos.length - 4}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </button>
                </div>
            )}

            {/* Ratings Section */}
            {/* Ratings Section */}
            <div className="p-4 bg-surface/30">
                {hasRatings ? (
                    <div className="flex flex-col gap-3">
                        {/* Average Large Star */}
                        {ratingValues.length === 2 && (
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-gold text-2xl">★</span>
                                <span className="font-space font-bold text-xl text-gold">
                                    {averageRating.toFixed(1)}
                                </span>
                                <span className="text-xs text-muted font-bold tracking-widest uppercase ml-1">
                                    Promedio
                                </span>
                            </div>
                        )}

                        {/* Avatars Row */}
                        <div className="flex items-center justify-center gap-8">
                            {/* Ara */}
                            <AvatarRating
                                user={araUser}
                                rating={araRating}
                                isWaiting={!araRating}
                            />

                            {/* Link/Divider */}
                            <div className="text-border text-xs">♥</div>

                            {/* Jeremy */}
                            <AvatarRating
                                user={jeremyUser}
                                rating={jeremyRating}
                                isWaiting={!jeremyRating}
                            />
                        </div>
                    </div>
                ) : (
                    // No ratings yet
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted italic">Sin calificaciones aún</span>
                        {onRate && (
                            <button
                                onClick={() => onRate(visit.id)}
                                className="btn-pixel text-xs py-2 px-4"
                            >
                                Calificar ⭐
                            </button>
                        )}
                    </div>
                )}

                {/* Rate Now Button (if applicable) */}
                {currentUserId && !ratings[currentUserId] && hasRatings && onRate && (
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => onRate(visit.id)}
                            className="btn-pixel text-xs py-2 px-6 w-full"
                        >
                            ¡Te toca calificar! ⭐
                        </button>
                    </div>
                )}

                {/* Footer Actions (Critique + Photos) */}
                {hasRatings && (
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                        <Link href={`/place/${place.id}`} className="text-muted hover:text-pink transition-colors underline decoration-dotted">
                            Ver nuestra critica 🧐
                        </Link>

                        <div className="w-1 h-1 rounded-full bg-gray-700" />

                        {visit.photos && visit.photos.length > 0 ? (
                            <button
                                onClick={() => {
                                    setPhotoModalMode('view');
                                    setShowPhotoModal(true);
                                }}
                                className="text-muted hover:text-[var(--pixel-cyan)] transition-colors underline decoration-dotted flex items-center gap-1"
                            >
                                Ver recuerdos 📸
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setPhotoModalMode('upload');
                                    setShowPhotoModal(true);
                                }}
                                className="text-muted hover:text-[var(--pixel-cyan)] transition-colors underline decoration-dotted flex items-center gap-1"
                            >
                                Agregar recuerdo ➕
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Photo Modal */}
            <PhotoUploadModal
                isOpen={showPhotoModal}
                visitId={visit.id}
                initialMode={photoModalMode}
                placeName={place.name}
                onClose={() => setShowPhotoModal(false)}
                onSuccess={() => {
                    setShowPhotoModal(false);
                    // Could trigger a refresh here if needed
                }}
                existingPhotos={visit.photos}
            />
        </article >
    );
}

function AvatarRating({ user, rating, isWaiting }: { user: any, rating: Rating | undefined, isWaiting: boolean }) {
    return (
        <div className={`flex flex-col items-center gap-1 ${isWaiting ? "opacity-50 grayscale" : ""}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border relative">
                <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex items-center gap-1">
                {isWaiting ? (
                    <span className="text-[10px] text-muted font-bold uppercase tracking-wide">Esperando</span>
                ) : (
                    <>
                        <span className="text-gold text-xs">★</span>
                        <span className="font-bold text-sm">{rating?.rating}</span>
                    </>
                )}
            </div>
        </div>
    );
}
