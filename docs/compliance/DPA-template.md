# Data Processing Agreement (Template)

**Between the Clinic (the "Controller") and Wellspring Ltd (the "Processor")**

> Template only — not legal advice. Each clinic accepts a versioned copy of this DPA
> in **Settings → Compliance → Data Processing Agreement**, and the acceptance
> (version, timestamp, accepting user) is recorded in the audit log.

This Agreement supplements the Wellspring Terms of Service and reflects Article 28 of
the UK GDPR. Where the Clinic processes special-category health data, the Clinic is the
**data controller** and Wellspring is the **data processor**.

## 1. Subject matter and duration
The Processor processes personal data on behalf of the Controller for the term of the
subscription and for any agreed retention period thereafter.

## 2. Nature and purpose of processing
Hosting and operating a wellbeing and clinic-administration platform: storage of
session notes, intake/consent records, scheduling, billing references, journaling, and
self-reported wellbeing check-ins; and AI-assisted summarisation of clinician-authored
notes.

## 3. Types of personal data
Identification/contact data; appointment and billing metadata; clinician session notes;
patient journaling and self-reported wellbeing check-ins. **Special-category data:**
health-related information contained in notes and check-ins.

## 4. Categories of data subjects
Clinic staff (clinicians, owners, administrators) and the clinic's patients/clients.

## 5. Processor obligations (Art. 28(3))
The Processor shall:
(a) process personal data only on documented instructions from the Controller,
    including on international transfers;
(b) ensure persons authorised to process are bound by confidentiality;
(c) implement the technical and organisational measures in **Annex A**;
(d) engage sub-processors only per clause 6;
(e) assist the Controller with data-subject rights requests via the export/deletion
    tooling;
(f) assist with security, breach notification (clause 7), and DPIAs;
(g) at the Controller's choice, delete or return all personal data at end of service;
(h) make available information necessary to demonstrate compliance and allow audits.

## 6. Sub-processors
The Controller authorises the sub-processors listed in **Annex B**. The Processor gives
prior notice of changes and gives the Controller the opportunity to object.

## 7. Personal data breach
The Processor notifies the Controller **without undue delay and within 72 hours** of
becoming aware of a personal data breach, with the information needed for the Controller
to meet its Art. 33/34 obligations.

## 8. International transfers and residency
Personal data is hosted in the **UK/EU**. Any transfer outside the UK/EU requires an
appropriate Art. 46 safeguard (e.g. UK IDTA / EU SCCs). AI sub-processors operate under
**zero-retention** terms and do not train on Controller data.

## 9. Liability and term
As set out in the Terms of Service. This Agreement terminates with the subscription,
subject to surviving confidentiality and deletion obligations.

---

### Annex A — Technical and organisational measures
- Encryption in transit (TLS 1.2+) and at rest.
- Per-tenant logical isolation via `clinic_id` and Postgres Row-Level Security.
- Role-based access control; least-privilege service-role usage (server-only).
- Full audit logging of access to and changes of personal data.
- Configurable retention and deletion; data-export tooling.
- Regular backups with encryption; documented restore procedures.

### Annex B — Authorised sub-processors
| Sub-processor | Purpose | Location | Safeguards |
|---|---|---|---|
| Supabase | Database, auth, storage, edge compute | EU region | DPA, UK/EU residency |
| Stripe | Subscription & metered billing | UK/EU + adequacy/SCCs | DPA |
| Anthropic | AI summarisation (server-side) | Zero-retention API | DPA, no-training |
| Google (Gemini) | AI summarisation (optional, server-side) | Zero-retention API | DPA, no-training |

### Annex C — Versioning
| Version | Effective date | Notes |
|---|---|---|
| 1.0 | 2026-01-01 | Initial template |
