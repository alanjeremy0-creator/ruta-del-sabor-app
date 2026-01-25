"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Star, Navigation, Trash2 } from "lucide-react";
import { useUser, DEFAULT_USERS, getAllUsersWithAvatars } from "@/hooks/useUser";
import { getPlace, deleteVisitsByPlaceId, deletePlace, getVisitsByPlaceId, type Place, type Visit } from "@/lib/firestore";
import { FoodEmblem } from "@/components/ui/FoodEmblem";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { categoryIcons } from "@/components/ui/FoodIcons";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import Image from "next/image";

// Hook to get place details (photos) from Google Places Service
function usePlaceDetails(placeId: string | undefined, isLoaded: boolean) {
    const [photos, setPhotos] = useState<string[]>([]);
    const [googleRating, setGoogleRating] = useState<number | null>(null);
    const serviceRef = useRef<google.maps.places.PlacesService | null>(null);

    useEffect(() => {
        if (!isLoaded || !placeId) return;

        // Verify google maps is available
        if (!window.google || !window.google.maps || !window.google.maps.places) return;

        // Create a dummy element for the service
        const mapDiv = document.createElement("div");
        serviceRef.current = new window.google.maps.places.PlacesService(mapDiv);

        serviceRef.current.getDetails(
            {
                placeId: placeId,
                fields: ["photos", "rating", "user_ratings_total"],
            },
            (result, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
                    if (result.photos) {
                        const urls = result.photos.map((p) => p.getUrl({ maxWidth: 800 }));
                        setPhotos(urls);
                    }
                    if (result.rating) {
                        setGoogleRating(result.rating);
                    }
                }
            }
        );
    }, [isLoaded, placeId]);

    return { photos, googleRating };
}

