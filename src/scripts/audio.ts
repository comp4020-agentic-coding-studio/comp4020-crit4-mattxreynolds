import { once } from "./once";

// One AudioContext for the whole instrument, created once. It starts
// suspended (the browser's autoplay policy enforces this regardless) and is
// only resumed on the first user gesture anywhere in the UI — nothing plays
// on load.
export const audioContext = new AudioContext();

export const masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);

const resume = once(() => {
  void audioContext.resume();
  // Drops the pad-invite glow (see global.css) once the player has made
  // their first gesture anywhere in the UI — it's done its job.
  document.body.classList.remove("pre-first-gesture");
});

for (const type of ["pointerdown", "keydown"] as const) {
  document.addEventListener(type, resume);
}
