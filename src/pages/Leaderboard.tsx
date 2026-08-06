import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, Recycle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Row {
  user_id: string;
  username: string | null;
  email: string | null;
  points: number;
}

const displayName = (r: Row) => {
  if (r.username && r.username.trim()) return r.username.trim();
  if (r.email) return r.email.split("@")[0];
  return "Anonymous";
};

const Leaderboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.is_anonymous) {
      toast({
        title: "You're browsing as a guest",
        description: "Guest accounts don't appear on the leaderboard. Sign up to save your progress and compete!",
      });
    }
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_leaderboard");

if (error) {
  console.error("Leaderboard fetch error:", error);
  setRows([]);
} else {
  const merged: Row[] = (data ?? []).map((r: any) => ({
    user_id: r.user_id,
    username: r.username,
    email: null,
    points: Number(r.points),
  }));
  setRows(merged);
}
      setLoading(false);
    })();
  }, []);

  const rankIcon = (i: number) => {
    if (i === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (i === 1) return <Medal className="w-6 h-6 text-slate-400" />;
    if (i === 2) return <Award className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{i + 1}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pb-1">
          {t("leaderboardTitle")}
        </h1>
        <p className="text-muted-foreground">{t("leaderboardSubtitle")}</p>
      </div>

      <Card className="p-4 sm:p-6 shadow-custom-lg">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">{t("loadingLeaderboard")}</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">{t("noPlayersYet")}</div>
        ) : (
          <ul className="divide-y">
            {rows.map((r, i) => {
              const isMe = user?.id === r.user_id;
              return (
                <li
                  key={r.user_id}
                  className={`flex items-center gap-4 py-3 px-2 rounded-lg ${
                    isMe ? "bg-primary/5 ring-1 ring-primary/30" : ""
                  }`}
                >
                  <div className="w-8 flex justify-center">{rankIcon(i)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {displayName(r)}
                      {isMe && <span className="ml-2 text-xs text-primary">({t("you")})</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Recycle className="w-4 h-4" />
                    {r.points}
                    <span className="text-xs font-normal text-muted-foreground">{t("points")}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default Leaderboard;
