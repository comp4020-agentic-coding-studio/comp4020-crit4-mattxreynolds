import { clearGrid, createEmptyGrid, type Grid } from "./grid";
import { syncStepVisuals } from "./grid-visuals";
import { applyPreset, pickRandomPreset, type Preset } from "./presets";
import { Scheduler } from "./scheduler";

const DEFAULT_BPM = 120;

/** The shared grid data model — the scheduler reads it every tick, and later tasks (click-to-toggle, recording, presets) all write into this same instance. */
export const grid: Grid = createEmptyGrid();

let bpm = DEFAULT_BPM;
const scheduler = new Scheduler(grid, () => bpm);

const playStopButton = document.querySelector<HTMLButtonElement>("#play-stop");
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

playStopButton?.addEventListener("click", () => {
  if (scheduler.isPlaying) {
    scheduler.stop();
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    playStopButton.textContent = "Play";
    playStopButton.setAttribute("aria-pressed", "false");
    setPlayheadStep(null);
  } else {
    scheduler.start();
    playStopButton.textContent = "Stop";
    playStopButton.setAttribute("aria-pressed", "true");
    animate();
  }
});

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
