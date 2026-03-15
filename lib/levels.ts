export const LEVELS = [
  { minXp: 300, label: "AI Maker" },
  { minXp: 200, label: "Creator" },
  { minXp: 100, label: "Builder" },
  { minXp: 0, label: "Explorer" },
] as const;

export function getLevelFromXp(xp: number) {
  return LEVELS.find((level) => xp >= level.minXp)?.label ?? "Explorer";
}
