#!/usr/bin/env node
// tts.mjs — zero-dependency ElevenLabs TTS helper for sentence-mine.
// Requires Node >=18 (global fetch). Reads ELEVENLABS_API_KEY from repo-root .env.
//
// Usage:
//   node scripts/tts.mjs voices [query]            list account voices (optional name filter)
//   node scripts/tts.mjs shared <query>           search ElevenLabs community/shared voices
//   node scripts/tts.mjs say --voice <id> --out <file> --text "<text>" [--model <id>] [--format <fmt>]
//
// Exit codes: 0 ok, 1 usage/runtime error, 2 missing API key.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const API = "https://api.elevenlabs.io";

function loadKey() {
  let raw;
  try {
    raw = readFileSync(resolve(ROOT, ".env"), "utf8");
  } catch {
    fail("No .env file found at repo root.", 2);
  }
  const m = raw.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.+?)\s*$/m);
  const key = m && m[1].trim();
  if (!key) fail("ELEVENLABS_API_KEY is empty in .env", 2);
  return key;
}

function fail(msg, code = 1) {
  console.error(`tts: ${msg}`);
  process.exit(code);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) out[a.slice(2)] = argv[++i];
    else (out._ ||= []).push(a);
  }
  return out;
}

async function getJSON(url, key) {
  const r = await fetch(url, { headers: { "xi-api-key": key } });
  if (!r.ok) fail(`${r.status} ${r.statusText} on ${url}\n${await r.text()}`);
  return r.json();
}

async function cmdVoices(query, key) {
  const data = await getJSON(`${API}/v1/voices`, key);
  let voices = data.voices || [];
  if (query) {
    const q = query.toLowerCase();
    voices = voices.filter((v) => (v.name || "").toLowerCase().includes(q));
  }
  if (!voices.length) return console.log("(no matching voices)");
  for (const v of voices) {
    const labels = v.labels ? Object.values(v.labels).join(", ") : "";
    console.log(`${v.voice_id}\t${v.name}\t[${labels}]`);
  }
}

async function cmdShared(query, key) {
  if (!query) fail("shared: needs a search query");
  const data = await getJSON(
    `${API}/v1/shared-voices?search=${encodeURIComponent(query)}&page_size=20`,
    key
  );
  const voices = data.voices || [];
  if (!voices.length) return console.log("(no shared voices found)");
  for (const v of voices) {
    const labels = [v.accent, v.gender, v.age, v.language]
      .filter(Boolean)
      .join(", ");
    console.log(`${v.voice_id}\t${v.name}\t[${labels}]\tby ${v.public_owner_id || "?"}`);
  }
}

async function cmdUsage(key) {
  const s = await getJSON(`${API}/v1/user/subscription`, key);
  const used = s.character_count ?? 0;
  const limit = s.character_limit ?? 0;
  console.log(
    `tier=${s.tier}  used=${used}  limit=${limit}  remaining=${limit - used}`
  );
}

async function cmdSay(args, key) {
  const voice = args.voice;
  const out = args.out;
  const text = args.text;
  const model = args.model || "eleven_multilingual_v2";
  const format = args.format || "mp3_44100_128";
  if (!voice) fail("say: --voice <id> required");
  if (!out) fail("say: --out <file> required");
  if (!text) fail("say: --text <text> required");

  // Voice settings matched to the ElevenLabs web UI run that rendered sheísmo
  // correctly (filename tag: s50_sb75_se0_b). similarity_boost drives adherence
  // to Agustín's real Rioplatense voice, including the /ʃ/.
  const voice_settings = {
    stability: args.stability != null ? Number(args.stability) : 0.5,
    similarity_boost: args.similarity != null ? Number(args.similarity) : 0.75,
    style: args.style != null ? Number(args.style) : 0,
    use_speaker_boost: args["speaker-boost"] !== "false",
  };

  const r = await fetch(
    `${API}/v1/text-to-speech/${voice}?output_format=${format}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({ text, model_id: model, voice_settings }),
    }
  );
  if (!r.ok) fail(`TTS ${r.status} ${r.statusText}\n${await r.text()}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const outPath = resolve(ROOT, out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, buf);
  console.log(`wrote ${outPath} (${buf.length} bytes)`);
}

const key = loadKey();
const [cmd, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);

switch (cmd) {
  case "voices":
    await cmdVoices(args._?.[0], key);
    break;
  case "shared":
    await cmdShared(args._?.[0], key);
    break;
  case "say":
    await cmdSay(args, key);
    break;
  case "usage":
    await cmdUsage(key);
    break;
  default:
    fail(
      "usage: tts.mjs <voices [query] | shared <query> | say --voice <id> --out <file> --text <text> [--model <id>] [--format <fmt>]>"
    );
}
