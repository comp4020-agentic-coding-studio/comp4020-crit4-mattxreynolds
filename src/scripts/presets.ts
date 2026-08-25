import type { Grid } from "./grid";
import { PAD_DEFS, type PadDef } from "./pad-defs";

/** A built-in groove, expressed as which steps are on per pad — easier to read/write than a full boolean grid. */
export interface Preset {
  name: string;
  steps: Partial<Record<PadDef["id"], number[]>>;
}

export const PRESETS: Preset[] = [
  {
    name: "Four on the floor",
    steps: {
      kick: [0, 4, 8, 12],
      snare: [4, 12],
      hihat: [0, 2, 4, 6, 8, 10, 12, 14],
    },
  },
  {
    name: "Backbeat",
    steps: {
      kick: [0, 6, 8, 10],
      snare: [4, 12],
      hihat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      perc: [2, 10],
    },
  },
  {
    name: "Half-time",
    steps: {
      kick: [0],
      snare: [8],
      hihat: [0, 4, 8, 12],
      perc: [6, 14],
    },
  },
  {
    name: "Syncopated",
    steps: {
      kick: [0, 3, 6, 10],
      snare: [4, 11],
      hihat: [2, 5, 9, 13],
      perc: [1, 7, 8, 15],
    },
  },
];

/** Writes a preset's pattern into the grid, in place, overwriting whatever was there before. */
export function applyPreset(grid: Grid, preset: Preset): void {
  for (const pad of PAD_DEFS) {
    const row = grid[pad.id];
    row.fill(false);
    for (const step of preset.steps[pad.id] ?? []) row[step] = true;
  }
}

/**
 * Picks one built-in preset uniformly at random. rng is injectable so tests
 * can cover every preset deterministically. Pass the previously-loaded
 * preset as `exclude` to guarantee two consecutive picks never match —
 * callers use this to keep the random-groove button from repeating itself.
 */
export function pickRandomPreset(rng: () => number = Math.random, exclude?: Preset): Preset {
  const options = exclude ? PRESETS.filter((preset) => preset !== exclude) : PRESETS;
  const index = Math.floor(rng() * options.length);
  return options[index];
}
