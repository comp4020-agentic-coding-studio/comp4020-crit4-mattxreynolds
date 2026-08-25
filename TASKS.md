# TASKS

Execution strategy: sequential. Every task touches shared state (the grid
model, the shared `AudioContext`, `index.astro`, `global.css`) so there's no
genuinely independent slice to hand to a parallel subagent — build these in
order.

Test policy: tests are written alongside each task's own implementation and
are part of its completion condition, not a later pass. Per `PLAN.md`'s
testing-approach decision, that means structural/DOM assertions against
`dist/` for anything checkable that way, and pure-function unit tests for
logic pulled out of the DOM/AudioContext wiring (timing math, grid state).
Audible correctness is verified by ear in the dev server / `agent-browser`,
not by a test — say so per task rather than chasing an automated check for
something a test can't see.

## Backlog

_(empty — see Polish below)_

### Stretch (only if the above is solid with time to spare)

- A second ambient "space" preset.
- Per-pad volume.
- Keyboard control (arrow-key nudge) for the ambient layer.

## In progress

_(empty)_

## Blocked

_(empty)_

## Done

1. Web Audio foundation + page skeleton — 4a54f3e
2. Drum pads — 1da27e4
3. Sequencer clock + grid state + transport — bf0f8f1
4. Click-to-toggle step editing — 6736ac7
5. Preset grooves + random-groove button — c7e4bd5
6. Live recording into the grid — 7e563cc
7. Ambient layer — 4e9675e
8. Responsive layout pass — 2a04b81
9. Accessibility & keyboard pass — 6f12f4b
10. First-impression & copy pass — 6d71273

## Polish

_(empty — populated by review against the spec once the backlog above is built)_
