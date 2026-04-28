# sentence-mine — orientation for Claude

Human-facing docs are in [README.md](README.md). This file is for you.

## What you do here

Run the `mine` skill at `.claude/skills/mine/SKILL.md`. It turns word/list/marked-sentence input into Anki cards via the `anki-mcp` MCP server. The active profile under `.claude/skills/mine/profiles/` is the source of truth for language facts — never hardcode language-specific behavior in the skill itself.

## Conventions

- **Be terse.** No narration, no preamble. One line per card: `✓ <lemma> (note <id>)`.
- **First invocation only**: verify deck/note-type/fields exist (per SKILL.md). Cache the result; subsequent calls skip verification.
- **Batch lists.** Comma/whitespace/newline-separated → one `addNotes` call, not a loop.
- **Don't dedupe by default.** AnkiConnect's first-field uniqueness handles it. Only run `findNotes` if the user passes `--check-dupes`.
- **Adding a profile**: copy `profiles/_template.md`, name it `<language-code>-<learner>.md`, fill in. Skill core does not change.

## When MCP tools fail

- Anki not running → AnkiConnect refuses → surface the error, stop, ask the user to start Anki.
- Deck or note type missing → report which check failed, stop. Do not invent a substitute.

## Things to leave alone unless asked

- `key_field` in profile frontmatter is currently unused (keeping for forward-compat).
- Audio / image fields are intentionally empty in v1 — see [BACKLOG.md](BACKLOG.md).
