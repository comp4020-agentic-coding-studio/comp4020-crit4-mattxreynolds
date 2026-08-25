import { describe, expect, it } from "vitest";
import { stepAtElapsed, stepDurationSeconds } from "./timing";

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
