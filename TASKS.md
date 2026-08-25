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

12. **Generative scheduling, wired to the Ambient toggle.** An
    `AmbientScheduler`-style class (same shape as `Scheduler`, but
    real-time/`setTimeout`-based, not audio-clock-locked — event spacing is
    seconds, not sixteenth notes) triggers a bloom after a random interval
    within the configured min/max bounds, unlocked from the sequencer's
    grid/tempo entirely. Wire `#ambient-toggle`'s click handler: on starts
    the scheduler (and updates `aria-pressed`/label like the old toggle
    did), off stops it — future events only, never hard-cutting a bloom
    already in flight.
    **Done when:** unit tests (fake timers) show every interval stays
    within the configured bounds, toggling on twice never creates a second
    concurrent schedule, toggling off leaves zero pending timers, and
    re-enabling schedules fresh rather than resuming stale state; manual
    check in `agent-browser` that toggling repeatedly and leaving the tab
    open doesn't accumulate anything unbounded.
13. **Static per-event stereo field.** Pure, unit-tested pan-position
    function (sine/cosine-derived per the Pd reference) called once per
    event to give that bloom its own fixed position — never a sweep, never
    shared across events. Wire it into the voice spawned by the scheduler.
    **Done when:** the pan function is unit-tested for boundedness and for
    producing varied (not clustered) positions across repeated calls;
    spatial convincingness itself is a listening judgment, not a test.
14. **Pitch integration.** Pure `pickAmbientPitch`-style function drawing
    from the pentatonic collection decided in `PLAN.md`, respecting the
    configured octave range; wired into the scheduler so each event picks
    its own note. **Done when:** the pitch-selection function is
    unit-tested (always returns a collection member, respects octave
    bounds); `pnpm check` green. **Stop here** — per the brief, this is the
    checkpoint for listening feedback before any further ambient work
    (visual polish, a second control, a second preset).

### Stretch (only if the above is solid with time to spare)

- A second ambient character/preset, once the first pass is validated.
- Per-pad volume.
- Promoting one ambient tuning parameter (density/spread/drift) to a real
  second user-facing control, once listening feedback picks which one.

## In progress

11. **Ambient bloom voice + manual audition (replaces task 7's continuous
    drone).** Remove `ambient.ts`'s always-running detuned-oscillator/LFO
    graph and `ambient-mapping.ts`'s XY/intensity mapping functions (and
    their test file) — they're for a design we're no longer building. Add a
    tuning-constants module (spacing bounds, attack/hold/release, filter
    range, vibrato rate/depth, FM ratio/index, octave range, stereo spread,
    master level) and a voice factory that builds one one-shot "bloom": a
    saw-ish oscillator → lowpass filter (with restrained 2-op FM in) →
    panner → gain into the shared `masterGain`, envelope
    attack→hold→release via smooth ramps, plus subtle vibrato. Expose a
    dev-only console trigger (e.g. `window.__ambientTest`) to audition it
    repeatedly — no visible UI yet beyond the existing inert `#ambient`
    section/toggle markup (kept, not yet wired). Update
    `spec/prototype.test.ts`'s "ambient layer (task 7)" describe block and
    the task-9 assertion that referenced `#ambient-xy`'s explicit ARIA role
    to match the control that will actually exist (the single toggle)
    instead of the removed drag/intensity controls — do this now, not
    later, so the suite stays honest about what the page has rather than
    green-by-accident.
    **Done when:** repeated console-triggered blooms produce no clicks, no
    accumulating nodes (checked by ear/DOM node count in dev tools), and
    finish cleanly; `pnpm check` is green against the *updated* spec
    contract. **Test policy:** unit tests for any pure helper extracted
    (e.g. envelope timing math); audible quality is verified by ear, not by
    a test, per `PLAN.md`.

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

## Polish

_(empty — populated by review against the spec once the backlog above is built)_
