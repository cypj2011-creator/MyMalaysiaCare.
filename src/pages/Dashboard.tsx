import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, Recycle, Award, TreePine, Droplets, Zap, Trophy,
  LogOut, User as UserIcon, Mail, Calendar, Pencil, Check, X,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Scan {
  id: string;
  created_at: string;
  category: string;
  recyclable: boolean;
  confidence: number | null;
}

interface Profile {
  id: string;
  email: string;
  username: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [scans, setScans] = useState<Scan[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const isGuest = !!(user as any)?.is_anonymous;

  useEffect(() => {
     if (authLoading) return;
    if (!user) {
      navigate("/auth");
    } else if (isGuest) {
      toast({
        title: "Guest account",
        description: "Create a full account to access your dashboard.",
      });
      navigate("/auth");
    }
  }, [user, isGuest, authLoading, navigate, toast]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      setLoadingData(true);
      const [{ data: profileData }, { data: scanData, error: scanError }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("scan_history")
          .select("id, created_at, category, recyclable, confidence")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;

      if (profileData) {
        setProfile(profileData as Profile);
      } else {
        // self-heal in case the trigger missed creating one
        await supabase.from("profiles").insert({ id: user.id, email: user.email ?? "" });
        setProfile({ id: user.id, email: user.email ?? "", username: null, created_at: new Date().toISOString() });
      }

      if (scanError) {
        toast({ title: "Could not load scans", description: scanError.message, variant: "destructive" });
      }
      setScans((scanData as Scan[]) ?? []);
      setLoadingData(false);
    })();

    return () => { cancelled = true; };
  }, [user, toast]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const totalScans = scans.length;
  const recyclableCount = scans.filter((s) => s.recyclable).length;
  const points = recyclableCount; // 1 point per recyclable scan
  // Realistic per-item averages (household mix: bottles, cans, paper, cardboard)
  const carbonSaved = Math.round(recyclableCount * 1.1 * 10) / 10; // kg CO2
  const waterSaved = Math.round(recyclableCount * 13);              // liters
  const energySaved = Math.round(recyclableCount * 0.6 * 10) / 10;  // kWh
  const treesEquivalent = Math.round((carbonSaved / 21) * 10) / 10; // 1 mature tree ≈ 21kg CO2/yr

  const handleSaveUsername = async () => {
    if (!user) return;
    const clean = nameDraft.trim();
    if (!clean) { setEditingName(false); return; }
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username: clean })
      .eq("id", user.id);
    setSavingName(false);
    if (error) {
      const msg = /duplicate|unique/i.test(error.message) ? t("usernameTaken") : error.message;
      toast({ title: "Error", description: msg, variant: "destructive" });
      return;
    }
    setProfile((p) => (p ? { ...p, username: clean } : p));
    setEditingName(false);
    toast({ title: t("usernameSaved") });
  };

  const getCategoryData = () => {
    const categories: Record<string, number> = {};
    scans.forEach((s) => { categories[s.category] = (categories[s.category] || 0) + 1; });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const getTrendData = () => {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
    return last7.map((date) => ({
      date: new Date(date).toLocaleDateString("en-MY", { month: "short", day: "numeric" }),
      scans: scans.filter((s) => s.created_at.startsWith(date)).length,
    }));
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  if (authLoading || loadingData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })
    : "—";
  const displayName = profile?.username?.trim() || (profile?.email || user.email || "").split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Account Header */}
      <Card className="p-6 mb-8 shadow-custom-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Avatar className="h-16 w-16 flex-shrink-0">
              <AvatarFallback className="gradient-primary text-white text-xl font-bold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    autoFocus
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    placeholder={t("usernamePlaceholder")}
                    className="max-w-xs"
                    maxLength={30}
                  />
                  <Button size="sm" onClick={handleSaveUsername} disabled={savingName}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <h1 className="text-2xl font-bold flex items-center gap-2 flex-wrap">
                  <UserIcon className="w-5 h-5 text-primary" />
                  <span className="truncate">{displayName}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setNameDraft(profile?.username ?? ""); setEditingName(true); }}
                    aria-label={t("editUsername")}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </h1>
              )}
              <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:gap-4 mt-1">
                <span className="flex items-center gap-1 truncate"><Mail className="w-4 h-4 flex-shrink-0" /> {profile?.email || user.email}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4 flex-shrink-0" /> {memberSince}</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <Trophy className="w-4 h-4" /> {t("yourPoints")}: {points}
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" /> {t("signOut")}
          </Button>
        </div>
      </Card>

      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-[1.15] pb-1">
          {t("impactDashboard")}
        </h2>
        <p className="text-base text-muted-foreground">{t("trackYourJourney")}</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 shadow-custom-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Recycle className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold">{totalScans}</div>
          <div className="text-sm text-muted-foreground">{t("itemsScanned")}</div>
        </Card>

        <Card className="p-6 shadow-custom-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-secondary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold">{recyclableCount}</div>
          <div className="text-sm text-muted-foreground">{t("recyclableItems")}</div>
        </Card>

        <Card className="p-6 shadow-custom-lg gradient-primary text-white">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
            <TreePine className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold">{carbonSaved} kg</div>
          <div className="text-sm text-white/90">{t("co2SavedKg")}</div>
        </Card>

        <Card className="p-6 shadow-custom-lg gradient-secondary text-white">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
            <TreePine className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold">{treesEquivalent}</div>
          <div className="text-sm text-white/90">{t("treesEquivalent")}</div>
        </Card>
      </div>

      {scans.length === 0 ? (
        <Card className="p-12 text-center shadow-custom-lg">
          <Recycle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">{t("noScansYet")}</h3>
          <p className="text-muted-foreground mb-6">{t("noScansDesc")}</p>
          <Link to="/recycle">
            <Button className="gradient-primary text-white">{t("startScanning")}</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 shadow-custom-lg">
            <h3 className="text-xl font-semibold mb-6">{t("itemsByCategory")}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  cx="50%" cy="50%"
                  labelLine={false}
                  label={(e: any) => `${e.name} ${(e.percent * 100).toFixed(0)}%`}
                  outerRadius={80} dataKey="value"
                >
                  {getCategoryData().map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 shadow-custom-lg">
            <h3 className="text-xl font-semibold mb-6">{t("scanHistory7Days")}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="scans" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 shadow-custom-lg lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">{t("impactSummary")}</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <Droplets className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{waterSaved}L</div>
                <div className="text-sm text-muted-foreground">{t("waterSaved")}</div>
              </div>
              <div className="text-center p-4 bg-secondary/5 rounded-lg">
                <Zap className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary">{energySaved} kWh</div>
                <div className="text-sm text-muted-foreground">{t("energySaved")}</div>
              </div>
              <div className="text-center p-4 bg-accent/5 rounded-lg">
                <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-accent">Level {Math.floor(totalScans / 10) + 1}</div>
                <div className="text-sm text-muted-foreground">{t("ecoWarrior")}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-custom-lg lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Recent scans</h3>
            <div className="space-y-2">
              {scans.slice(0, 10).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                  <div>
                    <p className="font-medium">{s.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    s.recyclable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {s.recyclable ? "Recyclable" : "Non-recyclable"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
