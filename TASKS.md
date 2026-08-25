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

_(empty)_

### Stretch (only if the above is solid with time to spare)

- A second ambient character/preset, once the first pass is validated.
- Per-pad volume.
- Promoting one ambient tuning parameter (density/spread/drift) to a real
  second user-facing control, once listening feedback picks which one.

## In progress

18. Boost step-grid contrast — see Polish for scope.

## Blocked

_(empty)_

## Done

1. Web Audio foundation + page skeleton — 4a54f3e
2. Drum pads — 1da27e4
3. Sequencer clock + grid state + transport — bf0f8f1
4. Click-to-toggle step editing — 6736ac7
5. Preset grooves + random-groove button — c7e4bd5
6. Live recording into the grid — 7e563cc
7. Ambient layer (continuous drone design; superseded by tasks 11–14's
   generative field) — 4e9675e
8. Responsive layout pass — 2a04b81
9. Accessibility & keyboard pass — 6f12f4b
10. First-impression & copy pass — 6d71273
11. Ambient bloom voice + manual audition (replaces task 7's continuous
    drone) — a7d39fb
12. Generative scheduling, wired to the Ambient toggle — 91634d2
13. Static per-event stereo field — d06cb73
14. Ambient pitch integration (pentatonic pick per bloom) — 558d49c.
    **Stopped here per the brief** — awaiting listening feedback before any
    further ambient work.
15. Style the BPM range input — 04e90b2
16. Rebalance the transport bar at wide viewports — 845e6df
17. Differentiate REC from Clear / Random groove — ce53feb

## Polish

Scope for this pass: desktop (1920×1080) only, visual/CSS only — no layout
structure or DOM order changes (grid-above-pads from `cbad5d7` stands).
Phone (390×844) still needs a look before ship, but that's a separate pass,
not folded into this one.

18. **Boost step-grid contrast.** `--bg-step` and `--bg-elevated` sit one
    shade apart, so off steps barely register against the grid's own
    container — at a glance it reads as a dark slab with faint seams
    rather than a legible 4×16 grid.
    - Done when: individual off steps are clearly distinguishable from the
      grid container background at a glance, at both idle and mid-loop
      (`.step--current` outline still reads clearly against the new
      contrast).
    - Acceptance: verified visually in `agent-browser`; `--bg-step` (or
      `.step`'s border/background) adjusted, other tokens untouched unless
      needed.

19. **Add surface depth.** The page is currently flat — no shadows,
    gradients, or elevation anywhere except the pad-invite glow and hover
    states. Add restrained depth to key surfaces (pads, grid container,
    transport buttons) so the page reads as an instrument with presence
    rather than a set of flat rectangles.
    - Done when: pads/grid/transport have a subtle sense of elevation
      (e.g. soft shadow or gradient) that doesn't fight the existing hover/
      pressed states or the pad-invite animation.
    - Acceptance: verified visually in `agent-browser` at 1920×1080;
      `prefers-reduced-motion`/`hover: hover` guards stay intact.
