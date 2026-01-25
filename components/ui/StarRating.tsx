"use client";

import { useState } from "react";

interface StarRatingProps {
    value?: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
};

// SVG Star components to avoid image transparency issues
function StarFilled({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="#FFD93D"
                stroke="#000"
                strokeWidth="1.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
            />
        </svg>
    );
}

function StarEmpty({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="transparent"
                stroke="#4A4275"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
            />
        </svg>
    );
}

export function StarRating({
    value = 0,
    onChange,
    readonly = false,
    size = "md",
}: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState(0);
    const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

    const handleClick = (index: number) => {
        if (readonly) return;

        setAnimatingIndex(index);
        setTimeout(() => setAnimatingIndex(null), 300);

        onChange?.(index);
    };

    const displayValue = hoverValue || value;

    return (
        <div
            className="flex gap-1"
            onMouseLeave={() => !readonly && setHoverValue(0)}
        >
            {[1, 2, 3, 4, 5].map((index) => (
                <button
                    key={index}
                    type="button"
                    disabled={readonly}
                    onClick={() => handleClick(index)}
                    onMouseEnter={() => !readonly && setHoverValue(index)}
                    className={`
            ${sizeClasses[size]} 
            ${!readonly && "cursor-pointer hover:scale-110"} 
            ${animatingIndex === index && "star-bounce"}
            transition-transform
          `}
                >
                    {index <= displayValue ? (
                        <StarFilled className="w-full h-full drop-shadow-[0_0_8px_rgba(255,217,61,0.6)]" />
                    ) : (
                        <StarEmpty className="w-full h-full" />
                    )}
                </button>
            ))}
        </div>
    );
}
