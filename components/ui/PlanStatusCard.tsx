"use client";

import { useState } from "react";
import { type Visit } from "@/components/ui/PlaceCard";
import { useUser } from "@/hooks/useUser";
import { Check, CalendarClock } from "lucide-react";

interface PlanStatusCardProps {
    visit: Visit;
    currentUserId: "ara" | "jeremy";
    onConfirm: (visitId: string) => void;
    onReschedule: () => void; // Opens the modal
    users?: Record<string, { id: string; name: string; avatarUrl: string }>;
}

export function PlanStatusCard({ visit, currentUserId, onConfirm, onReschedule, users }: PlanStatusCardProps) {
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

    if (isMyTurn) {
        // CASE: I need to respond (It's my turn)
        return (
            <div className="card-pixel mb-6 border-2 border-gold bg-surface/50 overflow-hidden relative animate-fade-in">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gold animate-pulse" />

                <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-gold overflow-hidden shrink-0 bg-surface">
                            {proposerAvatar ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={proposerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gold/20 text-xl">✨</div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-space font-bold text-gold">
                                {partnerName} propone esta cita
                            </h3>
                            <p className="text-xs text-muted leading-relaxed">
                                ¿Te late la hora o prefieres cambiarla?
                                <br />Tú tienes la última palabra. 😉
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-1">
                        <button
                            onClick={() => onConfirm(visit.id)}
                            className="flex-1 btn-pixel py-2 px-3 text-xs flex items-center justify-center gap-2"
                            style={{ background: "var(--pixel-cyan)", color: "#0f172a" }}
                        >
                            <span className="text-sm">✅</span>
                            ¡Jalo!
                        </button>
                        <button
                            onClick={onReschedule}
                            className="flex-1 btn-pixel py-2 px-3 text-xs flex items-center justify-center gap-2 bg-surface border-2 border-border hover:border-gold transition-colors"
                        >
                            <span className="text-sm">📅</span>
                            Mmmm, mejor otro día
                        </button>
                    </div>
                </div>
            </div>
        );
    } else {
        // CASE: I am waiting for the partner (It's NOT my turn)
        const partnerAvatar = users?.[partnerId]?.avatarUrl;

        return (
            <div className="card-pixel mb-6 border-2 border-purple bg-surface/50 overflow-hidden relative animate-pulse">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-full h-1 bg-purple animate-pulse" />

                <div className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 relative">
                        {/* Partner Avatar */}
                        <div className="w-12 h-12 rounded-full border-2 border-purple overflow-hidden bg-surface">
                            {partnerAvatar ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover grayscale opacity-80" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-purple/20 text-xl">👤</div>
                            )}
                        </div>
                        {/* Hourglass Badge */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-base border border-purple flex items-center justify-center text-xs shadow-lg">
                            ⏳
                        </div>
                    </div>

                    <div>
                        <h3 className="font-space font-bold text-purple">
                            Esperando a {partnerName}...
                        </h3>
                        <p className="text-xs text-muted leading-tight mt-1">
                            Le enviamos la propuesta. Te avisaremos en cuanto confirme. 👀
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}
