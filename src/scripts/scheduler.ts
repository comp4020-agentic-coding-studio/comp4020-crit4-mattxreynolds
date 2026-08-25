import { audioContext } from "./audio";
import { playHiHat, playKick, playPerc, playSnare } from "./drums";
import { STEP_COUNT, type Grid } from "./grid";
import { PAD_DEFS, type PadDef } from "./pad-defs";
import { stepDurationSeconds } from "./timing";

const PLAY: Record<PadDef["id"], (when: number) => void> = {
  kick: playKick,
  snare: playSnare,
  hihat: playHiHat,
  perc: playPerc,
};

// Classic Web Audio lookahead scheduler (per Chris Wilson's "A Tale of Two
// Clocks"): a setInterval tick just decides which notes fall within the next
// SCHEDULE_AHEAD_SECONDS and hands them to the AudioContext's own clock —
// the audio timing itself never depends on setInterval's precision, which is
// what keeps the loop from drifting or stuttering when the tab is busy.
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_SECONDS = 0.1;

interface ScheduledStep {
  step: number;
  time: number;
}

export class Scheduler {
  #grid: Grid;
  #getBpm: () => number;
  #timerId: ReturnType<typeof setInterval> | null = null;
  #nextStepTime = 0;
  #currentStep = 0;
  #queue: ScheduledStep[] = [];

  constructor(grid: Grid, getBpm: () => number) {
    this.#grid = grid;
    this.#getBpm = getBpm;
  }

  get isPlaying(): boolean {
    return this.#timerId !== null;
  }

  start(): void {
    if (this.isPlaying) return;
    this.#currentStep = 0;
    this.#nextStepTime = audioContext.currentTime;
    this.#queue = [];
    this.#timerId = setInterval(() => this.#tick(), LOOKAHEAD_MS);
  }

  stop(): void {
    if (this.#timerId !== null) {
      clearInterval(this.#timerId);
      this.#timerId = null;
    }
    this.#queue = [];
  }

  /**
   * The most recently scheduled step whose time has now arrived, for driving
   * the visual playhead — or null if nothing has reached its scheduled time
   * yet. Consumes entries from the queue as they become current.
   */
  currentVisibleStep(): number | null {
    const now = audioContext.currentTime;
    let step: number | null = null;
    while (this.#queue.length && this.#queue[0].time <= now) {
      step = this.#queue.shift()!.step;
    }
    return step;
  }

  #tick(): void {
    while (this.#nextStepTime < audioContext.currentTime + SCHEDULE_AHEAD_SECONDS) {
      this.#scheduleStep(this.#currentStep, this.#nextStepTime);
      this.#queue.push({ step: this.#currentStep, time: this.#nextStepTime });
      this.#nextStepTime += stepDurationSeconds(this.#getBpm());
      this.#currentStep = (this.#currentStep + 1) % STEP_COUNT;
    }
  }

  #scheduleStep(step: number, time: number): void {
    for (const pad of PAD_DEFS) {
      if (this.#grid[pad.id][step]) {
        PLAY[pad.id](time);
      }
    }
  }
}
