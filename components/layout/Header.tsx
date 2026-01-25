"use client";

import Image from "next/image";
import { useUser } from "@/hooks/useUser";
import { PixelHeart } from "@/components/ui/PixelHeart";

export function Header() {
    const { user } = useUser();

    return (
        <header className="sticky top-0 z-50 glass-dark border-b border-border">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <h1 className="font-space text-xl font-bold text-primary tracking-tight flex items-center gap-1.5">
                    <span className="text-pink">Ruta</span> del Sabor
                    <PixelHeart size={18} className="ml-1" />
                </h1>

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
        </header>
    );
}
