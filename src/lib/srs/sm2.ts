/**
 * SM-2 (SuperMemo 2) adapted for EnglishQuest SRS.
 *
 * grade: 0=Again, 1=Hard, 2=Good, 3=Easy (4-button layout).
 * Runs client-side in Web Worker for zero latency; syncs to server.
 */

export interface SrsState {
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  dueDate: Date;
}

/**
 * Grade a review response and compute new SRS state.
 */
export function sm2Grade(state: SrsState, grade: 0 | 1 | 2 | 3): SrsState {
  let { easeFactor, interval, repetitions } = state;

  // Map 2=Good/3=Easy to "pass"
  if (grade >= 2) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions++;
  } else {
    // Again or Hard → reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor: making this somewhat punitive for misses
  const quality = [0, 1, 4, 5][grade]; // Map grade to SM-2 quality
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  return { easeFactor, interval, repetitions, dueDate };
}

/**
 * Creates initial SRS state for a new card.
 */
export function createSrsState(): SrsState {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: new Date(), // due now
  };
}