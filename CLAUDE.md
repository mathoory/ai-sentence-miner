# sentence-mine

A Claude-driven sentence-mining tool: word/list/marked-sentence in → Anki card out.

## Layout

- `.claude/skills/mine/SKILL.md` — generic skill core (no language-specific facts)
- `.claude/skills/mine/profiles/<name>.md` — language + learner profile (the swappable layer)
- `.claude/commands/mine.md` — `/mine` slash command
- `.mcp.json` — registers `@ankimcp/anki-mcp-server` (requires Anki desktop running)
- `BACKLOG.md` — durable backlog

## Trigger

`/mine <input>` or natural-language phrasing — `mine: che`, `add laburo to anki`. Both routes hit the same skill and follow the active profile.

## Adding a language or learner

Drop a new profile in `profiles/` based on `_template.md`. Skill core never changes.
