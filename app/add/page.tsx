"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Heart, X, Search } from "lucide-react";
// import { Autocomplete } from "@react-google-maps/api"; // Removed in favor of manual implementation
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { savePlace, createVisit, mapGoogleTypeToCategory, type Place } from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";
import { useUser } from "@/hooks/useUser";
import { FoodEmblem } from "@/components/ui/FoodEmblem";
import { getAutocompleteOptions } from "@/lib/googleMaps";
import { PixelConfetti } from "@/components/ui/PixelConfetti";
import { useToast } from "@/contexts/ToastContext";
import { sendPushNotification } from "@/app/actions/push";

export default function AddPlanPage() {
    const router = useRouter();
    const { user } = useUser();
    const { isLoaded, loadError } = useGoogleMaps();
    const { showToast } = useToast();

    // ... (rest of state)


    // Form state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
    const [manualPlaceName, setManualPlaceName] = useState("");
    const [manualAddress, setManualAddress] = useState("");
    const [useManualEntry, setUseManualEntry] = useState(false);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Manual Autocomplete Implementation
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        if (isLoaded && inputRef.current && window.google) {
            try {
                const options = getAutocompleteOptions();
                const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, options);
                autocompleteRef.current = autocomplete;

                autocomplete.addListener("place_changed", handlePlaceChanged);
            } catch (e) {
                console.error("Error initializing autocomplete:", e);
            }
        }
    }, [isLoaded]);

    const handlePlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place && place.geometry && place.place_id && place.name) {
                setSelectedPlace(place);
                setSearchQuery(place.name);
                setUseManualEntry(false);
            } else {
                // No valid place, enable manual entry
                setUseManualEntry(true);
            }
        }
    };

    // Check if place selection is complete (either from Google or manual)
    const isPlaceComplete = selectedPlace || (useManualEntry && manualPlaceName.trim() && manualAddress.trim());
    const isDateComplete = date.trim() !== "";
    const isTimeComplete = time.trim() !== "";

    const handleSubmit = async () => {
        if (!user) return;

        // Determine if using Google place or manual entry
        if (selectedPlace) {
            if (!selectedPlace.place_id || !selectedPlace.name || !selectedPlace.geometry?.location) return;
        } else if (useManualEntry) {
            if (!manualPlaceName.trim() || !manualAddress.trim()) return;
        } else {
            return;
        }

        if (!date || !time) return;

        setIsSubmitting(true);
        try {
            let placeId: string;
            let placeName: string;
            let placeAddress: string;
            let placeLat: number;
            let placeLng: number;
            let photoRef: string | undefined;
            let category: Place["category"];

            if (selectedPlace && selectedPlace.place_id && selectedPlace.geometry?.location) {
                // Use Google place data
                placeId = selectedPlace.place_id;
                placeName = selectedPlace.name || "Lugar sin nombre";
                placeAddress = selectedPlace.formatted_address || selectedPlace.vicinity || "Dirección desconocida";
                placeLat = selectedPlace.geometry.location.lat();
                placeLng = selectedPlace.geometry.location.lng();
                category = mapGoogleTypeToCategory(selectedPlace.types || []);
                if (selectedPlace.photos && selectedPlace.photos.length > 0) {
                    const photoUrl = selectedPlace.photos[0].getUrl({ maxWidth: 400 });
                    // Extract the raw reference from the URL (parameter '1s')
                    const match = photoUrl.match(/[?&]1s([^&]+)/);
                    if (match) {
                        photoRef = match[1];
                    }
                }
            } else {
                // Use manual entry - generate a unique ID
                placeId = crypto.randomUUID();
                placeName = manualPlaceName;
                placeAddress = manualAddress;
                placeLat = 19.4326; // Default to CDMX? Or just placeholder.
                placeLng = -99.1332;
                category = "food";
                photoRef = undefined;
            }

            await savePlace({
                id: placeId,
                name: placeName,
                address: placeAddress,
                category: category,
                lat: placeLat,
                lng: placeLng,
                photoReference: photoRef,
            });

            const visitDate = new Date(`${date}T${time}`);

            await createVisit({
                placeId: placeId,
                userId: user.id || "anon",
                visitDate: Timestamp.fromDate(visitDate),
                status: "planned",
            });

            // Show success animation
            showToast("¡Plan creado! 📅", "success");
            setIsSubmitting(false);
            setShowSuccess(true);

            // Redirect after animation
            setTimeout(() => {
                router.push("/");
            }, 2500);

        } catch (error) {
            console.error("Error saving plan:", error);
            alert("Hubo un error al guardar el plan. Intenta de nuevo.");
            setIsSubmitting(false);
        }
    };

    const handleClose = () => router.back();

    const handleEnableManualEntry = () => {
        setUseManualEntry(true);
        setSelectedPlace(null);
        setManualPlaceName(searchQuery);
    };

    if (!isLoaded && !loadError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base">
                <FoodEmblem size={48} className="animate-bounce" />
            </div>
        );
    }

    if (loadError) {
        return <div className="p-4">Error cargando Google Maps</div>;
    }

    // Success Screen with Confetti
    if (showSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-base relative overflow-hidden">
                <PixelConfetti isActive={true} />

                {/* Success Animation */}
                <div className="text-center z-10 animate-success-pop">
                    <div className="mb-6 relative">
                        <Heart
                            className="w-24 h-24 text-pink mx-auto animate-pulse"
                            fill="currentColor"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl animate-bounce">💕</span>
                        </div>
                    </div>
                    <h2 className="font-space font-bold text-2xl text-pink mb-2 animate-fade-in">
                        ¡Propuesta enviada! 📨
                    </h2>
                    <p className="text-lg text-muted animate-fade-in" style={{ animationDelay: "0.3s" }}>
                        Esperando el visto bueno de tu amor 💖
                    </p>
                </div>

                <style jsx>{`
                    @keyframes success-pop {
                        0% { transform: scale(0); opacity: 0; }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .animate-success-pop {
                        animation: success-pop 0.5s ease-out forwards;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-dark border-b border-border">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                    <h1 className="font-space font-bold text-lg">Nuestro nuevo plan</h1>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 hover:bg-surface flex items-center justify-center pixel-border"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="max-w-lg mx-auto p-4 space-y-6">
                {/* Search Section */}
                <section>
                    <label className="font-space text-pink font-bold block mb-2 text-sm">
                        Busca el nombre del lugar de nuestra visita 🚀 🌮
                    </label>
                    <div className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted z-10" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isLoaded ? "Tacos, café, sushi..." : "Cargando mapa..."}
                                disabled={!isLoaded}
                                className={`w-full pl-10 pr-4 py-3 border-2 border-border bg-surface focus:outline-none focus:border-pink pixel-border text-primary placeholder:text-muted ${!isLoaded ? "cursor-wait opacity-70" : ""}`}
                                autoFocus
                            />
                        </div>
                    </div>




                    {/* Manual Entry Button */}
                    {searchQuery && !selectedPlace && !useManualEntry && (
                        <button
                            onClick={handleEnableManualEntry}
                            className="mt-2 text-sm text-sage hover:text-pink underline transition-colors"
                        >
                            ¿No está 😢? Agrégalo por acá 😉
                        </button>
                    )}

                    {/* Selected Place Preview */}
                    {selectedPlace && (
                        <div className="mt-3 p-3 card-pixel flex items-center gap-3 border-2 border-sage animate-fade-in">
                            <div className="w-12 h-12 flex items-center justify-center bg-surface border border-border">
                                {selectedPlace.photos && selectedPlace.photos.length > 0 ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={selectedPlace.photos[0].getUrl({ maxWidth: 100 })}
                                        alt="Place"
                                        className="w-full h-full object-cover grayscale"
                                    />
                                ) : (
                                    <MapPin className="w-6 h-6 text-pink" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-space font-bold truncate">{selectedPlace.name}</p>
                                <p className="text-xs text-muted truncate">
                                    {selectedPlace.formatted_address || selectedPlace.vicinity}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedPlace(null);
                                    setSearchQuery("");
                                }}
                                className="text-muted hover:text-primary z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Manual Entry Form */}
                    {useManualEntry && (
                        <div className="mt-4 p-4 card-pixel border-2 border-gold space-y-3 animate-fade-in">
                            <p className="text-xs text-gold font-bold uppercase tracking-wide">📝 Entrada manual</p>
                            <input
                                type="text"
                                value={manualPlaceName}
                                onChange={(e) => setManualPlaceName(e.target.value)}
                                placeholder="Nombre del lugar"
                                className="w-full px-4 py-3 border-2 border-border bg-surface focus:outline-none focus:border-pink pixel-border text-primary placeholder:text-muted"
                            />
                            <input
                                type="text"
                                value={manualAddress}
                                onChange={(e) => setManualAddress(e.target.value)}
                                placeholder="Dirección o referencia"
                                className="w-full px-4 py-3 border-2 border-border bg-surface focus:outline-none focus:border-pink pixel-border text-primary placeholder:text-muted"
                            />
                            <button
                                onClick={() => {
                                    setUseManualEntry(false);
                                    setManualPlaceName("");
                                    setManualAddress("");
                                }}
                                className="text-xs text-muted hover:text-primary underline"
                            >
                                Cancelar entrada manual
                            </button>
                        </div>
                    )}
                </section>

                {/* Date Section - Shows after place is selected */}
                {isPlaceComplete && (
                    <section className="animate-fade-in">
                        <label className="font-space text-pink font-bold block mb-2 text-sm">
                            ¿Cuándo iremos? 🤔
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-4 border-2 border-border bg-surface focus:outline-none focus:border-pink pixel-border text-primary text-lg"
                            style={{ colorScheme: "dark" }}
                        />
                    </section>
                )}

                {/* Time Section - Shows after date is selected */}
                {isPlaceComplete && isDateComplete && (
                    <section className="animate-fade-in">
                        <label className="font-space text-pink font-bold block mb-1 text-sm">
                            ¿A qué hora?
                        </label>
                        <p className="text-xs text-muted mb-2">
                            no vayas a llegar tarde 🤭 ¡es broma tranqui, siii!
                        </p>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full px-4 py-4 border-2 border-border bg-surface focus:outline-none focus:border-pink pixel-border text-primary text-lg"
                            style={{ colorScheme: "dark" }}
                        />
                    </section>
                )}

                {/* Submit Button */}
                {isPlaceComplete && isDateComplete && isTimeComplete && !isSubmitting ? (
                    <div className="sparkle-button-wrapper w-full">
                        <span className="sparkle-star sparkle-star-1">✦</span>
                        <span className="sparkle-star sparkle-star-2">✦</span>
                        <span className="sparkle-star sparkle-star-3" style={{ color: "var(--pixel-pink)" }}>★</span>
                        <span className="sparkle-star sparkle-star-4">✦</span>
                        <button
                            onClick={handleSubmit}
                            className="w-full py-4 font-bold uppercase tracking-wide btn-pixel"
                            style={{ background: "var(--pixel-gold)", color: "#0D0B1E" }}
                        >
                            {isSubmitting ? "Guardando..." : "¡Vamos! 🎉"}
                        </button>
                    </div>
                ) : (
                    <button
                        disabled
                        className="w-full py-4 font-bold uppercase tracking-wide bg-border text-muted cursor-not-allowed pixel-border"
                    >
                        ¡Vamos! 🎉
                    </button>
                )}
            </main>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                /* FORCE GOOGLE MAPS AUTOCOMPLETE ON TOP */
                .pac-container {
                    z-index: 99999 !important;
                    display: block !important;
                }
                .pac-logo {
                    display: none !important;
                }
            `}</style>
        </div >
    );
}
