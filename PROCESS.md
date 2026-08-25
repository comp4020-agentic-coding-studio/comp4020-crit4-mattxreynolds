# Process overview

A reading-guide to how the work came together --- a map to your process, not an
essay about it. Markers read this file and follow its citations; they don't
trawl the repo for evidence you didn't point at, so if a moment mattered, cite
it.

This file is the shape; the course site's
[assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#what-you-submit)
is the requirement, and its
[word counts](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#word-counts)
cover every deliverable.

## What I built

Driftbeat, a browser-based drum-pad instrument: four synthesized drum pads
(kick/snare/hi-hat/perc, no audio files) are the primary, immediate
interaction, with a 16-step grid underneath that's both a recording target
and directly clickable, so a groove can be drummed in live or built by hand
and freely switched between. A sparse generative ambient layer shares the
same screen with its own independent on/off --- isolated synthesized tones
bloom occasionally at fixed stereo positions, staying clearly subordinate to
the sequencer rather than competing with it.

## The moments that mattered

> Task 1's acceptance check (`spec/crit-4.test.ts`, "makes sound live via the
> Web Audio API") scans shipped `.js` files for `AudioContext`, but Astro/Vite
> inlines any built script under 4kb straight into the HTML --- reusing
> `assetsInlineLimit`, a setting meant for images --- instead of emitting a
> `.js` file at all. A correct, fully synthesized audio implementation
> vanished from the check's view rather than failing it, which is worse: a
> silently-skipped check reads as passing. I fixed it at the config level
> (`assetsInlineLimit: 0` in `astro.config.ts`) rather than widening the
> test's file scan, so "shipped as JS" keeps meaning a real asset for
> everything the rest of the build produces, not just this one check.
> Confirmed by rebuilding and finding the drum-pad script present in `dist/`
> as its own `.js` file, with the spec test passing against the real build
> rather than an inlined one
> ([`cbfb7c2`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-mattxreynolds/commit/cbfb7c2)).

> Partway through the build, `CLAUDE.md` had accumulated both the standing
> facts a session needs every time and a full procedural essay --- the
> working loop, a sensor-by-sensor writeup, a stale lint step from a check
> that no longer exists --- that only needed reading once per stage, not
> repeated every turn. Rather than keep trimming prose in place, I split it:
> `CLAUDE.md` keeps only what's true every session, and the actual multi-stage
> workflow moved into three self-triggering skills (`ideate`, `plan`,
> `working-loop`). Reviewing what the old version actually said before
> deleting it surfaced two things a straight rewrite would have lost: a
> "verification precedes done" rule that an *earlier* redesign had already
> silently dropped, which I restored in the new skills rather than letting a
> second rewrite repeat the same loss; and a `.gitignore` gap --- `.claude/`
> was wholesale-excluded for API-key safety, which would have made the new
> skills themselves invisible to git the moment I created them. I checked
> `git status` after adding the skill files specifically to catch that before
> it became a real problem, not after
> ([`673a940`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-mattxreynolds/commit/673a940)).

> The random-groove button picked a preset uniformly at random on every
> press, which meant it could hand back the exact same groove twice in a
> row --- indistinguishable from the button doing nothing, from the player's
> side. Rather than fix this by eyeballing the transport wiring, I wrote a
> failing test first (`pickRandomPreset` must never return whichever preset
> was excluded) so the requirement was pinned down as "never repeats the
> previous pick," not just "usually feels random." The fix threads an
> optional `exclude` parameter through `pickRandomPreset` and has the
> transport remember its last pick to pass back in. The test went red
> against the old unconditional-random implementation and green once
> `exclude` filtered the candidate list, which is what told me the fix
> matched the requirement rather than just changing behaviour in roughly the
> right direction
> ([`b5288c8...9534baa`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-mattxreynolds/compare/b5288c8...9534baa)).

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that a
reflection entry the marker reads is in `reflections/`, and that your
`CLAUDE.md` is there --- before a marker ever opens the file. It checks that
your map is traceable, not that it is good: the marker judges whether your
small, deliberately chosen set of moments shows real judgement and reflection. A
green check is not a substitute for that curation.

Images aren't checked: whether one renders is visible the moment you look. Open
this file on GitHub and look at it before you ship.
