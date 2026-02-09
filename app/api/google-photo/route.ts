import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const photoReference = searchParams.get("photo_reference");
    const maxWidth = searchParams.get("maxwidth") || "400";

    if (!photoReference) {
        return new NextResponse("Missing photo_reference", { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) {
        return new NextResponse("Server configuration error", { status: 500 });
    }

    const googleUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;

    try {
        const response = await fetch(googleUrl, {
            headers: {
                "Referer": "http://localhost:3000/",
                "User-Agent": "Next.js Proxy",
            }
        });

        if (!response.ok) {
            console.error(`Google API Error: ${response.status} ${response.statusText}`);
            return new NextResponse(`Google API Error: ${response.statusText}`, { status: response.status });
        }

        const headers = new Headers();
        headers.set("Content-Type", response.headers.get("Content-Type") || "image/jpeg");
        headers.set("Cache-Control", "public, max-age=86400"); // Cache for 24 hours

        return new NextResponse(response.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("Error fetching Google Photo:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
