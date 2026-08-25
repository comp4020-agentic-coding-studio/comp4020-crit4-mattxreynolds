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
