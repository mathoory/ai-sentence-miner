# sentence-mine — orientation for Claude

Human-facing docs are in [README.md](README.md). This file is for you.

## What you do here

Run the `mine` skill at `.claude/skills/mine/SKILL.md`. It turns word/list/marked-sentence input into Anki cards via the `anki-mcp` MCP server. The active profile under `.claude/skills/mine/profiles/` is the source of truth for language facts — never hardcode language-specific behavior in the skill itself.

Cards also get **Argentine-accent audio** (ElevenLabs, voice "Agustín") on `word_audio` + `sentence_audio`. Audio is **not** generated inline by hand — the skill delegates to `scripts/backfill.mjs`, the single audio path. See the Audio section below.

## Conventions

- **Be terse.** No narration, no preamble. One line per card: `✓ <lemma> (note <id>)`.
- **First invocation only**: verify deck/note-type/fields exist (per SKILL.md). Cache the result; subsequent calls skip verification.
- **Batch lists.** Comma/whitespace/newline-separated → one `addNotes` call, not a loop.
- **Don't dedupe by default.** AnkiConnect's first-field uniqueness handles it. Only run `findNotes` if the user passes `--check-dupes`.
- **Adding a profile**: copy `profiles/_template.md`, name it `<language-code>-<learner>.md`, fill in. Skill core does not change.

## Audio (ElevenLabs → Anki)

- **One path:** `scripts/backfill.mjs`. The skill, after creating cards, runs `node scripts/backfill.mjs --notes <ids>`. To catch up the whole deck, run it with no args. Never hand-write `[sound:...]` fields.
- **Credit-aware by design.** The script pre-flights the ElevenLabs plan. Agustín is a *library voice* → needs a **paid** plan. On the free tier the script skips cleanly and leaves cards text-only; rerun on a paid plan to fill them. So: mine anytime on any plan; re-up + run the script occasionally to fill audio; downgrade. The mp3s live permanently in Anki, so you only ever pay for *new* audio.
- **Setup:** needs `ELEVENLABS_API_KEY` in `.env` (gitignored). Full details in [docs/TTS_SETUP.md](docs/TTS_SETUP.md). Voice/model/scope live in the profile's `tts` block; the deck/voice constants are mirrored at the top of `backfill.mjs`.
- **Gotcha:** keep Anki's Browse window closed during an audio run — an open editor silently clobbers `updateNoteFields`.

## When MCP tools fail

- Anki not running → AnkiConnect refuses → surface the error, stop, ask the user to start Anki.
- Deck or note type missing → report which check failed, stop. Do not invent a substitute.
- ElevenLabs free tier / out of credits → audio is skipped, not failed. Cards keep their text; report it and move on.

## Things to leave alone unless asked

- `key_field` in profile frontmatter is currently unused (keeping for forward-compat).
- `image` and `Definitions 2` fields are intentionally empty — see [BACKLOG.md](BACKLOG.md). (`word_audio`/`sentence_audio` are now wired — see Audio above.)
