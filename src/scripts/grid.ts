import { PAD_DEFS, type PadDef } from "./pad-defs";

export const STEP_COUNT = 16;

export type Grid = Record<PadDef["id"], boolean[]>;

/** A fresh 4-row × 16-step grid with every step off. */
export function createEmptyGrid(): Grid {
  const grid = {} as Grid;
  for (const pad of PAD_DEFS) {
    grid[pad.id] = new Array<boolean>(STEP_COUNT).fill(false);
  }
  return grid;
}

/** Turns every step off, in place, so callers holding a reference (the scheduler) see the change immediately. */
export function clearGrid(grid: Grid): void {
  for (const pad of PAD_DEFS) {
    grid[pad.id].fill(false);
  }
}

/** Flips one step on/off, in place, and returns the new value. */
export function toggleStep(grid: Grid, padId: PadDef["id"], step: number): boolean {
  const next = !grid[padId][step];
  grid[padId][step] = next;
  return next;
}
