import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    // Favicon often looks better with transparent background or matching the shape.
                    // BUT for consistency and visibility on dark/light tabs, let's keep the dark background 
                    // or just the heart if we want transparent. 
                    // Let's stick to the square background to be safe and consistent with the app icon.
                    background: '#2d2b45',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4, // Slight rounding for favicon
                }}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 14 14"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ shapeRendering: 'crispEdges' }}
                >
                    {/* Heart Shape */}
                    {/* Row 2 */}
                    <rect x="2" y="2" width="1" height="1" fill="#ff69b4" />
                    <rect x="3" y="2" width="1" height="1" fill="#ff69b4" />
                    <rect x="7" y="2" width="1" height="1" fill="#ff69b4" />
                    <rect x="8" y="2" width="1" height="1" fill="#ff69b4" />

                    {/* Row 3 */}
                    <rect x="1" y="3" width="1" height="1" fill="#ff69b4" />
                    <rect x="2" y="3" width="1" height="1" fill="#ffadd6" /> {/* Shine */}
                    <rect x="3" y="3" width="1" height="1" fill="#ff69b4" />
                    <rect x="4" y="3" width="1" height="1" fill="#ff69b4" />
                    <rect x="6" y="3" width="1" height="1" fill="#ff69b4" />
                    <rect x="9" y="3" width="1" height="1" fill="#ff69b4" />

                    {/* Row 4 */}
                    <rect x="1" y="4" width="1" height="1" fill="#ff69b4" />
                    <rect x="2" y="4" width="1" height="1" fill="#ffadd6" /> {/* Shine */}
                    <rect x="3" y="4" width="1" height="1" fill="#ff69b4" />
                    <rect x="4" y="4" width="1" height="1" fill="#ff69b4" />
                    <rect x="5" y="4" width="1" height="1" fill="#ff69b4" />
                    <rect x="6" y="4" width="1" height="1" fill="#ff69b4" />
                    <rect x="7" y="4" width="1" height="1" fill="#ff69b4" />
                    <rect x="8" y="4" width="1" height="1" fill="#ff69b4" />
                    <rect x="9" y="4" width="1" height="1" fill="#ff69b4" />

                    {/* Row 5 */}
                    <rect x="1" y="5" width="1" height="1" fill="#ff69b4" />
                    <rect x="2" y="5" width="1" height="1" fill="#ff69b4" />
                    <rect x="3" y="5" width="1" height="1" fill="#ff69b4" />
                    <rect x="4" y="5" width="1" height="1" fill="#ff69b4" />
                    <rect x="5" y="5" width="1" height="1" fill="#ff69b4" />
                    <rect x="6" y="5" width="1" height="1" fill="#ff69b4" />
                    <rect x="7" y="5" width="1" height="1" fill="#ff69b4" />
                    <rect x="8" y="5" width="1" height="1" fill="#ff69b4" />
                    <rect x="9" y="5" width="1" height="1" fill="#ff69b4" />

                    {/* Row 6 */}
                    <rect x="2" y="6" width="1" height="1" fill="#ff69b4" />
                    <rect x="3" y="6" width="1" height="1" fill="#ff69b4" />
                    <rect x="4" y="6" width="1" height="1" fill="#ff69b4" />
                    <rect x="5" y="6" width="1" height="1" fill="#ff69b4" />
                    <rect x="6" y="6" width="1" height="1" fill="#ff69b4" />
                    <rect x="7" y="6" width="1" height="1" fill="#ff69b4" />
                    <rect x="8" y="6" width="1" height="1" fill="#ff69b4" />

                    {/* Row 7 */}
                    <rect x="3" y="7" width="1" height="1" fill="#ff69b4" />
                    <rect x="4" y="7" width="1" height="1" fill="#ff69b4" />
                    <rect x="5" y="7" width="1" height="1" fill="#ff69b4" />
                    <rect x="6" y="7" width="1" height="1" fill="#ff69b4" />
                    <rect x="7" y="7" width="1" height="1" fill="#ff69b4" />

                    {/* Row 8 */}
                    <rect x="4" y="8" width="1" height="1" fill="#ff69b4" />
                    <rect x="5" y="8" width="1" height="1" fill="#ff69b4" />
                    <rect x="6" y="8" width="1" height="1" fill="#ff69b4" />

                    {/* Row 9 */}
                    <rect x="5" y="9" width="1" height="1" fill="#ff69b4" />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
