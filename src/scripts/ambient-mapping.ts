// Pure mapping functions for the ambient layer's XY drag control and
// intensity control — pulled out of the AudioContext wiring so the mapping
// curves themselves are unit-testable (Web Audio output isn't observable in
// jsdom, but these functions are plain arithmetic).

const MIN_RATE_HZ = 0.05;
const MAX_RATE_HZ = 1.5;

/** Normalized X (0..1, left→right) → LFO rate in Hz, how fast the stereo sweep cycles. */
export function mapRate(x: number): number {
  return MIN_RATE_HZ + clamp01(x) * (MAX_RATE_HZ - MIN_RATE_HZ);
}

const MIN_CUTOFF_HZ = 200;
const MAX_CUTOFF_HZ = 6000;

/** Normalized Y (0..1, top→bottom) → lowpass cutoff in Hz. Inverted so dragging toward the top brightens the tone. */
export function mapCutoff(y: number): number {
  const t = 1 - clamp01(y);
  return MIN_CUTOFF_HZ + t * (MAX_CUTOFF_HZ - MIN_CUTOFF_HZ);
}

const MAX_DEPTH = 0.9;

/** Normalized intensity (0..1) → LFO depth, the width of the stereo sweep. */
export function mapDepth(intensity: number): number {
  return clamp01(intensity) * MAX_DEPTH;
}

const MAX_LEVEL = 0.3;

/** Normalized intensity (0..1) → output level (linear gain), capped well below the drum voices' headroom. */
export function mapLevel(intensity: number): number {
  return clamp01(intensity) * MAX_LEVEL;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
