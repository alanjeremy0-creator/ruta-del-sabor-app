"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
    id: number;
    x: number;
    delay: number;
    color: string;
    size: number;
}

interface PixelConfettiProps {
    isActive: boolean;
    onComplete?: () => void;
}

const PIXEL_COLORS = [
    "#FFD700", // Gold
    "#FF6B6B", // Salmon
    "#87BC87", // Sage
    "#5B9BD5", // Blue
    "#9B59B6", // Purple
    "#F39C12", // Orange
];

export function PixelConfetti({ isActive, onComplete }: PixelConfettiProps) {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

    useEffect(() => {
        if (isActive) {
            // Generate confetti pieces
            const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                delay: Math.random() * 0.5,
                color: PIXEL_COLORS[Math.floor(Math.random() * PIXEL_COLORS.length)],
                size: Math.random() * 8 + 4, // 4-12px
            }));
            setPieces(newPieces);

            // Clean up after animation
            const timer = setTimeout(() => {
                setPieces([]);
                onComplete?.();
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [isActive, onComplete]);

    if (!isActive || pieces.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="absolute confetti-piece"
                    style={{
                        left: `${piece.x}%`,
                        top: "-20px",
                        width: piece.size,
                        height: piece.size,
                        backgroundColor: piece.color,
                        animationDelay: `${piece.delay}s`,
                        // Pixel art look - no border radius
                    }}
                />
            ))}
        </div>
    );
}
