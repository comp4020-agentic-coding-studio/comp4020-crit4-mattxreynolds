import { describe, expect, it, vi } from "vitest";
import { once } from "./once";

describe("once", () => {
  it("does not call the wrapped function until invoked", () => {
    const fn = vi.fn();
    once(fn);
    expect(fn).not.toHaveBeenCalled();
  });

  it("calls the wrapped function on first invocation", () => {
    const fn = vi.fn();
    const gated = once(fn);
    gated();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("never calls the wrapped function more than once", () => {
    const fn = vi.fn();
    const gated = once(fn);
    gated();
    gated();
    gated();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
