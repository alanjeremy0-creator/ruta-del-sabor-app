import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
// @ts-ignore - web-push types not found on Vercel build
import webpush from "web-push";

// Configure VAPID
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        "mailto:alan.jasso@example.com",
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

// Helper to send push notification
async function sendPush(userId: string, title: string, body: string, url: string = "/") {
    try {
        const doc = await db.collection("subscriptions").doc(userId).get();
        if (!doc.exists) return;

        const subscription = doc.data()?.subscription;
        if (!subscription) return;

        const payload = JSON.stringify({ title, body, url });
        await webpush.sendNotification(subscription, payload);
        console.log(`[Reminder] Sent to ${userId}: ${title}`);
    } catch (error: any) {
        console.error(`[Reminder] Failed for ${userId}:`, error.message);
        if (error.statusCode === 410 || error.statusCode === 404) {
            await db.collection("subscriptions").doc(userId).delete();
        }
    }
}

export async function GET(request: NextRequest) {
    // Verify cron secret (for security in production)
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const sentReminders: string[] = [];
    const sentReviews: string[] = [];

    try {
        // Get all planned visits
        const visitsSnapshot = await db.collection("visits")
            .where("status", "==", "planned")
            .where("confirmationStatus", "==", "confirmed")
            .get();

        for (const doc of visitsSnapshot.docs) {
            const visit = doc.data();
            const visitId = doc.id;
            const visitDate = visit.visitDate.toDate();
            const placeId = visit.placeId;

            // Get place name
            const placeDoc = await db.collection("places").doc(placeId).get();
            const placeName = placeDoc.exists ? placeDoc.data()?.name : "un lugar";

            // --- REMINDER: 1 hour before ---
            // Check if visit is within the next hour (between now and oneHourFromNow)
            const timeDiff = visitDate.getTime() - now.getTime();
            const isWithinNextHour = timeDiff > 0 && timeDiff <= 60 * 60 * 1000;

            // Check if we already sent this reminder (stored in visit.reminderSent)
            if (isWithinNextHour && !visit.reminderSent) {
                // Send to both users with personalized messages
                await sendPush(
                    "ara",
                    "⏰ ¡Ya casi es hora!",
                    `Ponte linda que vamos a ${placeName} en una hora. ¡Qué emoción! 🤤`,
                    "/"
                );
                await sendPush(
                    "jeremy",
                    "⏰ ¡Ya casi es hora!",
                    `Ponte guapo que vamos a ${placeName} en una hora. ¡Qué emoción! 🤤`,
                    "/"
                );

                // Mark reminder as sent
                await db.collection("visits").doc(visitId).update({ reminderSent: true });
                sentReminders.push(visitId);
            }
        }

        // --- POST-VISIT REVIEW REMINDER: 2 hours after ---
        // Get completed visits from around 2 hours ago that have not been rated by both
        const completedSnapshot = await db.collection("visits")
            .where("status", "==", "completed")
            .get();

        for (const doc of completedSnapshot.docs) {
            const visit = doc.data();
            const visitId = doc.id;
            const visitDate = visit.visitDate.toDate();
            const placeId = visit.placeId;
            const ratings = visit.ratings || {};

            // Check if visit was around 2 hours ago (within last 30 min window)
            const timeSinceVisit = now.getTime() - visitDate.getTime();
            const isAroundTwoHoursAfter = timeSinceVisit >= 2 * 60 * 60 * 1000 && timeSinceVisit < 2.5 * 60 * 60 * 1000;

            // Check if reminder not already sent and not both rated
            if (isAroundTwoHoursAfter && !visit.reviewReminderSent) {
                const placeDoc = await db.collection("places").doc(placeId).get();
                const placeName = placeDoc.exists ? placeDoc.data()?.name : "un lugar";

                // Send to users who haven't rated
                if (!ratings["ara"]) {
                    await sendPush(
                        "ara",
                        "🎤 Oye, ¿qué tal estuvo?",
                        `Sube tu fotito de ${placeName} y dinos qué tal la comida (rico o qué? 😉).`,
                        `/rate/${visitId}`
                    );
                }
                if (!ratings["jeremy"]) {
                    await sendPush(
                        "jeremy",
                        "🎤 Oye, ¿qué tal estuvo?",
                        `Sube tu fotito de ${placeName} y dinos qué tal la comida (rico o qué? 😉).`,
                        `/rate/${visitId}`
                    );
                }

                // Mark review reminder as sent
                await db.collection("visits").doc(visitId).update({ reviewReminderSent: true });
                sentReviews.push(visitId);
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: now.toISOString(),
            sentReminders,
            sentReviews,
        });
    } catch (error: any) {
        console.error("[Cron] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
