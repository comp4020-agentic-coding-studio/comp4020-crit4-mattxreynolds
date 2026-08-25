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

8. **Responsive layout pass.** Dark theme; consistent color per instrument
   across its pad and grid row. Build the page structure from `PLAN.md`'s
   layout decision: header → transport bar (Play/Stop, REC, Clear,
   random-groove, BPM) → pads → grid → a persistent ambient bar pinned to
   the bottom of the viewport, sized to stay a compact strip (control
   shrinks on phone) rather than another full section. Phone layout: pads as
   2×2, the 16-step grid scrolling horizontally within its own container
   (not the page).
   - Done when: verified in `agent-browser` at both 1920×1080 and 390×844,
     including scrolling the page on phone to confirm the ambient bar stays
     visible and isn't overlapped by mobile browser chrome.
   - Acceptance: no page-level horizontal scroll at either viewport; content
     above the ambient bar has padding so nothing sits underneath it; every
     control is reachable and usable at both sizes; invariants stay green.

10. **First-impression & copy pass.** Real title, meta description, and
    `og:image`/card update per `CLAUDE.md`; delete `spec/starter.test.ts` and
    its `data-testid="intro"` element; make sure the opening screen — with no
    audio playing and no instructions — visibly invites a first tap.
    - Done when: a fresh look at the page (no prior context) makes it obvious
      what to do without reading anything.
    - Acceptance: all invariants green; `pnpm check` fully green.

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

## Polish

_(empty — populated by review against the spec once the backlog above is built)_
