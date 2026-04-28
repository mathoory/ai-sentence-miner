---
# Required: target language and learner identity
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
| `<field-name>` | What goes in this field. Be specific. If empty in v1, say "Empty in v1" explicitly. |
| ... | ... |

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
