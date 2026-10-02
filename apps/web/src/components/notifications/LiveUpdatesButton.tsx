"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

export default function LiveUpdatesButton() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check if already subscribed
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleSubscribe = async () => {
    if (!isSupported) return;
    setIsLoading(true);

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm !== "granted") {
        setIsLoading(false);
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error("VAPID public key not found");
        setIsLoading(false);
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON())
      });

      if (response.ok) {
        setIsSubscribed(true);
      } else {
        console.error("Failed to save subscription to server");
      }
    } catch (err) {
      console.error("Push subscription error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!isSupported) return;
    setIsLoading(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      
      if (subscription) {
        await fetch("/api/notifications/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        
        await subscription.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error("Push unsubscription error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) return null;

  if (permission === "denied") {
    return (
      <button 
        disabled
        title="Notifications are blocked in your browser"
        className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-[var(--muted)] border border-[var(--border)] rounded-md cursor-not-allowed uppercase tracking-wider"
      >
        <BellOff className="w-3 h-3" />
        <span className="hidden md:inline">Blocked</span>
      </button>
    );
  }

  return (
    <button
      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
      disabled={isLoading}
      title={isSubscribed ? "Disable Live Updates" : "Enable Live Updates"}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors uppercase tracking-wider ${
        isSubscribed 
          ? "text-[var(--gold)] bg-[var(--gold)]/10 border border-[var(--accent)] hover:bg-[var(--gold)]/20" 
          : "text-[var(--secondary)] border border-[var(--border)] hover:text-white hover:border-white"
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="w-3 h-3 fill-[var(--gold)] text-[var(--gold)]" />
      ) : (
        <Bell className="w-3 h-3" />
      )}
      <span className="hidden md:inline">{isSubscribed ? "Subscribed" : "Live Updates"}</span>
    </button>
  );
}
