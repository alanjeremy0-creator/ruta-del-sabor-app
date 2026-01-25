"use client";

// Pixel Heart Icon - used alongside "Ruta del Sabor" branding

interface PixelHeartProps {
    className?: string;
    size?: number;
    color?: string;
}

export function PixelHeart({
    className = "",
    size = 16,
    color = "#FF6B9D"
}: PixelHeartProps) {
    return (
        <svg
            viewBox="0 0 16 16"
            width={size}
            height={size}
            className={className}
            style={{ imageRendering: "pixelated" }}
        >
            {/* Pixel heart shape - 16x16 grid */}
            {/* Row 1-2: top bumps */}
            <rect x="2" y="2" width="2" height="2" fill={color} />
            <rect x="4" y="2" width="2" height="2" fill={color} />
            <rect x="8" y="2" width="2" height="2" fill={color} />
            <rect x="10" y="2" width="2" height="2" fill={color} />

            {/* Row 3: full top */}
            <rect x="0" y="4" width="2" height="2" fill={color} />
            <rect x="2" y="4" width="2" height="2" fill={color} />
            <rect x="4" y="4" width="2" height="2" fill={color} />
            <rect x="6" y="4" width="2" height="2" fill={color} />
            <rect x="8" y="4" width="2" height="2" fill={color} />
            <rect x="10" y="4" width="2" height="2" fill={color} />
            <rect x="12" y="4" width="2" height="2" fill={color} />

            {/* Row 4: full */}
            <rect x="0" y="6" width="2" height="2" fill={color} />
            <rect x="2" y="6" width="2" height="2" fill={color} />
            <rect x="4" y="6" width="2" height="2" fill={color} />
            <rect x="6" y="6" width="2" height="2" fill={color} />
            <rect x="8" y="6" width="2" height="2" fill={color} />
            <rect x="10" y="6" width="2" height="2" fill={color} />
            <rect x="12" y="6" width="2" height="2" fill={color} />

            {/* Row 5: narrowing */}
            <rect x="2" y="8" width="2" height="2" fill={color} />
            <rect x="4" y="8" width="2" height="2" fill={color} />
            <rect x="6" y="8" width="2" height="2" fill={color} />
            <rect x="8" y="8" width="2" height="2" fill={color} />
            <rect x="10" y="8" width="2" height="2" fill={color} />

            {/* Row 6: narrowing more */}
            <rect x="4" y="10" width="2" height="2" fill={color} />
            <rect x="6" y="10" width="2" height="2" fill={color} />
            <rect x="8" y="10" width="2" height="2" fill={color} />

            {/* Row 7: bottom point */}
            <rect x="6" y="12" width="2" height="2" fill={color} />

            {/* Highlight/shine effect */}
            <rect x="2" y="4" width="2" height="2" fill="rgba(255,255,255,0.3)" />
        </svg>
    );
}

// Animated version with pulse
export function PixelHeartAnimated({
    className = "",
    size = 16,
    color = "#FF6B9D"
}: PixelHeartProps) {
    return (
        <span className={`inline-block animate-pulse ${className}`}>
            <PixelHeart size={size} color={color} />
        </span>
    );
}
