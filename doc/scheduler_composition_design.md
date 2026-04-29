# Adaptive Scheduler Composition: FSRS + BKT

**Date:** 2026-04-17
**Author:** worker_1
**Status:** Pre-read for Thursday 2026-04-18 pairing session (worker_2 + worker_3)
**Decision needed:** How should FSRS (review timing) and BKT (skill mastery) compose when they disagree on what to serve next?

---

## TL;DR

FSRS and BKT optimize for different things at different granularities:

- **FSRS** (per-card): "When should I review this specific problem to hit 90% retention?"
- **BKT** (per-skill): "Which skill does this student need more practice on?"

They agree most of the time — a due card for a weak skill is a clear serve. But when they disagree, the scheduler has to pick. This document enumerates the conflict cases, sketches three resolution strategies, and recommends one for Thursday's pairing to ratify or override.

**My recommendation: a blended priority score with mood-gated weight shifts and a "severely-overdue" safety net.** Details below. The point of pre-writing this is so Thursday lands on a decision instead of discovering the design debate live.

---

## The core problem

Both FSRS and BKT will live inside the same adaptive scheduler. Given a student request for the next problem, the scheduler has a pool of candidate cards (problem instances) and must pick one. Each card has:

- **An FSRS state** (D, S, last_review) — lets us compute current retrievability R
- **A skill tag** — links the card to a BKT skill whose P(known) the student has

The question: how do we rank candidates when FSRS and BKT send different signals?

Note that FSRS and BKT aren't interchangeable. FSRS reasons about **memory decay of specific cards**. BKT reasons about **abstract mastery of a concept** across many cards. A student can have seen 3 of the 20 cards tagged to a skill — FSRS knows about those 3, BKT aggregates all evidence into one P(known). These are complementary models, not competing ones. Composition just has to be principled.

---

## Conflict enumeration

For a given skill, FSRS has three states:

- **DUE** — at least one card for this skill has predicted R < target (typically 0.9)
- **NOT_DUE** — all cards for this skill have R ≥ target
- **UNSEEN** — at least some cards for this skill have no FSRS state (student has never reviewed them)

For the same skill, BKT has three states:

- **WEAK** — P(known) < 0.3
- **LEARNING** — 0.3 ≤ P(known) < 0.7
- **MASTERED** — P(known) ≥ 0.7

The 3×3 matrix of combined states:

| | BKT: WEAK | BKT: LEARNING | BKT: MASTERED |
|---|---|---|---|
| **FSRS: DUE** | Clear — serve the due card. Both systems agree. | Normal. Serve the due card. | **⚠ CONFLICT A**: FSRS says review, BKT says student doesn't need it. |
| **FSRS: NOT_DUE** | **⚠ CONFLICT B**: BKT wants practice, FSRS has nothing scheduled. | No urgency. Could advance or rest. | Move on to another skill. |
| **FSRS: UNSEEN** | Serve a new card. Introduces FSRS state for this skill. | Serve a new card for learning. | **⚠ EDGE**: Rare — shouldn't happen unless P(known) inherited from prerequisite inference. |

The two real conflicts:

### Conflict A: FSRS-due-but-mastered

FSRS says "review this card" (e.g., R = 0.82, below 0.9 target). BKT says "this student has mastered the skill." Should we force the review?

**Case for yes:** Mastery can decay. FSRS's retention model is grounded in memory science; skipping reviews degrades long-term retention. Mastered now ≠ mastered next month.

**Case for no:** The student's time is finite. If they're demonstrably mastering fractions, spending a session on a fractions-comparison card they'll almost certainly get right is lower value than practicing a weak skill.

### Conflict B: BKT-weak-but-not-due

BKT says "this skill is weak — student needs practice." FSRS says "no cards for this skill are due." Student has reviewed 1-2 cards recently and their R is still high; no other cards have been attempted yet.

**Case for force-serve:** Weak skills need practice; waiting for FSRS to schedule is too passive.

