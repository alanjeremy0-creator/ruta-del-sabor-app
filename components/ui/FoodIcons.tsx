"use client";

// SVG Pixel Art Icons with real transparency
// These replace the PNG icons that had fake transparency backgrounds

interface IconProps {
    className?: string;
    size?: number;
}

export function TacoIcon({ className = "", size = 48 }: IconProps) {
    return (
        <svg
            viewBox="0 0 64 64"
            width={size}
            height={size}
            className={className}
            style={{ imageRendering: "pixelated" }}
        >
            {/* Tortilla */}
            <path d="M8 32 Q8 16 32 12 Q56 16 56 32 Q56 48 32 52 Q8 48 8 32" fill="#E8B84A" stroke="#8B6914" strokeWidth="2" />
            {/* Meat */}
            <rect x="16" y="28" width="32" height="12" fill="#6B3E26" />
            <rect x="20" y="32" width="4" height="4" fill="#8B5A3C" />
            <rect x="28" y="28" width="4" height="4" fill="#8B5A3C" />
            <rect x="36" y="32" width="4" height="4" fill="#8B5A3C" />
            {/* Lettuce */}
            <rect x="14" y="24" width="8" height="4" fill="#4CAF50" />
            <rect x="24" y="22" width="8" height="4" fill="#66BB6A" />
            <rect x="34" y="24" width="8" height="4" fill="#4CAF50" />
            <rect x="44" y="22" width="6" height="4" fill="#66BB6A" />
            {/* Tomato */}
            <rect x="18" y="20" width="4" height="4" fill="#E53935" />
            <rect x="30" y="18" width="4" height="4" fill="#EF5350" />
            <rect x="42" y="20" width="4" height="4" fill="#E53935" />
            {/* Cheese */}
            <rect x="22" y="26" width="6" height="2" fill="#FFD93D" />
            <rect x="36" y="26" width="6" height="2" fill="#FFD93D" />
        </svg>
    );
}

export function CoffeeIcon({ className = "", size = 48 }: IconProps) {
    return (
        <svg
            viewBox="0 0 64 64"
            width={size}
            height={size}
            className={className}
            style={{ imageRendering: "pixelated" }}
        >
            {/* Cup */}
            <rect x="16" y="24" width="28" height="32" fill="#FFFFFF" stroke="#333" strokeWidth="2" />
            <rect x="18" y="26" width="24" height="4" fill="#F5F5F5" />
            {/* Coffee */}
            <rect x="18" y="30" width="24" height="20" fill="#6D4C41" />
            <rect x="20" y="32" width="8" height="4" fill="#8D6E63" />
            {/* Handle */}
            <rect x="44" y="32" width="8" height="4" fill="#FFFFFF" stroke="#333" strokeWidth="2" />
            <rect x="48" y="36" width="4" height="12" fill="#FFFFFF" stroke="#333" strokeWidth="2" />
            <rect x="44" y="44" width="8" height="4" fill="#FFFFFF" stroke="#333" strokeWidth="2" />
            {/* Steam */}
            <path d="M24 20 Q26 16 24 12" stroke="#9E9E9E" strokeWidth="2" fill="none" />
            <path d="M32 18 Q34 14 32 10" stroke="#9E9E9E" strokeWidth="2" fill="none" />
            <path d="M40 20 Q42 16 40 12" stroke="#9E9E9E" strokeWidth="2" fill="none" />
        </svg>
    );
}

export function BurgerIcon({ className = "", size = 48 }: IconProps) {
    return (
        <svg
            viewBox="0 0 64 64"
            width={size}
            height={size}
            className={className}
            style={{ imageRendering: "pixelated" }}
        >
            {/* Top bun */}
            <path d="M12 24 Q12 12 32 12 Q52 12 52 24 L52 28 L12 28 Z" fill="#E8A845" stroke="#8B6914" strokeWidth="2" />
            {/* Sesame seeds */}
            <rect x="20" y="16" width="4" height="2" fill="#FFF8E1" />
            <rect x="30" y="14" width="4" height="2" fill="#FFF8E1" />
            <rect x="40" y="16" width="4" height="2" fill="#FFF8E1" />
            {/* Cheese */}
            <polygon points="10,32 14,28 50,28 54,32 50,36 14,36" fill="#FFD93D" />
            {/* Patty */}
            <rect x="12" y="36" width="40" height="8" fill="#5D4037" stroke="#3E2723" strokeWidth="1" />
            {/* Lettuce */}
            <path d="M10 44 Q16 48 22 44 Q28 48 34 44 Q40 48 46 44 Q52 48 54 44 L54 48 L10 48 Z" fill="#4CAF50" />
            {/* Tomato */}
            <rect x="12" y="48" width="40" height="4" fill="#E53935" />
            {/* Bottom bun */}
            <rect x="12" y="52" width="40" height="8" rx="4" fill="#E8A845" stroke="#8B6914" strokeWidth="2" />
        </svg>
    );
}

