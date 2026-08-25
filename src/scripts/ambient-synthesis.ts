// Pure helpers for the ambient bloom voice. Kept free of AudioContext so the
// timing/pitch/FM math is unit-testable; ambient-voice.ts wires these into
// actual Web Audio nodes.

import { OCTAVE_RANGE, PENTATONIC_INTERVALS, ROOT_FREQUENCY_HZ } from "./ambient-config";

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

/**
 * A fixed, sine-derived pan position for one event — never a sweep, never
 * shared across events. Each call picks a random angle around the circle
 * and projects it onto the stereo axis, matching the Pd reference's
 * per-event static placement.
 */
export function ambientPanPosition(
  spread: number,
  random: () => number = Math.random,
): number {
  const angle = random() * Math.PI * 2;
  return Math.sin(angle) * spread;
}

/**
 * Picks one note for a bloom: a scale degree from the configured
 * pentatonic collection, shifted up by a random whole number of octaves
 * within OCTAVE_RANGE. Draws `random()` twice — once for the degree, once
 * for the octave — so each event's pitch is independent of its pan and
 * hold time.
 */
export function pickAmbientPitch(random: () => number = Math.random): number {
  const degreeIndex = Math.floor(random() * PENTATONIC_INTERVALS.length);
  const octaveOffset = Math.floor(random() * OCTAVE_RANGE);
  const semitones = PENTATONIC_INTERVALS[degreeIndex] + octaveOffset * 12;
  return ROOT_FREQUENCY_HZ * Math.pow(2, semitones / 12);
}
