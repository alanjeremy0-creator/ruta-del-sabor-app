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
            <div className="card-pixel mb-6 border-2 border-[var(--pixel-cyan)] bg-[#0f1020] overflow-hidden relative shadow-[0_0_15px_rgba(34,211,209,0.15)] animate-fade-in">
                {/* Decoration: Colorful top bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--pixel-cyan)] via-purple-500 to-[var(--pixel-pink)] animate-flash" />

                <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-[var(--pixel-cyan)] p-0.5 bg-surface relative">
                            {/* User Avatar */}
                            <div className="w-full h-full rounded-full overflow-hidden">
                                {proposerAvatar ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={proposerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-cyan-900/50 text-xl">✨</div>
                                )}
                            </div>
                            {/* Notification Dot */}
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0f1020] animate-bounce" />
                        </div>

                        <div>
                            <h3 className="font-space font-bold text-white text-lg leading-none mb-1">
                                {partnerName} propone esta cita
                            </h3>
                            <p className="text-xs text-[var(--pixel-cyan)] font-medium">
                                ¡Requiere tu atención! ⚡
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                        "¿Te late la hora o prefieres cambiarla? <br />
                        Tú tienes la última palabra. 😉"
                    </p>

                    <div className="flex gap-3 mt-1">
                        <button
                            onClick={() => onConfirm(visit.id)}
                            className="flex-1 btn-pixel py-3 px-3 text-sm font-bold flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-transform shadow-lg shadow-cyan-500/20"
                            style={{ background: "var(--pixel-cyan)", color: "#0f172a", border: "none" }}
                        >
                            <span className="text-base">✅</span>
                            ¡JALO!
                        </button>
                        <button
                            onClick={onReschedule}
                            className="flex-1 btn-pixel py-3 px-3 text-xs font-bold flex items-center justify-center gap-2 bg-[#1a1b2e] border-2 border-gray-700 hover:border-white hover:bg-[#252640] transition-colors text-gray-300"
                        >
                            <span className="text-base">📅</span>
                            <span className="text-center leading-tight">MEJOR<br />OTRO DÍA</span>
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
                <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-[var(--pixel-cyan)] to-[var(--pixel-pink)] animate-flash" />

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
