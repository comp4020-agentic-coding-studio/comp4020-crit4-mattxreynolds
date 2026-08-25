/** One source of truth for pad identity, display name, and keyboard shortcut — shared by the Astro markup (build time) and the pad-wiring script (client side), so the visible key hint can never drift from the actual binding. */
export interface PadDef {
  id: "kick" | "snare" | "hihat" | "perc";
  label: string;
  key: string;
}

export const PAD_DEFS: PadDef[] = [
  { id: "kick", label: "Kick", key: "A" },
  { id: "snare", label: "Snare", key: "S" },
  { id: "hihat", label: "Hi-hat", key: "D" },
  { id: "perc", label: "Perc", key: "F" },
];
