const getEcoWarriorLevel = (value: number) => Math.max(1, Math.floor(value / 5) + 1);

const getEcoWarriorBadge = (level: number) => {
  if (level >= 31) {
    return { label: "Legend", className: "border-amber-400/50 bg-amber-400/10 text-amber-700 dark:text-amber-300" };
  }
  if (level >= 21) {
    return { label: "Champion", className: "border-violet-500/50 bg-violet-500/10 text-violet-700 dark:text-violet-300" };
  }
  if (level >= 11) {
    return { label: "Guardian", className: "border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-300" };
  }
  if (level >= 6) {
    return { label: "Ranger", className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" };
  }
  return { label: "Sprout", className: "border-lime-500/50 bg-lime-500/10 text-lime-700 dark:text-lime-300" };
};

const ecoLevel = getEcoWarriorLevel(points);
const ecoBadge = getEcoWarriorBadge(ecoLevel);

<div className="text-center p-4 bg-accent/5 rounded-lg">
  <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
  <div className="text-xl font-bold text-accent">{ecoBadge.label}</div>
  <div className="text-2xl font-bold text-accent mt-1">Lvl {ecoLevel}</div>
  <div className="text-sm text-muted-foreground mt-1">{t("ecoWarrior")}</div>
</div>