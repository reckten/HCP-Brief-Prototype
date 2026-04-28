# Execution Plan

## Recommended Engagement Path
- **Primary path:** EHR-triggered point-of-care education (sidebar card on chart open for CPSD-analog diagnosis codes).
- **Secondary path:** On-demand CME-style modules hosted on an accredited CME partner platform.
- **Rationale:** The brief is education-led and targets HCPs at the moment of clinical decision-making. EHR point-of-care is the highest-fit primary channel because it delivers context-relevant education when the diagnostic question is live, which is exactly the behavior the objective seeks to influence. CME provides depth and accreditation cover but cannot drive in-the-moment recognition; it is a complement, not a substitute. Email and rep-delivered detail aids are explicitly out of scope per the brief.

## Key Assumptions
- At least two major EHR vendors are configured for sidebar placement before Week 8.
- CME accreditation partner is contracted and can clear modules in a 4-week MLR-parallel window.
- HCP-level targeting list is sourced from a vendor and contains no internal PHI.
- The CPSD analog code (`[ILLUSTRATIVE] G99.X-CPSD`) is locked by Medical Affairs no later than Week 3, or trigger logic falls back to a broader differential set.

## Phased Sequencing

### Phase 1 - Foundations (Weeks 0-3)
- Lock diagnostic code mapping with Medical Affairs (gating dependency).
- Confirm CME partner contract and accreditation lead times.
- Confirm EHR vendor scope; identify the two soft-launch partners by name.
- Draft frequency cap and opt-out policy (currently open questions in the brief).
- Exit criteria: code mapping signed off; vendor list confirmed; opt-out and frequency policy approved.

### Phase 2 - Build and Review (Weeks 3-7)
- Produce EHR sidebar cards (60-90s) and CME modules (8-12 min) in parallel.
- MLR review of all surfaces, with explicit attention to fair-balance and off-label boundaries on the short-form card.
- CME independence check: confirm branding density complies with accreditor guidelines.
- Set up measurement instrumentation (engagement events, opt-out rate, no downstream PHI).
- Exit criteria: MLR-approved assets; instrumentation deployed in stage; CME modules accredited.

### Phase 3 - Soft Launch and Rollout (Weeks 8-12)
- Soft launch on two EHR vendor partners (Week 8); monitor frequency cap compliance and opt-out rates daily for the first two weeks.
- Compare engagement and opt-out signals against the QA test plan thresholds before full rollout.
- Full rollout Week 12 contingent on no severity-1 compliance flags.
- Exit criteria: soft-launch metrics within thresholds; no open MLR issues; full-rollout go/no-go documented.

## Dependencies
- Medical Affairs (diagnostic code mapping, positioning sign-off).
- MLR review pipeline (asset approval).
- Two named EHR vendor partners (sidebar configuration).
- CME accreditation partner (independence and accreditation).
- HCP list vendor (targeting data; HCP-level only).
- Measurement vendor or in-house analytics (engagement instrumentation).

## Escalation Points
- Diagnostic code mapping not locked by end of Week 3 -> escalate to Medical Affairs lead and brand team; trigger fallback (broader differential code set) decision.
- CME independence concern raised by accreditor -> halt module branding work; route to Compliance and Medical Affairs.
- Frequency cap breach in soft launch -> pause campaign on affected vendor; route to AgentOps and Compliance.
- Audience-overbreadth flag (combined Neurology + IM + FM may exceed minimum-necessary scope) -> escalate to Compliance for review before full rollout.

## Surfaced Ambiguities
1. **Frequency cap and opt-out policy are undefined.** This is operationally blocking for EHR sidebar placement and must be resolved before Phase 2 build begins. Without it, fair-balance and minimum-necessary obligations cannot be evaluated.
2. **Audience scope risk.** Combining Neurology, Internal Medicine, and Family Medicine across five Northeast states is broad for an education-led initiative. Either narrow the primary segment (e.g. Neurology only for sidebar; PCP for CME) or accept higher review scrutiny.
3. **Measurement plan is undecided.** "Engagement only" vs. "downstream behavior signals" has compliance implications - downstream behavior signals may pull the program toward promotional classification. This decision must precede Phase 2 instrumentation.
