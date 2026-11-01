// Eco Warrior levels: every 5 points = 1 level. Levels never stop increasing.
//   0-4 pts = Lvl 1, 5-9 pts = Lvl 2, ... 80 pts = Lvl 17, 200 pts = Lvl 41, etc.
//
// Names (ranks) are fewer than levels. A new name unlocks at a certain level,
// and the last gap is a bit longer, so the top name takes a bit more effort.
// Used by BOTH the Dashboard and the Leaderboard so they always match.
//
// To rename a rank: change its name below.
// To add a rank (up to 8 is a good maximum): add a new line at the END of RANKS
// with a higher fromLevel than the one before it.

export const POINTS_PER_LEVEL = 5;

interface Rank {
  name: string;
  fromLevel: number; // the level where this name unlocks
  className: string; // badge colours (Tailwind)
}

export const RANKS: Rank[] = [
  { name: "Starter",  fromLevel: 1,  className: "border-lime-500/50 bg-lime-500/10 text-lime-700 dark:text-lime-300" },                    // Lvl 1-3   (0-14 pts)
  { name: "Sprout",   fromLevel: 4,  className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },        // Lvl 4-6   (15-29 pts)
  { name: "Ranger",   fromLevel: 7,  className: "border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-300" },                         // Lvl 7-9   (30-44 pts)
  { name: "Guardian", fromLevel: 10, className: "border-violet-500/50 bg-violet-500/10 text-violet-700 dark:text-violet-300" },            // Lvl 10-12 (45-59 pts)
  { name: "Champion", fromLevel: 13, className: "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300" },      // Lvl 13-16 (60-79 pts)
  { name: "Legend",   fromLevel: 17, className: "border-yellow-500/70 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" },            // Lvl 17+   (80+ pts)
];

const rankIndexForLevel = (level: number) => {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (level >= RANKS[i].fromLevel) idx = i;
  }
  return idx;
};

export interface EcoLevel {
  level: number;        // 1, 2, 3, ... (no maximum)
  name: string;         // current rank name
  className: string;    // badge colours (Tailwind)
  pointsToNext: number; // points still needed for the next level
  progress: number;     // 0..100, progress inside the current level
  nextLevel: { level: number; name: string };      // the next level and the name it has
  nextRank: { level: number; name: string } | null; // the next NEW name and the level it unlocks (null at top rank)
}

export const getEcoLevel = (points: number): EcoLevel => {
  const safe = Math.max(0, Math.floor(Number(points) || 0));
  const level = Math.floor(safe / POINTS_PER_LEVEL) + 1;
  const rankIdx = rankIndexForLevel(level);
  const rank = RANKS[rankIdx];
  const pointsToNext = level * POINTS_PER_LEVEL - safe;
  const progress = ((POINTS_PER_LEVEL - pointsToNext) / POINTS_PER_LEVEL) * 100;
  const upcoming = RANKS[rankIdx + 1];

  return {
    level,
    name: rank.name,
    className: rank.className,
    pointsToNext,
    progress,
    nextLevel: { level: level + 1, name: RANKS[rankIndexForLevel(level + 1)].name },
    nextRank: upcoming ? { level: upcoming.fromLevel, name: upcoming.name } : null,
  };
};
