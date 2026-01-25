"use client";

import { useState, useEffect } from "react";

export interface AvatarConfig {
    outfit: string;
}

export interface User {
    id: "ara" | "jeremy";
    name: string;
    avatarUrl: string;
    avatar?: AvatarConfig;
}

// Helper to build avatar URL from config
export function getAvatarUrl(userId: "ara" | "jeremy", outfit?: string): string {
    const outfitId = outfit || "default";
    return `/pixels/avatar/${userId}/${outfitId}.png`;
}

export const DEFAULT_USERS: Record<string, User> = {
    ara: {
        id: "ara",
        name: "Ara",
        avatarUrl: "/pixels/avatar/ara/default.png",
    },
    jeremy: {
        id: "jeremy",
        name: "Jeremy",
        avatarUrl: "/pixels/avatar/jeremy/default.png",
    },
};

// Helper to get all users with their personalized avatars (reads from localStorage)
export function getAllUsersWithAvatars(): Record<string, User> {
    if (typeof window === "undefined") {
        return DEFAULT_USERS;
    }

    const users = { ...DEFAULT_USERS };

    // Read Ara's avatar
    const araAvatar = localStorage.getItem("ruta-del-sabor-avatar-ara");
    if (araAvatar) {
        try {
            const config = JSON.parse(araAvatar) as AvatarConfig;
            users.ara = { ...users.ara, avatarUrl: getAvatarUrl("ara", config.outfit), avatar: config };
        } catch { /* ignore */ }
    }

    // Read Jeremy's avatar
    const jeremyAvatar = localStorage.getItem("ruta-del-sabor-avatar-jeremy");
    if (jeremyAvatar) {
        try {
            const config = JSON.parse(jeremyAvatar) as AvatarConfig;
            users.jeremy = { ...users.jeremy, avatarUrl: getAvatarUrl("jeremy", config.outfit), avatar: config };
        } catch { /* ignore */ }
    }

    // Fallback: Check the old single-user avatar key (for current user)
    const currentUserId = localStorage.getItem("ruta-del-sabor-user-id") as "ara" | "jeremy" | null;
    const currentAvatar = localStorage.getItem("ruta-del-sabor-avatar");
    if (currentUserId && currentAvatar) {
        try {
            const config = JSON.parse(currentAvatar) as AvatarConfig;
            users[currentUserId] = {
                ...users[currentUserId],
                avatarUrl: getAvatarUrl(currentUserId, config.outfit),
                avatar: config
            };
        } catch { /* ignore */ }
    }

    return users;
}

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    useEffect(() => {
        // Check localStorage for existing user
        const storedUserId = localStorage.getItem("ruta-del-sabor-user-id");
        const storedAvatar = localStorage.getItem("ruta-del-sabor-avatar");

        if (storedUserId && (storedUserId === "ara" || storedUserId === "jeremy")) {
            const userData = { ...DEFAULT_USERS[storedUserId] };
            if (storedAvatar) {
                try {
                    const avatarConfig = JSON.parse(storedAvatar) as AvatarConfig;
                    userData.avatar = avatarConfig;
                    // Update avatarUrl based on saved config
                    userData.avatarUrl = getAvatarUrl(userData.id, avatarConfig.outfit);
                } catch {
                    // Ignore parse errors
                }
            }
            setUser(userData);
            setNeedsOnboarding(false);
        } else {
            setNeedsOnboarding(true);
        }

        setIsLoading(false);
    }, []);

    const selectUser = (userId: "ara" | "jeremy") => {
        localStorage.setItem("ruta-del-sabor-user-id", userId);
        const userData = { ...DEFAULT_USERS[userId] };
        setUser(userData);
        setNeedsOnboarding(false);
    };

    const updateAvatar = (avatar: AvatarConfig) => {
        const storedUserId = localStorage.getItem("ruta-del-sabor-user-id") as "ara" | "jeremy" | null;
        if (!storedUserId) return;

        localStorage.setItem("ruta-del-sabor-avatar", JSON.stringify(avatar));

        const updatedUser = {
            ...DEFAULT_USERS[storedUserId],
            avatar,
            avatarUrl: getAvatarUrl(storedUserId, avatar.outfit),
        };
        setUser(updatedUser);
    };

    const logout = () => {
        localStorage.removeItem("ruta-del-sabor-user-id");
        localStorage.removeItem("ruta-del-sabor-avatar");
        setUser(null);
        setNeedsOnboarding(true);
    };

    return {
        user,
        isLoading,
        needsOnboarding,
        selectUser,
        updateAvatar,
        logout,
    };
}
