
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
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ScanLine,
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
        description:
          "Please sign in to use the scanner and save your scan history.",
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

    // Reset so selecting the same file again triggers change.
    if (e.target) e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
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
    // Retry up to 3 times with backoff for transient failures.
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

      if (!insertError) {
        loadScanHistory();
      }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center paper-grain">
        <div
          className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary/20 border-t-primary"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-grain overflow-x-clip py-8 sm:py-10 md:py-16 px-3 sm:px-4">
      <div className="container mx-auto w-full max-w-4xl min-w-0">

        {/* Page heading */}
        <PageHeader
          eyebrow={t("smartAIRecognition")}
          icon={<Sparkles className="w-4 h-4" />}
          title={t("recycAIScanner")}
          subtitle={t("instantIdentify")}
        />

        {/* Scanner card */}
        <Card className="relative overflow-hidden min-w-0 p-4 sm:p-6 md:p-8 mb-6 md:mb-8 animate-scale-in border-border/70 shadow-sm">

          {/* Decorative background */}
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

          <div className="relative">

            {/* Scanner introduction */}
            <div className="flex items-start gap-3 mb-6">
              <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <ScanLine className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <h2 className="font-bold text-lg sm:text-xl text-foreground">
                  Identify your waste
                </h2>

                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Take a photo or upload an image. Our AI will help
                  identify the item and provide recycling guidance.
                </p>
              </div>
            </div>

            {/* Hidden file inputs */}
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

            {/* Upload area */}
            {!selectedImage && (
              <div className="border-2 border-dashed border-primary/20 rounded-2xl bg-primary/[0.025] px-4 py-8 sm:py-10 text-center transition-colors hover:border-primary/40">

                <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/20 text-primary">
                  <ImageIcon className="w-8 h-8" />
                </div>

                <h3 className="font-semibold text-foreground text-base sm:text-lg">
                  Choose an item to scan
                </h3>

                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                  Make sure the item is clearly visible and well lit
                  for better recognition.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 max-w-md mx-auto">

                  <Button
                    className="flex-1 w-full min-w-0 h-12 shadow-sm"
                    disabled={isScanning}
                    onClick={() =>
                      cameraInputRef.current?.click()
                    }
                  >
                    <Camera className="mr-2 h-5 w-5 shrink-0" />
                    <span>{t("takePhoto")}</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1 w-full min-w-0 h-12 bg-background"
                    disabled={isScanning}
                    onClick={() =>
                      uploadInputRef.current?.click()
                    }
                  >
                    <Upload className="mr-2 h-5 w-5 shrink-0" />
                    <span>{t("uploadPhoto")}</span>
                  </Button>

                </div>
              </div>
            )}

            {/* Selected image */}
            {selectedImage && (
              <div className="animate-fade-in space-y-4">

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
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
                      className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="rounded-2xl overflow-hidden bg-muted/60 border border-border/70 p-2">
                  <img
                    src={selectedImage}
                    alt="Selected item"
                    className="w-full max-h-[280px] sm:max-h-[380px] object-contain rounded-xl"
                  />
                </div>

                {!isScanning && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 w-full"
                      onClick={() =>
                        uploadInputRef.current?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change image
                    </Button>

                    <Button
                      className="flex-1 w-full"
                      onClick={() =>
                        cameraInputRef.current?.click()
                      }
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Take another photo
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* AI scanning state */}
            {isScanning && (
              <div className="mt-6 rounded-2xl bg-primary/[0.04] border border-primary/10 px-4 py-8 sm:py-10 text-center animate-fade-in">

                <div className="relative mx-auto w-16 h-16 mb-5">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />

                  <div className="absolute inset-0 flex items-center justify-center text-primary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="font-bold text-lg text-foreground">
                  AI analyzing your item...
                </h3>

                <p className="text-sm text-muted-foreground mt-2">
                  Identifying materials and checking recycling information.
                </p>
              </div>
            )}

            {/* Scan result */}
            {scanResult && !isScanning && (
              <div className="mt-6 space-y-4 sm:space-y-5 animate-fade-in">

                <div
                  className={`rounded-2xl p-4 sm:p-6 border ${
                    scanResult.recyclable
                      ? "bg-secondary/10 border-secondary/40"
                      : "bg-destructive/5 border-destructive/30"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`shrink-0 flex items-center justify-center w-11 h-11 rounded-xl ${
                          scanResult.recyclable
                            ? "bg-secondary/20 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {scanResult.recyclable ? (
                          <Recycle className="w-6 h-6" />
                        ) : (
                          <AlertCircle className="w-6 h-6" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                          Analysis result
                        </p>

                        <h3 className="text-lg sm:text-xl font-bold text-foreground break-words">
                          {scanResult.recyclable
                            ? t("recyclable")
                            : t("nonRecyclable")}
                        </h3>
                      </div>
                    </div>

                    <div className="self-start sm:self-center rounded-full bg-background/80 border border-border/60 px-3 py-1.5">
                      <span className="text-xs sm:text-sm font-semibold text-muted-foreground whitespace-nowrap">
                        {Math.round(scanResult.confidence * 100)}%{" "}
                        {t("confident")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/50">
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                      {t("category")}
                    </p>

                    <p className="text-base sm:text-lg font-bold text-foreground break-words">
                      {scanResult.category}
                    </p>
                  </div>
                </div>

                {/* Recycling instructions */}
                <div className="rounded-2xl bg-muted/70 border border-border/50 p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                      <Info className="w-4 h-4" />
                    </div>

                    <h4 className="font-bold text-primary text-sm sm:text-base">
                      {t("instructionsLabel")}
                    </h4>
                  </div>

                  <p className="text-foreground text-sm sm:text-base leading-relaxed break-words">
                    {scanResult.instructions}
                  </p>
                </div>

                {/* Eco fact */}
                <div className="rounded-2xl bg-accent/10 border border-accent/30 p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20 text-primary">
                      <Leaf className="w-4 h-4" />
                    </div>

                    <h4 className="font-bold text-primary text-sm sm:text-base">
                      {t("ecoFactLabel")}
                    </h4>
                  </div>

                  <p className="text-foreground text-sm sm:text-base leading-relaxed break-words">
                    {scanResult.ecoFact}
                  </p>
                </div>

                {/* Recycling map */}
                {scanResult.recyclable && (
                  <Button
                    onClick={() => navigate("/map")}
                    className="w-full h-12 shadow-sm"
                  >
                    <MapPin className="mr-2 h-5 w-5 shrink-0" />
                    {t("findNearestCenter")}
                  </Button>
                )}

                {/* Scan another item */}
                <Button
                  variant="outline"
                  className="w-full h-11 bg-background"
                  onClick={() => {
                    setSelectedImage(null);
                    setScanResult(null);
                  }}
                >
                  <ScanLine className="mr-2 h-4 w-4" />
                  Scan another item
                </Button>

              </div>
            )}

          </div>
        </Card>

        {/* Scan history */}
        {scanHistory.length > 0 && (
          <Card className="min-w-0 p-4 sm:p-5 md:p-6 mb-6 animate-fade-in">

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
                <Clock className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {t("scanHistoryTitle")}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Your latest recycling scans
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {scanHistory.map((scan) => (
                <div
                  key={scan.id}
                  className="min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-xl bg-secondary/10 border border-secondary/15"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-background/80 text-primary">
                      <Recycle className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-foreground break-words">
                        {scan.category}
                      </p>

                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-center text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${
                      scan.recyclable
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-destructive text-destructive-foreground"
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

        {/* Information section */}
        <div className="relative overflow-hidden mt-6 md:mt-8 p-4 sm:p-5 md:p-6 rounded-2xl bg-primary/[0.045] border border-primary/10 animate-fade-in">

          <div className="absolute -right-8 -bottom-10 opacity-[0.06] pointer-events-none">
            <Leaf className="w-36 h-36 text-primary" />
          </div>

          <div className="relative flex items-start gap-3">
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-foreground text-sm sm:text-base mb-2">
                {t("smartAIAssistance")}
              </h3>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t("aiRecognizes")}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RecycleScanner;
