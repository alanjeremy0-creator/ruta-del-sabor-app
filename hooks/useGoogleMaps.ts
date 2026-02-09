"use client";

import { useLoadScript } from "@react-google-maps/api";
import { useMemo, useState, useEffect } from "react";
import { LIBRARIES } from "@/lib/googleMaps";

// Grayscale Retro Style
const mapStyle = [
    {
        featureType: "all",
        elementType: "geometry",
        stylers: [{ color: "#242f3e" }],
    },
    {
        featureType: "all",
        elementType: "labels.text.stroke",
        stylers: [{ lightness: -80 }],
    },
    {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ lightness: -20 }],
    },
];

export function useGoogleMaps() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<Error | undefined>(undefined);

    useEffect(() => {
        const checkGoogle = () => {
            if (typeof window !== "undefined" && window.google && window.google.maps) {
                setIsLoaded(true);
            }
        };

        checkGoogle();

        const interval = setInterval(checkGoogle, 100);
        return () => clearInterval(interval);
    }, []);

    const options = useMemo(() => ({
        styles: mapStyle,
        disableDefaultUI: true,
        rotateControl: false,
        scaleControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: false,
        clickableIcons: false,
        backgroundColor: "#1a1a2e",
    }), []);

    return { isLoaded, loadError, options };
}
