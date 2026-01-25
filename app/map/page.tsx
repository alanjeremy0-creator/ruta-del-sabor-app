"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useVisits } from "@/hooks/useVisits";
import { useEffect, useState, useMemo } from "react";
import { FoodEmblem } from "@/components/ui/FoodEmblem";

const TOLUCA_CENTER = { lat: 19.2826, lng: -99.6556 };

export default function MapPage() {
    const router = useRouter();
    const { isLoaded, loadError, options } = useGoogleMaps();
    const { plannedVisits, completedVisits, isLoading } = useVisits();

    const allVisits = useMemo(() => [...plannedVisits, ...completedVisits], [plannedVisits, completedVisits]);

    const handleBack = () => {
        router.back();
    };

    if (loadError) {
        return <div className="p-4 text-pink">Error cargando el mapa: {loadError.message}</div>;
    }

    if (!isLoaded || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base">
                <div className="text-center animate-pulse">
                    <FoodEmblem size={64} className="mx-auto mb-4" />
                    <p className="text-secondary font-space">Cargando mapa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base relative">
            {/* Header */}
            <header className="absolute top-4 left-4 z-10">
                <button
                    onClick={handleBack}
                    className="w-10 h-10 rounded-full bg-surface/90 backdrop-blur border border-border shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </header>

            {/* Google Map */}
            <GoogleMap
                mapContainerClassName="w-full h-screen"
                center={allVisits.length > 0 ? { lat: allVisits[0].place.lat || TOLUCA_CENTER.lat, lng: allVisits[0].place.lng || TOLUCA_CENTER.lng } : TOLUCA_CENTER}
                zoom={13}
                options={options}
            >
                {allVisits.map((visit) => {
                    const place = visit.place;
                    if (!place.lat || !place.lng) return null;

                    // TODO: Custom marker icons based on category would go here
                    // For now using default markers but we could use SVG paths or URLs to our pixel art

                    return (
                        <MarkerF
                            key={visit.id}
                            position={{ lat: place.lat, lng: place.lng }}
                            title={place.name}
                            icon={{
                                url: `/pixels/icons/${place.category}.png`, // Try to use our pixel assets if they work
                                scaledSize: new google.maps.Size(32, 32),
                            }}
                        />
                    );
                })}
            </GoogleMap>
        </div>
    );
}
