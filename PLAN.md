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
  fixed here. It has its own on/off, independent of the rhythm transport —
  it can run alone, alongside the loop, or not at all.
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

- A second ambient "space" preset (different tone/sweep character).
- Per-pad volume.
- Keyboard control (arrow-key nudge) for the ambient layer.

## Design & technical decisions

**Transport.** 4/4, 16 steps (sixteenth notes). BPM is adjustable (default
120, range ~60–180) via a range/number input in the transport bar; the
scheduler reads the live BPM value on each tick, so a tempo change takes
effect immediately, mid-loop, without needing to stop first. Play/Stop
controls the rhythm sequencer only — the ambient layer has its own separate
on/off (see below). REC is a separate toggle: arming it starts the sequencer
if it isn't already running (you need the loop running to know what step
you're on), and disarming it stops recording without stopping playback. A
Clear button resets the grid to empty.

**Preset grooves.** A small built-in set (four is enough) of contrasting
preset patterns. A "random groove" button in the transport bar picks one
uniformly at random (excluding whichever preset it loaded last, so pressing
it twice in a row always changes the pattern) and loads it into the grid,
overwriting whatever's there — no confirmation prompt, consistent with the
no-fail-state stance: overwriting is a fast way to start over, not a mistake
to guard against. Loading a preset does not start playback by itself; Play
still needs a press, same as any other change to the grid.

**Drum synthesis** (oscillator/noise + envelope through a `GainNode`, per
MDN's simple-synth example):
- Kick: sine oscillator, pitch envelope from ~150 Hz down to ~40 Hz over
  ~150 ms, matching amplitude decay.
- Snare: filtered noise burst + a short tone, ~150 ms decay.
- Hi-hat: high-passed noise, very short (~50–100 ms) decay.
- Perc: short pitched blip (triangle osc, fast pitch drop), ~100 ms.

**Recording model.** A hit only ever marks a step true, never false — clicking
is the only way to clear a step, so recording can't accidentally erase
existing work. Hits quantize to the nearest step boundary.

**Ambient layer.** Two detuned oscillators → lowpass filter → `StereoPannerNode`
→ gain. An LFO permanently drives the panner (never a static value) whenever
the layer is audible. It has its own on/off toggle, independent of the
rhythm Play/Stop, so it can run alone, with the loop, or not at all. The
player's drag control maps X → LFO rate (sweep speed) and Y → filter cutoff
(brightness); a separate intensity control maps to LFO depth (stereo width)
and/or output level. Full keyboard parity for this one control (e.g.
arrow-key nudging) is a stretch, not core — the pads and grid already carry
full keyboard playability.

**Audio lifecycle.** One `AudioContext`, created once, resumed lazily on the
first user gesture anywhere in the UI (a pad tap, a grid click, a transport
button, or the ambient drag). No separate "tap to start" splash screen —
"invites the first sound" has to come entirely from how inviting the pads
look, since no audio plays before that first gesture.

**Layout.** Dark theme; each instrument gets one consistent color across its
pad and its grid row. Page structure, top to bottom: header (title + nav) →
transport bar (Play/Stop, REC, Clear, random-groove, BPM) → pads → step grid
→ **ambient bar**. The ambient bar is a persistent strip pinned to the
bottom of the viewport (`position: sticky` or `fixed`, with matching
bottom-padding on the content above it so nothing sits underneath it) —
always reachable without scrolling, on both viewports. It holds the on/off
toggle, the XY drag control, and the intensity control in a single compact
row on desktop; on phone these wrap/stack within the same bar rather than
growing tall, and the drag control shrinks (down to roughly 100–120px) so
the bar stays a strip, not another full section. Page-level vertical
scrolling is fine and expected on phone (pads + grid + everything else won't
all fit above the fold); page-level *horizontal* scrolling is not — the
16-step grid keeps all 16 steps per row but scrolls horizontally within its
own container instead. Watch for mobile browser chrome (address bar,
gesture bar) overlapping a fixed bottom bar — verify in `agent-browser` at
the real 390×844 viewport, not just assumed from CSS.

**Testing approach.** Web Audio output itself isn't observable in jsdom, so
automated tests are either (a) structural/DOM assertions against the built
`dist/` output, in the style of the existing invariants and `crit-4.test.ts`,
or (b) pure-function unit tests for logic deliberately extracted from the
DOM/AudioContext wiring (step-timing math, grid state transitions). Audible
correctness — does the kick actually sound like a kick, does the pan actually
sweep — is verified by ear in the running dev server, not by a test.
