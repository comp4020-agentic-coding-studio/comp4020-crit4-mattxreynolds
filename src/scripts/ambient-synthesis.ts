// Pure helpers for the ambient bloom voice. Kept free of AudioContext so the
// timing/pitch/FM math is unit-testable; ambient-voice.ts wires these into
// actual Web Audio nodes.

export interface EnvelopeSchedule {
  attackEnd: number;
  holdEnd: number;
  releaseEnd: number;
}

/** Lays out attack -> hold -> release end times (seconds) relative to `start`. */
export function envelopeSchedule(
  start: number,
  attackSeconds: number,
  holdSeconds: number,
  releaseSeconds: number,
): EnvelopeSchedule {
  const attackEnd = start + attackSeconds;
  const holdEnd = attackEnd + holdSeconds;
  const releaseEnd = holdEnd + releaseSeconds;
  return { attackEnd, holdEnd, releaseEnd };
}

export function semitonesToCents(semitones: number): number {
  return semitones * 100;
}

/** Chowning-style FM depth: modulator gain (Hz) applied to the carrier's frequency. */
export function fmModulatorGainHz(modulatorFrequencyHz: number, index: number): number {
  return modulatorFrequencyHz * index;
}

/** Picks a delay uniformly within [minSeconds, maxSeconds), unlocked from any grid/tempo. */
export function randomIntervalSeconds(
  minSeconds: number,
  maxSeconds: number,
  random: () => number = Math.random,
): number {
  return minSeconds + random() * (maxSeconds - minSeconds);
}
