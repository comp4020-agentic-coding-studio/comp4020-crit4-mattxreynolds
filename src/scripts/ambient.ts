import {
  ATTACK_SECONDS,
  MAX_HOLD_SECONDS,
  MIN_HOLD_SECONDS,
  RELEASE_SECONDS,
  STEREO_SPREAD,
} from "./ambient-config";
import { AmbientScheduler } from "./ambient-scheduler";
import { ambientPanPosition, pickAmbientPitch } from "./ambient-synthesis";
import { spawnAmbientVoice, type AmbientVoiceHandle } from "./ambient-voice";

// Tracks voices currently sounding so the toggle can cut them off
// immediately on stop, rather than letting each finish its own envelope.
const activeVoices = new Set<AmbientVoiceHandle>();

function triggerBloom(): void {
  const frequencyHz = pickAmbientPitch();
  const pan = ambientPanPosition(STEREO_SPREAD);
  const holdSeconds = MIN_HOLD_SECONDS + Math.random() * (MAX_HOLD_SECONDS - MIN_HOLD_SECONDS);
  const voice = spawnAmbientVoice(frequencyHz, pan, holdSeconds);
  activeVoices.add(voice);
  const naturalDurationMs = (ATTACK_SECONDS + holdSeconds + RELEASE_SECONDS) * 1000;
  setTimeout(() => activeVoices.delete(voice), naturalDurationMs);
}

function stopAllVoicesNow(): void {
  for (const voice of activeVoices) {
    voice.stopNow();
  }
  activeVoices.clear();
}

// Dev-only console hook to audition a single bloom on demand, independent
// of the generative scheduler below: run `__ambientTest.trigger()`.
declare global {
  interface Window {
    __ambientTest?: { trigger(): void };
  }
}
window.__ambientTest = { trigger: triggerBloom };

const scheduler = new AmbientScheduler(triggerBloom);
const toggleButton = document.querySelector<HTMLButtonElement>("#ambient-toggle");

toggleButton?.addEventListener("click", () => {
  const turningOn = !scheduler.isRunning;
  if (turningOn) {
    scheduler.start();
  } else {
    scheduler.stop();
    stopAllVoicesNow();
  }
  toggleButton.setAttribute("aria-pressed", String(turningOn));
  toggleButton.textContent = turningOn ? "Ambient: On" : "Ambient: Off";
});
