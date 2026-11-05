import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Your Google "Web application" Client ID (not secret). Put it in .env as:
//   VITE_GOOGLE_CLIENT_ID="1234567890-abcdefg.apps.googleusercontent.com"
// If it is missing, the Google button is simply hidden.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

declare global {
  interface Window {
    google?: any;
  }
}

const loadGoogleScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const src = "https://accounts.google.com/gsi/client";
    const existing = document.querySelector(`script[src="${src}"]`);

    const script = (existing as HTMLScriptElement) ?? document.createElement("script");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Could not load Google sign-in")));

    if (!existing) {
      script.src = src;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

const GoogleSignInButton = () => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: { credential?: string }) => {
            if (!response?.credential) return;

            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
            });

            if (error) {
              toast({
                title: "Google sign-in failed",
                description: error.message,
                variant: "destructive",
              });
            }
            // On success the Auth page notices the new session and opens the app.
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          // Google allows 200-400px. Use the full card width on phones, 400px on laptops.
          width: Math.min(400, Math.max(200, Math.floor(buttonRef.current.clientWidth || 300))),
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [toast]);

  if (!GOOGLE_CLIENT_ID || failed) return null;

  return (
    <div className="mb-6">
      <div ref={buttonRef} className="flex justify-center w-full" />

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or use email</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignInButton;
