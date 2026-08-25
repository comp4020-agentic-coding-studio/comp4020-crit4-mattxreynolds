// Tuning constants for the ambient generative layer. Deliberately not
// exposed as UI controls yet (see PLAN.md) — change these directly while
// listening, then rebuild. Each is commented with the Pd-patch reference
// behaviour it approximates.

/** Seconds between generative events, picked uniformly at random within this
 * range each time. Kept deliberately shorter than the shortest possible
 * voice duration (ATTACK_SECONDS + MIN_HOLD_SECONDS + RELEASE_SECONDS,
 * 4.4s below) so a new bloom always starts while the previous one is still
 * sounding — no silent gap, always some overlap. */
export const MIN_EVENT_INTERVAL_SECONDS = 1.5;
export const MAX_EVENT_INTERVAL_SECONDS = 4;

/** Envelope shape, in seconds — lengthened and smoothed from the original
 * ~300ms/1-4s/~700ms reference per listening feedback: a slower attack and
 * release read as smoother, and longer holds make each bloom feel less
 * clipped. */
export const ATTACK_SECONDS = 0.6;
export const MIN_HOLD_SECONDS = 2;
export const MAX_HOLD_SECONDS = 7;
export const RELEASE_SECONDS = 1.8;

/** Lowpass cutoff shared by every voice — keeps the saw source glassy rather
 * than buzzy. Lowered from 1400Hz per listening feedback for a smoother,
 * warmer tone. */
export const FILTER_CUTOFF_HZ = 900;

/** Subtle 2-op FM colour. Set FM_INDEX to 0 to A/B the voice without it.
 * Index lowered from 1.5 per listening feedback — smoother, less metallic. */
export const FM_RATIO = 2;
export const FM_INDEX = 0.8;

/** Barely-perceptible pitch instability — not obvious vibrato. */
export const VIBRATO_RATE_HZ = 4;
export const VIBRATO_DEPTH_SEMITONES = 0.075;

/** Peak gain per voice, well under the drum voices' headroom. */
export const AMBIENT_MASTER_LEVEL = 0.18;

/** How far a per-event stereo position can sit from center (task 13). 1 = full L/R extremes. */
export const STEREO_SPREAD = 0.7;

/** How many octaves upward from the root a chosen pitch can land in. */
export const OCTAVE_RANGE = 2;

/** Root of the ambient pitch set. A3 — sits an octave below the 440 Hz
 * placeholder tone used during tasks 11-13, so the top of the octave
 * range lands in a comparable register. */
export const ROOT_FREQUENCY_HZ = 220;

/** A minor pentatonic scale degrees, in semitones above the root. Chosen
 * per PLAN.md: the sequencer's voices are all unpitched, so there's no
 * existing scale to inherit — any two notes from a pentatonic collection
 * sound consonant together with no voice-leading logic required. */
export const PENTATONIC_INTERVALS = [0, 3, 5, 7, 10];
