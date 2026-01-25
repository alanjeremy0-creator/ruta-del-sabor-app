"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { SparkleButton } from "./SparkleButton";

interface AvatarOption {
    id: string;
    label: string;
    imagePath: string;
}

interface AvatarCustomizerProps {
    userId: "ara" | "jeremy";
    onComplete: (selectedOutfit: string) => void;
    onBack?: () => void;
}

const AVATAR_OPTIONS: Record<"ara" | "jeremy", AvatarOption[]> = {
    ara: [
        { id: "default", label: "Clásico", imagePath: "/pixels/avatar/ara/default.png" },
        { id: "red-jacket", label: "Chamarra Roja", imagePath: "/pixels/avatar/ara/red-jacket.png" },
        { id: "pink-hoodie", label: "Hoodie Rosa", imagePath: "/pixels/avatar/ara/pink-hoodie.png" },
    ],
    jeremy: [
        { id: "default", label: "Clásico", imagePath: "/pixels/avatar/jeremy/default.png" },
        { id: "black-tshirt", label: "Playera Negra", imagePath: "/pixels/avatar/jeremy/black-tshirt.png" },
        { id: "blue-hoodie", label: "Hoodie Azul", imagePath: "/pixels/avatar/jeremy/blue-hoodie.png" },
    ],
};

export function AvatarCustomizer({ userId, onComplete, onBack }: AvatarCustomizerProps) {
    const options = AVATAR_OPTIONS[userId];
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedOption = options[selectedIndex];

    const handlePrev = () => {
        setSelectedIndex((prev) => (prev === 0 ? options.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev === options.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="font-space text-2xl font-bold mb-2 text-center">
                Personaliza tu avatar <span className="text-pink">🎨</span>
            </h2>
            <p className="text-muted mb-6 text-center text-sm">
                Elige tu outfit favorito
            </p>

            {/* Avatar Display with Navigation */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={handlePrev}
                    className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-border transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-muted" />
                </button>

                <div className="relative w-48 h-48 rounded-xl overflow-hidden border-4 border-gold shadow-lg">
                    <Image
                        src={selectedOption.imagePath}
                        alt={selectedOption.label}
                        fill
                        sizes="192px"
                        className="object-cover pixel-art"
                    />
                </div>

                <button
                    onClick={handleNext}
                    className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-border transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-muted" />
                </button>
            </div>

            {/* Selected Outfit Label */}
            <p className="font-space font-bold text-lg mb-6 text-pink">
                {selectedOption.label}
            </p>

            {/* Outfit Thumbnails */}
            <div className="flex gap-3 mb-8">
                {options.map((option, index) => (
                    <button
                        key={option.id}
                        onClick={() => setSelectedIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === selectedIndex
                            ? "border-gold scale-110 shadow-lg"
                            : "border-border opacity-60 hover:opacity-100"
                            }`}
                    >
                        <Image
                            src={option.imagePath}
                            alt={option.label}
                            width={64}
                            height={64}
                            className="object-cover pixel-art"
                        />
                    </button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="px-4 py-2 text-sm text-muted hover:text-primary transition-colors"
                    >
                        ← Cambiar usuario
                    </button>
                )}
                <SparkleButton
                    onClick={() => onComplete(selectedOption.id)}
                    className="flex items-center gap-2"
                    style={{ background: "var(--pixel-gold)", color: "var(--bg-base)" }}
                >
                    ¡Listo, soy yo!
                    <ChevronRight className="w-5 h-5" />
                </SparkleButton>
            </div>
        </div>
    );
}
