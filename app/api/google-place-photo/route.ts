import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const photoReference = searchParams.get("photo_reference");
    const maxWidth = searchParams.get("maxwidth") || "400";

    if (!photoReference) {
        return NextResponse.json({ error: "Missing photo_reference" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const googleUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;

    try {
        const response = await fetch(googleUrl);
        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status });
        }

        const buffer = await response.arrayBuffer();
        const headers = new Headers(response.headers);
        headers.set("Cache-Control", "public, max-age=86400"); // Cache for 24 hours

        return new NextResponse(buffer, {
            status: 200,
            headers: headers,
        });
    } catch (error) {
        console.error("Error fetching Google Photo:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
