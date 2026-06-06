# TTS audio setup (ElevenLabs → Anki)

How cards get Argentine-accent audio, and how to reproduce it from a clean checkout.

## The model

**Text is the source of truth; audio is a credit-aware enrichment pass.**

- Mining always creates cards — on any plan.
- **One script** applies audio: `scripts/backfill.mjs`. Nothing else writes `[sound:...]` fields.
- It pre-flights your ElevenLabs plan. The rioplatense voices are *library voices* → need a **paid** plan. On the free tier it skips cleanly and leaves cards text-only.
- mp3s are stored permanently in Anki, so you only ever pay for *new* clips.

**Steady-state loop:** mine freely on any plan → re-up for one month occasionally → `node scripts/backfill.mjs` → downgrade.

## Dependencies

- **Node ≥ 18** (built-in `fetch`). Already required by `anki-mcp`. The scripts have **zero npm dependencies**.
- **Anki desktop running** with AnkiConnect (the scripts talk to `http://localhost:8765`).
- **An ElevenLabs API key on a paid plan** (Starter+). Free tier cannot use library voices via the API.
- No Python, no `uv`, no extra MCP server, no local model.

## One-time setup

1. Get an API key: elevenlabs.io → Profile → API Keys → Create (enable **Text to Speech** + **Voices: read**).
2. Put it in the repo-root `.env` (gitignored — never committed):
   ```
   ELEVENLABS_API_KEY=sk_...
   ```

## Voice config — lives in the profile

Voice is **not** hardcoded in the skill. It's in the active profile's frontmatter
(`.claude/skills/mine/profiles/<profile>.md`):

```yaml
tts:
  provider: elevenlabs
  voice_id: ByVRQtaK1WDOvTmP1PKO        # Agustín — Relaxed, Warm and Approachable
  model_id: eleven_multilingual_v2
  format: mp3_44100_128
  voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true }
  scope: word+sentence                   # or: sentence
  filename_prefix: sm_esAR_
```

> **Coupling to know about:** `scripts/backfill.mjs` mirrors `deck / voice_id / model_id /
> format / scope / prefix / voice_settings` as constants at the top of the file. If you change
> the voice, change it in **both** the profile and `backfill.mjs`. (Parameterizing this is a
> BACKLOG item.) `voice_settings` were matched to the ElevenLabs web UI run that rendered
> sheísmo correctly — raising `similarity_boost` pushes adherence to the voice's real accent.

## Daily use

The `mine` skill runs this automatically after creating cards:

```bash
node scripts/backfill.mjs --notes <comma-separated note ids>   # just the new cards
```

Manual / catch-up:

```bash
node scripts/backfill.mjs            # whole deck: every card missing sentence_audio
node scripts/backfill.mjs --dry      # show targets, no API calls, no spend
```

Behavior:
- **Idempotent** — only touches cards whose `sentence_audio` is empty.
- **Free tier / out of credits** → prints a notice (or aborts on a quota error) and leaves text intact. Never a half-state.
- Temp mp3s are written to the OS temp dir and deleted after upload — **nothing lands in the repo**.

### Helper script (`scripts/tts.mjs`) — the ElevenLabs primitive

```bash
node scripts/tts.mjs voices [name]        # voices in your account
node scripts/tts.mjs shared "argentin"    # search the shared/community library for a voice id
node scripts/tts.mjs usage                # tier + characters used / remaining
node scripts/tts.mjs say --voice <id> --out clip.mp3 --text "tu oración"   # one-off synth
```

## How a card gets audio

1. `backfill.mjs` reads the note's `Word` and `Example Sentence` (HTML stripped) from AnkiConnect.
2. Synthesizes word + sentence clips (per `scope`) with ElevenLabs.
3. `storeMediaFile` copies each mp3 into Anki's `collection.media`.
4. `updateNoteFields` sets `word_audio` / `sentence_audio` to `[sound:<file>.mp3]`.

> **Gotcha:** keep Anki's **Browse window closed** during a run. An open editor holds the old
> field values and silently overwrites the update when you next view the note.

## Swapping providers later

`scripts/tts.mjs` is the only place that calls ElevenLabs. Point it (and `backfill.mjs`'s
`synth`/endpoint) at another HTTP TTS API and update `profile.tts`. The `mine` skill and the
Anki side don't change — they only know "run the audio script."

## Media location & cleanup

- **Authoritative audio:** `…/Anki2/<profile>/collection.media` (this is what syncs to AnkiMobile).
- **Repo:** holds no audio. `.env` and any stray `.tts-cache/` / `samples/` are gitignored.
- Sync Anki (desktop → AnkiWeb → AnkiMobile) after a run to push audio to your phone.
