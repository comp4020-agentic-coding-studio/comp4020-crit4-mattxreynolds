# PLAN

## Thesis

A browser-based drum-pad instrument: four synthesized drum pads are the
primary, immediate interaction, and a 16-step grid sits underneath as both a
recording target and a directly-editable pattern — so you can either drum a
groove in live or build one by clicking, and switch between the two freely. A
sparse generative ambient layer lives on the same screen, its own on/off
independent of the rhythm: isolated synthesized tones surface occasionally
and unpredictably, each blooming briefly at its own fixed stereo position
before fading, never a continuous pad and never locked to the sequencer's
grid — it stays clearly subordinate to the sequencer, coloring the space
around it rather than competing with it.

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
- **Ambient layer (secondary mechanic, same screen, generative field):** a
  sparse field of isolated synthesized tones, asynchronous and unlocked from
  the sequencer's grid — long unpredictable gaps, then a single note blooms
  in, lingers briefly, and fades. Never a continuous pad, never audibly
  rhythmic. Each event gets its own fixed stereo position (not a sweep). It
  has one on/off control, independent of the rhythm transport — it can run
  alone, alongside the loop, or not at all. No other controls are exposed to
  the player for the first version; tuning lives in code (see below).
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

- A second ambient character/preset, once the generative field's first pass
  has been validated by ear.
- Per-pad volume.
- Promoting one of the ambient layer's tuning parameters (e.g. density,
  spread, drift) to a real second user-facing control — deferred until
  listening feedback on the first pass identifies which one is worth it.

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

**Ambient layer.** A generative field of isolated "bloom" voices, not a
continuous pad. Each event: a saw-ish oscillator (through a lowpass filter,
with a restrained two-operator FM colour layered in) with its own
attack → hold → release envelope (~600ms / 2–7s / ~1.8s — smooth
`setTargetAtTime`/linear ramps throughout, no clicks; lengthened from an
initial ~300ms/1–4s/~700ms per listening feedback), a subtle ~4Hz/±0.075
semitone vibrato so it never sits perfectly static, and its own fixed
`StereoPannerNode` position for that event only (sine/cosine-derived, not a
sweep). Voices are one-shot: built, played, and left to be garbage-collected
after their release finishes, the same lifecycle pattern `drums.ts` already
uses for one-shot pad hits. Event spacing (1.5–4s) is kept shorter than the
shortest possible voice duration, so blooms always overlap rather than
leaving a silent gap between them.

Events are scheduled asynchronously and independently of the sequencer's
grid/tempo — a timer picks the next gap randomly within a configured
min/max range (reference behaviour was 10–40s; the shipped starting value is
shorter so it's auditionable without a long wait, see the tuning-constants
module) and is never quantized to a step boundary, so no repeating pattern
against the beat is audible.

**Ambient pitch set.** The sequencer's four voices (kick/snare/hihat/perc)
are all unpitched, so there is no existing scale to inherit from the
pattern. Rather than inventing a harmony engine, each ambient event picks
one note at random from a small pentatonic collection (a handful of scale
degrees around a fixed root, spanning a couple of octaves via a configured
octave-range) — pentatonic because any two notes from it sound consonant
together with no voice-leading logic required, which matches "simplest
relationship that makes the layers feel connected" without the sequencer
having any pitch of its own to connect to.

It has one on/off control ("Ambient"), independent of the rhythm Play/Stop,
so it can run alone, with the loop, or not at all. No other parameter is
exposed as a UI control in this first pass — attack/release, filter
character, vibrato, FM index/ratio, octave range, stereo spread, and event
spacing bounds are developer-facing tuning constants in one module, not
instrument controls, until listening feedback says one of them earns a real
control (see Stretch).

**Audio lifecycle.** One `AudioContext`, created once, resumed lazily on the
first user gesture anywhere in the UI (a pad tap, a grid click, a transport
button, or the ambient drag). No separate "tap to start" splash screen —
"invites the first sound" has to come entirely from how inviting the pads
look, since no audio plays before that first gesture.

**Layout.** Dark theme; each instrument gets one consistent color across its
pad and its grid row. Page structure, top to bottom: header (title + nav) →
transport bar (Play/Stop, REC, Clear, random-groove, BPM, **and the Ambient
toggle**) → step grid → pads. Two decisions here superseded the original
plan during the desktop polish pass and were never written back until this
review: the grid moved above the pads (`cbad5d7`, "grid moved above the
pads and wrapped in its own tile") — the pads are still the primary
*interaction*, but the grid is the primary thing you look at first — and
the ambient toggle moved off a fixed bottom bar into the transport row
itself (`6ad34cd`, "drop the fixed footer bar"), so there is no
persistent bottom strip any more. Page-level vertical scrolling is fine and
expected on phone; page-level *horizontal* scrolling is not. The phone step
grid no longer scrolls horizontally at all — steps shrink to fit all 16 in
view instead (`6834c6b`).

That shrink has a known, accepted cost: at 390px wide, the 64 step buttons
land at ~19×19px, under the WCAG 2.2 AA 24×24px minimum target size (an
`agent-browser a11y`/axe audit at 390×844 confirms this as a serious
violation) — and the math doesn't leave room to fix it without giving up
something else: 16 columns at 24px each need ≥384px of pure track width
with zero gap, which is already the whole phone viewport before any page
margin. Kept as-is deliberately rather than reverting to horizontal scroll
or wrapping to two rows per instrument, because direct step-tapping on
phone isn't the only way to edit the grid: Recording via the four pads
(each comfortably touch-sized) reaches every step without needing to hit a
19px target, so the small steps are a secondary, best-effort interaction
rather than the only path — precise about which control on phone is
supposed to carry the load, not an oversight.

**Testing approach.** Web Audio output itself isn't observable in jsdom, so
automated tests are either (a) structural/DOM assertions against the built
`dist/` output, in the style of the existing invariants and `crit-4.test.ts`,
or (b) pure-function unit tests for logic deliberately extracted from the
DOM/AudioContext wiring (step-timing math, grid state transitions). Audible
correctness — does the kick actually sound like a kick, does the pan actually
sweep — is verified by ear in the running dev server, not by a test.
