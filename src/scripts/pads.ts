import { playHiHat, playKick, playPerc, playSnare } from "./drums";
import { PAD_DEFS, type PadDef } from "./pad-defs";
import { recordHit } from "./transport";

const PLAY: Record<PadDef["id"], () => void> = {
  kick: playKick,
  snare: playSnare,
  hihat: playHiHat,
  perc: playPerc,
};

/** Sounds the pad and, if REC is armed, marks it into the grid — the single entry point every trigger source (pointer, focused-key, global shortcut) goes through. */
function trigger(id: PadDef["id"]): void {
  PLAY[id]();
  recordHit(id);
}

const KEY_TO_PAD = new Map(PAD_DEFS.map((pad) => [pad.key.toLowerCase(), pad.id]));

function setPressed(button: HTMLButtonElement, pressed: boolean): void {
  button.classList.toggle("pad--pressed", pressed);
  button.setAttribute("aria-pressed", String(pressed));
}

const buttons = new Map<PadDef["id"], HTMLButtonElement>();

for (const button of document.querySelectorAll<HTMLButtonElement>("#pads .pad")) {
  const id = button.dataset.pad as PadDef["id"] | undefined;
  if (!id || !(id in PLAY)) continue;
  buttons.set(id, button);

  // pointerdown covers mouse, touch, and pen in one listener.
  button.addEventListener("pointerdown", () => {
    trigger(id);
    setPressed(button, true);
  });
  for (const type of ["pointerup", "pointerleave", "pointercancel"] as const) {
    button.addEventListener(type, () => setPressed(button, false));
  }

  // Native keyboard activation (Tab + Enter/Space) — handled explicitly so
  // we can suppress the browser's own follow-up click and avoid a double hit.
  button.addEventListener("keydown", (event) => {
    if (event.repeat || (event.key !== " " && event.key !== "Enter")) return;
    event.preventDefault();
    trigger(id);
    setPressed(button, true);
  });
  button.addEventListener("keyup", (event) => {
    if (event.key === " " || event.key === "Enter") setPressed(button, false);
  });
}

// The A/S/D/F shortcuts work from anywhere on the page, not just when a pad
// has focus — a drum pad you can only trigger while tabbed onto it isn't
// playable "with whatever is at hand".
document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  const id = KEY_TO_PAD.get(event.key.toLowerCase());
  if (!id) return;
  trigger(id);
  const button = buttons.get(id);
  if (button) setPressed(button, true);
});

document.addEventListener("keyup", (event) => {
  const id = KEY_TO_PAD.get(event.key.toLowerCase());
  if (!id) return;
  const button = buttons.get(id);
  if (button) setPressed(button, false);
});
