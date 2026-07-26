import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, Sparkles, Leaf, Info, Clock, MapPin } from "lucide-react";
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

  const compressImage = (dataUrl: string, maxDim = 1024, quality = 0.85): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    // Reset so selecting the same file again re-triggers change
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
      toast({ title: "Could not read image", description: "Please try another photo.", variant: "destructive" });
    };
    reader.readAsDataURL(file);
  };

  const invokeAnalyze = async (imageData: string) => {
    // Retry up to 3 times with backoff for transient failures
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke("analyze-image", {
          body: { imageData },
        });
        if (error) throw error;
        if (!data || (data as any).error) throw new Error((data as any)?.error || "No data");
        return data;
      } catch (err) {
        lastErr = err;
        console.warn(`analyze-image attempt ${attempt + 1} failed`, err);
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
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
        recyclable: typeof data.recyclable === "boolean" ? data.recyclable : false,
        instructions:
          data.instructions ??
          "Rinse the item, remove any non-recyclable parts, and take it to your nearest recycling centre.",
        ecoFact: data.ecoFact ?? "Recycling one item helps reduce landfill waste and conserves natural resources.",
        confidence: typeof data.confidence === "number" ? data.confidence : 0.6,
      };
    } catch (error) {
      console.error("Analysis error (using fallback):", error);
      usedFallback = true;
      result = {
        category: "Unidentified Item",
        recyclable: true,
        instructions:
          "We couldn't reach the AI service right now. General tip: clean the item, separate materials (plastic, paper, metal, glass), and drop it off at a recycling centre near you.",
        ecoFact: "Even a single recycled bottle saves enough energy to power a lightbulb for hours.",
        confidence: 0.5,
      };
    }

    setScanResult(result);

    if (user && !usedFallback) {
      const { error: insertError } = await supabase.from("scan_history").insert({
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
      title: usedFallback ? "Showing offline guidance" : "Analysis complete!",
      description: usedFallback
        ? "AI service was busy — general recycling tips shown below."
        : `Identified as: ${result.category}`,
      variant: usedFallback ? "default" : "default",
    });

    setIsScanning(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 md:py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">{t("smartAIRecognition")}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("recycAIScanner")}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t("instantIdentify")}
          </p>
        </div>

        <Card className="p-4 md:p-8 mb-6 md:mb-8 animate-scale-in">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

            <Button
              className="flex-1 w-full h-auto py-4 md:py-6"
              disabled={isScanning}
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="mr-2 h-5 w-5" />
              <span className="text-sm md:text-base">{t("takePhoto")}</span>
            </Button>

            <Button
              variant="outline"
              className="flex-1 w-full h-auto py-4 md:py-6"
              disabled={isScanning}
              onClick={() => uploadInputRef.current?.click()}
            >
              <Upload className="mr-2 h-5 w-5" />
              <span className="text-sm md:text-base">{t("uploadPhoto")}</span>
            </Button>
          </div>

          {selectedImage && (
            <div className="mb-6 animate-fade-in">
              <img
                src={selectedImage}
                alt="Selected item"
                className="w-full max-h-[300px] md:max-h-[400px] object-contain rounded-lg"
              />
            </div>
          )}

          {isScanning && (
            <div className="text-center py-8 md:py-12 animate-fade-in">
              <div className="inline-flex items-center space-x-3 bg-primary/10 px-6 py-3 rounded-full mb-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-primary font-medium">AI analyzing your item...</span>
              </div>
            </div>
          )}

          {scanResult && !isScanning && (
            <div className="space-y-4 md:space-y-6 animate-fade-in">
              <div className={`p-4 md:p-6 rounded-lg ${scanResult.recyclable ? "bg-green-50 border-2 border-green-500" : "bg-red-50 border-2 border-red-500"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">
                    {scanResult.recyclable ? t("recyclable") : t("nonRecyclable")}
                  </h3>
                  <span className="text-xs md:text-sm font-medium text-gray-600">
                    {Math.round(scanResult.confidence * 100)}% {t("confident")}
                  </span>
                </div>
                <p className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                  {t("category")} {scanResult.category}
                </p>
              </div>

              <div className="bg-blue-50 p-4 md:p-6 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center text-sm md:text-base">
                  <Info className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  {t("instructionsLabel")}
                </h4>
                <p className="text-blue-800 text-sm md:text-base">{scanResult.instructions}</p>
              </div>

              <div className="bg-green-50 p-4 md:p-6 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center text-sm md:text-base">
                  <Leaf className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  {t("ecoFactLabel")}
                </h4>
                <p className="text-green-800 text-sm md:text-base">{scanResult.ecoFact}</p>
              </div>

              {scanResult.recyclable && (
                <Button
                  onClick={() => navigate("/map")}
                  className="w-full gradient-primary"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  {t("findNearestCenter")}
                </Button>
              )}
            </div>
          )}
        </Card>

        {scanHistory.length > 0 && (
          <Card className="p-4 md:p-6 animate-fade-in">
            <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              {t("scanHistoryTitle")}
            </h3>
            <div className="space-y-3">
              {scanHistory.map((scan) => (
                <div key={scan.id} className="p-3 md:p-4 bg-secondary/10 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm md:text-base truncate">{scan.category}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs md:text-sm font-medium px-2 py-1 rounded-full whitespace-nowrap ${scan.recyclable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {scan.recyclable ? t("recyclable") : t("nonRecyclable")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-primary/5 rounded-lg animate-fade-in">
          <h3 className="font-semibold mb-2 text-sm md:text-base">{t("smartAIAssistance")}</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            {t("aiRecognizes")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecycleScanner;