"use client";

import { useState } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { SparkleButton } from "./SparkleButton";

interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (date: string, time: string) => Promise<void>;
    currentDate?: Date;
}

export function RescheduleModal({ isOpen, onClose, onSubmit, currentDate }: RescheduleModalProps) {
    if (!isOpen) return null;

    const today = new Date().toISOString().split("T")[0];

    // Initialize with current values if available, otherwise empty
    const initialDate = currentDate ? currentDate.toISOString().split("T")[0] : "";
    const initialTime = currentDate
        ? currentDate.toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit', hour12: false })
        : "";

    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!date || !time) return;

        setIsSubmitting(true);
        try {
            await onSubmit(date, time);
            onClose();
        } catch (error) {
            console.error(error);
            // Error handling usually in parent
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-base border-2 border-border card-pixel w-full max-w-sm relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-2 hover:bg-surface rounded-md transition-colors"
                >
                    <X className="w-5 h-5 text-muted" />
                </button>

                <div className="p-6">
                    <h2 className="font-space font-bold text-xl mb-1 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-pink" />
                        Reagendar Cita
                    </h2>
                    <p className="text-xs text-muted mb-6">
                        Propón una nueva fecha para que tu pareja la revise.
                    </p>

                    <div className="space-y-4">
                        {/* Date Input */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-muted mb-1">
                                Nueva Fecha
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={today}
                                className="w-full px-4 py-3 border-2 border-border bg-surface focus:outline-none focus:border-pink pixel-border text-primary"
                                style={{ colorScheme: "dark" }}
                            />
                        </div>

                        {/* Time Input */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-muted mb-1">
                                Nueva Hora
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-border bg-surface focus:outline-none focus:border-pink pixel-border text-primary"
                                style={{ colorScheme: "dark" }}
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={!date || !time || isSubmitting}
                            className={`w-full py-3 font-bold uppercase tracking-wide btn-pixel transition-all ${!date || !time
                                    ? "opacity-50 cursor-not-allowed bg-border"
                                    : "bg-gold hover:scale-[1.02]"
                                }`}
                            style={{
                                background: (!date || !time) ? undefined : "var(--pixel-gold)",
                                color: "#0f172a"
                            }}
                        >
                            {isSubmitting ? "Guardando..." : "Enviar Propuesta 📨"}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
