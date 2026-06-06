# Backlog — sentence-mine

Ideas worth doing later. Triage when v1 has soaked enough to know what's actually missing.

## Shipped

**Argentine-accent audio — done (2026-06).** `word_audio` + `sentence_audio` synthesized via ElevenLabs, voice "Agustín — Relaxed, Warm and Approachable" (rioplatense), applied by `scripts/backfill.mjs` (the single audio path). Credit-aware (skips cleanly on the free tier), idempotent, mp3s stored permanently in Anki. Profile carries a `tts` block; setup in [docs/TTS_SETUP.md](docs/TTS_SETUP.md). Trail so we don't re-litigate:
- Chose one consistent ElevenLabs voice across word + sentence over the Forvo/TTS hybrid (voice coherence > free crowd audio).
- Evaluated and rejected: Azure es-AR (registration friction + less expressive), local models Piper / XTTS-v2 / F5-TTS (quality below bar, even with cloning) — local needs a paid-tier-equivalent quality that open models don't hit yet.
- `voice_settings` matched to the web UI run that rendered sheísmo (stability 0.5 / similarity 0.75 / style 0 / speaker-boost). Isolated *word* clips still render sheísmo less reliably than sentences (short context + ElevenLabs non-determinism). Acceptable; revisit if it grates — fallback is sentence-only scope (`profile.tts.scope`).
- Still open: real-voice sentence audio timestamp-extracted from Dreaming Spanish / lessons the user actually consumed — higher quality, much higher effort. Longer-term.

## v1 → v2 candidates

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

**Sheísmo pronunciation hint** — for words containing `ll` or `y`, optionally render the Argentine pronunciation in `Definitions 1` (`calle [ˈkaʃe]`). *Largely covered now by audio* — Agustín pronounces the sheísmo — so this is only for **visual** reinforcement and is lower priority. One real angle remains: isolated `word_audio` clips render sheísmo less reliably than sentences, so a text hint could still help on single-word `ll`/`y` cards.

**Vault-themed example bias** — when generating sentences, optionally pull from themes already alive in the user's notes (mate vocabulary, Argentine geography, family conversations) so examples feel continuous with the rest of the vault.

**`Recursos español.md` integration** — when the learner wants authoritative Argentine references, the skill can cite/link to the resources the user has already vetted.

## Architectural / multi-language

**`active.md` pointer** — formal mechanism for "which profile is current" instead of the skill heuristically picking. A one-line file pointing at `es-AR-mattan.md` would make multi-profile setups unambiguous.

**Second profile to validate the language-agnostic claim** — drop in a Czech profile or an English-for-someone profile and confirm the skill core needs zero changes. Best done when there's a real second use case, not as a synthetic test.

**Parameterize `scripts/backfill.mjs` from the active profile.** It currently hardcodes deck/voice/model/scope/prefix constants that mirror `es-AR-mattan.md`'s `tts` block. The skill core and `tts.mjs` are profile-agnostic, but the audio orchestrator is not — a second audio-enabled profile would need these read from the profile frontmatter (parse it, or pass `--profile`). Fine while single-language; do it when a real second profile wants audio.

**De-duplicate the ElevenLabs `synth()` call.** `scripts/tts.mjs` and `scripts/backfill.mjs` each carry their own copy of the ElevenLabs fetch + `voice_settings` (~15 lines). Currently in sync but can drift. Extract a shared module — `tts.mjs` exports `synth()`, `backfill.mjs` imports it — when convenient. Low risk, low urgency.

**Profile composition** — split each profile into two files: `language.md` (rules of the dialect) and `learner.md` (this user's level, native langs, preferences). Then language and user are independently swappable. Likely overkill for a single user; revisit if multiple learners share a language.

## Coaching-system integration (longer-term)

A sibling skill or hook that, on a Phase transition, reviews mined cards and reports on which lemmas are being retained vs. struggling — surfacing patterns into `_AI/habits/spanish/state.md`. Closes the loop: cards mined here become signal for the coaching system there.
