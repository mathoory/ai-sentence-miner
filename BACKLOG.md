# Backlog — sentence-mine

Ideas worth doing later. Triage when v1 has soaked enough to know what's actually missing.

## v1 → v2 candidates

**Audio fields — Argentine accent specifically.** Wire `word_audio` and `sentence_audio`. Argentine accent is non-negotiable; generic "Spanish (Spain)" or neutral LatAm TTS would defeat the purpose. Open questions to resolve before building:
- *Real-voice route:* Forvo has crowd-sourced pronunciations filterable by country (`forvo.com/word/<x>/#es` → tagged Argentina). Coverage is spotty for full sentences but solid for single words. Could pull word_audio from Forvo and skip sentence_audio entirely.
- *TTS route:* ElevenLabs and Azure Neural TTS both ship Argentine Spanish voices (`es-AR`). ElevenLabs voice library has rioplatense voices specifically. Cost is per-character; for ~5 cards/day this is trivial.
- *Hybrid:* word_audio from Forvo (real voice, free), sentence_audio from TTS (fills gaps). Probably the right answer.
- *Pull from real input?* Lessons with Mijal, Dreaming Spanish episodes, podcasts the user already listens to — could timestamp-extract real sentence audio. Higher effort, much higher quality. Belongs in a longer-term bucket.
- Probably the highest-value next step; audio is what makes cards stick on mobile.

**Weekly progress report (sibling skill).** A `/progress` or `/weekly` skill that queries AnkiConnect and renders a markdown report — either printed or appended to `_AI/habits/spanish/sessions/YYYY-MM-DD.md`. Available data: cards added (`added:7 tag:mined::es-AR`), reviews done + retention %, cohort progress (cards mined N weeks ago, % now mature), struggle list (low ease / repeated lapses), deck-level deltas. The report is only useful if it's *actionable* — the struggle list and cohort retention curve tell you whether to slow mining or address specific gaps; raw counts are vanity. Could schedule via cron to run every Sunday. Closely related to the vocab-tracking entry below — likely the same project.

**Vocabulary tracking & progress dashboard.** No structured way today to answer "how many words do I know? which lessons drove the most retention? where are my gaps?" Existing tools to evaluate before building:
- *Anki-native:* Anki's built-in stats already cover review counts, retention %, mature card count. Add-ons like *Advanced Browser*, *Heatmap*, *Review Heatmap* extend this. Free, lives where the cards already are.
- *Refold tracker* (Refold itself ships a vocab/immersion tracker tied to their methodology — relevant since the note type is Refold's).
- *Lingq / Migaku / Readlang:* track known-word counts across reading. Different mental model (passive recognition over time, not flashcard-driven). Could complement Anki rather than replace it.
- *Custom Obsidian dashboard:* a sibling skill/script that pulls AnkiConnect stats into `_AI/habits/spanish/` and renders a weekly snapshot — total mature cards, new cards/week, lessons each lemma traces back to. Tightest integration with the coaching system already in the vault.
- Decide based on which question matters most: "am I retaining" (Anki built-ins), "what's my total vocab size" (Lingq-style), or "is my study habit healthy" (custom dashboard).

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
