"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/hooks/useUser";
import { ChevronRight } from "lucide-react";
import { FoodEmblem } from "@/components/ui/FoodEmblem";
import { PixelHeartAnimated } from "@/components/ui/PixelHeart";
import { SparkleButton } from "@/components/ui/SparkleButton";
import { AvatarCustomizer } from "@/components/ui/AvatarCustomizer";
import { PixelConfetti } from "@/components/ui/PixelConfetti";

type Step = "welcome" | "select-user" | "customize" | "confirm-avatar" | "done" | "final-celebration";

export default function OnboardingPage() {
    const router = useRouter();
    const { selectUser, updateAvatar } = useUser();
    const [step, setStep] = useState<Step>("welcome");
    const [selectedUserId, setSelectedUserId] = useState<"ara" | "jeremy" | null>(null);
    const [selectedOutfit, setSelectedOutfit] = useState<string>("default");
    const [showConfetti, setShowConfetti] = useState(false);

    const handleSelectUser = (userId: "ara" | "jeremy") => {
        setSelectedUserId(userId);
        setStep("customize");
    };

    const handleAvatarComplete = (outfit: string) => {
        if (!selectedUserId) return;

        selectUser(selectedUserId);
        updateAvatar({ outfit });
        setSelectedOutfit(outfit);

        // Show confirmation step with confetti
        setShowConfetti(true);
        setStep("confirm-avatar");
    };

    const handleConfirmAvatar = () => {
        setShowConfetti(false);
        setStep("done");
    };

    const handleBackToUserSelect = () => {
        setSelectedUserId(null);
        setStep("select-user");
    };

    const handleComplete = () => {
        // Show final celebration
        setShowConfetti(true);
        setStep("final-celebration");
    };

    // Auto-navigate after final celebration confetti ends
    useEffect(() => {
        if (step === "final-celebration") {
            const timer = setTimeout(() => {
                router.push("/");
            }, 2500); // Same duration as confetti
            return () => clearTimeout(timer);
        }
    }, [step, router]);

    // Get final avatar path
    const getFinalAvatarPath = () => {
        if (!selectedUserId || !selectedOutfit) return "";
        return `/pixels/avatar/${selectedUserId}/${selectedOutfit}.png`;
    };

    const userName = selectedUserId === "ara" ? "Ara" : "Jeremy";
    const isAra = selectedUserId === "ara";

    return (
        <div className="min-h-screen flex flex-col">
            {/* Confetti */}
            <PixelConfetti isActive={showConfetti} />

            {/* Welcome Step */}
            {step === "welcome" && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-8">
                        <FoodEmblem size={100} className="mx-auto mb-4" />
                        <h1 className="font-space text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                            <span className="text-pink">Ruta</span> del Sabor
                            <PixelHeartAnimated size={24} />
                        </h1>
                        <p className="text-muted">
                            Nuestras paradas glotonas 😆
                        </p>
                        <p className="text-muted text-xs mt-1 opacity-70">
                            (sin que Alan sea gordo de nuevo plis 🙏)
                        </p>
                    </div>

                    <SparkleButton
                        onClick={() => setStep("select-user")}
                        className="flex items-center gap-2"
                        style={{ background: "var(--pixel-gold)", color: "var(--bg-base)" }}
                    >
                        Presiona, ¡Dale!
                        <ChevronRight className="w-5 h-5" />
                    </SparkleButton>
                </div>
            )}

            {/* Select User Step */}
            {step === "select-user" && (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <h2 className="font-space text-2xl font-bold mb-2 text-center">
                        ¿Quién eres? <span className="text-pink">👋</span>
                    </h2>
                    <p className="text-muted mb-8 text-center">
                        No mientas a la Ruta del Sabor 😑
                    </p>

                    <div className="flex gap-6">
                        {/* Ara */}
                        <button
                            onClick={() => handleSelectUser("ara")}
                            className="p-6 card-pixel hover:border-pink transition-all hover:scale-105 text-center"
                        >
                            <div className="w-24 h-24 mx-auto mb-4 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                                <Image
                                    src="/pixels/avatar/silhouette-female.png"
                                    alt="Ara"
                                    width={96}
                                    height={96}
                                    className="pixel-art object-cover"
                                />
                            </div>
                            <span className="font-space font-bold text-lg">Ara</span>
                        </button>

                        {/* Jeremy */}
                        <button
                            onClick={() => handleSelectUser("jeremy")}
                            className="p-6 card-pixel hover:border-pink transition-all hover:scale-105 text-center"
                        >
                            <div className="w-24 h-24 mx-auto mb-4 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                                <Image
                                    src="/pixels/avatar/silhouette-male.png"
                                    alt="Jeremy"
                                    width={96}
                                    height={96}
                                    className="pixel-art object-cover"
                                />
                            </div>
                            <span className="font-space font-bold text-lg">Jeremy</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Customize Avatar Step */}
            {step === "customize" && selectedUserId && (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <AvatarCustomizer
                        userId={selectedUserId}
                        onComplete={handleAvatarComplete}
                        onBack={handleBackToUserSelect}
                    />
                </div>
            )}

            {/* Confirm Avatar Step - After selecting outfit */}
            {step === "confirm-avatar" && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-8">
                        <div className="w-32 h-32 mx-auto mb-4 bg-secondary rounded-xl border-4 border-gold flex items-center justify-center overflow-hidden shadow-lg">
                            <Image
                                src={getFinalAvatarPath()}
                                alt={userName}
                                width={128}
                                height={128}
                                className="pixel-art object-cover"
                            />
                        </div>
                        <h2 className="font-space text-2xl font-bold mb-2">
                            ¡Si eres tú!
                        </h2>
                        <p className="text-muted">
                            Tienes que admitir que <span className="text-pink font-bold">¡Si amor!</span>😏
                        </p>
                    </div>

                    <SparkleButton
                        onClick={handleConfirmAvatar}
                        className="flex items-center gap-2"
                        style={{ background: "var(--pixel-gold)", color: "var(--bg-base)" }}
                    >
                        ¡Continuar!
                        <ChevronRight className="w-5 h-5" />
                    </SparkleButton>
                </div>
            )}

            {/* Done Step */}
            {step === "done" && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-8">
                        <div className="w-32 h-32 mx-auto mb-4 bg-secondary rounded-xl border-4 border-gold flex items-center justify-center overflow-hidden shadow-lg">
                            <Image
                                src={getFinalAvatarPath()}
                                alt={userName}
                                width={128}
                                height={128}
                                className="pixel-art object-cover"
                            />
                        </div>
                        <h2 className="font-space text-2xl font-bold mb-2">
                            ¡Hola, <span className="text-pink">{userName}</span>! 🎉
                        </h2>
                        <p className="text-muted">
                            Ahora si todo listo para comenzar nuestra ruta glotona virtual.
                        </p>
                        <p className="text-muted text-xs mt-1 opacity-70">
                            (No olvides que Alan no debe engordar de nuevo, virgencita plis 🙏)
                        </p>
                    </div>

                    <SparkleButton
                        onClick={handleComplete}
                        className="flex items-center gap-2"
                        style={{ background: "var(--pixel-gold)", color: "var(--bg-base)" }}
                    >
                        ¡Vamos!
                        <ChevronRight className="w-5 h-5" />
                    </SparkleButton>
                </div>
            )}

            {/* Final Celebration Step - Auto-advancing splash */}
            {step === "final-celebration" && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    {/* Heart Graphic */}
                    <div className="mb-8 relative">
                        <div className="text-8xl animate-pulse">💕</div>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl animate-bounce">💗</div>
                    </div>

                    <h2 className="font-space text-2xl font-bold mb-2">
                        ¡Bienvenid{isAra ? "a" : "o"} <span className="text-pink">amor</span>!
                    </h2>
                    <p className="text-muted">
                        Vamos a construir nuestra ruta 😉
                    </p>
                </div>
            )}

            {/* Progress Dots */}
            <div className="p-8 flex justify-center gap-2">
                {["welcome", "select-user", "customize", "confirm-avatar", "done", "final-celebration"].map((s, i) => (
                    <div
                        key={s}
                        className={`w-2 h-2 transition-colors ${["welcome", "select-user", "customize", "confirm-avatar", "done", "final-celebration"].indexOf(step) >= i
                            ? "bg-pink"
                            : "bg-border"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
