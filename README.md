# sentence-mine

A Claude-driven sentence-mining tool: word, list, or marked sentence in → Anki card out.

Built around the idea that Claude already knows your target language, your dialect, your level, and (if you tell it) your life — so generating an Anki card with a *good* example sentence is mostly a matter of asking. This repo is the asking, made repeatable.

## What it does

Given input like:

```
mine: che
mine: propio nivel leyendo así regla
mine: "se hace el boludo, no quiere darse cuenta"
```

…the skill generates fields per the active profile (lemma, definition, example sentence, translation), wraps the target word in `<b>...</b>`, applies tags, and pushes the card straight into Anki via the [anki-mcp](https://github.com/ankimcp/anki-mcp-server) MCP server. No CSV export, no manual paste — the card is in your deck before you finish reading the result line.

Three input modes:

| Input shape | Mode |
|---|---|
| Single word / short phrase | **word** — generate an example sentence per profile rules |
| Comma / newline / whitespace-separated list | **list** — batch via `addNotes` (one MCP call) |
| Sentence with marked target (`**word**`, `*word*`, `{word}`, `"word"`) | **sentence** — preserve the sentence verbatim, lemmatize the target |

## Why

Most flashcard pipelines either dump dictionary glosses (sterile, hard to retain) or require manually crafting every example sentence (slow, kills the habit). LLMs make the middle path cheap: one well-prompted skill produces cards that sound like they came from a friend who knows your dialect, with example sentences calibrated to your level.

The tradeoff: card quality is only as good as the profile. A vague profile produces vague cards. The es-AR profile in this repo is opinionated for a reason — it specifies voseo, lunfardo register, Argentine cultural anchors, and the user's actual life context. Generic profiles give generic cards.

## Architecture

```
.claude/
  skills/mine/
    SKILL.md                  # generic skill core — no language-specific facts
    profiles/
      _template.md            # starter for new languages/learners
      es-AR-mattan.md         # Argentinian Spanish for the current learner
  commands/
    mine.md                   # /mine slash command — thin wrapper around the skill
.mcp.json                     # registers anki-mcp via npx
CLAUDE.md                     # orientation for Claude when entering this repo
BACKLOG.md                    # ideas worth doing later
```

The skill core is **language-agnostic on purpose**. To add a new language or a new learner, drop a profile in `profiles/` based on `_template.md`. The skill picks it up automatically. Nothing in `SKILL.md` should ever hardcode a language fact.

## Setup

**Prerequisites:**

- [Anki desktop](https://apps.ankiweb.net/) running (this is what AnkiConnect needs)
- [AnkiConnect add-on](https://ankiweb.net/shared/info/2055492159) installed in Anki
- A note type and deck that match what your profile declares (the default profile expects the *Refold Sentence Miner: Sentence* note type and a deck named *Spanish Sentence Mining*)
- [Claude Code](https://claude.com/claude-code) (or the Claude Agent SDK) with this repo as its working directory
- Node.js 18+ (the `.mcp.json` bootstraps `@ankimcp/anki-mcp-server` via `npx`; if you don't want to depend on `npx`, pre-install the package globally and edit `.mcp.json` to point at the binary)

**Steps:**

1. Clone this repo.
2. Open the project in Claude Code. The `.mcp.json` registers `@ankimcp/anki-mcp-server` on first run via `npx`.
3. Confirm the active profile matches your setup. The skill loads the only `.md` in `profiles/` not starting with `_`. To use a different profile, either rename existing ones or add `profiles/active.md` as an explicit pointer (see backlog).
4. Try it: `mine: hola`. If Anki is open, you'll see a new card.

The first invocation in a session does a one-time check that the deck, note type, and field names declared in the profile actually exist. If anything's missing, the skill stops and tells you which check failed.

## Usage

Natural-language phrasing works the same as the slash command:

```
/mine boliche
mine: boliche
add boliche to anki
```

Lists batch automatically:

```
mine: che, dale, posta, quilombo
```

Sentence mode preserves your sentence verbatim and only lemmatizes the bolded target:

```
mine: "no seas **boludo**, vení para acá"
```

Per-card output is one line: `✓ <lemma> (note <id>)`. Batches collapse to `✓ added N, skipped M, errors K`.

## Adding a language or a learner

Copy `profiles/_template.md` to `profiles/<your-profile>.md` and fill in:

- The frontmatter (language, dialect, learner level, deck, note type, tags)
- **Technical commitments** — non-negotiable rules of the dialect (pronoun system, conjugation conventions, punctuation quirks, etc.)
- **Field rules** — for each field of the note type, what goes there
- **Style** — what a good card *feels* like for this language and learner
- **Cultural anchors** — real contexts for example sentences, so they feel alive instead of stock-tourist

The skill core never changes. If a new language requires changing the skill itself, that's a bug in the profile schema, not the skill.

## Status

v1, single user, single language. Audio fields are intentionally empty — see [BACKLOG.md](BACKLOG.md) for the full v2 candidate list (highlights: Argentine-accent audio via Forvo + ElevenLabs `es-AR`, weekly progress reports queried from AnkiConnect, vault integration with Obsidian).

## License

No license declared yet — treat as personal-use code. If you want to fork it for your own language/learner, go ahead; if you want to redistribute, open an issue first.
