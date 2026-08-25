import { describe, expect, it } from "vitest";
import { OCTAVE_RANGE, PENTATONIC_INTERVALS, ROOT_FREQUENCY_HZ } from "./ambient-config";
import {
  ambientPanPosition,
  envelopeSchedule,
  fmModulatorGainHz,
  pickAmbientPitch,
  randomIntervalSeconds,
  semitonesToCents,
} from "./ambient-synthesis";

/** Returns each value in `values` in turn, then cycles — lets a test drive
 * pickAmbientPitch's two sequential random() draws independently. */
function sequence(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

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
    // Offset from a plain 0.1 grid: sin(2*PI*t) is symmetric under
    // t -> 0.5 - t, so an evenly-spaced grid starting at 0 collides in
    // mirrored pairs. The offset keeps the sample representative of real
    // (non-symmetric) random draws.
    const positions = [0.03, 0.13, 0.23, 0.33, 0.43, 0.53, 0.63, 0.73, 0.83, 0.93].map((t) =>
      ambientPanPosition(0.7, () => t),
    );
    const distinct = new Set(positions.map((p) => p.toFixed(4)));
    expect(distinct.size).toBeGreaterThan(5);
  });
});

describe("pickAmbientPitch", () => {
  it("returns exactly the root frequency when both draws select the lowest option", () => {
    expect(pickAmbientPitch(sequence([0]))).toBeCloseTo(ROOT_FREQUENCY_HZ);
  });

  it("selects the scale degree and octave indicated by the two random draws", () => {
    // floor(0.41 * 5) = 2 -> PENTATONIC_INTERVALS[2] (a fourth); floor(0 * OCTAVE_RANGE) = 0
    const pitch = pickAmbientPitch(sequence([0.41, 0]));
    expect(pitch).toBeCloseTo(ROOT_FREQUENCY_HZ * Math.pow(2, PENTATONIC_INTERVALS[2] / 12));
  });

  it("always lands exactly on a member of the pentatonic collection, at some octave", () => {
    const validFrequencies = new Set<number>();
    for (const interval of PENTATONIC_INTERVALS) {
      for (let octave = 0; octave < OCTAVE_RANGE; octave++) {
        validFrequencies.add(ROOT_FREQUENCY_HZ * Math.pow(2, (interval + octave * 12) / 12));
      }
    }
    const testPoints = [0, 0.15, 0.35, 0.55, 0.75, 0.95];
    for (const degreeT of testPoints) {
      for (const octaveT of testPoints) {
        const pitch = pickAmbientPitch(sequence([degreeT, octaveT]));
        const matches = [...validFrequencies].some((f) => Math.abs(f - pitch) < 1e-6);
        expect(matches).toBe(true);
      }
    }
  });

  it("never exceeds the top of the configured octave range", () => {
    const maxInterval = Math.max(...PENTATONIC_INTERVALS);
    const maxFrequency = ROOT_FREQUENCY_HZ * Math.pow(2, (maxInterval + (OCTAVE_RANGE - 1) * 12) / 12);
    for (let i = 0; i < 20; i++) {
      const pitch = pickAmbientPitch(sequence([i / 20, ((i + 7) % 20) / 20]));
      expect(pitch).toBeLessThanOrEqual(maxFrequency + 1e-6);
      expect(pitch).toBeGreaterThanOrEqual(ROOT_FREQUENCY_HZ - 1e-6);
    }
  });
});