**Options:**
1. Serve an unseen card for this skill (introduces new FSRS state; progresses learning)
2. Force an early review of an already-seen card (violates FSRS's interval — sub-optimal for retention efficiency)
3. Wait until a card becomes due (passive; student doesn't improve on weak skill)

Option 1 is usually right if unseen cards exist. Option 2 only makes sense if the skill has no unseen cards left. Option 3 is wrong for weak skills.

### Edge case: UNSEEN + MASTERED

BKT's P(known) ≥ 0.7 without the student ever having seen any cards for this skill. This only happens if the BKT model propagates mastery from prerequisite skills (e.g., "student mastered multiplication, so they have high prior on two-step multiplication problems"). It's a design choice whether P(L0) inherits from prerequisite mastery. Worker_3's spec says P(L0) is a per-skill population prior — not a dynamic inference. Under that model, UNSEEN + MASTERED shouldn't arise. I'd keep it that way.

---

## Cold-start: diagnostic mode (pre-strategy)

> *Added after worker_3 review, 2026-04-17: original 3×3 matrix implicitly assumed the student has SOME attempt history. A brand-new student breaks this assumption.*

A new student has:
- FSRS state: empty for every card (all UNSEEN)
- BKT state: all skills at population P(L0) (all effectively LEARNING with equal P(known))
- Mood state: none (no signal history)

The blended priority score has no differentiating signal in this state. `fsrs_urgency = 0` for every card (no due reviews possible when there's no history). `bkt_urgency` is uniform across skills. The scheduler would degenerate to ranking by `novelty_bonus`, which is uniform too — effectively random selection across thousands of candidate cards.

**This is a separate problem from composition.** Bootstrapping ability estimates and discovering which skills a student actually knows is the domain of Computer Adaptive Testing (CAT), not of the steady-state scheduler.

**Diagnostic mode proposal:**

- Active for the first **10-15 problems** of a new student's first session (or until BKT has minimum evidence on 3+ grade-level skills).
- Serves a **fixed spread of difficulty × topic coverage**: 3 difficulty bands (easy / medium / hard) × 3-5 topics within the student's nominal grade. This is a curriculum-guided spread, not an adaptive selection.
- Purpose: generate initial BKT observations quickly so that, when the production scheduler takes over, it has real P(known) values per skill to work with.
- Transition: switch to Strategy C+D when **either**:
  - (a) ≥ 10 attempts logged AND P(known) on at least 3 skills is outside [0.4, 0.6] (BKT has made a confident call on at least 3 skills), **OR**
  - (b) ≥ 20 attempts logged regardless of BKT state (hard ceiling — prevents a uniform learner whose BKT lands near 0.5 on everything from staying in diagnostic mode indefinitely).

  Asymmetric risk is why the OR clause matters: switching to adaptive on weak BKT signal produces slightly noisier scheduling for a session or two until BKT sharpens, which is self-correcting. Staying in diagnostic forever means the system never personalizes for that student.
- Flagged explicitly in `decision_trace.mode: "diagnostic" | "adaptive"` so analytics can segment by which algorithm served which problem.

This also surfaces an invariant check: if Strategy C+D runs and finds ALL candidates at default BKT priors with no FSRS history, log a critical warning and fall back to diagnostic mode — catches the case where the transition logic fails or a session somehow gets wiped mid-use.

---

## Resolution strategies

### Strategy A: FSRS-primary with BKT-filter

> "Retention is the priority. Skip obviously-mastered reviews."

- FSRS ranks candidates by urgency (cards with lowest R first).
- BKT applies a filter: skip due reviews where BKT P(known) ≥ 0.9 AND R ≥ 0.7 (i.e., mastered skill with only mildly-declined retention).
- Unseen cards are served when no due cards pass the filter.

**Pros:** Preserves FSRS's retention guarantee. Simple to implement.
**Cons:** Doesn't actively push toward weak skills. A student can coast on a small set of known-well cards while weak skills go untouched.

### Strategy B: BKT-primary with FSRS-filter

> "Learning gaps are the priority. Use FSRS to pick which card within a weak skill."

- BKT picks target skill (lowest P(known)).
- For that skill, FSRS picks the card (most overdue, else most novel, else oldest).
- Overdue cards for mastered skills are deferred or silently lost.

**Pros:** Aggressively targets weak skills. Students feel like they're being helped where they need it.
**Cons:** Retention breaks down. Cards that should have been reviewed get skipped. Student forgets material that FSRS would have caught.

### Strategy C: Blended priority score (recommended)

> "Combine both signals into one priority, with a safety net."

For each candidate card c, compute:

```
fsrs_urgency(c) = max(0, 1 - R(c)/R_target)     # 0 if R ≥ target, up to 1 if R = 0
bkt_urgency(c)  = 1 - P(known)(skill_of(c))     # 0 if mastered, 1 if unknown
novelty_bonus(c) = 0.1 if c is unseen and skill is WEAK else 0

priority(c) = w_f * fsrs_urgency(c)
            + w_b * bkt_urgency(c)
            + novelty_bonus(c)
```

Serve the highest-priority card. Default weights: `w_f = 0.5`, `w_b = 0.5`.

**Safety net — the severely-overdue override:**

```
if any candidate has R(c) < 0.5:
    serve the card with lowest R, ignoring everything else
```

A card whose retention has dropped below 0.5 is effectively half-forgotten. Bumping it to the top regardless of BKT state prevents the "student coasts on weak-skill practice while everything else decays" failure mode.

**Pros:**
- Handles all 9 state cells uniformly.
- Tunable: product can set `w_f / w_b` ratio based on what metrics matter (retention vs. learning speed).
- Composes naturally with mood (see Strategy D).
- The safety net eliminates the worst-case tail outcome.

**Cons:**
- Tuning weights is an open empirical question. Cold-start at 0.5/0.5 is a guess.
- Priority score masks conflicts rather than surfacing them (hard to debug "why did the scheduler pick this card").

### Strategy D: Mood-gated weight shifts (layered on top of C)

Mood modifies the `w_f / w_b` weights AND the candidate pool for this session:

| Mood | w_f (FSRS) | w_b (BKT) | Candidate pool | Rationale |
|------|------------|------------|----------------|-----------|
| FLOW | w_f_default | w_b_default | All eligible cards | Default blend |
| FRUSTRATED | 0.7 | 0.3 | All eligible cards | Shift toward review of known material — rebuild confidence, avoid piling on new difficult skills |
| CONFUSED | 0.3 | 0.7 | **Prerequisite topic only** (via PREREQUISITE_TOPICS lookup on current topic) | Route to prerequisite topic FIRST; compute priority within that narrower pool only. Don't let the student continue struggling at the level where they got stuck. |
| BORED | 0.3 | 0.7 | All eligible cards + novelty bonus boosted to 0.3 | Shift toward new content and weak skills — unchallenged student needs fresh material |

**CONFUSED ordering is load-bearing.** The order of operations is:
1. Classify mood from behavioral signals
2. If CONFUSED: look up `PREREQUISITE_TOPICS[current_topic]` → narrow candidate pool to that prerequisite topic's cards only
3. Compute blended priority across the (possibly narrowed) candidate pool with mood-adjusted weights
4. Apply safety-net override if any card has R < 0.5
5. Serve the top-priority card

Computing priority across all topics and THEN realizing we should have been looking at the prerequisite is wrong — the prerequisite routing narrows what's in the pool, not how it's ranked.

This layer composes with the BKT mood modifiers worker_3 specced. The mood modifiers adjust what the scheduler *sees* (P(known) is effectively unchanged since modifiers live on P(T)/P(G)/P(S), not P(L0)). The mood weight-shifts adjust what the scheduler *picks* given what it sees, and the candidate-pool adjustment for CONFUSED changes what's eligible to be picked in the first place. They're orthogonal and all three are needed.

---

## Recommended decision for Thursday

Adopt **Strategy C + D** with these specifics:

1. **Blended priority** as the base algorithm. Weights default to `w_f = 0.5, w_b = 0.5`. Novelty bonus 0.1 for unseen cards on WEAK skills.
2. **Severely-overdue safety net**: any card with R < 0.5 jumps to top regardless of other signals.
3. **Mood-gated weight shifts** per the table in Strategy D. Weights and mood adjustments are centralized constants so they can be tuned from one place.
4. **Tuning plan**: default weights in Phase 2; A/B test and tune from production data in Phase 4 alongside IRT calibration.

Reasons I prefer this over A or B:

- Strategy A (FSRS-primary) optimizes retention but fails the "weak skills never get targeted" case. For K-6 math where the point is to learn new material, this is wrong product.
- Strategy B (BKT-primary) optimizes learning but lets retention decay silently. For a platform that charges parents for ongoing subscription value, losing acquired skills is a business problem, not just a pedagogy problem.
- Strategy C with a safety net gives both signals weight, avoids the pathological tails of each, and composes cleanly with mood work already in flight.

The cost is tuning complexity (3-5 tunable constants: weights, novelty bonus, safety-net threshold, mood adjustments). That's acceptable for a system with this much pedagogical subtlety.

---

## What I'd like Thursday to actually decide

1. **Ratify, override, or request modification of Strategy C+D.** If worker_2 or worker_3 sees a case I'm missing, better to surface it before code is written.
2. **Lock the default weights.** Three proposals on the table:
   - **0.5/0.5** (my original): neutral baseline, easiest to defend absent data. Worker_3 confirmed their spaced-repetition sim used scripted ground-truth moods, not real student data, so they have no empirical basis to argue for a different ratio — and recommended shipping 0.5/0.5 with plan to tune in Phase 4.
   - **0.4 FSRS / 0.6 BKT** (worker_2's proposal): foundation-building mode for K-6, failure mode is "never learned" not "forgot."
   - **0.55 BKT / 0.45 FSRS** (worker_3's hunch): edge-of-mastery learning > retention-of-known for elementary, but explicitly "worth nothing without data."

   Given worker_3's honest admission that no data exists to pick between these: **ship 0.5/0.5**. The three proposals are within ~10 percentage points of each other; the safety net + CONFUSED/BORED mood shifts are doing the bulk of the pedagogical work. Tune in Phase 4 using the decision_trace telemetry (see observability below — counterfactual replay from top-N candidates lets us answer "what would 0.4/0.6 have picked?" without a live A/B test).
3. **Lock the safety-net threshold** (R < 0.5). This is also a guess. Could be R < 0.6 (more aggressive) or R < 0.4 (more lenient).
4. **Decide where the priority computation lives** — in worker_2's generator? Worker_3's scheduler? Or my NestJS adaptive engine module? My vote: in the scheduler (worker_3's surface). Generator stays pure; backend wraps.
5. **Decide on structured `decision_trace` emission.** Every next-problem response includes a nested `decision_trace` field with named keys — NOT a free-form log string. Proposed shape (per worker_2 review):

   ```json
   {
     "mode": "adaptive",
     "picked_card_id": "prob_2a3f",
     "fsrs_urgency": 0.22,
     "bkt_urgency": 0.65,
     "novelty_bonus": 0.1,
     "mood_applied": "confused",
     "w_f_used": 0.3,
     "w_b_used": 0.7,
     "candidate_pool_scope": "prerequisite_topic:multiplication",
     "candidate_pool_size": 47,
     "safety_net_triggered": false,
     "final_priority": 0.615,
     "tiebreaker_used": null,
     "top_candidates": [
       {"card_id": "prob_2a3f", "fsrs_urgency": 0.22, "bkt_urgency": 0.65, "novelty_bonus": 0.1, "final_priority": 0.615},
       {"card_id": "prob_9b1c", "fsrs_urgency": 0.40, "bkt_urgency": 0.55, "novelty_bonus": 0.0, "final_priority": 0.505},
       {"card_id": "prob_7e3d", "fsrs_urgency": 0.00, "bkt_urgency": 0.80, "novelty_bonus": 0.1, "final_priority": 0.460},
       {"card_id": "prob_4f22", "fsrs_urgency": 0.35, "bkt_urgency": 0.40, "novelty_bonus": 0.0, "final_priority": 0.385},
       {"card_id": "prob_0a8e", "fsrs_urgency": 0.18, "bkt_urgency": 0.45, "novelty_bonus": 0.1, "final_priority": 0.369}
     ]
   }
   ```

   **Top-N candidate set (N=5) is the key addition** (worker_3's suggestion). Storage is small (5 rows per decision), but it enables **counterfactual replay**: given historical trace data, Phase 4 weight tuning can compute "what would weights of 0.7/0.3 have picked instead of 0.5/0.5?" without running a live A/B test. The tuning becomes a data regression problem over accumulated traces, not a fresh A/B experiment. This is the single biggest observability leverage point.

   Structured emission makes: (a) Phase 4 weight tuning data-driven instead of grid-search-from-scratch, (b) teacher dashboard debugging trivial ("why did Alex get shown a Grade 2 problem instead of Grade 3?" → trace the decision), (c) unit tests assertable (given a fixture student state + mood, the trace should match expected values), (d) retroactive analysis of the cold-start → adaptive transition via the `mode` field.

---

## Additional items flagged in review (worker_3, 2026-04-17)

**9. Signed novelty bonus for over-repetition.** Worker_3 flagged a concern: a card the student has reviewed 10+ times is pedagogically stale, and serving it again just because FSRS flagged it due can feel repetitive even if the algorithm is technically correct. Options:

- **(a) Trust FSRS's desirable-difficulty model:** well-learned cards have exponentially growing intervals, so 50 reviews of one card should never happen in a compressed timeframe. The current formula auto-corrects.
- **(b) Signed novelty bonus:** `novelty_bonus = +0.1` for 0 reviews, `0` for 1-10 reviews, `-0.05` for 11+ reviews — **within a rolling 30-day window, NOT lifetime count** (a card seen 15 times over 2 years is successful spaced retention; 15 times in 4 weeks is over-repetition; only the latter should be penalized). Explicit, debuggable, composes with blended priority without special-casing. **Magnitude verification:** in the target case (over-reviewed card with STABLE FSRS state, fsrs_urgency=0, same-skill novel alternative): over-reviewed priority = 0.5×bkt − 0.05; novel priority = 0.5×bkt + 0.1; novel wins by 0.15 — the penalty flips the decision correctly. In the "over-reviewed AND decayed" case (fsrs_urgency≈0.9): -0.05 does NOT flip the decision, but this is defensible — if retention has decayed, the card genuinely needs review and FSRS should win. Magnitudes can be tuned in Phase 4 from telemetry; ship as specified for Phase 2.
- **(c) Per-skill card rotation as a tiebreaker:** among candidates for a skill, prefer the card with the oldest last_review date when priorities are close. Doesn't override FSRS; just breaks ties toward variety.

My lean: **(b) signed novelty bonus** — it's explicit in the trace (the `novelty_bonus` field already exists and devs/analysts can see why a card was down-weighted), it composes with the blended priority cleanly, and the debit magnitude can be tuned if the effect is too strong. Bring to Thursday for decision.

---

## Additional items flagged in review (worker_2, 2026-04-17)

These refine Strategy C+D rather than replacing it. All three are proposed as acceptance criteria for P2-T04:

**6. Ability-matching tiebreaker.** When two candidate cards have identical priority scores (rare but possible, especially early in a session with thin data), break the tie by picking the card whose difficulty is closest to the student's current ability estimate (`student_ability_band`). Prevents the scheduler from producing jagged difficulty curves when multiple cards tie at the top. If priorities are still tied after difficulty-matching, fall back to deterministic ordering (e.g., lowest problem_id) so behavior is reproducible.

**7. `R_target` is a tunable constant, not fixed at 0.9.** FSRS's 0.9 default is calibrated for mature adult flashcard learners. For K-6 students on a gamified platform, 0.85 may be right — fewer reviews means less session fatigue, and slightly more forgetting is acceptable when the student is in learning-mode anyway (losses get picked up by the safety net or by BKT-driven re-practice). Default to 0.9 for Phase 2, A/B test 0.85 vs. 0.9 in Phase 4 using the Metabase analytics pipeline. The value should live as a single named constant so the tuning is localized.

**8. Assertion on UNSEEN + MASTERED.** The 3×3 state matrix has one cell ("UNSEEN + MASTERED") that shouldn't occur under worker_3's current BKT model (P(L0) is a per-skill population prior, not dynamically inferred from prerequisite mastery). If someone later changes the model to propagate mastery from prerequisites, this cell becomes reachable and the scheduler's behavior is undefined. Add an explicit invariant check in the scheduler state-update path: if this cell fires, log a critical warning and treat the state as UNSEEN + LEARNING (safest fallback — serve a new card for learning). Belt-and-suspenders against a future upstream model change silently breaking the scheduler.

## What this changes in the dev plan

- Scheduled task plan P2-T04 (Next-Problem Selection Algorithm) needs to reference this composition. Currently the description says "(1) check overdue reviews, (2) prioritize weakest skills, (3) target difficulty, (4) respect curriculum sequence" — which is essentially Strategy B. Updating to Strategy C+D is a task scope change, not a new task.
- The severely-overdue safety net should be an explicit acceptance criterion in P2-T04.
- Priority-score emission for debuggability should be added to the acceptance criteria.

If Thursday ratifies Strategy C+D, I'll update P2-T04 and the dev plan Phase 2 adaptive engine section to reflect it. If Thursday picks a different strategy, I'll update to match whatever was decided.

---

## Open questions I'm NOT resolving here

These are downstream of Thursday's composition decision:

- How does the scheduler handle the "student is done for the session" signal? (i.e., pick nothing, not pick something low-urgency)
- What's the batch size — does the scheduler pre-compute 10 cards or pick one-at-a-time? Affects responsiveness vs. smoothness of the priority curve.
- How does the scheduler interact with teacher-assigned homework sets (which override the default priority model entirely)?
- Do we want per-skill caps (e.g., "no more than 3 cards from the same skill in a row")?

These are worth Thursday's time if there's remaining bandwidth, but the composition decision is the critical path.
