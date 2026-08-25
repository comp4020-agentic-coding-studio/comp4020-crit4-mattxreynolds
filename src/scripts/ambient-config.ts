// Tuning constants for the ambient generative layer. Deliberately not
// exposed as UI controls yet (see PLAN.md) — change these directly while
// listening, then rebuild. Each is commented with the Pd-patch reference
// behaviour it approximates.

/** Seconds between generative events, picked uniformly at random within this
 * range each time (task 12). Reference behaviour was 10-40s; shortened here
 * so the effect is auditionable without a long wait — widen this back out
 * once the character itself is right. */
export const MIN_EVENT_INTERVAL_SECONDS = 4;
export const MAX_EVENT_INTERVAL_SECONDS = 12;

/** Envelope shape, in seconds. Reference: attack ~300ms, hold 1-4s, release ~700ms. */
export const ATTACK_SECONDS = 0.3;
export const MIN_HOLD_SECONDS = 1;
export const MAX_HOLD_SECONDS = 4;
export const RELEASE_SECONDS = 0.7;

/** Lowpass cutoff shared by every voice — keeps the saw source glassy rather than buzzy. */
export const FILTER_CUTOFF_HZ = 1400;

/** Subtle 2-op FM colour. Set FM_INDEX to 0 to A/B the voice without it. */
export const FM_RATIO = 2;
export const FM_INDEX = 1.5;

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
