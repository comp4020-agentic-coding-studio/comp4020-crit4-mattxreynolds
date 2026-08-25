import { describe, expect, it } from "vitest";
import { clearGrid, createEmptyGrid, STEP_COUNT } from "./grid";

describe("createEmptyGrid", () => {
  it("has one row per pad", () => {
    const grid = createEmptyGrid();
    expect(Object.keys(grid).sort()).toEqual(["hihat", "kick", "perc", "snare"]);
  });

  it("gives every row 16 steps, all off", () => {
    const grid = createEmptyGrid();
    for (const row of Object.values(grid)) {
      expect(row).toHaveLength(STEP_COUNT);
      expect(row.every((step) => step === false)).toBe(true);
    }
  });

  it("returns independent rows — mutating one grid doesn't affect another", () => {
    const a = createEmptyGrid();
    const b = createEmptyGrid();
    a.kick[0] = true;
    expect(b.kick[0]).toBe(false);
  });
});

describe("clearGrid", () => {
  it("turns every step off, in place", () => {
    const grid = createEmptyGrid();
    grid.kick[0] = true;
    grid.snare[4] = true;
    grid.hihat[15] = true;

    clearGrid(grid);

    for (const row of Object.values(grid)) {
      expect(row.every((step) => step === false)).toBe(true);
    }
  });

  it("mutates the same row arrays rather than replacing them", () => {
    const grid = createEmptyGrid();
    const kickRow = grid.kick;
    kickRow[0] = true;

    clearGrid(grid);

    expect(grid.kick).toBe(kickRow);
  });
});
