"use client";

import Image from "next/image";
import { Bell, BellOff } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { PixelHeart } from "@/components/ui/PixelHeart";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function Header() {
    const { user } = useUser();
    const { isSupported, permission, subscribeToPush } = usePushNotifications();

    const handleEnableNotifications = async () => {
        if (user?.id) {
            await subscribeToPush(user.id);
        }
    };

    return (
        <header className="sticky top-0 z-50 glass-dark border-b border-border">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <h1 className="font-space text-xl font-bold text-primary tracking-tight flex items-center gap-1.5">
                    <span className="text-pink">Ruta</span> del Sabor
                    <PixelHeart size={18} className="ml-1" />
                </h1>

                <div className="flex items-center gap-3">
                    {/* Notification Toggle (Only show if supported and not denied) */}
                    {isSupported && permission === 'default' && (
                        <button
                            onClick={handleEnableNotifications}
                            className="w-10 h-10 flex items-center justify-center border-2 border-border hover:border-yellow-400 transition-colors pixel-border bg-surface text-yellow-500 animate-pulse"
                            title="Activar notificaciones"
                        >
                            <Bell size={20} />
                        </button>
                    )}

                    {/* User Avatar */}
                    {user && (
                        <button className="w-10 h-10 overflow-hidden border-2 border-border hover:border-pink transition-colors pixel-border bg-surface">
                            <Image
                                src={user.avatarUrl || "/pixels/avatar/ara-default.png"}
                                alt={user.name}
                                width={40}
                                height={40}
                                sizes="40px"
                                className="pixel-art object-cover"
                            />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
