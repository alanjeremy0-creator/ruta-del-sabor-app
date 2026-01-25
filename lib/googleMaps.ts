// Google Maps utilities

// Toluca/Metepec bounds for restricting autocomplete
export const TOLUCA_BOUNDS = {
    north: 19.35,
    south: 19.20,
    east: -99.55,
    west: -99.75,
};

// Grayscale map style for Neo-Retro aesthetic
export const GRAYSCALE_MAP_STYLE = [
    {
        elementType: "geometry",
        stylers: [{ saturation: -100 }],
    },
    {
        elementType: "labels.text.fill",
        stylers: [{ color: "#737373" }],
    },
    {
        elementType: "labels.text.stroke",
        stylers: [{ color: "#ffffff" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#E5E7EB" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#E5E7EB" }],
    },
    {
        featureType: "poi",
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "transit",
        stylers: [{ visibility: "off" }],
    },
];

// Autocomplete options for restaurant search
export const getAutocompleteOptions = () => ({
    bounds: new google.maps.LatLngBounds(
        { lat: TOLUCA_BOUNDS.south, lng: TOLUCA_BOUNDS.west },
        { lat: TOLUCA_BOUNDS.north, lng: TOLUCA_BOUNDS.east }
    ),
    strictBounds: true,
    componentRestrictions: { country: "mx" },
    types: ["restaurant", "cafe", "bar", "bakery", "meal_takeaway"],
    fields: ["place_id", "name", "formatted_address", "geometry", "photos", "types"],
});

// Load Google Maps script dynamically
export function loadGoogleMapsScript(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof google !== "undefined" && google.maps) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Maps"));
        document.head.appendChild(script);
    });
}

// Get photo URL from reference
export function getGooglePhotoUrl(photoReference: string, maxWidth = 400): string {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) return "";
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}
