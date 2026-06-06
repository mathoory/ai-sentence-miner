#!/usr/bin/env node
// backfill.mjs — apply Agustín word+sentence audio to Anki cards via ElevenLabs.
// The single audio path for this repo (the `mine` skill calls it; you can too).
//
//   node scripts/backfill.mjs                 # whole deck: every card missing sentence_audio
//   node scripts/backfill.mjs --notes 1,2,3   # only these note ids (used by the mine skill)
//   node scripts/backfill.mjs --dry           # list targets, no API calls, no spend
//
// Credit-aware: pre-flights your ElevenLabs plan. On the FREE tier it skips
// cleanly (Agustín is a library voice → needs a paid plan) and leaves cards
// text-only; rerun on a paid plan to fill them. Idempotent: only ever touches
// cards that still lack sentence_audio.
//
// Keep Anki's Browse window CLOSED while this runs (an open editor silently
// clobbers field updates).

import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const TMP = resolve(tmpdir(), "sentence-mine-audio");
const ANKI = "http://localhost:8765";
const EL = "https://api.elevenlabs.io";

// — config: mirrors the `tts` block in profiles/es-AR-mattan.md —
const DECK = "Spanish Sentence Mining";
const VOICE = "ByVRQtaK1WDOvTmP1PKO";          // Agustín — Relaxed, Warm and Approachable
const MODEL = "eleven_multilingual_v2";
const FORMAT = "mp3_44100_128";
const PREFIX = "sm_esAR_";
const SCOPE = "word+sentence";                  // "word+sentence" | "sentence"
const SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true };

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry");
const notesArg = (() => {
  const i = argv.indexOf("--notes");
  return i >= 0 ? argv[i + 1] : null;
})();

function key() {
  const raw = readFileSync(resolve(ROOT, ".env"), "utf8");
  const m = raw.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.+?)\s*$/m);
  if (!m || !m[1].trim()) throw new Error("ELEVENLABS_API_KEY missing in .env");
  return m[1].trim();
}
const KEY = DRY ? "" : key();

async function anki(action, params = {}) {
  const r = await fetch(ANKI, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, version: 6, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`AnkiConnect ${action}: ${j.error}`);
  return j.result;
}

async function synth(text, outPath) {
  const r = await fetch(`${EL}/v1/text-to-speech/${VOICE}?output_format=${FORMAT}`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: SETTINGS }),
  });
  if (!r.ok) {
    const e = new Error(`TTS ${r.status}: ${await r.text()}`);
    e.status = r.status;
    throw e;
  }
  writeFileSync(outPath, Buffer.from(await r.arrayBuffer()));
}

const stripHtml = (s) =>
  s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const slugify = (w) =>
  PREFIX +
  w.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/^(el|la|los|las|un|una|unos|unas)\s+/, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

async function preflight() {
  const r = await fetch(`${EL}/v1/user/subscription`, { headers: { "xi-api-key": KEY } });
  if (!r.ok) throw new Error(`subscription check failed: ${r.status} ${await r.text()}`);
  return r.json(); // { tier, character_count, character_limit }
}

async function targetNotes() {
  let ids;
  if (notesArg) ids = notesArg.split(",").map((s) => Number(s.trim())).filter(Boolean);
  else ids = await anki("findNotes", { query: `deck:"${DECK}" sentence_audio:` });
  if (!ids.length) return [];
  const infos = await anki("notesInfo", { notes: ids });
  // idempotent: skip any that already carry sentence audio
  return infos.filter((n) => !(n.fields.sentence_audio?.value || "").trim());
}

async function main() {
  const notes = await targetNotes();
  if (!notes.length) {
    console.log("Nothing to do — target cards already have audio.");
    return;
  }
  console.log(`${notes.length} card(s) to audio${DRY ? " (dry run)" : ""}.\n`);

  if (!DRY) {
    const sub = await preflight();
    if (sub.tier === "free") {
      console.log(
        "ℹ ElevenLabs FREE tier — Agustín (library voice) needs a paid plan.\n" +
          "  Skipping audio; cards keep their text. Re-run after upgrading to fill them."
      );
      return;
    }
  }

  mkdirSync(TMP, { recursive: true });
  const used = new Set();
  let ok = 0, failed = 0, i = 0;

  for (const n of notes) {
    i++;
    const word = n.fields.Word.value.trim();
    const sentence = stripHtml(n.fields["Example Sentence"].value);
    if (!sentence) { console.log(`(${i}/${notes.length}) skip "${word}": empty sentence`); continue; }

    let base = slugify(word) || `${PREFIX}note${n.noteId}`;
    while (used.has(base)) base += "_x";
    used.add(base);
    const wf = `${base}_word.mp3`, sf = `${base}_sent.mp3`;
    const doWord = SCOPE.includes("word");

    if (DRY) {
      console.log(`(${i}/${notes.length}) ${word}  ->  ${doWord ? wf + " + " : ""}${sf}`);
      ok++;
      continue;
    }

    try {
      const fields = {};
      if (doWord) {
        const p = resolve(TMP, wf);
        await synth(word, p);
        await anki("storeMediaFile", { filename: wf, path: p });
        unlinkSync(p);
        fields.word_audio = `[sound:${wf}]`;
      }
      const sp = resolve(TMP, sf);
      await synth(sentence, sp);
      await anki("storeMediaFile", { filename: sf, path: sp });
      unlinkSync(sp);
      fields.sentence_audio = `[sound:${sf}]`;

      await anki("updateNoteFields", { note: { id: n.noteId, fields } });
      ok++;
      console.log(`(${i}/${notes.length}) ✓ ${word}`);
    } catch (e) {
      if (e.status === 401 || e.status === 402 || /payment|quota|unusual activity/i.test(e.message)) {
        console.error(`\nAborting — ElevenLabs rejected the request (plan/quota):\n  ${e.message}`);
        console.error(`Done ${ok} before stopping. Upgrade/refill and re-run.`);
        process.exit(1);
      }
      failed++;
      console.log(`(${i}/${notes.length}) ⚠ ${word} — ${e.message}`);
    }
  }
  console.log(`\nDONE: ${ok} ok, ${failed} failed of ${notes.length}.`);
}

main().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
