import { MAX_HOLD_SECONDS, MIN_HOLD_SECONDS } from "./ambient-config";
import { spawnAmbientVoice } from "./ambient-voice";

// The #ambient-toggle button exists in the markup but isn't wired to
// anything yet — task 12 adds the generative scheduler and its click
// handler. For now, this only exposes a dev-only console hook so the bloom
// voice can be auditioned by hand: run `__ambientTest.trigger()` in the
// browser console.
declare global {
  interface Window {
    __ambientTest?: { trigger(): void };
  }
}

function triggerTestBloom(): void {
  const frequencyHz = 440;
  const pan = Math.random() * 2 - 1;
  const holdSeconds = MIN_HOLD_SECONDS + Math.random() * (MAX_HOLD_SECONDS - MIN_HOLD_SECONDS);
  spawnAmbientVoice(frequencyHz, pan, holdSeconds);
}

window.__ambientTest = { trigger: triggerTestBloom };
