import { lazy, Suspense, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";
import GuestUpgradeNotice from "./components/GuestUpgradeNotice";
import { GuestSessionCleanup } from "./hooks/useGuestCleanup";

const Home = lazy(() => import("./pages/Home"));
const RecycleScanner = lazy(() => import("./pages/RecycleScanner"));
const InteractiveMap = lazy(() => import("./pages/InteractiveMap"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Learn = lazy(() => import("./pages/Learn"));
const About = lazy(() => import("./pages/About"));
const Auth = lazy(() => import("./pages/Auth"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const CursorGlow = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;

    if (!glow) return;

    const finePointer = window.matchMedia("(pointer: fine)");

    if (!finePointer.matches) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      glow.style.opacity = "1";
    };

    const handlePointerLeave = () => {
      glow.style.opacity = "0";
    };

    window.addEventListener("pointermove", handlePointerMove);
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-background">
    <div className="flex items-center gap-3 text-primary">
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-sm font-medium">Loading MyMalaysiaCare...</span>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CursorGlow />
      <Toaster />
      <Sonner />
      <HashRouter>
        <ScrollToTop />
        <Header />
        <GuestUpgradeNotice />
        <main
          className="pb-24"
          onClickCapture={(event) => {
            const button = (event.target as HTMLElement).closest("button");
            const label = button?.textContent?.trim();
            if (label === "Previous" || label === "Next") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <Suspense fallback={<AppFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/recycle" element={<RecycleScanner />} />
              <Route path="/map" element={<InteractiveMap />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <ChatBot />
        <GuestSessionCleanup />
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
