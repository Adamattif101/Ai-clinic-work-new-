# Why Wellspring Is Not a Medical Device

**One-page memo — keep with the product file. Review on any material feature change.**

## Summary

Wellspring is a **wellbeing and practice-administration support tool** for private
therapy/counselling clinics. It does **not** meet the definition of a medical device
under the UK Medical Devices Regulations 2002 (as amended) or EU MDR 2017/745, and it
is **not** software as a medical device (SaMD) under MHRA guidance.

We make this determination because Wellspring's intended purpose — the legally
operative test — is administrative and wellbeing support, not a medical purpose.

## Intended purpose (the deciding factor)

A product is a medical device because of the **manufacturer's stated intended
purpose**, not its technical capability. Wellspring's intended purpose is:

1. To help clinicians organise and summarise their **own** session notes into
   administrative summaries and prep briefs (a productivity layer over text the
   clinician authored).
2. To automate clinic administration: scheduling, intake, consent capture, reminders,
   billing, and record-keeping.
3. To give patients a **wellbeing companion**: journaling, self-reported daily mood
   check-ins (engagement, not clinical measurement), and clinician-assigned fixed
   psychoeducation content.

None of these is a medical purpose within the meaning of the regulations.

## What Wellspring deliberately does NOT do

To stay outside the medical-device boundary, the product **must never**:

- **Diagnose, screen, triage, or risk-score** any condition.
- **Treat, prevent, cure, or alleviate** disease or injury, or claim to.
- **Monitor** a physiological or clinical condition (e.g. "monitor depression").
- Produce **clinical decisions or recommendations** that direct patient care.
- Interpret mood/wellbeing check-ins as **clinical severity** or symptom measurement.
- Generate **automated clinical advice** in any free-text chat.

These prohibitions are enforced in copy review and in code (see
`src/lib/forbiddenTerms.ts` and the deterministic crisis layer in
`src/lib/crisisDetection.ts`, which only surfaces **signposting** to existing UK
helplines and never offers clinical advice).

## Language discipline

Across all UI copy, marketing, and generated AI output we avoid:
`treat`, `prevent`, `diagnose`, `screen`, `triage`, `monitor [condition]`,
`assess severity`, `clinical risk`. The AI summarisation layer is prompted and
post-filtered to describe **what the clinician wrote**, framed as engagement and
administrative support, never as clinical judgement.

## The AI summarisation boundary

The notes-to-insight layer reorganises text the **clinician already authored**. It
adds no clinical inference about the patient and is positioned as a drafting aid the
clinician reviews and owns. It is analogous to a transcription/summarisation tool, a
recognised non-device category, provided no diagnostic or treatment recommendation is
produced.

## If the intended purpose ever changes

Any feature that scores, classifies, triages, or recommends care would likely make
Wellspring a medical device and trigger UKCA/CE conformity assessment obligations.
**Such features must not ship without a formal regulatory review and sign-off.**

> This memo is an internal product-governance record, not legal advice. Obtain
> regulatory/legal counsel before any change to intended purpose.
