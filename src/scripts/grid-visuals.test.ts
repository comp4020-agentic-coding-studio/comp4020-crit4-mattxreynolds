import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { createEmptyGrid } from "./grid";
import { paintStep, syncStepVisuals } from "./grid-visuals";

function buildStepButtons(doc: Document): Element {
  const container = doc.createElement("div");
  for (const pad of ["kick", "snare"]) {
    for (let step = 0; step < 4; step++) {
      const button = doc.createElement("button");
      button.className = "step";
      button.dataset.pad = pad;
      button.dataset.step = String(step);
      button.setAttribute("aria-pressed", "false");
      container.appendChild(button);
    }
  }
  return container;
}

describe("paintStep", () => {
  it("adds step--on and sets aria-pressed=true when on", () => {
    const doc = new JSDOM().window.document;
    const button = doc.createElement("button");
    paintStep(button, true);
    expect(button.classList.contains("step--on")).toBe(true);
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  it("removes step--on and sets aria-pressed=false when off", () => {
    const doc = new JSDOM().window.document;
    const button = doc.createElement("button");
    button.classList.add("step--on");
    button.setAttribute("aria-pressed", "true");
    paintStep(button, false);
    expect(button.classList.contains("step--on")).toBe(false);
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });
});

describe("syncStepVisuals", () => {
  it("paints every step button to match the grid data", () => {
    const doc = new JSDOM().window.document;
    const container = buildStepButtons(doc);
    const grid = createEmptyGrid();
    grid.kick[0] = true;
    grid.snare[2] = true;

    syncStepVisuals(grid, container);

    for (const button of container.querySelectorAll<HTMLButtonElement>("button")) {
      const padId = button.dataset.pad as "kick" | "snare";
      const step = Number(button.dataset.step);
      const on = grid[padId][step];
      expect(button.classList.contains("step--on")).toBe(on);
      expect(button.getAttribute("aria-pressed")).toBe(String(on));
    }
  });

  it("turns a stale on-looking button back off when the grid was cleared — regression for the Clear button leaving squares coloured", () => {
    const doc = new JSDOM().window.document;
    const container = buildStepButtons(doc);
    const staleButton = container.querySelector<HTMLButtonElement>(
      '[data-pad="kick"][data-step="0"]',
    )!;
    staleButton.classList.add("step--on");
    staleButton.setAttribute("aria-pressed", "true");

    syncStepVisuals(createEmptyGrid(), container);

    expect(staleButton.classList.contains("step--on")).toBe(false);
    expect(staleButton.getAttribute("aria-pressed")).toBe("false");
  });
});
