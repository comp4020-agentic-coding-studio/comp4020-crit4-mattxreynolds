import { MAX_HOLD_SECONDS, MIN_HOLD_SECONDS, STEREO_SPREAD } from "./ambient-config";
import { AmbientScheduler } from "./ambient-scheduler";
import { ambientPanPosition } from "./ambient-synthesis";
import { spawnAmbientVoice } from "./ambient-voice";

// Pitch is still a placeholder — task 14 (pitch integration) replaces it.
// Every bloom is already audible, correctly shaped, and spatially placed,
// just not yet musically varied.
function triggerBloom(): void {
  const frequencyHz = 440;
  const pan = ambientPanPosition(STEREO_SPREAD);
  const holdSeconds = MIN_HOLD_SECONDS + Math.random() * (MAX_HOLD_SECONDS - MIN_HOLD_SECONDS);
  spawnAmbientVoice(frequencyHz, pan, holdSeconds);
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
  }
  toggleButton.setAttribute("aria-pressed", String(turningOn));
  toggleButton.textContent = turningOn ? "Ambient: On" : "Ambient: Off";
});
