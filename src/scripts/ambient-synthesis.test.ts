import { describe, expect, it } from "vitest";
import {
  ambientPanPosition,
  envelopeSchedule,
  fmModulatorGainHz,
  randomIntervalSeconds,
  semitonesToCents,
} from "./ambient-synthesis";

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

describe("ambientPanPosition", () => {
  it("is centered when the angle sits at 0", () => {
    expect(ambientPanPosition(0.7, () => 0)).toBeCloseTo(0);
  });

  it("stays within [-spread, spread] across a full sweep of angles", () => {
    for (let i = 0; i <= 10; i++) {
      const pan = ambientPanPosition(0.7, () => i / 10);
      expect(Math.abs(pan)).toBeLessThanOrEqual(0.7 + 1e-9);
    }
  });

  it("reaches both the positive and negative edge of the spread", () => {
    expect(ambientPanPosition(0.7, () => 0.25)).toBeCloseTo(0.7);
    expect(ambientPanPosition(0.7, () => 0.75)).toBeCloseTo(-0.7);
  });

  it("produces varied, not clustered, positions across repeated calls", () => {
    const positions = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((t) =>
      ambientPanPosition(0.7, () => t),
    );
    const distinct = new Set(positions.map((p) => p.toFixed(4)));
    expect(distinct.size).toBeGreaterThan(5);
  });
});
