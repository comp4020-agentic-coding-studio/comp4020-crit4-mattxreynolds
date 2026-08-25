import { describe, expect, it } from "vitest";
import { envelopeSchedule, fmModulatorGainHz, randomIntervalSeconds, semitonesToCents } from "./ambient-synthesis";

describe("envelopeSchedule", () => {
  it("lays out attack -> hold -> release end times relative to the start", () => {
    const schedule = envelopeSchedule(10, 0.3, 2, 0.7);
    expect(schedule.attackEnd).toBeCloseTo(10.3);
    expect(schedule.holdEnd).toBeCloseTo(12.3);
    expect(schedule.releaseEnd).toBeCloseTo(13);
  });

  it("handles a zero-length stage without collapsing the following ones", () => {
    const schedule = envelopeSchedule(0, 0, 1, 0.5);
    expect(schedule.attackEnd).toBeCloseTo(0);
    expect(schedule.holdEnd).toBeCloseTo(1);
    expect(schedule.releaseEnd).toBeCloseTo(1.5);
  });
});

describe("semitonesToCents", () => {
  it("converts one semitone to 100 cents", () => {
    expect(semitonesToCents(1)).toBe(100);
  });

  it("scales linearly, including fractional semitones", () => {
    expect(semitonesToCents(0.075)).toBeCloseTo(7.5);
  });
});

describe("fmModulatorGainHz", () => {
  it("is zero at index 0, regardless of modulator frequency", () => {
    expect(fmModulatorGainHz(440, 0)).toBe(0);
  });

  it("scales the modulation depth linearly with index", () => {
    expect(fmModulatorGainHz(200, 1)).toBeCloseTo(200);
    expect(fmModulatorGainHz(200, 2)).toBeCloseTo(400);
  });
});

describe("randomIntervalSeconds", () => {
  it("returns the minimum when the source returns 0", () => {
    expect(randomIntervalSeconds(4, 12, () => 0)).toBe(4);
  });

  it("returns just under the maximum when the source returns just under 1", () => {
    expect(randomIntervalSeconds(4, 12, () => 0.999999)).toBeCloseTo(12, 4);
  });

  it("scales linearly between the bounds", () => {
    expect(randomIntervalSeconds(4, 12, () => 0.5)).toBeCloseTo(8);
  });
});
