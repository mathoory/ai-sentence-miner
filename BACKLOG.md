# Backlog — sentence-mine

Ideas worth doing later. Triage when v1 has soaked enough to know what's actually missing.

## v1 → v2 candidates

**Audio fields** — wire AwesomeTTS or pre-generated mp3s for `word_audio` and `sentence_audio`. Probably the highest-value next step; audio is what makes cards stick on mobile.

**Image field** — manual paste, or an auto-pick from a curated source. Unclear if worth the friction; revisit only if reviews feel too text-heavy.

**`Definitions 2` content** — currently empty. Candidates:
- A simple Spanish definition once the learner is solidly A2+ (Refold-canonical).
- A near-synonym in the target language.
- A common collocation.
- A Hebrew bridge for grammar that doesn't map through English.

**Bulk capture file** — a `vocab.txt` (or a daily-note section in Obsidian) the user appends to during the day from any device. A second skill batch-processes it on demand. Solves the mobile-capture gap.

**Cloze-format alternative** — for the same word, optionally produce a cloze card alongside the recognition card. Compare retention later.

**Mobile-direct add** — currently desktop-only since AnkiConnect needs the desktop app. Revisit if it becomes a real bottleneck (likely won't, given the desktop → AnkiWeb → AnkiMobile pipeline already works).

## Vault-integration ideas (Mattan-specific, but inspirational for any user)

**Cross-reference `MOC Vocabulario Español.md`** — before minting, check whether the lemma already lives in the user's vault notes. If it does, pre-fill known meanings or offer to skip.

**Hebrew-bridge mode for grammar** — when a grammar concept (gendered nouns, verb aspect, definite-article behavior) maps cleanly through Hebrew but not English, render a one-line Hebrew analogy on the card. Likely belongs in `Definitions 2`.

**Phase-aware tagging** — read the current phase from `_AI/habits/spanish/plan.md` and apply `phase-2`, `phase-3`, etc. as a tag on every minted card. Lets retrospectives filter "what was I learning during the install phase vs the volume-expansion phase."

**Session-log integration** — append every minted card's lemma to the day's session log at `_AI/habits/spanish/sessions/YYYY-MM-DD.md`, so coaching reviews can see what was mined that week without querying Anki.

**Pull examples from Dreaming Spanish content actually watched** — instead of Claude inventing example sentences, pull them from real input the user has consumed. Requires DS content tracking (subtitles? watched-episode log?). Longer-term.

**Sheísmo pronunciation hint** — for words containing `ll` or `y`, optionally render the Argentine pronunciation in `Definitions 1` (`calle [ˈkaʃe]`). Small, tasteful — but only worth it if the user actually wants pronunciation hints on cards.

**Vault-themed example bias** — when generating sentences, optionally pull from themes already alive in the user's notes (mate vocabulary, Argentine geography, family conversations) so examples feel continuous with the rest of the vault.

**`Recursos español.md` integration** — when the learner wants authoritative Argentine references, the skill can cite/link to the resources the user has already vetted.

## Architectural / multi-language

**`active.md` pointer** — formal mechanism for "which profile is current" instead of the skill heuristically picking. A one-line file pointing at `es-AR-mattan.md` would make multi-profile setups unambiguous.

**Second profile to validate the language-agnostic claim** — drop in a Czech profile or an English-for-someone profile and confirm the skill core needs zero changes. Best done when there's a real second use case, not as a synthetic test.

**Profile composition** — split each profile into two files: `language.md` (rules of the dialect) and `learner.md` (this user's level, native langs, preferences). Then language and user are independently swappable. Likely overkill for a single user; revisit if multiple learners share a language.

## Coaching-system integration (longer-term)

A sibling skill or hook that, on a Phase transition, reviews mined cards and reports on which lemmas are being retained vs. struggling — surfacing patterns into `_AI/habits/spanish/state.md`. Closes the loop: cards mined here become signal for the coaching system there.
