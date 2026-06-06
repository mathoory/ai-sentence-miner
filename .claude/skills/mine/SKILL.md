---
name: mine
description: Turn a word, list of words, or marked sentence into Anki cards. Triggers on `mine: <input>`, `/mine <input>`, `add <word> to anki`, or any clearly-vocabulary-capture message in the user's target language. Reads the active profile under profiles/ for language-specific rules — switch profiles to switch language or learner. Pushes cards live via the anki-mcp MCP server.
---

# mine

Thin wrapper. No language facts here — they live in `profiles/`.

## Execution discipline

- **Be terse.** No narration, no chain-of-thought in output. Generate the card, call the tool, report one line.
- **Single word → fast path.** Skip exploration. Generate fields per profile rules and call `addNote` immediately.
- **Cache once per session.** After the first invocation succeeds, skip deck/note-type/field verification on subsequent calls.
- **Don't dedupe by default.** AnkiConnect natively rejects duplicates if the first field is unique. Only run `findNotes` if the user passes `--check-dupes` or asks explicitly.
- **Prefer batches.** If the user gives a list, use `addNotes` (one MCP call) instead of looping `addNote`.

## Load profile

1. `profiles/active.md` if present.
2. Otherwise the only `.md` in `profiles/` not starting with `_`.
3. Otherwise ask once.

The profile defines: `language`, `target_dialect`, `learner_level`, `learner_native`, `learner_strong`, `deck`, `note_type`, `key_field`, `tags`, `tts` (optional audio config), field rules, technical commitments, style.

## Modes

| Input shape | Mode |
|---|---|
| Single word / short phrase | **word** — generate example sentence per profile |
| Comma/newline/whitespace-separated list (2+ tokens) | **list** — batch via `addNotes` |
| Sentence with marked target (`**word**`, `*word*`, `{word}`, `"word"`) | **sentence** — use verbatim, lemmatize target |

## Workflow

**First invocation in session only:**
1. `listDecks` — confirm `profile.deck` exists.
2. `modelNames` — confirm `profile.note_type` exists.
3. `modelFieldNames` — confirm every profile field rule maps to a real field.

If any check fails: report once, stop. Otherwise cache success and skip these on subsequent calls.

**Every invocation:**
1. Generate/extract content per profile field rules. Empty fields stay empty strings — leave audio fields empty here; they're filled in step 4.
2. (Optional, only with `--check-dupes`) `findNotes` against `deck:"<deck>" "<key_field>":"<lemma>"`.
3. `addNote` (one) or `addNotes` (batch). Apply `profile.tags`. **Capture the returned note id(s).**
4. **Audio** — only when `profile.tts` is set. After the cards exist, run the single audio path:
   ```
   node scripts/backfill.mjs --notes <comma-separated new note ids>
   ```
   It synthesizes word+sentence audio (profile voice), stores the mp3s in Anki, and attaches them. It is **credit-aware**: on a paid ElevenLabs plan it fills audio immediately; on the free tier it prints a notice and leaves the cards text-only (a later run on a paid plan fills them). Surface the script's summary line. **Never block or fail card creation on audio.** Remind the user to keep Anki's Browse window closed while it runs (an open editor clobbers field updates).
5. One line per card: `✓ <lemma> (note <id>)`, adding 🔊 when audio attached this run. For batches: `✓ added N, skipped M, errors K`, then the audio summary line.

If AnkiConnect returns a duplicate error, surface it as `⚠ <lemma> already exists` and continue with the rest.

## Never

- Fill `image` or `Definitions 2` (backlog-marked). Audio (`word_audio`, `sentence_audio`) is owned by `scripts/backfill.mjs` — never hand-craft `[sound:...]` fields.
- Hardcode language facts — or the TTS voice/provider — in this file. Voice + scope live in `profile.tts`; the audio pipeline lives in `scripts/`.
- Modify existing notes without explicit user request.