export default function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [place, setPlace] = useState<Place | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [allUsers, setAllUsers] = useState<Record<string, any>>(DEFAULT_USERS);
    const { isLoaded, loadError, options } = useGoogleMaps();

    // Load all users with their custom avatars
    useEffect(() => {
        setAllUsers(getAllUsersWithAvatars());
    }, []);

    // Fetch our DB place data AND visits
    useEffect(() => {
        async function fetchData() {
            if (!id) return;
            try {
                const [placeData, visitsData] = await Promise.all([
                    getPlace(id),
                    getVisitsByPlaceId(id)
                ]);
                setPlace(placeData);
                setVisits(visitsData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    // Fetch extra details from Google (Photos)
    const { photos, googleRating } = usePlaceDetails(place?.id, isLoaded);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!place) return;

        setIsDeleting(true);
        try {
            // Delete all visits associated with this place
            await deleteVisitsByPlaceId(place.id);
            // Delete the place itself
            await deletePlace(place.id);
            // Redirect to home
            router.push("/");
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Hubo un error al eliminar. Intenta de nuevo.");
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading || !isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base">
                <FoodEmblem size={64} className="animate-bounce" />
            </div>
        );
    }

    if (!place) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <p className="text-xl font-space font-bold mb-4">Lugar no encontrado 😢</p>
                <button onClick={() => router.back()} className="btn-pixel">
                    Regresar
                </button>
            </div>
        );
    }

    const IconComponent = categoryIcons[place.category] || categoryIcons.food;

    return (
        <div className="min-h-screen bg-base pb-24">
            {/* Header / Hero */}
            <header className="relative h-64 md:h-80 bg-surface border-b-4 border-pink overflow-hidden">
                {/* Background Image (Use first Google Photo or fallback pattern) */}
                {photos.length > 0 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={photos[0]}
                        alt={place.name}
                        className="w-full h-full object-cover brightness-50"
                    />
                ) : (
                    <div className="w-full h-full bg-[url('/pixels/pattern.png')] opacity-20" />
                )}

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-surface/90 backdrop-blur border border-border shadow-lg flex items-center justify-center active:scale-95 transition-transform text-primary"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-base to-transparent pt-20">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-pink text-white text-xs font-bold uppercase tracking-widest rounded-full">
                                    {place.category}
                                </span>
                                {googleRating && (
                                    <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-0.5 rounded-full border border-yellow-400/50">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-bold text-yellow-100">
                                            {googleRating}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <h1 className="font-space font-bold text-3xl md:text-4xl text-white drop-shadow-lg leading-tight">
                                {place.name}
                            </h1>
                        </div>
                        <div className="w-14 h-14 bg-surface rounded-xl border-2 border-pink flex items-center justify-center shadow-lg transform rotate-3">
                            <IconComponent size={32} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-8 space-y-8">
                {/* Info Card */}
                <section className="card-pixel p-5 border-2 border-sage card-glow">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-sage mt-1 flex-shrink-0" />
                        <div>
                            <h2 className="font-bold text-lg mb-1">Ubicación</h2>
                            <p className="text-muted leading-relaxed">{place.address}</p>

                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.address)}&query_place_id=${place.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-sage hover:underline"
                            >
                                <Navigation className="w-4 h-4" />
                                打开 Google Maps
                            </a>
                        </div>
                    </div>
                </section>

                {/* Visits History */}
                {visits.length > 0 && (
                    <section>
                        <h2 className="font-space font-bold text-xl mb-4 flex items-center gap-2">
                            <span className="text-pink">📝</span> Reseñas y Visitas
                        </h2>
                        <div className="space-y-4">
                            {visits.map((visit) => {
                                const araRating = visit.ratings?.ara;
                                const jeremyRating = visit.ratings?.jeremy;

                                return (
                                    <div key={visit.id} className="card-pixel p-0 border border-border/50 bg-surface/50">
                                        <div className="px-4 py-2 border-b border-border/50 bg-base/50 flex justify-between items-center text-sm">
                                            <span className="text-muted font-bold">
                                                {visit.visitDate ? new Date(visit.visitDate.toDate()).toLocaleDateString("es-MX", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha desconocida'}
                                            </span>
                                            {/* Status Badge */}
                                            {visit.status === 'completed' ? (
                                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    Completada
                                                </span>
                                            ) : (
                                                <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    Planeada
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-4 space-y-4">
                                            {/* Ara's Review */}
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-full border-2 border-pink overflow-hidden relative">
                                                        <Image src={allUsers.ara?.avatarUrl || DEFAULT_USERS.ara.avatarUrl} alt="Ara" fill className="object-cover" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-sm text-pink">Ara</span>
                                                        {araRating ? (
                                                            <div className="flex text-gold text-xs">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span key={i}>{i < araRating.rating ? "★" : "☆"}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted italic">Pendiente</span>
                                                        )}
                                                    </div>
                                                    {araRating?.notes && (
                                                        <div className="bg-base/50 p-3 rounded-lg rounded-tl-none border border-border/50 text-sm text-balance relative">
                                                            <div className="absolute -top-[1px] -left-[9px] w-2 h-2 bg-transparent border-t border-r border-border/50 [transform:skew(45deg)] bg-base/50"></div>
                                                            &quot;{araRating.notes}&quot;
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Jeremy's Review */}
                                            <div className="flex gap-3 flex-row-reverse text-right">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-full border-2 border-cyan overflow-hidden relative">
                                                        <Image src={allUsers.jeremy?.avatarUrl || DEFAULT_USERS.jeremy.avatarUrl} alt="Jeremy" fill className="object-cover" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-end gap-2 mb-1">
                                                        {jeremyRating ? (
                                                            <div className="flex text-gold text-xs">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span key={i}>{i < jeremyRating.rating ? "★" : "☆"}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted italic">Pendiente</span>
                                                        )}
                                                        <span className="font-bold text-sm text-cyan">Jeremy</span>
                                                    </div>
                                                    {jeremyRating?.notes && (
                                                        <div className="bg-base/50 p-3 rounded-lg rounded-tr-none border border-border/50 text-sm text-balance inline-block text-left">
                                                            &quot;{jeremyRating.notes}&quot;
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Average Rating Footer */}
                                            {(araRating || jeremyRating) && (
                                                <div className="pt-3 mt-2 border-t border-border/50 flex justify-center items-center gap-3">
                                                    <span className="text-[10px] text-muted uppercase tracking-widest font-bold">
                                                        Calificación Final
                                                    </span>
                                                    <div className="flex items-center gap-1 bg-surface px-3 py-1 rounded-full border border-border/50">
                                                        <span className="text-gold text-sm">★</span>
                                                        <span className="font-space font-bold text-base text-white">
                                                            {(() => {
                                                                const ratings = [araRating?.rating, jeremyRating?.rating].filter((r): r is number => r !== undefined);
                                                                const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                                                                return avg % 1 === 0 ? avg : avg.toFixed(1);
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Overall Average */}
                        {visits.length > 0 && (
                            <div className="mt-4 p-4 card-pixel bg-surface/80 border-dashed border-2 border-gold/50 text-center">
                                <p className="text-xs text-muted font-bold uppercase tracking-widest mb-2">Promedio general de esta visita</p>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-3xl text-gold animate-pulse">★</span>
                                    <span className="font-space font-bold text-4xl text-white">
                                        {(() => {
                                            const allRatings = visits.flatMap(v => Object.values(v.ratings || {}).map(r => r.rating));
                                            if (allRatings.length === 0) return "0.0";
                                            const avg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
                                            return avg % 1 === 0 ? avg : avg.toFixed(1);
                                        })()}
                                    </span>
                                </div>
                                <p className="text-[10px] text-muted mt-2">¡Somos mejores que el chef Benito! 👩🍳👨🍳 MasterChef contratanos</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Photo Gallery */}
                {photos.length > 0 && (
                    <section>
                        <h2 className="font-space font-bold text-xl mb-4 flex items-center gap-2">
                            <span className="text-pink">📸</span> Galería
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {photos.slice(0, 4).map((url, i) => (
                                <div
                                    key={i}
                                    className={`relative aspect-square overflow-hidden rounded-lg border-2 border-border shadow-sm group ${i === 0 ? 'col-span-2 aspect-video' : ''}`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={url}
                                        alt={`Foto ${i + 1}`}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Map */}
                <section>
                    <h2 className="font-space font-bold text-xl mb-4 flex items-center gap-2">
                        <span className="text-pink">🗺️</span> Mapa
                    </h2>
                    <div className="h-64 rounded-xl overflow-hidden border-2 border-border relative shadow-inner">
                        <GoogleMap
                            mapContainerClassName="w-full h-full"
                            center={{ lat: place.lat, lng: place.lng }}
                            zoom={15}
                            options={{ ...options, gestureHandling: "cooperative" }}
                        >
                            <MarkerF
                                position={{ lat: place.lat, lng: place.lng }}
                                icon={{
                                    url: `/pixels/icons/${place.category}.png`,
                                    scaledSize: new window.google.maps.Size(40, 40),
                                }}
                            />
                        </GoogleMap>
                    </div>
                </section>

                {/* Delete Section */}
                <section className="pt-4 border-t border-border">
                    <button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="w-full py-3 px-4 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span className="text-sm font-bold">
                            Eliminar de mi lista
                        </span>
                    </button>

                    <ConfirmModal
                        isOpen={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={handleConfirmDelete}
                        title="¿Eliminar lugar?"
                        message="¿Estás seguro de que quieres eliminar este lugar? También se borrarán todas las visitas asociadas. Esta acción no se puede deshacer."
                        confirmText="Sí, eliminar"
                        cancelText="Cancelar"
                        isDestructive={true}
                        isLoading={isDeleting}
                    />
                </section>
            </main>
        </div>
    );
}
