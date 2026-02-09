"use server";

import webpush from "web-push";
import { db } from "@/lib/firebase-admin"; // We need admin access for backend sending

// Configure VAPID details globally for this module
// Note: We need to ensure these env vars are set
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        "mailto:alan.jasso@example.com", // update with real email if needed
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function subscribeUserToPush(subscription: PushSubscription, userId: string) {
    if (!userId || !subscription) {
        throw new Error("Missing userId or subscription");
    }

    try {
        // Store subscription in Firestore
        // We use the userId as the document ID for simplicity (one device per user assumption for now)
        // If we want multiple devices, we should use a subcollection.
        // For this PWA, simple is better. Overwriting is fine.
        await db.collection("subscriptions").doc(userId).set({
            subscription,
            updatedAt: new Date().toISOString(),
        });

        console.log(`Subscribed user ${userId} to push notifications`);
        return { success: true };
    } catch (error) {
        console.error("Error saving subscription:", error);
        return { success: false, error: "Failed to save subscription" };
    }
}

export async function sendPushNotification(userId: string, title: string, body: string, data?: any) {
    try {
        const doc = await db.collection("subscriptions").doc(userId).get();
        if (!doc.exists) {
            console.log(`No subscription found for user ${userId}`);
            return { success: false, error: "No subscription" };
        }

        const subscription = doc.data()?.subscription;
        if (!subscription) return { success: false, error: "Invalid subscription data" };

        const payload = JSON.stringify({
            title,
            body,
            url: data?.url || "/",
            ...data
        });

        await webpush.sendNotification(subscription, payload);
        console.log(`Notification sent to ${userId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error sending push notification:", error);
        if (error.statusCode === 410 || error.statusCode === 404) {
            // Subscription is gone, delete it
            await db.collection("subscriptions").doc(userId).delete();
            console.log(`Deleted expired subscription for ${userId}`);
        }
        return { success: false, error: error.message };
    }
}
