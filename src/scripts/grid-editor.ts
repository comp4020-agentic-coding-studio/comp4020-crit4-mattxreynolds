import { toggleStep } from "./grid";
import { paintStep } from "./grid-visuals";
import type { PadDef } from "./pad-defs";
import { grid } from "./transport";

for (const button of document.querySelectorAll<HTMLButtonElement>("#grid .step")) {
  const padId = button.dataset.pad as PadDef["id"] | undefined;
  const step = Number(button.dataset.step);
  if (!padId || Number.isNaN(step)) continue;

  // A native <button> already fires "click" for mouse, touch, and keyboard
  // (Enter/Space) activation, so one listener covers all three.
  button.addEventListener("click", () => {
    paintStep(button, toggleStep(grid, padId, step));
  });
}
