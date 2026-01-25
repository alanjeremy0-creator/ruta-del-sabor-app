import { savePlace, createVisit, completeVisit, type Place } from "./firestore";
import { Timestamp } from "firebase/firestore";

const MOCK_PLACES: Omit<Place, "createdAt">[] = [
    {
        id: "place-1",
        name: "Tacos El Viejón",
        address: "Centro, Toluca",
        category: "taco",
        lat: 19.2826,
        lng: -99.6556
    },
    {
        id: "place-2",
        name: "Café Pixel",
        address: "Metepec",
        category: "coffee",
        lat: 19.2564,
        lng: -99.6048
    },
    {
        id: "place-3",
        name: "Burger 8-Bit",
        address: "Toluca Centro",
        category: "burger",
        lat: 19.2900,
        lng: -99.6600
    },
];

export async function seedDatabase() {
    console.log("Seeding database...");

    // 1. Save Places
    for (const place of MOCK_PLACES) {
        await savePlace(place);
    }

    // 2. Save Visits

    // Future visit (Próxima Parada)
    await createVisit({
        placeId: "place-2", // Café Pixel
        userId: "jeremy",
        visitDate: Timestamp.fromDate(new Date(Date.now() + 3 * 60 * 60 * 1000)), // +3 hours
        status: "planned"
    });

    // Past planned visit (To Rate)
    await createVisit({
        placeId: "place-2", // Café Pixel again
        userId: "jeremy",
        visitDate: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), // -2 hours
        status: "planned"
    });

    // Completed visit (History)
    const completedVisitId = await createVisit({
        placeId: "place-3", // Burger 8-Bit
        userId: "ara",
        visitDate: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // -7 days
        status: "planned" // Start as planned
    });

    // Complete it for Ara
    await completeVisit(completedVisitId, "ara", 4, "Estuvo rico!");
    // Complete it for Jeremy
    await completeVisit(completedVisitId, "jeremy", 5, "Me encantó!");

    console.log("Database seeded successfully!");
}
