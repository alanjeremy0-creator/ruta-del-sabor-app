"use client";

// Food Emblem - Happy foodie savoring delicious food
// SVG with true transparency - No border, slight tilt

interface FoodEmblemProps {
    className?: string;
    size?: number;
}

export function FoodEmblem({ className = "", size = 80 }: FoodEmblemProps) {
    return (
        <svg
            viewBox="0 0 64 64"
            width={size}
            height={size}
            className={className}
            style={{ imageRendering: "auto" }}
        >
            {/* Slight tilt applied to entire emblem */}
            <g transform="rotate(-8, 32, 32)">
                {/* Stars in background */}
                <circle cx="8" cy="16" r="1.2" fill="#FF6B9D" opacity="0.7" />
                <circle cx="56" cy="12" r="1" fill="#FF6B9D" opacity="0.6" />
                <circle cx="6" cy="52" r="1" fill="#FFD93D" opacity="0.5" />
                <circle cx="58" cy="50" r="1.2" fill="#FFD93D" opacity="0.6" />

                {/* Main face - yellow/orange gradient feel */}
                <circle cx="32" cy="32" r="20" fill="#FFB347" />
                <circle cx="32" cy="31" r="18" fill="#FFCC33" />

                {/* Highlight on face */}
                <ellipse cx="24" cy="24" rx="5" ry="4" fill="rgba(255,255,255,0.3)" />

                {/* Cheek blush */}
                <ellipse cx="18" cy="36" rx="4" ry="2.5" fill="#FF9E80" opacity="0.6" />
                <ellipse cx="46" cy="36" rx="4" ry="2.5" fill="#FF9E80" opacity="0.6" />

                {/* Closed happy eyes - curved lines */}
                <path d="M20 30 Q25 25 30 30" stroke="#5D4037" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M34 30 Q39 25 44 30" stroke="#5D4037" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                {/* Eyebrows - raised happy */}
                <path d="M20 24 Q25 20 30 24" stroke="#5D4037" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M34 24 Q39 20 44 24" stroke="#5D4037" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                {/* Big happy smile */}
                <path d="M22 38 Q32 48 42 38" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Tongue sticking out */}
                <ellipse cx="32" cy="43" rx="5" ry="4" fill="#FF6B9D" />
                <ellipse cx="32" cy="42" rx="4" ry="3" fill="#FF8FAB" />

                {/* Spoon with food coming from the side */}
                <g transform="translate(2, 28)">
                    {/* Spoon handle */}
                    <rect x="-2" y="4" width="12" height="3" rx="1.5" fill="#C0C0C0" />
                    {/* Spoon bowl */}
                    <ellipse cx="12" cy="5.5" rx="5" ry="4" fill="#D3D3D3" />
                    <ellipse cx="12" cy="5" rx="4" ry="3" fill="#E8E8E8" />

                    {/* Food on spoon */}
                    {/* Tomato */}
                    <circle cx="10" cy="3" r="2.5" fill="#FF6347" />
                    <circle cx="10" cy="2" r="0.8" fill="#FF7F7F" />
                    {/* Leaf/herb */}
                    <ellipse cx="13" cy="2" rx="2" ry="1.2" fill="#32CD32" transform="rotate(-25, 13, 2)" />
                    <ellipse cx="14" cy="3" rx="1.5" ry="1" fill="#228B22" transform="rotate(15, 14, 3)" />
                </g>

                {/* Steam/aroma waves */}
                <path d="M14 18 Q12 12 14 6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M10 22 Q8 16 10 10" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" strokeLinecap="round" />

                {/* Sparkles */}
                <circle cx="50" cy="20" r="2" fill="#FFD93D" opacity="0.9" />
                <circle cx="54" cy="28" r="1.2" fill="#FF6B9D" opacity="0.8" />
            </g>
        </svg>
    );
}
