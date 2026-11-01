// Eco Warrior ranks, based directly on the player's points (no levels).
//
//   Starter   0-3 pts   (shown as 1-3)
//   Sprout    4-6 pts
//   Ranger    7-10 pts
//   Guardian  11-18 pts
//   Champion  19-30 pts
//   Legend    31+ pts
//
// Used by BOTH the Dashboard and the Leaderboard so they always match.
//
// To rename a rank: change its name below.
// To change when a rank unlocks: change its minPoints (keep the list in order,
// lowest to highest). The "points until next rank" text, the progress bar and
// the Level guide on the Leaderboard all update by themselves.

export interface Rank {
  name: string;
  minPoints: number; // the points where this rank starts
  className: string; // badge colours (Tailwind)
}

export const RANKS: Rank[] = [
  { name: "Starter",  minPoints: 0,  className: "border-lime-500/50 bg-lime-500/10 text-lime-700 dark:text-lime-300" },
  { name: "Sprout",   minPoints: 4,  className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { name: "Ranger",   minPoints: 7,  className: "border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  { name: "Guardian", minPoints: 11, className: "border-violet-500/50 bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  { name: "Champion", minPoints: 19, className: "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300" },
  { name: "Legend",   minPoints: 31, className: "border-yellow-500/70 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" },
];

export interface EcoRank {
  name: string;         // current rank name
  className: string;    // badge colours (Tailwind)
  pointsToNext: number; // points still needed for the next rank (0 at top rank)
  progress: number;     // 0..100, progress from this rank toward the next one
  next: { name: string; minPoints: number } | null; // next rank (null at top rank)
}

export const getEcoRank = (points: number): EcoRank => {
  const safe = Math.max(0, Math.floor(Number(points) || 0));

  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (safe >= RANKS[i].minPoints) idx = i;
  }

  const current = RANKS[idx];
  const upcoming = RANKS[idx + 1];

  if (!upcoming) {
    return { name: current.name, className: current.className, pointsToNext: 0, progress: 100, next: null };
  }

  const span = upcoming.minPoints - current.minPoints;
  const progress = Math.min(100, Math.max(0, ((safe - current.minPoints) / span) * 100));

  return {
    name: current.name,
    className: current.className,
    pointsToNext: upcoming.minPoints - safe,
    progress,
    next: { name: upcoming.name, minPoints: upcoming.minPoints },
  };
};
