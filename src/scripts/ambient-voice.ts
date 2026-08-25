import {
  AMBIENT_MASTER_LEVEL,
  ATTACK_SECONDS,
  FILTER_CUTOFF_HZ,
  FM_INDEX,
  FM_RATIO,
  RELEASE_SECONDS,
  VIBRATO_DEPTH_SEMITONES,
  VIBRATO_RATE_HZ,
} from "./ambient-config";
import { audioContext, masterGain } from "./audio";
import { envelopeSchedule, fmModulatorGainHz, semitonesToCents } from "./ambient-synthesis";

// Same "build once, play, let it be garbage-collected" lifecycle as
// drums.ts's one-shot voices — nothing here is reused across events.
const SILENT = 0.0001;

/**
 * Spawns one ambient "bloom": a sawtooth carrier (light 2-op FM colour +
 * barely-perceptible vibrato) through a lowpass filter, at its own fixed
 * stereo position, shaped by an attack -> hold -> release envelope.
 */
export function spawnAmbientVoice(
  frequencyHz: number,
  pan: number,
  holdSeconds: number,
  when: number = audioContext.currentTime,
): void {
  const schedule = envelopeSchedule(when, ATTACK_SECONDS, holdSeconds, RELEASE_SECONDS);

  const carrier = audioContext.createOscillator();
  carrier.type = "sawtooth";
  carrier.frequency.value = frequencyHz;

  const vibrato = audioContext.createOscillator();
  vibrato.type = "sine";
  vibrato.frequency.value = VIBRATO_RATE_HZ;
  const vibratoDepth = audioContext.createGain();
  vibratoDepth.gain.value = semitonesToCents(VIBRATO_DEPTH_SEMITONES);
  vibrato.connect(vibratoDepth).connect(carrier.detune);

  const modulator = audioContext.createOscillator();
  modulator.type = "sine";
  const modulatorFrequencyHz = frequencyHz * FM_RATIO;
  modulator.frequency.value = modulatorFrequencyHz;
  const modulatorGain = audioContext.createGain();
  modulatorGain.gain.value = fmModulatorGainHz(modulatorFrequencyHz, FM_INDEX);
  modulator.connect(modulatorGain).connect(carrier.frequency);

  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = FILTER_CUTOFF_HZ;

  // Fixed for the lifetime of this one event — never automated, unlike the
  // old drone's permanently-sweeping panner.
  const panner = audioContext.createStereoPanner();
  panner.pan.value = Math.min(1, Math.max(-1, pan));

  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(SILENT, when);
  gain.gain.linearRampToValueAtTime(AMBIENT_MASTER_LEVEL, schedule.attackEnd);
  gain.gain.setValueAtTime(AMBIENT_MASTER_LEVEL, schedule.holdEnd);
  gain.gain.exponentialRampToValueAtTime(SILENT, schedule.releaseEnd);

  carrier.connect(filter).connect(panner).connect(gain).connect(masterGain);

  carrier.start(when);
  vibrato.start(when);
  modulator.start(when);
  carrier.stop(schedule.releaseEnd);
  vibrato.stop(schedule.releaseEnd);
  modulator.stop(schedule.releaseEnd);
}
