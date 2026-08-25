# Crit 4 reflection

**The breakthrough.** Rewriting `CLAUDE.md` around three self-triggering
skills ([`673a940`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-mattxreynolds/commit/673a940))
was the moment the harness stopped being a file I edited reactively and
became something I could audit. Reading the old version end-to-end before
cutting it down surfaced a rule an *earlier* rewrite had already silently
dropped — proof that a standing-instructions file degrades quietly unless
someone actually rereads it rather than just appending to it. The same
session, a `.gitignore` line written for a different reason (keeping API
keys out of `.claude/`) turned out to also be swallowing the new skill files
I'd just written. Neither problem would have shown up in a diff of what I
added; both only showed up by checking what the change actually did against
what I'd already committed to.

**What it changed.** I came in treating checks — tests, linters, the
evidence gate — as the thing that catches mistakes in the *product*. This
week's real catches (a spec test that silently stopped seeing shipped audio
because Vite inlined it away, an aria-label that read fine in the DOM but
was invisible to assistive tech, a sticky label that only detached 80%
through a scroll a static screenshot would never show) were all cases where
the check I already had wasn't wrong, but wasn't looking at the right
artifact — the built output, the live accessibility tree, the scrolled
state. I want to be the kind of developer who treats "the check passed"
as a claim about *what was checked*, and asks that question before trusting
the green.
