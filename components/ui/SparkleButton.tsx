"use client";

// SparkleButton - CTA button with external star sparkles
// Wraps the btn-pixel with decorative stars around it

import { ReactNode } from "react";

interface SparkleButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export function SparkleButton({ children, onClick, className = "", style }: SparkleButtonProps) {
    return (
        <div className="sparkle-button-wrapper">
            {/* External sparkle stars */}
            <span className="sparkle-star sparkle-star-1">✦</span>
            <span className="sparkle-star sparkle-star-2">✦</span>
            <span className="sparkle-star sparkle-star-3">★</span>
            <span className="sparkle-star sparkle-star-4">✦</span>

            <button
                onClick={onClick}
                className={`btn-pixel ${className}`}
                style={style}
            >
                {children}
            </button>
        </div>
    );
}
