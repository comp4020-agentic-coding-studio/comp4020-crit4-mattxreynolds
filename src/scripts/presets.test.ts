import { describe, expect, it } from "vitest";
import { createEmptyGrid, STEP_COUNT } from "./grid";
import { PAD_DEFS } from "./pad-defs";
import { applyPreset, pickRandomPreset, PRESETS } from "./presets";

describe("PRESETS", () => {
  it("has four contrasting built-in presets", () => {
    expect(PRESETS).toHaveLength(4);
    const patterns = PRESETS.map((preset) => JSON.stringify(preset.steps));
    expect(new Set(patterns).size, "presets should not be duplicates of each other").toBe(4);
  });

  it("only uses valid step indices for real pads", () => {
    for (const preset of PRESETS) {
      for (const [padId, steps] of Object.entries(preset.steps)) {
        expect(PAD_DEFS.map((pad) => pad.id)).toContain(padId);
        for (const step of steps ?? []) {
          expect(step).toBeGreaterThanOrEqual(0);
          expect(step).toBeLessThan(STEP_COUNT);
        }
      }
    }
  });
});

describe("applyPreset", () => {
  it("writes the preset's pattern into the grid", () => {
    const grid = createEmptyGrid();
    const preset = PRESETS[0];

    applyPreset(grid, preset);

    for (const pad of PAD_DEFS) {
      const expected = new Array<boolean>(STEP_COUNT).fill(false);
      for (const step of preset.steps[pad.id] ?? []) expected[step] = true;
      expect(grid[pad.id]).toEqual(expected);
    }
  });

  it("overwrites whatever was in the grid before, with no confirmation needed", () => {
    const grid = createEmptyGrid();
    grid.kick[1] = true;
    grid.snare[2] = true;

    applyPreset(grid, PRESETS[0]);

    const expectedKick = new Array<boolean>(STEP_COUNT).fill(false);
    for (const step of PRESETS[0].steps.kick ?? []) expectedKick[step] = true;
    expect(grid.kick).toEqual(expectedKick);
  });

  it("mutates the same row arrays rather than replacing them", () => {
    const grid = createEmptyGrid();
    const kickRow = grid.kick;

    applyPreset(grid, PRESETS[0]);

    expect(grid.kick).toBe(kickRow);
  });
});

describe("pickRandomPreset", () => {
  it("draws from the full preset set, not a fixed subset", () => {
    const picked = new Set<string>();
    // Sweep the injectable RNG's whole [0, 1) range so every preset's slot
    // is exercised deterministically, without depending on real randomness.
    for (let i = 0; i < PRESETS.length; i++) {
      const rng = () => i / PRESETS.length;
      picked.add(pickRandomPreset(rng).name);
    }
    expect(picked.size).toBe(PRESETS.length);
  });

  it("defaults to Math.random when no rng is supplied", () => {
    const preset = pickRandomPreset();
    expect(PRESETS).toContain(preset);
  });
});
