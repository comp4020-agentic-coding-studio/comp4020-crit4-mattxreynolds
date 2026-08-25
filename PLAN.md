# PLAN

## Thesis

A browser-based drum-pad instrument: four synthesized drum pads are the
primary, immediate interaction, and a 16-step grid sits underneath as both a
recording target and a directly-editable pattern — so you can either drum a
groove in live or build one by clicking, and switch between the two freely. A
continuous ambient/spatial layer lives on the same screen, always active
alongside the rhythm: its stereo position is permanently in motion (an
automatic panning sweep, never a static position), and the player's gestures
shape that motion's character and tone rather than pinning it in place.

## Core idea

- **Pads (primary):** four pads (kick / snare / hi-hat / perc), each a fully
  synthesized sound (oscillator/noise + envelope through a `GainNode`, per
  the MDN simple-synth pattern) — no audio files, nothing "played back".
  Triggerable by pointer, touch, and a keyboard key per pad.
- **Grid (secondary, always visible):** one row per pad, 16 steps, one shared
  data model. A step can be set two ways, both writing to the same grid:
  - **Record:** press REC, drum on the pads while the loop plays; each hit
    marks the step nearest the current playhead.
  - **Click:** toggle any step directly, loop stopped or running.
  There is no separate "edit mode" — clicking always works, recording is an
  alternative way to fill the same grid.
- **Ambient layer (secondary mechanic, same screen, always live with the
  loop):** a continuously playing synthesized bed (e.g. detuned
  oscillators through a filter) whose stereo pan is **always moving** —
  an automatic sweep that never sits still while the layer is audible. The
  player's gesture(s) (an XY-style control, plus an intensity control) shape
  the sweep's speed/width and the tone/loudness, rather than setting a fixed
  pan value. Exact axis-to-parameter mapping is a build-time decision, not
  fixed here.
- **One screen, one instrument:** pads, grid, and ambient control are all
  visible and live together — the ambient layer is not a separate tab or
  mode. If it ever feels like a second instrument bolted on, it gets cut
  back or removed rather than kept for its own sake.
- **Silence on load:** nothing plays automatically when the page opens (this
  also matches the Web Audio autoplay policy — the `AudioContext` starts
  suspended until a user gesture regardless). "Invites the first sound" has
  to come from the pads' visual design alone, not from audio already
  playing.
- **No fail state:** clicking, drumming, and clearing the grid are all
  reversible and can't produce a "wrong" pattern; the ambient layer has no
  incorrect setting either.

## Explicitly cut for this deliverable

- Per-step/per-sound editing (waveform view, tune/decay/pan knobs) — was
  part of the "Composer" mockup idea, dropped in favor of pads+grid+ambient.
- Multiple simultaneous "modes" or tabs (composer / performer / conductor as
  separate screens) — collapsed into one always-live screen instead.
- Undo/redo, swing, time-signature controls, settings panel.
- Sample-based drum sounds — synthesized only.

## Stretch (only if core is solid with time to spare)

- One or more preset grooves, loaded into the grid on demand (not
  auto-played) as a starting point.
- A second ambient "space" preset (different tone/sweep character).
- Per-pad volume.
