import { useEffect, useState } from "react";
import { Recycle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";

interface Row {
  user_id: string;
  username: string | null;
  email: string | null;
  points: number;
}

const PAGE_SIZE = 15;

const getEcoWarriorLevel = (points: number) => Math.max(1, Math.floor(points / 10) + 1);

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
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [rows.length]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const rankColor = (i: number) => {
    if (i === 0) return "text-[#d4af37]";
    if (i === 1) return "text-[#c0c0c0]";
    if (i === 2) return "text-[#b87333]";
    return "text-[#1f1f1f] dark:text-stone-200/95";
  };

  const rankNumber = (i: number) => (
    <span
      className={`tabular-nums font-serif leading-none tracking-[-0.05em] ${
        i < 3 ? "text-[2.2rem] sm:text-[2.6rem]" : "text-[1.8rem] sm:text-[2.1rem]"
      } ${rankColor(i)}`}
    >
      {String(i + 1).padStart(2, "0")}
    </span>
  );

  return (
    <div className="paper-grain">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        <PageHeader title={t("leaderboardTitle")} subtitle={t("leaderboardSubtitle")} />

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">{t("loadingLeaderboard")}</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">{t("noPlayersYet")}</div>
        ) : (
          <>
            <ol className="border-t-2 border-primary">
              {paginatedRows.map((r, i) => {
                const actualIndex = (page - 1) * PAGE_SIZE + i;
                const isMe = user?.id === r.user_id;
                const ecoLevel = getEcoWarriorLevel(r.points);

                return (
                  <li
                    key={r.user_id}
                    className={`grid min-w-0 grid-cols-[3rem_1fr_auto] sm:grid-cols-[4rem_1fr_auto] items-center gap-3 py-3 px-2 border-b border-border ${
                      isMe ? "bg-accent/15" : ""
                    }`}
                  >
                    <div className="flex justify-center py-1">{rankNumber(actualIndex)}</div>

                    <div className="min-w-0 overflow-hidden">
                      <p className="truncate whitespace-nowrap overflow-hidden text-ellipsis text-base sm:text-lg text-primary leading-normal">
                        {displayName(r)}
                        {isMe && <span className="ml-2 text-sm text-secondary">({t("you")})</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("ecoWarrior")} • Lv. {ecoLevel}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-primary shrink-0">
                      <Recycle className="w-4 h-4 text-secondary" />
                      <span className="text-lg tabular-nums">{r.points}</span>
                      <span className="text-sm text-muted-foreground">{t("points")}</span>
                    </div>
                  </li>
                );
              })}
            </ol>

            {rows.length > PAGE_SIZE && (
              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-border px-3 py-2 text-sm text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-md border border-border px-3 py-2 text-sm text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
