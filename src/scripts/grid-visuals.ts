import type { Grid } from "./grid";
import type { PadDef } from "./pad-defs";

/** Sets one step button's on/off look to match a given state. */
export function paintStep(button: HTMLButtonElement, on: boolean): void {
  button.classList.toggle("step--on", on);
  button.setAttribute("aria-pressed", String(on));
}

/** Repaints every step button from the grid data — for changes that don't go through a single button's own click handler (Clear, loading a preset). */
export function syncStepVisuals(grid: Grid, root: ParentNode = document): void {
  for (const button of root.querySelectorAll<HTMLButtonElement>(".step")) {
    const padId = button.dataset.pad as PadDef["id"] | undefined;
    const step = Number(button.dataset.step);
    if (!padId || Number.isNaN(step)) continue;
    paintStep(button, grid[padId][step]);
  }
}
