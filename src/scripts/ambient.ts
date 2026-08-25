import { audioContext, masterGain } from "./audio";
import { mapCutoff, mapDepth, mapLevel, mapRate } from "./ambient-mapping";

// Two detuned oscillators -> lowpass filter -> StereoPannerNode -> gain.
// Everything here starts and runs continuously from load — audibility is
// gated entirely by outputGain, never by starting/stopping the oscillators
// (an AudioScheduledSourceNode can't be restarted after .stop()). The LFO
// drives panner.pan permanently, so the sweep is already moving the instant
// the layer becomes audible rather than starting from a parked position.
const DETUNE_CENTS = 7;
const BASE_FREQ_HZ = 220;

// Triangle rather than sawtooth — far fewer harmonics, so the pad reads as
// light/airy rather than a buzzy bass drone even at the same base frequency.
const oscA = audioContext.createOscillator();
oscA.type = "triangle";
oscA.frequency.value = BASE_FREQ_HZ;

const oscB = audioContext.createOscillator();
oscB.type = "triangle";
oscB.frequency.value = BASE_FREQ_HZ;
oscB.detune.value = DETUNE_CENTS;

const filter = audioContext.createBiquadFilter();
filter.type = "lowpass";

const panner = audioContext.createStereoPanner();

const outputGain = audioContext.createGain();
outputGain.gain.value = 0; // off by default — nothing plays until the toggle is pressed

const lfo = audioContext.createOscillator();
lfo.type = "sine";

const lfoDepth = audioContext.createGain();
lfoDepth.gain.value = 0;

lfo.connect(lfoDepth).connect(panner.pan);
oscA.connect(filter);
oscB.connect(filter);
filter.connect(panner).connect(outputGain).connect(masterGain);

oscA.start();
oscB.start();
lfo.start();

const toggleButton = document.querySelector<HTMLButtonElement>("#ambient-toggle");
const xyPad = document.querySelector<HTMLDivElement>("#ambient-xy");
const thumb = xyPad?.querySelector<HTMLElement>(".ambient-xy-thumb");
const intensityInput = document.querySelector<HTMLInputElement>("#ambient-intensity");

// Short glide on every parameter change avoids zipper noise/clicks while
// still tracking the control closely enough to feel live.
const GLIDE_SECONDS = 0.05;

let isOn = false;

function currentIntensity(): number {
  return intensityInput ? Number(intensityInput.value) / 100 : 0.5;
}

function applyAudibility(): void {
  const intensity = currentIntensity();
  const targetLevel = isOn ? mapLevel(intensity) : 0;
  const targetDepth = isOn ? mapDepth(intensity) : 0;
  outputGain.gain.setTargetAtTime(targetLevel, audioContext.currentTime, GLIDE_SECONDS);
  lfoDepth.gain.setTargetAtTime(targetDepth, audioContext.currentTime, GLIDE_SECONDS);
}

function applyXY(x: number, y: number): void {
  const clampedX = Math.min(1, Math.max(0, x));
  const clampedY = Math.min(1, Math.max(0, y));
  lfo.frequency.setTargetAtTime(mapRate(clampedX), audioContext.currentTime, GLIDE_SECONDS);
  filter.frequency.setTargetAtTime(mapCutoff(clampedY), audioContext.currentTime, GLIDE_SECONDS);
  if (thumb) {
    thumb.style.left = `${clampedX * 100}%`;
    thumb.style.top = `${clampedY * 100}%`;
  }
}

// Center start position: a middling sweep rate and a middling brightness.
applyXY(0.5, 0.5);
applyAudibility();

toggleButton?.addEventListener("click", () => {
  isOn = !isOn;
  toggleButton.setAttribute("aria-pressed", String(isOn));
  toggleButton.textContent = isOn ? "Ambient: On" : "Ambient: Off";
  applyAudibility();
});

intensityInput?.addEventListener("input", applyAudibility);

let dragging = false;

function updateFromPointer(event: PointerEvent): void {
  if (!xyPad) return;
  const rect = xyPad.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  applyXY(x, y);
}

xyPad?.addEventListener("pointerdown", (event) => {
  dragging = true;
  xyPad.setPointerCapture(event.pointerId);
  updateFromPointer(event);
});
xyPad?.addEventListener("pointermove", (event) => {
  if (dragging) updateFromPointer(event);
});
for (const type of ["pointerup", "pointercancel"] as const) {
  xyPad?.addEventListener(type, () => {
    dragging = false;
  });
}
