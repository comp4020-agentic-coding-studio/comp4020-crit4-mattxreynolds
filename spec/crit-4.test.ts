import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// C4 "An instrument" — comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/04-instrument/
//
// Most of this week's spec is judged live at the crit, not by a test suite:
// whether it's expressive, whether a stranger finds the first sound
// uninstructed, whether it's fun to keep playing. Those are named here, not
// asserted — sound in mind at the crit, not proven green beforehand:
//
//   - expressive: the player's choices shape what they hear, and two players
//     sound different
//   - a stranger can play it uninstructed — the opening screen invites the
//     first sound
//   - there is no way to play it wrong — no score, no fail state
//
// The two lines below are mechanically checkable, so they're asserted here.

const DIST = resolve("dist");

function shippedFiles(dir: string = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? shippedFiles(path) : [path];
  });
}

const bundledJs = shippedFiles()
  .filter((path) => path.endsWith(".js"))
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");

const home = new JSDOM(readFileSync(join(DIST, "index.html"), "utf8")).window
  .document;

describe("crit 4: an instrument", () => {
  it("makes sound live via the Web Audio API, not by playing back a recording", () => {
    expect(
      /AudioContext/.test(bundledJs),
      "no AudioContext in the shipped JS — sound should be synthesised live, not played back",
    ).toBe(true);

    for (const el of home.querySelectorAll("audio, video")) {
      expect(
        el.hasAttribute("src") || el.querySelector("source"),
        "an <audio>/<video> element with a source plays back a fixed recording, not a live instrument",
      ).toBe(false);
    }
  });

  it("is reachable without a mouse — at least one focusable control exists", () => {
    // Mouse and touch fire on any element by default; keyboard players need
    // an explicit focus target. A page with none has already excluded them,
    // whatever gesture the instrument otherwise expects.
    const focusable = home.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]",
    );
    expect(
      focusable.length,
      "no button, link, form control, or [tabindex] element — a keyboard player has nothing to land on",
    ).toBeGreaterThan(0);
  });
});
