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

The profile defines: `language`, `target_dialect`, `learner_level`, `learner_native`, `learner_strong`, `deck`, `note_type`, `key_field`, `tags`, field rules, technical commitments, style.

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
1. Generate/extract content per profile field rules. Empty fields stay empty strings.
2. (Optional, only with `--check-dupes`) `findNotes` against `deck:"<deck>" "<key_field>":"<lemma>"`.
3. `addNote` (one) or `addNotes` (batch). Apply `profile.tags`.
4. One line per card: `✓ <lemma> (note <id>)`. For batches: `✓ added N, skipped M, errors K`.

If AnkiConnect returns a duplicate error, surface it as `⚠ <lemma> already exists` and continue with the rest.

## Never

- Generate audio, images, or fill backlog-marked fields.
- Hardcode language facts in this file.
- Modify existing notes without explicit user request.
