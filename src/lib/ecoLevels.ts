// Eco Warrior levels: every 5 points = 1 level.
// Level 1 starts at 0 pts, and the top level (31) starts at 150 pts.
// Used by BOTH the Dashboard and the Leaderboard so they always match.
// To rename a level, just edit its name in LEVEL_NAMES below (keep the order).

export const POINTS_PER_LEVEL = 5;

export const LEVEL_NAMES: string[] = [
  "Starter",          // Lvl 1  (0-4 pts)
  "Seedling",         // Lvl 2  (5-9)
  "Sprout",           // Lvl 3  (10-14)
  "Sapling",          // Lvl 4  (15-19)
  "Leafling",         // Lvl 5  (20-24)
  "Green Thumb",      // Lvl 6  (25-29)
  "Tree Hugger",      // Lvl 7
  "Sorter",           // Lvl 8
  "Collector",        // Lvl 9
  "Eco Scout",        // Lvl 10 (45-49)
  "Trail Ranger",     // Lvl 11 (50-54)
  "Forest Ranger",    // Lvl 12
  "River Guardian",   // Lvl 13
  "Reef Guardian",    // Lvl 14
  "Earth Guardian",   // Lvl 15 (70-74)
  "Eco Defender",     // Lvl 16 (75-79)
  "Green Knight",     // Lvl 17
  "Planet Protector", // Lvl 18
  "Eco Warrior",      // Lvl 19
  "Eco Champion",     // Lvl 20 (95-99)
  "Eco Hero",         // Lvl 21 (100-104)
  "Eco Master",       // Lvl 22
  "Eco Sage",         // Lvl 23
  "Eco Titan",        // Lvl 24
  "Eco Legend",       // Lvl 25 (120-124)
  "Green Paragon",    // Lvl 26 (125-129)
  "Nature Champion",  // Lvl 27
  "Planet Hero",      // Lvl 28
  "Eco Emperor",      // Lvl 29
  "Eco Immortal",     // Lvl 30 (145-149)
  "Eco Sovereign",    // Lvl 31 (150+ pts, max level)
];

export const MAX_LEVEL = LEVEL_NAMES.length;

// One colour per group of 5 levels (the last one is just for the max level)
const TIER_CLASSES: string[] = [
  "border-lime-500/50 bg-lime-500/10 text-lime-700 dark:text-lime-300",
  "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "border-violet-500/50 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "border-yellow-500/70 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
];

export interface EcoLevel {
  level: number;        // 1..MAX_LEVEL
  name: string;         // badge name
  className: string;    // badge colours (Tailwind)
  isMax: boolean;
  pointsToNext: number; // points still needed for the next level (0 at max)
  progress: number;     // 0..100, progress inside the current level
  next: { level: number; name: string } | null; // the next target (null at max level)
}

export const getEcoLevel = (points: number): EcoLevel => {
  const safe = Math.max(0, Math.floor(Number(points) || 0));
  const level = Math.min(MAX_LEVEL, Math.floor(safe / POINTS_PER_LEVEL) + 1);
  const isMax = level === MAX_LEVEL;
  const pointsToNext = isMax ? 0 : level * POINTS_PER_LEVEL - safe;
  const progress = isMax ? 100 : ((POINTS_PER_LEVEL - pointsToNext) / POINTS_PER_LEVEL) * 100;
  const tier = Math.min(TIER_CLASSES.length - 1, Math.floor((level - 1) / 5));

  return {
    level,
    name: LEVEL_NAMES[level - 1],
    className: TIER_CLASSES[tier],
    isMax,
    pointsToNext,
    progress,
    next: isMax ? null : { level: level + 1, name: LEVEL_NAMES[level] },
  };
};
