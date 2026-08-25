import { audioContext, masterGain } from "./audio";

/** A buffer of white noise `duration` seconds long, used as the raw material for the noise-based voices below. */
function noiseBuffer(duration: number): AudioBuffer {
  const frameCount = Math.max(1, Math.floor(audioContext.sampleRate * duration));
  const buffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// Envelopes decay to this rather than 0 — exponentialRampToValueAtTime can't
// target 0 — which is inaudibly close for the short durations used here.
const SILENT = 0.0001;

/**
 * Every voice takes `when` (an AudioContext time), defaulting to "now" for a
 * live pad hit — but the sequencer passes a future time so it can schedule a
 * whole lookahead window of notes precisely on the audio clock, rather than
 * relying on `setTimeout`/`setInterval` (whose drift is exactly what causes
 * a scheduled loop to stutter).
 */

/** Sine oscillator with a pitch envelope from ~150 Hz down to ~40 Hz over ~150ms, matching amplitude decay. */
export function playKick(when: number = audioContext.currentTime): void {
  const duration = 0.15;

  const osc = audioContext.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, when);
  osc.frequency.exponentialRampToValueAtTime(40, when + duration);

  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(1, when);
  gain.gain.exponentialRampToValueAtTime(SILENT, when + duration);

  osc.connect(gain).connect(masterGain);
  osc.start(when);
  osc.stop(when + duration);
}

/** Filtered noise burst plus a short tone, ~150ms decay. */
export function playSnare(when: number = audioContext.currentTime): void {
  const duration = 0.15;

  const noise = audioContext.createBufferSource();
  noise.buffer = noiseBuffer(duration);
  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 1800;
  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(1, when);
  noiseGain.gain.exponentialRampToValueAtTime(SILENT, when + duration);
  noise.connect(noiseFilter).connect(noiseGain).connect(masterGain);
  noise.start(when);
  noise.stop(when + duration);

  const tone = audioContext.createOscillator();
  tone.type = "triangle";
  tone.frequency.setValueAtTime(180, when);
  const toneGain = audioContext.createGain();
  toneGain.gain.setValueAtTime(0.6, when);
  toneGain.gain.exponentialRampToValueAtTime(SILENT, when + duration * 0.5);
  tone.connect(toneGain).connect(masterGain);
  tone.start(when);
  tone.stop(when + duration * 0.5);
}

/** High-passed noise, very short (~50-100ms) decay. */
export function playHiHat(when: number = audioContext.currentTime): void {
  const duration = 0.07;

  const noise = audioContext.createBufferSource();
  noise.buffer = noiseBuffer(duration);
  const filter = audioContext.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7000;
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.8, when);
  gain.gain.exponentialRampToValueAtTime(SILENT, when + duration);
  noise.connect(filter).connect(gain).connect(masterGain);
  noise.start(when);
  noise.stop(when + duration);
}

/** Short pitched blip: triangle oscillator, fast pitch drop, ~100ms. */
export function playPerc(when: number = audioContext.currentTime): void {
  const duration = 0.1;

  const osc = audioContext.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(600, when);
  osc.frequency.exponentialRampToValueAtTime(150, when + duration);

  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.8, when);
  gain.gain.exponentialRampToValueAtTime(SILENT, when + duration);

  osc.connect(gain).connect(masterGain);
  osc.start(when);
  osc.stop(when + duration);
}
