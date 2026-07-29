export interface ActiveEffect {
  type: "XP_BOOST" | "STREAK_FREEZE";
  activatedAt: string;
  expiresAt: string;
}

export const CONSUMABLE_EFFECTS: Record<string, { type: string; durationMs: number }> = {
  xp_boost: { type: "XP_BOOST", durationMs: 3600_000 },
  streak_freeze: { type: "STREAK_FREEZE", durationMs: 86400_000 },
};

export function isActiveEffect(effect: ActiveEffect): boolean {
  return new Date(effect.expiresAt).getTime() > Date.now();
}

export function getEffectRemainingMs(effect: ActiveEffect): number {
  return Math.max(0, new Date(effect.expiresAt).getTime() - Date.now());
}

export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return "Expirado";
  const hours = Math.floor(ms / 3600_000);
  const minutes = Math.floor((ms % 3600_000) / 60_000);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}
