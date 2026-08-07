import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const GuestUpgradeNotice = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const wasGuest = useRef(false);

  const isGuest = !!(user as any)?.is_anonymous;
  const onDashboard = location.pathname === "/dashboard";

  useEffect(() => {
    if (loading) return;
    if (isGuest && !wasGuest.current) {
      setOpen(true);
    }
    wasGuest.current = isGuest;
  }, [isGuest, loading]);

  useEffect(() => {
    if (loading) return;
    if (isGuest && onDashboard) {
      setOpen(true);
    }
  }, [onDashboard, isGuest, loading]);

  const dismiss = () => {
    setOpen(false);
    if (onDashboard) {
      navigate("/");
    }
  };

  const handleSignUp = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate("/auth");
  };

  if (!isGuest) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? dismiss() : setOpen(true))}>
      <DialogContent
        hideClose
        className="w-[90vw] max-w-2xl sm:max-w-3xl min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 p-8"
      >
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="rounded-full overflow-hidden w-20 h-20 flex items-center justify-center">
          <img
           src={`${import.meta.env.BASE_URL}logo.png`}
           alt="MyMalaysiaCare logo"
           className="w-full h-full object-cover"
         />
       </div>

        <h2 className="text-3xl sm:text-4xl font-bold leading-tight break-words">
          Please sign up to access Dashboard, Leaderboard and all the other features
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
          You're browsing as a guest. Create a free account to track your scans,
          earn points, climb the leaderboard and keep your eco impact saved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Button size="lg" className="flex-1" onClick={handleSignUp}>
            Sign Up Now
          </Button>
          <Button size="lg" variant="outline" className="flex-1" onClick={dismiss}>
            Continue as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuestUpgradeNotice;
