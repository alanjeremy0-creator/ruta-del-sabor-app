"use client";

import { useRouter } from "next/navigation";
import { type Visit } from "@/components/ui/PlaceCard";
import { categoryIcons, FoodIcon } from "@/components/ui/FoodIcons"; // Ensure FoodIcon handles fallback
import { CalendarClock } from "lucide-react";

import Image from "next/image";
import { useGooglePlacePhoto } from "@/hooks/useGooglePlacePhoto";

interface PlanStatusCardProps {
    visit: Visit;
    currentUserId: "ara" | "jeremy";
    onConfirm: (visitId: string) => void;
    onReschedule: () => void; // Opens the modal
    users?: Record<string, { id: string; name: string; avatarUrl: string }>;
}

export function PlanStatusCard({ visit, currentUserId, onConfirm, onReschedule, users }: PlanStatusCardProps) {
    const router = useRouter();
    const { proposedBy, confirmationStatus, userId: creatorId } = visit;

    // If it's already confirmed or is a legacy plan (undefined status), don't show this card
    if (confirmationStatus === "confirmed" || confirmationStatus === undefined) {
        return null;
    }

    const isMyTurn = proposedBy !== currentUserId;
    const partnerId = currentUserId === "ara" ? "jeremy" : "ara";
    const partnerName = currentUserId === "ara" ? "Jeremy" : "Ara";

    // Get proposer's avatar (whoever proposed it)
    const proposerId = proposedBy || creatorId; // Fallback to creator if undefined
    const proposerAvatar = users?.[proposerId]?.avatarUrl;

    // Icon
    const IconComponent = categoryIcons[visit.place.category] || FoodIcon;

    // --- REUSABLE OFFER CARD COMPONENT ---
    const OfferCard = ({ showActions }: { showActions: boolean }) => {
        const googlePhotoUrl = useGooglePlacePhoto(visit.place.id, visit.place.photoReference);

        return (
            <div className="bg-[#1a1b2e] rounded-xl border border-white/5 overflow-hidden transition-all hover:bg-[#202136] relative group">
                {/* Clickable Area for Navigation */}
                <div
                    onClick={(e) => {
                        // Prevent navigation if clicking buttons
                        if ((e.target as HTMLElement).closest('button')) return;
                        router.push(`/place/${visit.place.id}`);
                    }}
                    className="p-4 cursor-pointer"
                >
                    <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-purple/10 rounded-lg text-purple border border-purple/20 relative overflow-hidden">
                            {googlePhotoUrl ? (
                                <Image
                                    src={googlePhotoUrl}
                                    alt={visit.place.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <IconComponent size={24} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-base leading-tight group-hover:text-purple transition-colors">
                                {visit.place.name}
                            </h4>
                            <p className="text-xs text-muted mt-1 line-clamp-2">
                                {visit.place.address}
                            </p>
                        </div>
                        <div className="text-muted opacity-50 text-xs">
                            &gt;
                        </div>
                    </div>

                    {/* Date Badge */}
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--pixel-pink)] bg-surface/50 p-2 rounded border border-white/5">
                        <CalendarClock className="w-4 h-4" />
                        {new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(visit.visitDate))}
                    </div>
                </div>

                {/* Actions Section (Integrated) */}
                {showActions && (
                    <div className="px-4 pb-4 pt-2 flex gap-3">
                        <button
                            onClick={() => onConfirm(visit.id)}
                            className="flex-1 btn-pixel py-3 px-3 text-sm font-bold flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-transform shadow-lg shadow-cyan-500/20"
                            style={{ background: "var(--pixel-cyan)", color: "#0f172a", border: "none" }}
                        >
                            <span className="text-sm">✅</span>
                            ¡JALO!
                        </button>
                        <button
                            onClick={onReschedule}
                            className="flex-1 btn-pixel py-3 px-3 text-[10px] font-bold flex items-center justify-center gap-2 bg-surface border-2 border-gray-600 hover:border-white hover:bg-surface/80 transition-colors text-gray-300"
                        >
                            <span className="text-sm">📅</span>
                            <div className="flex flex-col leading-none text-left">
                                <span>MEJOR</span>
                                <span>OTRO DÍA</span>
                            </div>
                        </button>
                    </div>
                )}
            </div>
        );
    };

    if (isMyTurn) {
        // CASE: I need to respond (It's my turn)
        return (
            <div className="card-pixel mb-6 border-2 border-[var(--pixel-cyan)] bg-[#0f1020] overflow-hidden relative shadow-[0_0_15px_rgba(34,211,209,0.15)] animate-fade-in">
                {/* Decoration: Colorful top bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--pixel-cyan)] via-purple-500 to-[var(--pixel-pink)] animate-flash" />

                <div className="p-5 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-[var(--pixel-cyan)] p-0.5 bg-surface relative">
                            <div className="w-full h-full rounded-full overflow-hidden">
                                {proposerAvatar ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={proposerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-cyan-900/50 text-xl">✨</div>
                                )}
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0f1020] animate-bounce" />
                        </div>
                        <div>
                            <h3 className="font-space font-bold text-white text-base leading-none mb-1">
                                {partnerName} propone esta cita
                            </h3>
                            <p className="text-[10px] text-[var(--pixel-cyan)] font-medium">
                                ¡Requiere tu atención! ⚡
                            </p>
                        </div>
                    </div>

                    {/* Integrated Offer Card with Actions */}
                    <OfferCard showActions={true} />

                    <p className="text-xs text-gray-400 text-center italic opacity-80 mt-1">
                        "Tú tienes la última palabra 😉"
                    </p>
                </div>
            </div>
        );
    } else {
        // CASE: I am waiting for the partner (It's NOT my turn)
        const partnerAvatar = users?.[partnerId]?.avatarUrl;

        return (
            <div className="card-pixel mb-6 border-2 border-purple bg-surface/50 overflow-hidden relative animate-pulse">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-[var(--pixel-cyan)] to-[var(--pixel-pink)] animate-flash" />

                <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 relative">
                            <div className="w-10 h-10 rounded-full border-2 border-purple overflow-hidden bg-surface">
                                {partnerAvatar ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover grayscale opacity-80" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-purple/20 text-xl">👤</div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-base border border-purple flex items-center justify-center text-[8px] shadow-lg">
                                ⏳
                            </div>
                        </div>
                        <div>
                            <h3 className="font-space font-bold text-purple text-base">
                                Esperando a {partnerName}...
                            </h3>
                            <p className="text-[10px] text-muted leading-tight mt-0.5">
                                {partnerName} ya sabe el plan. A ver cuánto tarda en confirmar (no te desesperes, siiii). ⏳💖
                            </p>
                        </div>
                    </div>

                    {/* Integrated Offer Card (Read Only) */}
                    <div className="opacity-70 grayscale-[0.3]">
                        <OfferCard showActions={false} />
                    </div>
                </div>
            </div>
        );
    }
}