export function CocktailIcon({ className = "", size = 48 }: IconProps) {
    return (
        <svg
            viewBox="0 0 64 64"
            width={size}
            height={size}
            className={className}
            style={{ imageRendering: "pixelated" }}
        >
            {/* Glass */}
            <polygon points="16,16 48,16 36,40 28,40" fill="rgba(200,230,255,0.6)" stroke="#333" strokeWidth="2" />
            {/* Drink */}
            <polygon points="18,18 46,18 36,38 28,38" fill="#FF6B9D" />
            <polygon points="20,20 44,20 38,30 26,30" fill="#FF8EB3" />
            {/* Stem */}
            <rect x="30" y="40" width="4" height="12" fill="#E0E0E0" stroke="#333" strokeWidth="1" />
            {/* Base */}
            <rect x="22" y="52" width="20" height="4" fill="#E0E0E0" stroke="#333" strokeWidth="1" />
            {/* Umbrella */}
            <polygon points="12,8 24,8 18,16" fill="#FF3CAC" />
            <rect x="17" y="8" width="2" height="16" fill="#8B4513" />
            {/* Citrus */}
            <circle cx="48" cy="20" r="8" fill="#FFD93D" stroke="#FF9800" strokeWidth="2" />
            <path d="M44 20 L52 20 M48 16 L48 24" stroke="#FF9800" strokeWidth="1" />
        </svg>
    );
}

export function SushiIcon({ className = "", size = 48 }: IconProps) {
    return (
        <svg
            viewBox="0 0 64 64"
            width={size}
            height={size}
            className={className}
            style={{ imageRendering: "pixelated" }}
        >
            {/* Rice base */}
            <ellipse cx="32" cy="44" rx="24" ry="12" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="2" />
            <ellipse cx="32" cy="40" rx="24" ry="12" fill="#FFFFFF" />
            {/* Nori wrap */}
            <rect x="28" y="28" width="8" height="24" fill="#1B2631" />
            {/* Salmon */}
            <ellipse cx="32" cy="28" rx="20" ry="10" fill="#FF7043" stroke="#E64A19" strokeWidth="2" />
            <path d="M20 26 Q24 30 28 26" stroke="#FFAB91" strokeWidth="2" fill="none" />
            <path d="M32 24 Q36 28 40 24" stroke="#FFAB91" strokeWidth="2" fill="none" />
        </svg>
    );
}

export function FoodIcon({ className = "", size = 48 }: IconProps) {
    return (
        <svg
            viewBox="0 0 64 64"
            width={size}
            height={size}
            className={className}
            style={{ imageRendering: "pixelated" }}
        >
            {/* Plate */}
            <ellipse cx="32" cy="48" rx="28" ry="8" fill="#E0E0E0" stroke="#9E9E9E" strokeWidth="2" />
            <ellipse cx="32" cy="44" rx="24" ry="6" fill="#FAFAFA" />
            {/* Fork */}
            <rect x="16" y="12" width="2" height="24" fill="#9E9E9E" />
            <rect x="12" y="12" width="2" height="8" fill="#9E9E9E" />
            <rect x="20" y="12" width="2" height="8" fill="#9E9E9E" />
            <rect x="12" y="20" width="10" height="2" fill="#9E9E9E" />
            {/* Knife */}
            <rect x="46" y="12" width="4" height="24" fill="#9E9E9E" />
            <polygon points="46,12 50,12 50,8 48,4 46,8" fill="#BDBDBD" />
        </svg>
    );
}

// Map category to icon component
export const categoryIcons: Record<string, React.FC<IconProps>> = {
    taco: TacoIcon,
    coffee: CoffeeIcon,
    burger: BurgerIcon,
    cocktail: CocktailIcon,
    sushi: SushiIcon,
    food: FoodIcon,
};
