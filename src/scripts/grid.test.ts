import { describe, expect, it } from "vitest";
import { clearGrid, createEmptyGrid, markStep, STEP_COUNT, toggleStep } from "./grid";

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

describe("toggleStep", () => {
  it("flips an off step on and returns the new value", () => {
    const grid = createEmptyGrid();
    const result = toggleStep(grid, "kick", 0);
    expect(result).toBe(true);
    expect(grid.kick[0]).toBe(true);
  });

  it("flips an on step back off", () => {
    const grid = createEmptyGrid();
    grid.snare[4] = true;
    const result = toggleStep(grid, "snare", 4);
    expect(result).toBe(false);
    expect(grid.snare[4]).toBe(false);
  });

  it("only affects the targeted pad and step", () => {
    const grid = createEmptyGrid();
    toggleStep(grid, "hihat", 7);
    for (const [padId, row] of Object.entries(grid)) {
      for (const [step, on] of row.entries()) {
        expect(on).toBe(padId === "hihat" && step === 7);
      }
    }
  });

  it("mutates the grid in place rather than replacing the row", () => {
    const grid = createEmptyGrid();
    const kickRow = grid.kick;
    toggleStep(grid, "kick", 2);
    expect(grid.kick).toBe(kickRow);
  });
});

describe("markStep", () => {
  it("turns an off step on", () => {
    const grid = createEmptyGrid();
    markStep(grid, "kick", 3);
    expect(grid.kick[3]).toBe(true);
  });

  it("leaves an already-on step on — never clears a step", () => {
    const grid = createEmptyGrid();
    grid.snare[4] = true;
    markStep(grid, "snare", 4);
    expect(grid.snare[4]).toBe(true);
  });

  it("only affects the targeted pad and step", () => {
    const grid = createEmptyGrid();
    markStep(grid, "hihat", 7);
    for (const [padId, row] of Object.entries(grid)) {
      for (const [step, on] of row.entries()) {
        expect(on).toBe(padId === "hihat" && step === 7);
      }
    }
  });
});
