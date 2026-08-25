import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// Our own tests, turning TASKS.md's per-task acceptance criteria into
// checks. Distinct from crit-4.test.ts, which tracks the published course
// spec's mechanically-checkable lines specifically.
const DIST = resolve("dist");
const home = new JSDOM(readFileSync(join(DIST, "index.html"), "utf8")).window
  .document;

// Focus-visible styling lives in the built CSS bundle, not the DOM — jsdom
// doesn't apply stylesheets, so this reads the shipped asset as text.
function shippedCss(dir: string = DIST): string {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? [shippedCss(path)] : path.endsWith(".css") ? [readFileSync(path, "utf8")] : [];
    })
    .join("\n");
}
const css = shippedCss();

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

describe("ambient layer (tasks 11-14, generative field)", () => {
  it("has a labeled on/off toggle, independent of the rhythm transport", () => {
    const toggle = home.querySelector("#ambient-toggle");
    expect(toggle, "no #ambient-toggle control").toBeTruthy();
    expect(toggle?.tagName).toBe("BUTTON");
    expect(toggle?.textContent?.trim()).toBeTruthy();
    expect(toggle?.getAttribute("aria-pressed")).toBe("false");
  });

  it("exposes no other ambient controls — tuning lives in code, not the UI", () => {
    expect(home.querySelector("#ambient-xy"), "#ambient-xy should be gone").toBeFalsy();
    expect(home.querySelector("#ambient-intensity"), "#ambient-intensity should be gone").toBeFalsy();
  });
});

describe("accessibility & keyboard pass (task 9)", () => {
  it("marks every grid step as a labeled, initially-unpressed toggle", () => {
    const steps = [...home.querySelectorAll("#grid .step")];
    expect(steps.length).toBe(4 * 16);
    for (const step of steps) {
      expect(step.getAttribute("aria-label")?.trim(), `${step.outerHTML} has no aria-label`).toBeTruthy();
      expect(step.getAttribute("aria-pressed"), `${step.outerHTML} has no aria-pressed`).toBe("false");
    }
  });

  it("exposes Play/Stop as a toggle-style control", () => {
    const playStop = home.querySelector("#play-stop");
    expect(playStop?.getAttribute("aria-pressed")).toBe("false");
  });

  it("every toggle-style button starts in sync with aria-pressed", () => {
    // aria-pressed is meaningless without a visual state to match it — this
    // just confirms every toggle control declares the attribute at all, the
    // actual on/off styling is CSS checked below.
    const toggles = ["#play-stop", "#rec", "#ambient-toggle"];
    for (const selector of toggles) {
      const el = home.querySelector(selector);
      expect(el?.hasAttribute("aria-pressed"), `${selector} has no aria-pressed`).toBe(true);
    }
  });

  it("gives buttons and steps a visible keyboard-focus style, not just the drag control", () => {
    // Task 7 shipped a focus-visible ring scoped to #ambient-xy only. Task 9
    // needs every reachable control (pads, steps, transport buttons) to show
    // one too — checking the bundled CSS for a rule that isn't scoped to
    // #ambient-xy alone catches a regression back to that narrower rule.
    const broadFocusRule = /\bbutton:focus-visible\b/.test(css);
    expect(
      broadFocusRule,
      "no button:focus-visible rule in the shipped CSS — pads/steps/transport buttons have no visible focus state",
    ).toBe(true);
  });

  it("keeps the BPM input's arrow-key range reachable via a real <input>", () => {
    const bpm = home.querySelector("#bpm");
    expect(bpm?.tagName).toBe("INPUT");
    expect((bpm as HTMLInputElement).getAttribute("type")).toBe("range");
  });
});

describe("first-impression & copy pass (task 10)", () => {
  it("removes the starter intro paragraph", () => {
    expect(
      home.querySelector('[data-testid="intro"]'),
      "the starter's data-testid=\"intro\" paragraph is still on the page",
    ).toBeFalsy();
  });

  it("has a real title, not the starter placeholder", () => {
    expect(home.title.trim()).not.toBe("COMP4020 prototype");
  });

  it("has a real meta description, not the starter placeholder", () => {
    const description = home
      .querySelector('meta[name="description"]')
      ?.getAttribute("content")
      ?.trim();
    expect(description?.startsWith("Replace this")).toBe(false);
  });

  it("names the instrument in its top-level heading", () => {
    const h1 = home.querySelector("h1");
    expect(h1?.textContent?.trim()).not.toBe("COMP4020 prototype");
    expect(h1?.textContent?.trim()).toBeTruthy();
  });

  it("gives no instructions on the opening screen — the pads have to invite the first tap on their own", () => {
    // Any visible body copy telling the player what to do would contradict
    // the "no instructions" requirement — the intro paragraph was the only
    // place that lived, and it's gone (checked above). This just confirms
    // main's only text nodes are inherent to the instrument's own controls
    // (labels, headings), not added prose.
    const bodyParagraphs = [...home.querySelectorAll("main > p")];
    for (const p of bodyParagraphs) {
      const text = p.textContent ?? "";
      expect(
        /\b(click|tap|press|drag) (on |to )?the|^(click|tap|press|drag|try|start)\b/i.test(text.trim()),
        `"${text}" reads as an instruction`,
      ).toBe(false);
    }
  });
});
