import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// Our own tests, turning TASKS.md's per-task acceptance criteria into
// checks. Distinct from crit-4.test.ts, which tracks the published course
// spec's mechanically-checkable lines specifically.
const DIST = resolve("dist");
const home = new JSDOM(readFileSync(join(DIST, "index.html"), "utf8")).window
  .document;

describe("page skeleton (task 1)", () => {
  it("has a container for the drum pads", () => {
    expect(home.querySelector("#pads")).toBeTruthy();
  });

  it("has a container for the step grid", () => {
    expect(home.querySelector("#grid")).toBeTruthy();
  });

  it("has a container for the ambient layer controls", () => {
    expect(home.querySelector("#ambient")).toBeTruthy();
  });
});

describe("drum pads (task 2)", () => {
  const pads = [...home.querySelectorAll("#pads button")];

  it("has exactly four pad buttons", () => {
    expect(pads).toHaveLength(4);
  });

  it("labels every pad for assistive tech", () => {
    for (const pad of pads) {
      expect(
        pad.getAttribute("aria-label")?.trim(),
        `${pad.outerHTML} has no aria-label`,
      ).toBeTruthy();
    }
  });

  it("shows a visible key hint on every pad", () => {
    for (const pad of pads) {
      expect(
        pad.textContent?.trim(),
        `${pad.outerHTML} has no visible key hint text`,
      ).toBeTruthy();
    }
  });

  it("assigns the A/S/D/F keys, one per pad, with no repeats", () => {
    const keys = pads.map((pad) => pad.textContent?.trim().slice(-1).toUpperCase());
    expect(new Set(keys)).toEqual(new Set(["A", "S", "D", "F"]));
  });
});
