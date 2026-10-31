
import PageHeader from "@/components/PageHeader";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Camera,
  Upload,
  Sparkles,
  Leaf,
  Info,
  Clock,
  MapPin,
  Recycle,
  ImagePlus,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ScanLine,
  ShieldCheck,
  RefreshCw,
  Sprout,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

interface ScanResult {
  category: string;
  recyclable: boolean;
  instructions: string;
  ecoFact: string;
  confidence: number;
}

interface ScanHistory {
  id: string;
  category: string;
  recyclable: boolean;
  instructions: string;
  eco_fact: string;
  confidence: number;
  created_at: string;
}

const RecycleScanner = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the scanner and save your scan history.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, loading, navigate, toast]);

  useEffect(() => {
    if (user) {
      loadScanHistory();
    }
  }, [user]);

  const loadScanHistory = async () => {
    const { data, error } = await supabase
      .from("scan_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setScanHistory(data);
    }
  };

  const compressImage = (
    dataUrl: string,
    maxDim = 1024,
    quality = 0.85
  ): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        const scale = Math.min(
          1,
          maxDim / Math.max(img.width, img.height)
        );

        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");

        if (!ctx) return resolve(dataUrl);

        ctx.drawImage(img, 0, 0, w, h);

        try {
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch {
          resolve(dataUrl);
        }
      };

      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });

  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target?.files?.[0];

    if (e.target) e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      const raw = event.target?.result as string;
      const imageData = await compressImage(raw);

      setSelectedImage(imageData);
      await analyzeImage(imageData);
    };

    reader.onerror = () => {
      toast({
        title: "Could not read image",
        description: "Please try another photo.",
        variant: "destructive",
      });
    };

    reader.readAsDataURL(file);
  };

  const invokeAnalyze = async (imageData: string) => {
    let lastErr: unknown = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke(
          "analyze-image",
          {
            body: { imageData },
          }
        );

        if (error) throw error;

        if (!data || (data as any).error) {
          throw new Error((data as any)?.error || "No data");
        }

        return data;
      } catch (err) {
        lastErr = err;

        console.warn(
          `analyze-image attempt ${attempt + 1} failed`,
          err
        );

        await new Promise((r) =>
          setTimeout(r, 600 * (attempt + 1))
        );
      }
    }

    throw lastErr;
  };

  const analyzeImage = async (imageData: string) => {
    setIsScanning(true);
    setScanResult(null);

    let result: ScanResult;
    let usedFallback = false;

    try {
      const data = await invokeAnalyze(imageData);

      result = {
        category: data.category ?? "Unknown Item",
        recyclable:
          typeof data.recyclable === "boolean"
            ? data.recyclable
            : false,
        instructions:
          data.instructions ??
          "Rinse the item, remove any non-recyclable parts, and take it to your nearest recycling centre.",
        ecoFact:
          data.ecoFact ??
          "Recycling one item helps reduce landfill waste and conserves natural resources.",
        confidence:
          typeof data.confidence === "number"
            ? data.confidence
            : 0.6,
      };
    } catch (error) {
      console.error("Analysis error (using fallback):", error);

      usedFallback = true;

      result = {
        category: "Unidentified Item",
        recyclable: true,
        instructions:
          "We couldn't reach the AI service right now. General tip: clean the item, separate materials (plastic, paper, metal, glass), and drop it off at a recycling centre near you.",
        ecoFact:
          "Even a single recycled bottle saves enough energy to power a lightbulb for hours.",
        confidence: 0.5,
      };
    }

    setScanResult(result);

    if (user && !usedFallback) {
      const { error: insertError } = await supabase
        .from("scan_history")
        .insert({
          user_id: user.id,
          category: result.category,
          recyclable: result.recyclable,
          instructions: result.instructions,
          eco_fact: result.ecoFact,
          confidence: result.confidence,
        });

      if (!insertError) loadScanHistory();
    }

    toast({
      title: usedFallback
        ? "Showing offline guidance"
        : "Analysis complete!",
      description: usedFallback
        ? "AI service was busy — general recycling tips shown below."
        : `Identified as: ${result.category}`,
      variant: "default",
    });

    setIsScanning(false);
  };

  const handleNewScan = () => {
    if (isScanning) return;

    setSelectedImage(null);
    setScanResult(null);
    cameraInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          MyMalaysia
          <span className="italic font-semibold text-secondary">
            Care
          </span>
        </h1>

        <div className="h-9 w-9 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip paper-grain py-8 md:py-14 px-3 sm:px-4">
      <div className="container mx-auto w-full max-w-5xl min-w-0">

        {/* Page Heading */}
        <div className="mb-8 md:mb-12">
          <PageHeader
            eyebrow={t("smartAIRecognition")}
            icon={<Sparkles className="w-4 h-4" />}
            title={t("recycAIScanner")}
            subtitle={t("instantIdentify")}
          />
        </div>

        {/* Main Scanner */}
        <Card className="relative w-full min-w-0 overflow-hidden border border-border/70 shadow-custom-md rounded-xl animate-scale-in">

          {/* Decorative top strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />

          <div className="p-4 sm:p-6 md:p-9">

            {/* Scanner Introduction */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ScanLine className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-primary">
                    Identify your waste
                  </h2>

                  <p className="text-sm text-muted-foreground mt-1">
                    Take a photo or upload an image to get started.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                AI scanner ready
              </div>
            </div>

            {/* Hidden Inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isScanning}
            />

            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isScanning}
            />

            {/* Upload Area */}
            {!selectedImage ? (
              <div className="relative flex flex-col items-center justify-center text-center border-2 border-dashed border-primary/25 bg-primary/[0.025] rounded-xl px-4 py-10 sm:py-14 md:py-16 transition-all duration-300 hover:border-secondary/60 hover:bg-secondary/[0.04]">

                <div className="relative mb-5">
                  <div className="absolute inset-0 rounded-2xl bg-secondary/15 blur-xl scale-125" />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-card border border-border shadow-custom-md">
                    <ImagePlus className="w-9 h-9 text-primary" />
                  </div>

                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground border-4 border-card">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="text-lg md:text-xl font-bold text-primary">
                  Drop your image here
                </h3>

                <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
                  Choose a clear photo of one item for better recognition.
                </p>

                <div className="mt-7 flex w-full max-w-md flex-col sm:flex-row gap-3">
                  <Button
                    className="h-12 flex-1 rounded-lg shadow-custom-md"
                    disabled={isScanning}
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    {t("takePhoto")}
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 flex-1 rounded-lg border-primary/30 bg-card"
                    disabled={isScanning}
                    onClick={() => uploadInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    {t("uploadPhoto")}
                  </Button>
                </div>

                <p className="mt-5 text-xs text-muted-foreground">
                  Supports common image formats
                </p>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">

                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />
                    <span className="text-sm font-semibold text-foreground">
                      Image selected
                    </span>
                  </div>

                  {!isScanning && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setScanResult(null);
                      }}
                      className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Remove image
                    </button>
                  )}
                </div>

                <div className="relative flex justify-center bg-muted/40 p-3 sm:p-5">
                  <img
                    src={selectedImage}
                    alt="Selected recycling item"
                    className="max-h-[280px] md:max-h-[400px] w-full object-contain rounded-lg"
                  />

                  {isScanning && (
                    <div className="absolute inset-3 sm:inset-5 overflow-hidden rounded-lg pointer-events-none">
                      <div className="absolute inset-0 bg-primary/10" />

                      <div className="absolute left-0 right-0 h-1 bg-secondary shadow-[0_0_20px_hsl(var(--secondary))] animate-[scan_2s_ease-in-out_infinite]" />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-card/90 backdrop-blur px-4 py-2 shadow-lg flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                          <span className="text-sm font-semibold text-primary">
                            Analysing image...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scanning Status */}
            {isScanning && (
              <div className="mt-6 rounded-xl border border-secondary/30 bg-secondary/5 p-5 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/15">
                    <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-primary">
                      AI is analysing your item
                    </p>

                    <p className="text-sm text-muted-foreground mt-1">
                      Identifying materials and checking recycling information...
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary/15">
                  <div className="h-full w-1/3 rounded-full bg-secondary animate-[loading_1.5s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {/* Scan Results */}
            {scanResult && !isScanning && (
              <div className="mt-7 space-y-5 animate-fade-in">

                {/* Result Status */}
                <div
                  className={`relative overflow-hidden rounded-xl border p-5 sm:p-6 ${
                    scanResult.recyclable
                      ? "border-secondary/40 bg-secondary/[0.07]"
                      : "border-destructive/40 bg-destructive/[0.06]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          scanResult.recyclable
                            ? "bg-secondary/15 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {scanResult.recyclable ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <XCircle className="h-6 w-6" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Scan result
                        </p>

                        <h3
                          className={`mt-1 text-xl sm:text-2xl font-extrabold ${
                            scanResult.recyclable
                              ? "text-primary"
                              : "text-destructive"
                          }`}
                        >
                          {scanResult.recyclable
                            ? t("recyclable")
                            : t("nonRecyclable")}
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/70 bg-card/80 px-4 py-3 sm:text-right">
                      <p className="text-xs text-muted-foreground">
                        AI confidence
                      </p>

                      <p className="text-xl font-extrabold text-primary">
                        {Math.round(scanResult.confidence * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/60">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("category")}
                    </p>

                    <p className="mt-1 text-lg font-bold text-foreground break-words">
                      {scanResult.category}
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Info className="h-5 w-5" />
                    </div>

                    <h4 className="font-bold text-primary">
                      {t("instructionsLabel")}
                    </h4>
                  </div>

                  <p className="text-sm md:text-base text-foreground leading-relaxed">
                    {scanResult.instructions}
                  </p>
                </div>

                {/* Eco Fact */}
                <div className="relative overflow-hidden rounded-xl border border-accent/40 bg-accent/10 p-5 sm:p-6">
                  <div className="absolute -right-5 -bottom-5 opacity-[0.08]">
                    <Leaf className="h-32 w-32 text-primary" />
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/30 text-primary">
                        <Leaf className="h-5 w-5" />
                      </div>

                      <h4 className="font-bold text-primary">
                        {t("ecoFactLabel")}
                      </h4>
                    </div>

                    <p className="text-sm md:text-base text-foreground leading-relaxed">
                      {scanResult.ecoFact}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {scanResult.recyclable && (
                    <Button
                      onClick={() => navigate("/map")}
                      className="h-12 rounded-lg"
                    >
                      <MapPin className="mr-2 h-5 w-5" />
                      {t("findNearestCenter")}
                      <ArrowRight className="ml-auto h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedImage(null);
                      setScanResult(null);
                      uploadInputRef.current?.click();
                    }}
                    className="h-12 rounded-lg border-primary/30"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Scan another item
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* How it works */}
        {!selectedImage && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
            {[
              {
                icon: Camera,
                number: "01",
                title: "Capture",
                description: "Take a photo or upload an image.",
              },
              {
                icon: Sparkles,
                number: "02",
                title: "Analyse",
                description: "AI identifies the item and its material.",
              },
              {
                icon: Recycle,
                number: "03",
                title: "Recycle",
                description: "Get practical disposal guidance.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-xl border border-border/70 bg-card/70 p-4 sm:p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>

                  <span className="text-sm font-extrabold tracking-widest text-secondary">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-bold text-primary">
                  {step.title}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <Card className="w-full min-w-0 overflow-hidden rounded-xl border border-border/70 shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border px-4 sm:px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-primary">
                    {t("scanHistoryTitle")}
                  </h3>

                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your recent recycling scans
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-muted-foreground">
                Latest {scanHistory.length} scans
              </span>
            </div>

            <div className="divide-y divide-border">
              {scanHistory.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center gap-3 px-4 sm:px-6 py-4 transition-colors hover:bg-muted/40"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      scan.recyclable
                        ? "bg-secondary/15 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {scan.recyclable ? (
                      <Recycle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm md:text-base text-foreground truncate">
                      {scan.category}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-[10px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-full ${
                      scan.recyclable
                        ? "bg-secondary/15 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {scan.recyclable
                      ? t("recyclable")
                      : t("nonRecyclable")}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Information Footer */}
        <div className="mt-6 md:mt-8 relative overflow-hidden rounded-xl border border-primary/10 bg-primary/[0.04] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-primary">
                {t("smartAIAssistance")}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {t("aiRecognizes")}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Sprout className="h-4 w-4 text-secondary" />
            Small actions. Greener tomorrows.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecycleScanner;
