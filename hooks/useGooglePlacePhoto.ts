import { useState, useEffect } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

export function useGooglePlacePhoto(placeId: string | undefined, photoReference: string | undefined) {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    const { isLoaded } = useGoogleMaps();

    useEffect(() => {
        // If we already have a direct URL (not google maps), use it
        if (photoReference?.startsWith("http") && !photoReference.includes("maps.googleapis.com")) {
            setPhotoUrl(photoReference);
            return;
        }

        if (photoReference) {
            let finalReference = photoReference;

            // Check if it's a messy URL and extract the actual reference ID (starts with '1s' usually)
            // Example: ...PhotoService.GetPhoto?1sCnRtAAA...&...
            if (photoReference.includes("maps.googleapis.com") || photoReference.includes("1s")) {
                const match = photoReference.match(/1s([^&]+)/);
                if (match && match[1]) {
                    finalReference = match[1];
                }
            }

            // Use our own server-side proxy with the clean reference
            setPhotoUrl(`/api/google-place-photo?photo_reference=${finalReference}&maxwidth=400`);
            return;
        }

        // Fallback: If we only have placeId, we still need to fetch details to get the photo reference first
        // But for now, we assume the Place object passed to us has the reference if available.
        // If not, we can't easily guess it without a Place Details call, which requires the library.
        if (placeId && !photoReference && isLoaded && window.google && window.google.maps && window.google.maps.places) {
            const service = new window.google.maps.places.PlacesService(document.createElement("div"));
            service.getDetails({ placeId, fields: ["photos"] }, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.photos?.[0]) {
                    // Extract reference from the PlaceResult object
                    // The PlaceResult photo object doesn't give the raw reference easily publicly,
                    // but we can try to use the getUrl() and stick to proxy if we store the reference.
                    // For now, if we don't have the reference, we use the standard getUrl()
                    // which might be what's failing, but it's our best fallback.
                    try {
                        const url = place.photos[0].getUrl({ maxWidth: 400 });
                        setPhotoUrl(url);
                    } catch (e) { console.error(e); }
                }
            });
        }

    }, [placeId, photoReference, isLoaded]);

    return photoUrl;
}
