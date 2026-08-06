import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

const DISMISS_KEY = "guestNoticeDismissed";

const GuestUpgradeNotice = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isGuest = !!(user as any)?.is_anonymous;

  useEffect(() => {
    if (loading) return;
    if (isGuest && sessionStorage.getItem(DISMISS_KEY) !== "1") {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isGuest, loading]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
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

        <div className="rounded-full bg-primary/10 p-5">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold leading-tight break-words">
          Please sign up to access Dashboard, Leaderboard and all the other features
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
          You're browsing as a guest. Create a free account to track your scans,
          earn points, climb the leaderboard and keep your eco impact saved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Button
            size="lg"
            className="flex-1"
            onClick={() => {
              dismiss();
              navigate("/auth");
            }}
          >
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
