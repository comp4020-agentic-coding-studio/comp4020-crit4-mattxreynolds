import { STEP_COUNT } from "./grid";

/** Seconds per sixteenth-note step at the given BPM (4/4, 16 steps per bar). */
export function stepDurationSeconds(bpm: number): number {
  return 60 / bpm / 4;
}

/** Which of the 16 steps is current, `elapsedSeconds` into a loop at a constant `bpm`. */
export function stepAtElapsed(
  elapsedSeconds: number,
  bpm: number,
  stepCount: number = STEP_COUNT,
): number {
  const stepsElapsed = Math.floor(elapsedSeconds / stepDurationSeconds(bpm));
  return ((stepsElapsed % stepCount) + stepCount) % stepCount;
}
