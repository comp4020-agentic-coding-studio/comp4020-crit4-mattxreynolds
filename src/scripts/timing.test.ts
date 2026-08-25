import { describe, expect, it } from "vitest";
import { nearestStepAtElapsed, stepAtElapsed, stepDurationSeconds } from "./timing";

describe("stepDurationSeconds", () => {
  it("is a sixteenth note at 120 BPM", () => {
    expect(stepDurationSeconds(120)).toBeCloseTo(0.125);
  });

  it("is longer at a slower tempo", () => {
    expect(stepDurationSeconds(60)).toBeCloseTo(0.25);
  });

  it("is shorter at a faster tempo", () => {
    expect(stepDurationSeconds(180)).toBeCloseTo(0.083333, 5);
  });
});

describe("stepAtElapsed", () => {
  it("starts on step 0", () => {
    expect(stepAtElapsed(0, 120)).toBe(0);
  });

  it("advances to the next step after one step duration", () => {
    expect(stepAtElapsed(0.13, 120)).toBe(1);
  });

  it("wraps back to step 0 after a full 16-step loop", () => {
    expect(stepAtElapsed(2.0, 120)).toBe(0); // 16 * 0.125s
  });

  it("is at the last step just before the loop wraps", () => {
    expect(stepAtElapsed(1.99, 120)).toBe(15);
  });

  it("holds at a slower tempo (60 BPM)", () => {
    expect(stepAtElapsed(0.26, 60)).toBe(1);
    expect(stepAtElapsed(0.24, 60)).toBe(0);
  });

  it("advances faster at a higher tempo (180 BPM)", () => {
    expect(stepAtElapsed(0.09, 180)).toBe(1);
  });
});

describe("nearestStepAtElapsed", () => {
  it("rounds down to the nearest step when just past its start", () => {
    expect(nearestStepAtElapsed(0.05, 120)).toBe(0); // 0.05 / 0.125 = 0.4
  });

  it("rounds up to the next step once past the halfway point", () => {
    expect(nearestStepAtElapsed(0.07, 120)).toBe(1); // 0.07 / 0.125 = 0.56
  });

  it("rounds to the step it's closest to, further into the loop", () => {
    expect(nearestStepAtElapsed(0.19, 120)).toBe(2); // 0.19 / 0.125 = 1.52
  });

  it("wraps a hit near the very end of the loop back to step 0", () => {
    expect(nearestStepAtElapsed(1.94, 120)).toBe(0); // 1.94 / 0.125 = 15.52 -> 16 -> 0
  });

  it("holds at a slower tempo (60 BPM)", () => {
    expect(nearestStepAtElapsed(0.2, 60)).toBe(1); // 0.2 / 0.25 = 0.8
  });
});
