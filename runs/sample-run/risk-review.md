# Risk Review Memo

## Summary
The NeuroPath CPSD initiative is structurally sound as an education-led program but carries four reviewable concerns: audience overbreadth, fair-balance feasibility on short-form EHR cards, CME independence boundary, and unfinalized trigger-code mapping. None are immediate blockers, but all should be resolved before Phase 2 build. Severity is moderated by the fact that no patient-level PHI is in scope.

## Flagged Concerns

### Flag 1: Audience overbreadth (minimum-necessary)
- **Severity:** Medium
- **Category:** Minimum-necessary data use
- **Description:** The audience combines three specialties (Neurology, Internal Medicine, Family Medicine) across five Northeast states. For an education-led initiative, this is a wide net. Combined with the unfinalized CPSD code mapping, the trigger may surface to HCPs whose patients do not present with CPSD-analog conditions, expanding exposure beyond the educational rationale.
- **Recommendation:** Narrow the primary EHR sidebar segment to Neurology only; keep IM/FM in scope for on-demand CME (pull, not push). Re-evaluate after soft launch.

### Flag 2: Fair-balance feasibility on 60-90s EHR cards
- **Severity:** Medium
- **Category:** Missing guardrails
- **Description:** Short-form point-of-care cards have severe space constraints. Fair-balance language is required on every surface, but a 60-90 second card with diagnostic criteria, red flags, and a "learn more" link leaves limited room for an adequate balance statement. Truncation risk is real.
- **Recommendation:** Define minimum fair-balance template before MLR review; if it cannot fit alongside the educational content, restructure the card to separate the educational hook from a balance/disclosure footer that is always rendered.

### Flag 3: CME independence boundary
- **Severity:** Medium
- **Category:** Channel-specific concerns
- **Description:** The brief frames CME modules as branded education with NeuroPath as a "reference point." Accredited CME requires content independence - branded sponsor references inside didactic content can disqualify accreditation. The current framing is ambiguous.
- **Recommendation:** Confirm with the CME accreditation partner that branding is restricted to faculty disclosure and reference sections only. If brand-team intent is tighter integration, classify the modules as non-accredited educational content (not CME) and adjust language across the package.

### Flag 4: Trigger code mapping not locked
- **Severity:** Low (escalates to Medium if unresolved past Week 3)
- **Category:** Targeting ambiguity
- **Description:** The CPSD analog code (`[ILLUSTRATIVE] G99.X-CPSD`) is a placeholder pending Medical Affairs sign-off. EHR sidebar trigger logic depends on this code. If the final mapping differs materially, all trigger work and a portion of MLR review must be redone.
- **Recommendation:** Make Phase 2 build contingent on Medical Affairs lock by end of Week 3. Define the fallback differential proxy code set in writing now, signed off by Medical Affairs and Compliance, so the program does not stall on this single dependency.

## General Recommendations
- Document the frequency cap (currently provisional) and opt-out policy before Phase 2 begins. Both materially affect minimum-necessary posture.
- Keep "downstream behavioral signal" capture explicitly out of scope until brand team and Compliance jointly approve - capturing prescribing data would shift the program toward promotional classification.
- Maintain the `[ILLUSTRATIVE]` labeling on all codes in delivery and downstream artifacts to prevent confusion in handoff documents.
- Confirm in writing that no patient-level PHI is read or stored by the EHR sidebar pipeline.

## Disclaimer
This is educational simulation only. Not legal or regulatory advice.
