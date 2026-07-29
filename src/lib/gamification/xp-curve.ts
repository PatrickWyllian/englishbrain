/**
 * XP Curve — EnglishQuest
 *
 * Level N requires base * N^1.5 XP total.
 * Smooth curve, not exponential brutality — rewards grind without plateauing.
 */

/**
 * Total XP required to reach a given level (cumulative).
 */
export function xpForLevel(level: number): bigint {
  const base = 1000n;
  return base * BigInt(Math.floor(Math.pow(level, 1.5)));
}

/**
 * Find current level from total accumulated XP.
 */
export function levelFromXp(totalXp: bigint): number {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level++;
  return level;
}

/**
 * XP within current level (progress toward next level).
 */
export function xpIntoLevel(totalXp: bigint): { level: number; xp: bigint; xpNeeded: bigint } {
  const level = levelFromXp(totalXp);
  const prev = level > 1 ? xpForLevel(level) : 0n;
  const needed = xpForLevel(level + 1);
  const current = totalXp - prev;
  return { level, xp: current, xpNeeded: needed - prev };
}

/**
 * Calculate XP rewarded for completing a lesson.
 * Scales with user level (+5% per level) and streak bonus (up to +50%).
 */
export function calculateLessonXp(baseXp: number, userLevel: number, streak: number): number {
  const levelMultiplier = 1 + (userLevel - 1) * 0.05;
  const streakBonus = Math.min(streak * 2, 50);
  return Math.round(baseXp * levelMultiplier * (1 + streakBonus / 100));
}