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

describe("transport + grid (task 3)", () => {
  it("has a labeled Play/Stop control", () => {
    const playStop = home.querySelector("#play-stop");
    expect(playStop, "no #play-stop control").toBeTruthy();
    expect(playStop?.tagName).toBe("BUTTON");
    expect(playStop?.textContent?.trim()).toBeTruthy();
  });

  it("has a labeled Clear control", () => {
    const clear = home.querySelector("#clear");
    expect(clear, "no #clear control").toBeTruthy();
    expect(clear?.tagName).toBe("BUTTON");
    expect(clear?.textContent?.trim()).toBeTruthy();
  });

  it("has a BPM input defaulting to 120, ranged ~60-180", () => {
    const bpm = home.querySelector("#bpm");
    expect(bpm, "no #bpm control").toBeTruthy();
    expect(["INPUT"]).toContain(bpm?.tagName);
    expect((bpm as HTMLInputElement).value).toBe("120");
    expect(Number((bpm as HTMLInputElement).min)).toBeLessThanOrEqual(60);
    expect(Number((bpm as HTMLInputElement).max)).toBeGreaterThanOrEqual(180);
  });

  it("labels the BPM input for assistive tech", () => {
    const bpm = home.querySelector("#bpm");
    const id = bpm?.getAttribute("id");
    const label = home.querySelector(`label[for="${id}"]`);
    expect(label?.textContent?.trim(), "BPM input has no associated <label>").toBeTruthy();
  });

  it("seeds a 4-row × 16-step grid, empty", () => {
    const rows = [...home.querySelectorAll("#grid .grid-row")];
    expect(rows).toHaveLength(4);

    for (const row of rows) {
      const steps = [...row.querySelectorAll(".step")];
      expect(steps).toHaveLength(16);
    }
  });

  it("gives every grid row a pad identity for later toggle wiring", () => {
    const rows = [...home.querySelectorAll("#grid .grid-row")];
    const padIds = rows.map((row) => row.getAttribute("data-pad"));
    expect(new Set(padIds)).toEqual(new Set(["kick", "snare", "hihat", "perc"]));
  });
});

describe("preset grooves + random-groove button (task 5)", () => {
  it("has a labeled random-groove control", () => {
    const button = home.querySelector("#random-groove");
    expect(button, "no #random-groove control").toBeTruthy();
    expect(button?.tagName).toBe("BUTTON");
    expect(button?.textContent?.trim()).toBeTruthy();
  });
});

describe("live recording (task 6)", () => {
  it("has a labeled REC toggle", () => {
    const rec = home.querySelector("#rec");
    expect(rec, "no #rec control").toBeTruthy();
    expect(rec?.tagName).toBe("BUTTON");
    expect(rec?.textContent?.trim()).toBeTruthy();
  });

  it("exposes REC as a toggle-style control", () => {
    const rec = home.querySelector("#rec");
    expect(rec?.getAttribute("aria-pressed")).toBe("false");
  });
});

describe("ambient layer (task 7)", () => {
  it("has a labeled on/off toggle, independent of the rhythm transport", () => {
    const toggle = home.querySelector("#ambient-toggle");
    expect(toggle, "no #ambient-toggle control").toBeTruthy();
    expect(toggle?.tagName).toBe("BUTTON");
    expect(toggle?.textContent?.trim()).toBeTruthy();
    expect(toggle?.getAttribute("aria-pressed")).toBe("false");
  });

  it("has a labeled, focusable XY drag control", () => {
    const xy = home.querySelector("#ambient-xy");
    expect(xy, "no #ambient-xy control").toBeTruthy();
    expect(xy?.getAttribute("aria-label")?.trim(), "#ambient-xy has no aria-label").toBeTruthy();
    expect(xy?.getAttribute("tabindex"), "#ambient-xy is not focusable").toBe("0");
  });

  it("has a labeled intensity control", () => {
    const intensity = home.querySelector("#ambient-intensity");
    expect(intensity, "no #ambient-intensity control").toBeTruthy();
    expect(["INPUT"]).toContain(intensity?.tagName);
    const id = intensity?.getAttribute("id");
    const label = home.querySelector(`label[for="${id}"]`);
    expect(label?.textContent?.trim(), "intensity input has no associated <label>").toBeTruthy();
  });
});
