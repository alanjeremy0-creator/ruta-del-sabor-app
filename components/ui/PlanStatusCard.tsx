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
}

export function PlanStatusCard({ visit, currentUserId, onConfirm, onReschedule }: PlanStatusCardProps) {
    const { proposedBy, confirmationStatus, userId: creatorId } = visit;

    // If it's already confirmed or is a legacy plan (undefined status), don't show this card
    if (confirmationStatus === "confirmed" || confirmationStatus === undefined) {
        return null;
    }

    const isMyTurn = proposedBy !== currentUserId;
    const partnerName = currentUserId === "ara" ? "Jeremy" : "Ara";

    if (isMyTurn) {
        // CASE: I need to respond (It's my turn)
        return (
            <div className="card-pixel mb-6 border-2 border-gold bg-surface/50 overflow-hidden relative animate-fade-in">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gold animate-pulse" />

                <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-xl shrink-0">
                            ✨
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
                            <Check className="w-4 h-4" />
                            ¡Jalo!
                        </button>
                        <button
                            onClick={onReschedule}
                            className="flex-1 btn-pixel py-2 px-3 text-xs flex items-center justify-center gap-2 bg-surface border-2 border-border hover:border-gold transition-colors"
                        >
                            <CalendarClock className="w-4 h-4 text-muted" />
                            Mmmm, mejor otro día
                        </button>
                    </div>
                </div>
            </div>
        );
    } else {
        // CASE: I am waiting for the partner (It's NOT my turn)
        return (
            <div className="card-pixel mb-6 border-2 border-border border-dashed bg-surface/30 p-4 flex items-center gap-4 animate-pulse opacity-80">
                <div className="w-10 h-10 rounded-full bg-border/50 flex items-center justify-center grayscale">
                    ⏳
                </div>
                <div>
                    <h3 className="font-space font-bold text-muted">
                        Esperando a {partnerName}...
                    </h3>
                    <p className="text-xs text-muted/70">
                        Le enviamos la propuesta. Te avisaremos cuando confirme. 👀
                    </p>
                </div>
            </div>
        );
    }
}
