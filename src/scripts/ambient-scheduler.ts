import { MAX_EVENT_INTERVAL_SECONDS, MIN_EVENT_INTERVAL_SECONDS } from "./ambient-config";
import { randomIntervalSeconds } from "./ambient-synthesis";

// Real-time, setTimeout-based — unlike Scheduler's audio-clock lookahead,
// ambient event spacing is seconds apart and unlocked from the sequencer's
// tempo, so drift on the order of a few milliseconds is inaudible and a
// lookahead window would be needless complexity.
export class AmbientScheduler {
  #onEvent: () => void;
  #random: () => number;
  #timerId: ReturnType<typeof setTimeout> | null = null;

  constructor(onEvent: () => void, random: () => number = Math.random) {
    this.#onEvent = onEvent;
    this.#random = random;
  }

  get isRunning(): boolean {
    return this.#timerId !== null;
  }

  /** Fires immediately, then schedules subsequent events at random intervals. */
  start(): void {
    if (this.isRunning) return;
    this.#onEvent();
    this.#scheduleNext();
  }

  /** Stops future events only — never cuts an in-flight bloom short. */
  stop(): void {
    if (this.#timerId !== null) {
      clearTimeout(this.#timerId);
      this.#timerId = null;
    }
  }

  #scheduleNext(): void {
    const delaySeconds = randomIntervalSeconds(
      MIN_EVENT_INTERVAL_SECONDS,
      MAX_EVENT_INTERVAL_SECONDS,
      this.#random,
    );
    this.#timerId = setTimeout(() => {
      this.#timerId = null;
      this.#onEvent();
      this.#scheduleNext();
    }, delaySeconds * 1000);
  }
}
