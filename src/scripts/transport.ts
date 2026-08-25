import { clearGrid, createEmptyGrid, markStep, type Grid } from "./grid";
import { paintStep, syncStepVisuals } from "./grid-visuals";
import type { PadDef } from "./pad-defs";
import { applyPreset, pickRandomPreset, type Preset } from "./presets";
import { Scheduler } from "./scheduler";

const DEFAULT_BPM = 120;

/** The shared grid data model — the scheduler reads it every tick, and later tasks (click-to-toggle, recording, presets) all write into this same instance. */
export const grid: Grid = createEmptyGrid();

let bpm = DEFAULT_BPM;
const scheduler = new Scheduler(grid, () => bpm);

const playStopButton = document.querySelector<HTMLButtonElement>("#play-stop");
const recButton = document.querySelector<HTMLButtonElement>("#rec");
const clearButton = document.querySelector<HTMLButtonElement>("#clear");
const randomGrooveButton = document.querySelector<HTMLButtonElement>("#random-groove");
const bpmInput = document.querySelector<HTMLInputElement>("#bpm");
const bpmOutput = document.querySelector<HTMLOutputElement>("#bpm-value");

function setPlayheadStep(step: number | null): void {
  for (const cell of document.querySelectorAll<HTMLElement>("#grid .step")) {
    cell.classList.toggle("step--current", step !== null && Number(cell.dataset.step) === step);
  }
}

let rafId: number | null = null;
function animate(): void {
  const step = scheduler.currentVisibleStep();
  if (step !== null) setPlayheadStep(step);
  rafId = requestAnimationFrame(animate);
}

function startPlayback(): void {
  if (scheduler.isPlaying) return;
  scheduler.start();
  if (playStopButton) {
    playStopButton.textContent = "Stop";
    playStopButton.setAttribute("aria-pressed", "true");
  }
  animate();
}

function stopPlayback(): void {
  if (!scheduler.isPlaying) return;
  scheduler.stop();
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (playStopButton) {
    playStopButton.textContent = "Play";
    playStopButton.setAttribute("aria-pressed", "false");
  }
  setPlayheadStep(null);
}

playStopButton?.addEventListener("click", () => {
  if (scheduler.isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
});

// Arming REC starts the sequencer if it isn't already running (recording
// needs a running playhead to quantize hits against); disarming it only
// stops recording, never playback.
let isRecording = false;
recButton?.addEventListener("click", () => {
  isRecording = !isRecording;
  recButton.setAttribute("aria-pressed", String(isRecording));
  if (isRecording) startPlayback();
});

/** Called on every pad hit; while REC is armed, marks the nearest step for that pad. No-op while disarmed or stopped. */
export function recordHit(padId: PadDef["id"]): void {
  if (!isRecording) return;
  const step = scheduler.nearestStep();
  if (step === null) return;
  markStep(grid, padId, step);
  const button = document.querySelector<HTMLButtonElement>(
    `#grid .step[data-pad="${padId}"][data-step="${step}"]`,
  );
  if (button) paintStep(button, true);
}

clearButton?.addEventListener("click", () => {
  clearGrid(grid);
  syncStepVisuals(grid);
});

let lastPreset: Preset | undefined;
randomGrooveButton?.addEventListener("click", () => {
  lastPreset = pickRandomPreset(Math.random, lastPreset);
  applyPreset(grid, lastPreset);
  syncStepVisuals(grid);
});

bpmInput?.addEventListener("input", () => {
  const value = Number(bpmInput.value);
  if (Number.isNaN(value)) return;
  bpm = value;
  if (bpmOutput) bpmOutput.value = String(value);
});
