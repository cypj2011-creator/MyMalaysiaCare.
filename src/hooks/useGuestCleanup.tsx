import { useEffect } from "react";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-guest`;

/**
 * Deletes the current guest (anonymous) account when the browser tab/window
 * is closed. Uses a keepalive request so it still fires during unload.
 */
export const useGuestCleanup = () => {
  useEffect(() => {
    const handler = () => {
      // Read the cached session synchronously from localStorage
      try {
        const key = Object.keys(localStorage).find(
          (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
        );
        if (!key) return;
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const token = parsed?.access_token;
        const isGuest = parsed?.user?.is_anonymous;
        if (!token || !isGuest) return;

        fetch(FN_URL, {
          method: "POST",
          keepalive: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: "{}",
        }).catch(() => {});

        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    };

    window.addEventListener("pagehide", handler);
    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("pagehide", handler);
      window.removeEventListener("beforeunload", handler);
    };
  }, []);
};



export const GuestSessionCleanup = () => {
  useGuestCleanup();
  return null;
};
