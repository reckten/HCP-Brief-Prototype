# Delivery Package

## Audience Definition

| Attribute | Value |
|---|---|
| Specialty | Neurology (primary); Internal Medicine, Family Medicine (secondary) |
| Geography | Massachusetts, New York, New Jersey, Connecticut, Pennsylvania |
| Care setting | Outpatient clinic, academic medical center, multi-specialty group |
| Excluded settings | Inpatient, emergency department |
| Illustrative codes | [ILLUSTRATIVE] 2084N0400X (Neurology), 207R00000X (Internal Medicine), 207Q00000X (Family Medicine), G99.X-CPSD (CPSD analog placeholder) |
| Estimated reachable HCPs | [ILLUSTRATIVE] ~12,000-18,000 across the five-state footprint |

## Channel Recommendation
- **Primary:** EHR point-of-care sidebar education card.
- **Secondary:** On-demand accredited CME video modules.
- **Why:** The objective is education at the moment of diagnostic consideration, which is what point-of-care delivers. CME provides accredited depth for HCPs who want to go further. Email and rep-delivered detail aids are explicitly out of scope.

## Trigger Criteria (EHR Sidebar)
- **Signal:** On chart open, evaluate active or recent (last 90 days) problem-list entries against the [ILLUSTRATIVE] CPSD analog code set (`G99.X-CPSD` plus differential proxies pending Medical Affairs lock).
- **Suppression rules:**
  - Frequency cap: maximum 1 exposure per HCP per patient encounter, maximum 3 exposures per HCP per calendar week. **(Provisional - awaiting brand team policy.)**
  - Opt-out: HCP-level opt-out persisted across sessions; honored within 24 hours of opt-out event.
  - Recency: suppress if HCP has viewed the same card in the last 14 days for the same patient.
- **Fallback:** If trigger logic cannot evaluate (missing code mapping, EHR field unavailable), the card does not render. No fallback content is shown.

## Content Type and Format

**Short-form (EHR sidebar)**
- Format: 60-90 second educational card with concise diagnostic-criteria summary, red-flag list, and a "learn more" link to the CME module.
- Tone: educational, peer-to-peer, neutral.
- Required elements: fair-balance line, references citation block, "[ILLUSTRATIVE]" labeling on any diagnostic codes referenced in-card.

**Long-form (CME modules)**
- Format: 8-12 minute accredited CME video modules, hosted on the CME partner platform.
- Tone: peer-reviewed didactic.
- Required elements: accreditation statement, learning objectives, faculty disclosures, post-module assessment, references.

## Delivery Notes
- Handoff to MLR is required for both surfaces. Short-form fair-balance review is the highest-risk item.
- CME independence requirements constrain branding density inside modules - asset spec must show NeuroPath references only in faculty disclosure and reference sections, not in didactic content.
- Asset specs (resolution, file format, captioning) to be provided by EHR vendors and CME partner; not in scope of this package.
- Measurement events: card-impression, card-engagement, opt-out, CME-module-start, CME-module-complete. No downstream behavioral signals are captured at this stage (pending brand team decision).

## Implementation Assumptions
- HCP-level targeting only. No patient-level PHI is read or stored by the workflow.
- The two soft-launch EHR vendor partners are confirmed by Phase 2 start.
- CPSD code mapping is locked by Week 3 or trigger logic uses a broader differential proxy set, accepted in writing by Medical Affairs.
- CME partner can accredit within 4 weeks running parallel to MLR.
- Frequency cap and opt-out policy are approved by brand team and Compliance before EHR build begins.

## Out of Scope (Explicit)
- Email outreach, rep-delivered detail aids, paid social, programmatic display.
- Inpatient and ED point-of-care surfaces.
- Patient-facing materials.
- Downstream behavioral signal capture (e.g. prescribing data) - pending separate brand team decision.
