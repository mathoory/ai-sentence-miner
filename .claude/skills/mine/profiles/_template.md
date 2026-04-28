---
# Required: target language and learner identity
# File naming convention: <language-code>-<learner>.md  (e.g. es-AR-mattan.md, ja-JP-alice.md)
language:           # e.g. es-AR, ja-JP, cs-CZ — BCP-47 with region where it matters
target_dialect:     # e.g. Rioplatense (Porteño), Standard Mandarin, European Portuguese
learner_level:      # e.g. A1-A2, B1, intermediate, beginner
learner_native:     # e.g. Hebrew, English
learner_strong:     # e.g. English (C1/C2) — other languages the learner can leverage as bridges

# Required: where cards go
deck:               # exact Anki deck name
note_type:          # exact Anki note type name
key_field:          # the field used for dedupe — usually the lemma field

# Required: tags applied to every minted card
tags:
  - mined
  # - mined::<language-code>   # recommended for multi-language vaults
---

# Profile — <language> for <learner>

## Technical commitments (non-negotiable)

List the rules that must hold for this language/dialect. These are not stylistic suggestions — the skill should treat them as hard constraints.

Examples to consider:
- Pronoun system (which "you" form is correct in the target dialect)
- Verb conjugation conventions tied to that pronoun
- Punctuation conventions (some languages don't use opening question marks; some don't capitalize sentence starts in casual contexts)
- Pronunciation conventions worth flagging (or explicitly *not* flagging in v1)
- Bridge languages permitted for grammar explanation
- Level constraints on generated content

## Field rules — `<note_type>`

For each field of the note type, define the rule:

| Field | Rule |
|-------|------|
| `<lemma-field>` | The lemma. Specify normalization for each part of speech the learner will mine: verbs, nouns (with article? without?), adjectives, particles/interjections, **and fixed expressions / multi-word chunks** (e.g. `estar jugado`, `darse cuenta`, `hacerse el boludo` — these aren't single words but they're the unit of meaning). Without this category, list-mode mines of idioms get shoehorned awkwardly. |
| `<gloss-field>` | The English (or bridge-language) gloss. If the target language has its own grammar terminology (e.g. `gerundio`, `presente`, `pretérito` for Spanish; `te-form`, `masu-form` for Japanese), specify whether to use those labels for inflected/derived forms — and list them, so generation stays consistent. |
| `<example-field>` | The example sentence rule. Specify level constraints, register-matching expectation, and how the target word is marked (typically `<b>...</b>`). |
| ... | ... |
| `<empty-field>` | If empty in v1, say "Empty in v1" explicitly and link to BACKLOG.md. |

## Style — what good cards feel like

Describe the *taste* of a good card for this language and learner. Concrete guidance:
- What kind of example sentences fit (everyday vs literary, formal vs casual)
- How to match register to the target word
- What cultural texture is genuinely available vs what would feel manufactured
- The level of grammar around the target

## Cultural anchors worth leaning on (when natural)

List contexts that are real for the learner and produce sentences that feel alive rather than invented. Pull from the learner's actual life and the language's cultural surface — not stock tourist scenes.

## Example invocations (illustrative, not templates)

Write 3–4 worked examples showing the expected output shape for different input modes (word, list item, marked sentence). These calibrate future Claude sessions to the profile's voice.
