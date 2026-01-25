"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getPlannedVisits,
    getCompletedVisits,
    getPlace,
    completeVisit as completeVisitFirestore,
    type Visit as FirestoreVisit,
    type Place as FirestorePlace
} from "@/lib/firestore";
import { type Visit, type Place } from "@/components/ui/PlaceCard";

export function useVisits() {
    const [plannedVisits, setPlannedVisits] = useState<Visit[]>([]);
    const [completedVisits, setCompletedVisits] = useState<Visit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVisits = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch raw visits
            const [plannedRaw, completedRaw] = await Promise.all([
                getPlannedVisits(),
                getCompletedVisits()
            ]);

            // Helper to hydrate visits with place data
            const hydrateVisits = async (visits: FirestoreVisit[]): Promise<Visit[]> => {
                const hydratedSteps = await Promise.all(visits.map(async (visit) => {
                    if (!visit.placeId) return null;
                    const placeData = await getPlace(visit.placeId);
                    if (!placeData) return null; // Should handle orphaned visits

                    const v: Visit = {
                        id: visit.id,
                        place: {
                            id: placeData.id,
                            name: placeData.name,
                            address: placeData.address,
                            category: placeData.category,
                            lat: placeData.lat,
                            lng: placeData.lng,
                            photoReference: placeData.photoReference,
                        },
                        userId: visit.userId,
                        visitDate: visit.visitDate.toDate(),
                        status: visit.status,
                        ratings: visit.ratings || {},
                    };
                    return v;
                }));
                return hydratedSteps.filter((v): v is Visit => v !== null);
            };

            setPlannedVisits(await hydrateVisits(plannedRaw));
            setCompletedVisits(await hydrateVisits(completedRaw));
        } catch (err) {
            console.error("Error fetching visits:", err);
            setError("Error al cargar las visitas. Revisa tu conexión.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVisits();
    }, [fetchVisits]);

    const completeVisit = async (visitId: string, userId: "ara" | "jeremy", rating: number, notes?: string) => {
        try {
            await completeVisitFirestore(visitId, userId, rating, notes);
            await fetchVisits(); // Refresh data
        } catch (err) {
            console.error("Error completing visit:", err);
            throw err;
        }
    };

    const updateVisitDate = async (visitId: string, newDate: Date, proposedBy: "ara" | "jeremy") => {
        try {
            const { updateVisitDate: updateVisitDateFirestore } = await import("@/lib/firestore");
            await updateVisitDateFirestore(visitId, newDate, proposedBy);
            await fetchVisits();
        } catch (err) {
            console.error("Error updating visit date:", err);
            throw err;
        }
    };

    const confirmVisit = async (visitId: string) => {
        try {
            const { confirmVisit: confirmVisitFirestore } = await import("@/lib/firestore");
            await confirmVisitFirestore(visitId);
            await fetchVisits();
        } catch (err) {
            console.error("Error confirming visit:", err);
            throw err;
        }
    };

    return {
        plannedVisits,
        completedVisits,
        isLoading,
        error,
        refreshVisits: fetchVisits,
        completeVisit,
        updateVisitDate,
        confirmVisit
    };
}
