import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Your Google "Web application" Client ID (not secret). Put it in .env as:
//   VITE_GOOGLE_CLIENT_ID="1234567890-abcdefg.apps.googleusercontent.com"
// If it is missing, the Google button is simply hidden.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

type GoogleSignInButtonProps = {
  mode: "signin" | "signup";
};

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

// A thin line with "or" in the middle:  ------- or -------
export const OrDivider = () => (
  <div className="relative my-4">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs">
      <span className="bg-card px-2 text-muted-foreground">or</span>
    </div>
  </div>
);

const GoogleSignInButton = ({ mode }: GoogleSignInButtonProps) => {
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
          text: mode === "signup" ? "signup_with" : "signin_with",
          shape: "rectangular",
          // Match the width of the other form controls while keeping the button slightly taller.
          width: Math.min(400, Math.max(200, Math.floor(buttonRef.current.clientWidth || 300))),
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [mode, toast]);

  if (!GOOGLE_CLIENT_ID || failed) return null;

  return (
    <div className="w-full">
      <OrDivider />
      <div className="w-full py-1">
        <div ref={buttonRef} className="w-full [&>div]:!w-full" style={{ transform: "scaleY(1.06)", transformOrigin: "center" }} />
      </div>
    </div>
  );
};

export default GoogleSignInButton;
