
import { useState, useEffect } from 'react';
import { subscribeUserToPush } from '@/app/actions/push'; // We will create this

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const registerServiceWorker = async () => {
        if (!isSupported) return;
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none',
            });
            console.log('Service Worker registered:', registration);
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    };

    const subscribeToPush = async (userId: string) => {
        if (!isSupported) return;

        try {
            const registration = await registerServiceWorker();
            if (!registration) return;

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;

            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                setSubscription(existingSubscription);
                // Always update/verify subscription on backend
                await subscribeUserToPush(existingSubscription, userId);
                return;
            }

            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                console.error('VAPID Public Key is missing');
                return;
            }

            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            const newSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            setSubscription(newSubscription);
            setPermission(Notification.permission);

            // Send to backend
            await subscribeUserToPush(newSubscription, userId);

            console.log('Push Subscription successful');

        } catch (error) {
            console.error('Failed to subscribe to push:', error);
            // Check for permission denied
            setPermission(Notification.permission);
        }
    };

    return {
        isSupported,
        permission,
        subscription,
        subscribeToPush
    };
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
