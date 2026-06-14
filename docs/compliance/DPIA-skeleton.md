# Data Protection Impact Assessment (DPIA) — Skeleton

*Required where processing is likely to result in a high risk to individuals
(Art. 35 UK GDPR). Processing special-category health data at scale meets the threshold.*

> Skeleton to be completed jointly by the clinic (controller) and Wellspring (processor).

## 1. Identify the need for a DPIA
Processing of special-category health data; use of AI to summarise clinician notes;
multi-tenant platform serving vulnerable individuals. **DPIA required.**

## 2. Describe the processing
- **Nature:** storage and AI-assisted summarisation of clinician notes; patient
  journaling and self-reported wellbeing check-ins; scheduling, intake, billing.
- **Scope:** patients and staff of subscribing UK clinics; special-category data.
- **Context:** private therapy clinics; patients may be in distress.
- **Purposes:** wellbeing and administrative support — **not** diagnosis/treatment.
- **Data flows:** client (anon key + user JWT) → Supabase (RLS) → server-side Edge
  Functions → zero-retention AI API. Service-role key restricted to server jobs.

## 3. Consultation
Record consultation with clinicians, a DPO, and (where appropriate) patient
representatives.

## 4. Assess necessity and proportionality
- Lawful basis and Art. 9 condition documented (see APD).
- Data minimisation: no clinical scoring; only user-entered text.
- Processor instructions, sub-processor list, retention policy in place.

## 5. Identify and assess risks
| # | Risk | Likelihood | Severity | Overall |
|---|---|---|---|---|
| R1 | Cross-tenant data leakage | Low | High | High |
| R2 | AI output drifts into clinical advice/diagnosis | Med | High | High |
| R3 | Health data exposed via caching/logs | Low | High | High |
| R4 | Patient distress in free-text chat unaddressed | Med | High | High |
| R5 | Consent unclear / not withdrawable | Low | Med | Med |
| R6 | Service-role key misuse | Low | High | High |

## 6. Measures to reduce risk
| # | Measure | Residual risk |
|---|---|---|
| R1 | RLS on every table; `clinic_id` JWT claim via auth hook; indexed; tests | Low |
| R2 | Forbidden-terms filter; prompts constrained to summarise authored notes; human review | Low |
| R3 | Health responses NetworkOnly in SW; no PII in logs; encryption | Low |
| R4 | Deterministic, non-LLM crisis layer surfaces Samaritans 116 123 / 999 | Low |
| R5 | Explicit consent capture with timestamped withdrawal; default no clinician share | Low |
| R6 | Service-role server-only; secrets in vault; least privilege | Low |

## 7. Sign-off and outcome
| Item | Name/role | Date |
|---|---|---|
| Measures approved by | | |
| Residual risks accepted by | | |
| DPO advice | | |
| Consultation with ICO needed? | No (residual risk not high) | |

## 8. Keep under review
Reviewed on material change and at least annually.
