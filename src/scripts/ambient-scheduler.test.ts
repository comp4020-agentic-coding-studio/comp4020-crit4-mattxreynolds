import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AmbientScheduler } from "./ambient-scheduler";
import { MAX_EVENT_INTERVAL_SECONDS, MIN_EVENT_INTERVAL_SECONDS } from "./ambient-config";

// A fixed "random" source makes every scheduled delay deterministic:
// randomIntervalSeconds(min, max, () => 0.5) sits exactly halfway between
// the configured bounds (see ambient-synthesis.test.ts).
const MID_DELAY_MS = ((MIN_EVENT_INTERVAL_SECONDS + MAX_EVENT_INTERVAL_SECONDS) / 2) * 1000;
const fixedMidRandom = () => 0.5;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AmbientScheduler", () => {
  it("fires immediately when started — no delay before the first event", () => {
    const onEvent = vi.fn();
    const scheduler = new AmbientScheduler(onEvent, fixedMidRandom);
    scheduler.start();
    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  it("does not fire the second event before the scheduled interval elapses", () => {
    const onEvent = vi.fn();
    const scheduler = new AmbientScheduler(onEvent, fixedMidRandom);
    scheduler.start();
    vi.advanceTimersByTime(MID_DELAY_MS - 1);
    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  it("fires the second event once the scheduled interval elapses", () => {
    const onEvent = vi.fn();
    const scheduler = new AmbientScheduler(onEvent, fixedMidRandom);
    scheduler.start();
    vi.advanceTimersByTime(MID_DELAY_MS);
    expect(onEvent).toHaveBeenCalledTimes(2);
  });

  it("keeps rescheduling fresh intervals after firing", () => {
    const onEvent = vi.fn();
    const scheduler = new AmbientScheduler(onEvent, fixedMidRandom);
    scheduler.start();
    vi.advanceTimersByTime(MID_DELAY_MS);
    vi.advanceTimersByTime(MID_DELAY_MS);
    expect(onEvent).toHaveBeenCalledTimes(3);
  });

  it("never lets an interval stray outside the configured bounds", () => {
    const onEvent = vi.fn();
    let call = 0;
    const alternating = () => (call++ % 2 === 0 ? 0 : 1);
    const scheduler = new AmbientScheduler(onEvent, alternating);
    scheduler.start();
    expect(onEvent).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(MIN_EVENT_INTERVAL_SECONDS * 1000 - 1);
    expect(onEvent).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(onEvent).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(MAX_EVENT_INTERVAL_SECONDS * 1000 - 1);
    expect(onEvent).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    expect(onEvent).toHaveBeenCalledTimes(3);
  });

  it("starting twice never creates a second concurrent schedule", () => {
    const onEvent = vi.fn();
    const scheduler = new AmbientScheduler(onEvent, fixedMidRandom);
    scheduler.start();
    scheduler.start();
    expect(onEvent).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(MID_DELAY_MS);
    expect(onEvent).toHaveBeenCalledTimes(2);
  });

  it("reports isRunning", () => {
    const scheduler = new AmbientScheduler(vi.fn(), fixedMidRandom);
    expect(scheduler.isRunning).toBe(false);
    scheduler.start();
    expect(scheduler.isRunning).toBe(true);
    scheduler.stop();
    expect(scheduler.isRunning).toBe(false);
  });

  it("stopping leaves zero pending timers — nothing fires afterward", () => {
    const onEvent = vi.fn();
    const scheduler = new AmbientScheduler(onEvent, fixedMidRandom);
    scheduler.start();
    expect(onEvent).toHaveBeenCalledTimes(1);
    scheduler.stop();
    vi.advanceTimersByTime(MAX_EVENT_INTERVAL_SECONDS * 1000 * 10);
    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  it("restarting after stop fires immediately again, not the stale remainder", () => {
    const onEvent = vi.fn();
    const scheduler = new AmbientScheduler(onEvent, fixedMidRandom);
    scheduler.start();
    expect(onEvent).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(MID_DELAY_MS / 2);
    scheduler.stop();
    scheduler.start();
    expect(onEvent).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(MID_DELAY_MS - 1);
    expect(onEvent).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    expect(onEvent).toHaveBeenCalledTimes(3);
  });
});
