import { describe, expect, it } from "vitest";
import { mapCutoff, mapDepth, mapLevel, mapRate } from "./ambient-mapping";

describe("mapRate", () => {
  it("is slowest at x=0", () => {
    expect(mapRate(0)).toBeCloseTo(0.05);
  });

  it("is fastest at x=1", () => {
    expect(mapRate(1)).toBeCloseTo(1.5);
  });

  it("is monotonically increasing with x", () => {
    expect(mapRate(0.75)).toBeGreaterThan(mapRate(0.25));
  });

  it("clamps out-of-range input", () => {
    expect(mapRate(-1)).toBeCloseTo(mapRate(0));
    expect(mapRate(2)).toBeCloseTo(mapRate(1));
  });
});

describe("mapCutoff", () => {
  it("is brightest (highest cutoff) at the top, y=0", () => {
    expect(mapCutoff(0)).toBeCloseTo(6000);
  });

  it("is darkest (lowest cutoff) at the bottom, y=1", () => {
    expect(mapCutoff(1)).toBeCloseTo(200);
  });

  it("is monotonically decreasing with y", () => {
    expect(mapCutoff(0.25)).toBeGreaterThan(mapCutoff(0.75));
  });

  it("clamps out-of-range input", () => {
    expect(mapCutoff(-1)).toBeCloseTo(mapCutoff(0));
    expect(mapCutoff(2)).toBeCloseTo(mapCutoff(1));
  });
});

describe("mapDepth", () => {
  it("is silent-width at zero intensity", () => {
    expect(mapDepth(0)).toBe(0);
  });

  it("is widest at full intensity", () => {
    expect(mapDepth(1)).toBeCloseTo(0.9);
  });

  it("clamps out-of-range input", () => {
    expect(mapDepth(-1)).toBe(0);
    expect(mapDepth(2)).toBeCloseTo(0.9);
  });
});

describe("mapLevel", () => {
  it("is silent at zero intensity", () => {
    expect(mapLevel(0)).toBe(0);
  });

  it("is at its cap at full intensity, well under the drum voices' headroom", () => {
    expect(mapLevel(1)).toBeCloseTo(0.3);
    expect(mapLevel(1)).toBeLessThan(1);
  });

  it("clamps out-of-range input", () => {
    expect(mapLevel(-1)).toBe(0);
    expect(mapLevel(2)).toBeCloseTo(0.3);
  });
});
