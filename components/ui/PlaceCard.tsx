"use client";

import { StarRating } from "./StarRating";
import { categoryIcons } from "./FoodIcons";
import { DEFAULT_USERS } from "@/hooks/useUser";
import Image from "next/image";
import Link from "next/link";

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
    ratings: Record<string, Rating>;
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

    return (
        <article className="card-pixel rounded-none overflow-hidden card-glow transition-all mb-4">
            {/* Header */}
            <div className="p-4 pb-3 flex items-start gap-4">
                <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-surface/50 rounded-lg border border-border">
                    <IconComponent size={36} />
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
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-pink">🕐</span>
                    <span className="text-muted">{formatTime(visitDate)}</span>
                </div>
            </div>

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

                {/* Specific "Rate Now" button if current user hasn't rated yet but could */}
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

                {hasRatings && (
                    <div className="mt-4 text-center">
                        <Link href={`/place/${place.id}`} className="text-xs text-muted hover:text-pink transition-colors underline decoration-dotted">
                            Ver nuestra critica 🧐
                        </Link>
                    </div>
                )}
            </div>
        </article>
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
