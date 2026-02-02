import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
    width: 180,
    height: 180,
};
export const contentType = 'image/png';

// Pixel grid definition (14x14 based on previous SVG)
// We will scale this up to fit 180x180
// 180 / 14 ≈ 12.85 pixels per block. Let's precise positioning.
// Or we can just use a large pixel grid.

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    background: '#2d2b45',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* We recreate the pixel heart using a flex/grid or SVG inside */}
                {/* SVG is easiest to scale cleanly */}
                <svg
                    width="128"
                    height="128"
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
