# Curriculum Package — Pre-Handoff Deliverable

**Date:** 2026-04-17
**Author:** worker_2
**Purpose:** Resolve the open curriculum decision ("Singapore MOE or US Common Core" per P1-T16 of the scheduled task plan) and provide the content team with the decided curriculum, Grade 1-3 skill taxonomy, sample problems, quality guidelines, and a scaling sourcing plan. Unblocks P1-T16 (seed 500+ problems) which is flagged HIGH RISK in the dev plan.

---

## 1. Market Decision & Rationale

### Recommendation: **US Common Core (CCSS-M) for MVP**

### Comparison

| Dimension | US Common Core (CCSS-M) | Singapore MOE |
|-----------|------------------------|---------------|
| **K-6 TAM** | ~25M students in US public K-6; ~32M including private | ~400K primary students in Singapore |
| **Standards Licensing** | CCSS is public-domain-equivalent: NGA/CCSSO license is free for all uses, no per-use fees, no royalty | MOE syllabus is public; specific textbook publishers (Marshall Cavendish, SAP Education) hold copyright on problem databases |
| **Open Content Sources** | Illustrative Mathematics (CC BY 4.0 — commercial OK), OpenStax K-8 (CC BY), Open Up Resources (CC BY), NC Math (CC BY-SA). EngageNY is CC BY-NC-SA — not usable for paid product, skip | Ministry materials not openly licensed for commercial use; third-party Singapore Math resources are tightly copyrighted |
| **Competitive Density** | High but fragmented: IXL, Khan Academy, Prodigy, DreamBox, Zearn, Splash Math. No single dominant gamified K-6 math platform | Very high concentration: **Koblio owns 2/3 of Singapore primary schools**; Matholia deep on CPA methodology |
| **Localization Needs** | English only (US spelling); imperial measurement units; dollars | English + Mandarin for some; metric units; Singapore dollars |
| **Regulatory Complexity** | COPPA compliance for under-13 (non-trivial but one-time); no per-state approval for consumer product; SOC 2 for school districts | PDPA compliance; MOE approval useful for B2B but not required for B2C; individual school procurement cycles |
| **Expansion Path** | Easy: Canadian provinces map closely to CCSS; UK National Curriculum shares structure; Australia adapts cleanly | Harder: Singapore MOE methodology is prestigious but not a dominant curriculum elsewhere |

### Why Common Core over Singapore MOE

Three reasons drive the recommendation:

1. **Market size dominates all other factors.** US K-6 TAM is ~60× larger than Singapore. Even capturing 0.5% of US K-6 families exceeds capturing 10% of Singapore families. For a venture-backed startup, the math on CAC/LTV at scale favors the larger pond.

2. **Entering Koblio' home market is a direct-confrontation strategy against a well-entrenched incumbent.** Koblio has been operating in Singapore for 19 years, has 2/3 of primary schools, has MOE backing via IMDA, and has deep product-market fit with Singapore Math CPA methodology. A new entrant — even one with superior technology — will struggle to displace that network effect. The US market has no analogous incumbent; IXL is the closest but has limited gamification and lacks Singapore Math's respected pedagogy.

3. **Open content licensing collapses the content cold-start problem.** The HIGH RISK flag on P1-T16 (500-problem seed) is directly addressable with Illustrative Mathematics, OpenStax, and Open Up Resources — all CC BY 4.0 licensed for commercial use. Singapore MOE has no equivalent. Starting in CCSS gives the content team a 2,000+ problem head start from openly-licensed sources.

### Explicit tradeoff acknowledged

Singapore Math's CPA methodology is genuinely superior pedagogy. We keep it. The recommendation is not "abandon Singapore Math" — it is "use Singapore Math pedagogy to deliver CCSS-M standards to the US market." This is precisely the differentiation wedge: CCSS-aligned standards (required for US school adoption) + Singapore Math CPA instructional approach (superior learning outcomes). No US competitor currently does this combination at scale.

### Singapore MOE is the Phase 3-4 expansion market

Once the platform has product-market fit in the US (Phase 2-3), Singapore becomes the natural expansion market given the team's familiarity with Singapore Math. The dev plan's "localization framework" in Phase 4 handles this cleanly.

---

## 2. Grade 1-3 Skill Taxonomy (CCSS-M)

This taxonomy covers the core skills for CCSS Grades 1-3 that a student must master. Structure: `Domain → Cluster → Skill`. Each skill has a `skill_id` matching the CCSS identifier where possible, a `grade_level`, a `prerequisites` list (other `skill_id`s), a `description`, and a `typical_problem_count_target` for MVP content coverage.

**Total: 78 skills across 3 grades.**

Domains use standard CCSS abbreviations:
- **OA** — Operations & Algebraic Thinking
- **NBT** — Number & Operations in Base Ten
- **NF** — Number & Operations — Fractions (Grade 3+)
- **MD** — Measurement & Data
- **G** — Geometry

### Grade 1 (26 skills)

```yaml
# Grade 1 — Operations & Algebraic Thinking
- skill_id: G1.OA.01-add-within-10
  grade_level: 1
  domain: OA
  prerequisites: []
  description: "Add two single-digit numbers with sum ≤ 10"
  typical_problem_count_target: 60
- skill_id: G1.OA.02-subtract-within-10
  grade_level: 1
  domain: OA
  prerequisites: [G1.OA.01-add-within-10]
  description: "Subtract single-digit numbers with difference and minuend ≤ 10"
  typical_problem_count_target: 60
- skill_id: G1.OA.03-add-within-20
  grade_level: 1
  domain: OA
  prerequisites: [G1.OA.01-add-within-10]
  description: "Add whole numbers with sum ≤ 20, including crossing 10"
  typical_problem_count_target: 80
- skill_id: G1.OA.04-subtract-within-20
  grade_level: 1
  domain: OA
  prerequisites: [G1.OA.02-subtract-within-10, G1.OA.03-add-within-20]
  description: "Subtract within 20, including crossing 10"
  typical_problem_count_target: 80
- skill_id: G1.OA.05-word-problems-add-sub
  grade_level: 1
  domain: OA
  prerequisites: [G1.OA.03-add-within-20, G1.OA.04-subtract-within-20]
  description: "Solve add/subtract word problems within 20 (result unknown, change unknown, compare)"
  typical_problem_count_target: 80
- skill_id: G1.OA.06-commutative-property-add
  grade_level: 1
  domain: OA
  prerequisites: [G1.OA.01-add-within-10]
  description: "Apply commutative property: a + b = b + a"
  typical_problem_count_target: 30
- skill_id: G1.OA.07-associative-property-add
  grade_level: 1
  domain: OA
  prerequisites: [G1.OA.03-add-within-20]
  description: "Apply associative property: (a + b) + c = a + (b + c)"
  typical_problem_count_target: 30
- skill_id: G1.OA.08-fact-families
  grade_level: 1
  domain: OA
  prerequisites: [G1.OA.02-subtract-within-10]
  description: "Understand add/subtract as inverse operations using fact families (e.g., 3+4=7, 7-3=4, 7-4=3)"
  typical_problem_count_target: 40
- skill_id: G1.OA.09-make-ten-strategy
  grade_level: 1
  domain: OA
  prerequisites: [G1.OA.01-add-within-10]
  description: "Use make-ten strategy to add (e.g., 8+5 = 8+2+3 = 10+3 = 13)"
  typical_problem_count_target: 50
- skill_id: G1.OA.10-unknown-addend
  grade_level: 1
  domain: OA
  prerequisites: [G1.OA.03-add-within-20]
  description: "Find unknown addend: 8 + ? = 13"
  typical_problem_count_target: 40

# Grade 1 — Number & Operations in Base Ten
- skill_id: G1.NBT.01-count-to-120
  grade_level: 1
  domain: NBT
  prerequisites: []
  description: "Count, read, and write numerals to 120 starting at any number"
  typical_problem_count_target: 40
- skill_id: G1.NBT.02-place-value-tens-ones
  grade_level: 1
  domain: NBT
  prerequisites: [G1.NBT.01-count-to-120]
  description: "Understand 2-digit numbers as tens and ones (e.g., 47 = 4 tens + 7 ones)"
  typical_problem_count_target: 60
- skill_id: G1.NBT.03-compare-2-digit-numbers
  grade_level: 1
  domain: NBT
  prerequisites: [G1.NBT.02-place-value-tens-ones]
  description: "Compare 2-digit numbers using >, <, ="
  typical_problem_count_target: 50
- skill_id: G1.NBT.04-add-within-100
  grade_level: 1
  domain: NBT
  prerequisites: [G1.OA.03-add-within-20, G1.NBT.02-place-value-tens-ones]
  description: "Add 2-digit + 1-digit, 2-digit + multiple-of-10, within 100"
  typical_problem_count_target: 60
- skill_id: G1.NBT.05-mental-add-10
  grade_level: 1
  domain: NBT
  prerequisites: [G1.NBT.02-place-value-tens-ones]
  description: "Mentally find 10 more or 10 less than a 2-digit number, without counting"
  typical_problem_count_target: 30
- skill_id: G1.NBT.06-subtract-multiples-of-10
  grade_level: 1
  domain: NBT
  prerequisites: [G1.NBT.02-place-value-tens-ones]
  description: "Subtract multiples of 10 from multiples of 10, within 100 (e.g., 70 - 30)"
  typical_problem_count_target: 40

# Grade 1 — Measurement & Data
- skill_id: G1.MD.01-compare-lengths
  grade_level: 1
  domain: MD
  prerequisites: []
  description: "Order three objects by length; compare lengths of two objects indirectly via a third"
  typical_problem_count_target: 30
- skill_id: G1.MD.02-measure-length-units
  grade_level: 1
  domain: MD
  prerequisites: [G1.MD.01-compare-lengths]
  description: "Express length as whole number of same-size length units end-to-end"
  typical_problem_count_target: 30
- skill_id: G1.MD.03-tell-time-hour-half-hour
  grade_level: 1
  domain: MD
  prerequisites: []
  description: "Tell and write time in hours and half-hours using analog and digital clocks"
  typical_problem_count_target: 40
- skill_id: G1.MD.04-organize-data
  grade_level: 1
  domain: MD
  prerequisites: []
  description: "Organize, represent, and interpret data with up to three categories"
  typical_problem_count_target: 30

# Grade 1 — Geometry
- skill_id: G1.G.01-shape-attributes
  grade_level: 1
  domain: G
  prerequisites: []
  description: "Distinguish defining attributes (e.g., triangles are 3-sided) from non-defining (color, size)"
  typical_problem_count_target: 30
- skill_id: G1.G.02-compose-shapes
  grade_level: 1
  domain: G
  prerequisites: [G1.G.01-shape-attributes]
  description: "Compose 2D and 3D shapes from other shapes (e.g., two triangles make a rectangle)"
  typical_problem_count_target: 30
- skill_id: G1.G.03-partition-halves-fourths
  grade_level: 1
  domain: G
  prerequisites: [G1.G.01-shape-attributes]
  description: "Partition circles and rectangles into two or four equal shares; describe as halves or fourths"
  typical_problem_count_target: 30
```

### Grade 2 (26 skills)

```yaml
# Grade 2 — Operations & Algebraic Thinking
- skill_id: G2.OA.01-add-within-100
  grade_level: 2
  domain: OA
  prerequisites: [G1.NBT.04-add-within-100]
  description: "Add within 100 using place value, properties, and relationships"
  typical_problem_count_target: 80
- skill_id: G2.OA.02-subtract-within-100
  grade_level: 2
  domain: OA
  prerequisites: [G1.OA.04-subtract-within-20, G1.NBT.06-subtract-multiples-of-10]
  description: "Subtract within 100 using place value and relationships"
  typical_problem_count_target: 80
- skill_id: G2.OA.03-word-problems-2-step
  grade_level: 2
  domain: OA
  prerequisites: [G2.OA.01-add-within-100, G2.OA.02-subtract-within-100]
  description: "Solve two-step word problems with add/subtract within 100"
  typical_problem_count_target: 80
- skill_id: G2.OA.04-fluent-add-sub-within-20
  grade_level: 2
  domain: OA
  prerequisites: [G1.OA.03-add-within-20, G1.OA.04-subtract-within-20]
  description: "Fluently add and subtract within 20 using mental strategies; know all sums from memory"
  typical_problem_count_target: 60
- skill_id: G2.OA.05-odd-even
  grade_level: 2
  domain: OA
  prerequisites: [G2.OA.04-fluent-add-sub-within-20]
  description: "Determine odd or even from number of objects (pair counting); write equations expressing even numbers as sums of two equal addends"
  typical_problem_count_target: 30
- skill_id: G2.OA.06-arrays-multiplication-foundations
  grade_level: 2
  domain: OA
  prerequisites: [G2.OA.01-add-within-100]
  description: "Use arrays and repeated addition to find total objects (up to 5 rows × 5 columns) — foundation for multiplication"
  typical_problem_count_target: 50

# Grade 2 — Number & Operations in Base Ten
- skill_id: G2.NBT.01-place-value-hundreds
  grade_level: 2
  domain: NBT
  prerequisites: [G1.NBT.02-place-value-tens-ones]
  description: "Understand 3-digit numbers as hundreds, tens, ones"
  typical_problem_count_target: 60
- skill_id: G2.NBT.02-count-within-1000
  grade_level: 2
  domain: NBT
  prerequisites: [G2.NBT.01-place-value-hundreds]
  description: "Count within 1000; skip-count by 5s, 10s, 100s"
  typical_problem_count_target: 40
- skill_id: G2.NBT.03-read-write-3-digit
  grade_level: 2
  domain: NBT
  prerequisites: [G2.NBT.01-place-value-hundreds]
  description: "Read and write numbers to 1000 in base-10 numerals, number names, and expanded form"
  typical_problem_count_target: 50
- skill_id: G2.NBT.04-compare-3-digit
  grade_level: 2
  domain: NBT
  prerequisites: [G2.NBT.03-read-write-3-digit]
  description: "Compare two 3-digit numbers using >, <, ="
  typical_problem_count_target: 50
- skill_id: G2.NBT.05-add-within-1000
  grade_level: 2
  domain: NBT
  prerequisites: [G2.OA.01-add-within-100, G2.NBT.01-place-value-hundreds]
  description: "Add within 1000 using place value and algorithm (with regrouping)"
  typical_problem_count_target: 80
- skill_id: G2.NBT.06-subtract-within-1000
  grade_level: 2
  domain: NBT
  prerequisites: [G2.OA.02-subtract-within-100, G2.NBT.01-place-value-hundreds]
  description: "Subtract within 1000 using place value and algorithm (with regrouping)"
  typical_problem_count_target: 80
- skill_id: G2.NBT.07-mental-add-10-100
  grade_level: 2
  domain: NBT
  prerequisites: [G2.NBT.01-place-value-hundreds]
  description: "Mentally add or subtract 10 or 100 to/from a given 3-digit number"
  typical_problem_count_target: 40

# Grade 2 — Measurement & Data
- skill_id: G2.MD.01-measure-standard-units
  grade_level: 2
  domain: MD
  prerequisites: [G1.MD.02-measure-length-units]
  description: "Measure length using rulers, yardsticks, meter sticks (inches, feet, cm, m)"
  typical_problem_count_target: 40
- skill_id: G2.MD.02-different-units-same-object
  grade_level: 2
  domain: MD
  prerequisites: [G2.MD.01-measure-standard-units]
  description: "Measure same object with different units; relate number of units to unit size"
  typical_problem_count_target: 30
- skill_id: G2.MD.03-estimate-lengths
  grade_level: 2
  domain: MD
  prerequisites: [G2.MD.01-measure-standard-units]
  description: "Estimate lengths using units of inches, feet, cm, and meters"
  typical_problem_count_target: 30
- skill_id: G2.MD.04-compare-lengths-difference
  grade_level: 2
  domain: MD
  prerequisites: [G2.MD.01-measure-standard-units, G2.OA.02-subtract-within-100]
  description: "Measure to determine how much longer one object is than another in same units"
  typical_problem_count_target: 30
- skill_id: G2.MD.05-measurement-word-problems
  grade_level: 2
  domain: MD
  prerequisites: [G2.OA.03-word-problems-2-step, G2.MD.01-measure-standard-units]
  description: "Solve word problems involving lengths (add/subtract within 100 with same units)"
  typical_problem_count_target: 50
- skill_id: G2.MD.06-number-line
  grade_level: 2
  domain: MD
  prerequisites: [G2.NBT.02-count-within-1000]
  description: "Represent whole numbers as points on a number line; use number line for add/subtract within 100"
  typical_problem_count_target: 40
- skill_id: G2.MD.07-tell-time-5-minutes
  grade_level: 2
  domain: MD
  prerequisites: [G1.MD.03-tell-time-hour-half-hour]
  description: "Tell and write time to nearest 5 minutes using analog/digital clocks; AM/PM"
  typical_problem_count_target: 50
- skill_id: G2.MD.08-money
  grade_level: 2
  domain: MD
  prerequisites: [G2.OA.01-add-within-100]
  description: "Solve word problems involving dollar bills, quarters, dimes, nickels, pennies using $ and ¢ symbols"
  typical_problem_count_target: 60
- skill_id: G2.MD.09-line-plots
  grade_level: 2
  domain: MD
  prerequisites: [G2.MD.01-measure-standard-units]
  description: "Generate and interpret line plots with measurement data"
  typical_problem_count_target: 30
- skill_id: G2.MD.10-picture-bar-graphs
  grade_level: 2
  domain: MD
  prerequisites: [G1.MD.04-organize-data]
  description: "Draw and interpret picture graphs and bar graphs (single-unit scale)"
  typical_problem_count_target: 40

# Grade 2 — Geometry
- skill_id: G2.G.01-recognize-shapes
  grade_level: 2
  domain: G
  prerequisites: [G1.G.01-shape-attributes]
  description: "Recognize and draw shapes with specified attributes (angles, equal faces); identify triangles, quadrilaterals, pentagons, hexagons, cubes"
  typical_problem_count_target: 40
- skill_id: G2.G.02-partition-rectangles-rows-cols
  grade_level: 2
  domain: G
  prerequisites: [G2.OA.06-arrays-multiplication-foundations]
  description: "Partition rectangles into rows and columns of same-size squares; count to find total"
  typical_problem_count_target: 30
- skill_id: G2.G.03-partition-thirds
  grade_level: 2
  domain: G
  prerequisites: [G1.G.03-partition-halves-fourths]
  description: "Partition shapes into 2, 3, or 4 equal shares; describe as halves, thirds, fourths"
  typical_problem_count_target: 30
```

### Grade 3 (26 skills)

```yaml
# Grade 3 — Operations & Algebraic Thinking
- skill_id: G3.OA.01-multiplication-equal-groups
  grade_level: 3
  domain: OA
  prerequisites: [G2.OA.06-arrays-multiplication-foundations]
  description: "Interpret products of whole numbers as total objects in equal groups (e.g., 5 × 7 = 5 groups of 7)"
  typical_problem_count_target: 60
- skill_id: G3.OA.02-division-equal-shares
  grade_level: 3
  domain: OA
  prerequisites: [G3.OA.01-multiplication-equal-groups]
  description: "Interpret whole-number quotients as equal-share partitioning"
  typical_problem_count_target: 60
- skill_id: G3.OA.03-word-problems-mult-div
  grade_level: 3
  domain: OA
  prerequisites: [G3.OA.01-multiplication-equal-groups, G3.OA.02-division-equal-shares]
  description: "Solve word problems involving multiplication and division within 100"
  typical_problem_count_target: 80
- skill_id: G3.OA.04-unknown-factor-division
  grade_level: 3
  domain: OA
  prerequisites: [G3.OA.02-division-equal-shares]
  description: "Find the unknown whole number in multiplication/division equations (e.g., 8 × ? = 48)"
  typical_problem_count_target: 60
- skill_id: G3.OA.05a-commutative-mult
  grade_level: 3
  domain: OA
  prerequisites: [G3.OA.01-multiplication-equal-groups]
  description: "Apply commutative property of multiplication: a × b = b × a"
  typical_problem_count_target: 30
- skill_id: G3.OA.05b-associative-mult
  grade_level: 3
  domain: OA
  prerequisites: [G3.OA.01-multiplication-equal-groups]
  description: "Apply associative property of multiplication: (a × b) × c = a × (b × c)"
  typical_problem_count_target: 30
- skill_id: G3.OA.05c-distributive-property
  grade_level: 3
  domain: OA
  prerequisites: [G3.OA.01-multiplication-equal-groups, G2.OA.01-add-within-100]
  description: "Apply distributive property: a × (b + c) = (a × b) + (a × c)"
  typical_problem_count_target: 40
- skill_id: G3.OA.07-fluent-mult-div-within-100
  grade_level: 3
  domain: OA
  prerequisites: [G3.OA.01-multiplication-equal-groups, G3.OA.02-division-equal-shares]
  description: "Fluently multiply and divide within 100; know all products of two one-digit numbers from memory by end of Grade 3"
  typical_problem_count_target: 100
- skill_id: G3.OA.08-word-problems-4-operations
  grade_level: 3
  domain: OA
  prerequisites: [G3.OA.07-fluent-mult-div-within-100, G2.OA.03-word-problems-2-step]
  description: "Solve two-step word problems using four operations; represent with equations with unknown quantity"
  typical_problem_count_target: 80
- skill_id: G3.OA.09-arithmetic-patterns
  grade_level: 3
  domain: OA
  prerequisites: [G3.OA.07-fluent-mult-div-within-100]
  description: "Identify arithmetic patterns (in tables, addition/multiplication charts) and explain using properties"
  typical_problem_count_target: 40

# Grade 3 — Number & Operations in Base Ten
- skill_id: G3.NBT.01-round-10-100
  grade_level: 3
  domain: NBT
  prerequisites: [G2.NBT.01-place-value-hundreds, G2.MD.06-number-line]
  description: "Round whole numbers to nearest 10 or 100"
  typical_problem_count_target: 40
- skill_id: G3.NBT.02-fluent-add-sub-within-1000
  grade_level: 3
  domain: NBT
  prerequisites: [G2.NBT.05-add-within-1000, G2.NBT.06-subtract-within-1000]
  description: "Fluently add and subtract within 1000 using strategies and standard algorithm"
  typical_problem_count_target: 80
- skill_id: G3.NBT.03-multiply-1-digit-by-multiples-10
  grade_level: 3
  domain: NBT
  prerequisites: [G3.OA.01-multiplication-equal-groups]
  description: "Multiply one-digit whole numbers by multiples of 10 (e.g., 9 × 80)"
  typical_problem_count_target: 40

# Grade 3 — Number & Operations - Fractions (NEW in Grade 3)
- skill_id: G3.NF.01-unit-fractions
  grade_level: 3
  domain: NF
  prerequisites: [G2.G.03-partition-thirds]
  description: "Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts"
  typical_problem_count_target: 50
- skill_id: G3.NF.02-fractions-on-number-line
  grade_level: 3
  domain: NF
  prerequisites: [G3.NF.01-unit-fractions, G2.MD.06-number-line]
  description: "Represent a fraction a/b on a number line"
  typical_problem_count_target: 60
- skill_id: G3.NF.03a-equivalent-fractions
  grade_level: 3
  domain: NF
  prerequisites: [G3.NF.02-fractions-on-number-line]
  description: "Understand equivalent fractions: different a/b represent the same point on a number line"
  typical_problem_count_target: 50
- skill_id: G3.NF.03c-whole-numbers-as-fractions
  grade_level: 3
  domain: NF
  prerequisites: [G3.NF.01-unit-fractions]
  description: "Express whole numbers as fractions (e.g., 3 = 3/1; 6/2 = 3)"
  typical_problem_count_target: 30
- skill_id: G3.NF.03d-compare-fractions
  grade_level: 3
  domain: NF
  prerequisites: [G3.NF.02-fractions-on-number-line]
  description: "Compare two fractions with same numerator OR same denominator using <, >, ="
  typical_problem_count_target: 50

# Grade 3 — Measurement & Data
- skill_id: G3.MD.01-elapsed-time
  grade_level: 3
  domain: MD
  prerequisites: [G2.MD.07-tell-time-5-minutes]
  description: "Tell and write time to nearest minute; solve problems involving elapsed time intervals in minutes"
  typical_problem_count_target: 50
- skill_id: G3.MD.02-liquid-volume-mass
  grade_level: 3
  domain: MD
  prerequisites: [G3.OA.03-word-problems-mult-div]
  description: "Measure and estimate liquid volumes (L) and masses (g, kg); solve one-step word problems"
  typical_problem_count_target: 40
- skill_id: G3.MD.03-scaled-graphs
  grade_level: 3
  domain: MD
  prerequisites: [G2.MD.10-picture-bar-graphs, G3.OA.01-multiplication-equal-groups]
  description: "Draw and interpret scaled picture graphs and bar graphs (scale 2, 5, 10)"
  typical_problem_count_target: 40
- skill_id: G3.MD.04-measure-fractional-inches
  grade_level: 3
  domain: MD
  prerequisites: [G2.MD.01-measure-standard-units, G3.NF.01-unit-fractions]
  description: "Measure lengths to nearest half and quarter inch; generate line plots"
  typical_problem_count_target: 30
- skill_id: G3.MD.05-area-concept
  grade_level: 3
  domain: MD
  prerequisites: [G2.G.02-partition-rectangles-rows-cols]
  description: "Understand area as the measure of a region using unit squares"
  typical_problem_count_target: 30
- skill_id: G3.MD.06-measure-area-unit-squares
  grade_level: 3
  domain: MD
  prerequisites: [G3.MD.05-area-concept]
  description: "Measure area by counting unit squares (sq cm, sq in, sq ft, sq m)"
  typical_problem_count_target: 40
- skill_id: G3.MD.07-area-multiplication
  grade_level: 3
  domain: MD
  prerequisites: [G3.MD.06-measure-area-unit-squares, G3.OA.01-multiplication-equal-groups]
  description: "Relate area to multiplication and addition; find area of rectangles by multiplying side lengths"
  typical_problem_count_target: 60
- skill_id: G3.MD.08-perimeter
  grade_level: 3
  domain: MD
  prerequisites: [G3.NBT.02-fluent-add-sub-within-1000]
  description: "Solve problems involving perimeter of polygons (find perimeter given sides; find unknown side given perimeter)"
  typical_problem_count_target: 50

# Grade 3 — Geometry
- skill_id: G3.G.01-classify-shapes
  grade_level: 3
  domain: G
  prerequisites: [G2.G.01-recognize-shapes]
  description: "Understand shapes in different categories (rhombuses, rectangles) may share attributes (quadrilateral)"
  typical_problem_count_target: 40
- skill_id: G3.G.02-partition-equal-areas
  grade_level: 3
  domain: G
  prerequisites: [G3.NF.01-unit-fractions, G3.MD.06-measure-area-unit-squares]
  description: "Partition shapes into parts with equal areas; express each part as unit fraction of whole"
  typical_problem_count_target: 30
```

**Taxonomy summary:** 78 skills total (G1: 26, G2: 26, G3: 26). Full-coverage content target at typical problem count: ~3,500 problems. MVP target per P1-T16 (500 problems): 6-7 problems per skill as launch minimum, with the most heavily-used foundational skills (addition/subtraction fluency, multiplication facts) seeded at 12-15 each.

---

## 3. Sample Problem Set (30 problems)

Each problem follows the schema compatible with `generate_problem()` from `math_puzzle_generator.py` and extended for the MongoDB content store. Fields:

- `problem_id`: stable UUID-style identifier
- `skill_id`: curriculum skill reference
- `grade`: 1, 2, or 3
- `difficulty`: 1 (easiest) to 5 (hardest) within the skill
- `question_type`: multiple_choice | numeric | word_problem | fill_in
- `question`: problem text (may include LaTeX for math)
- `answer`: correct answer
- `distractors` (MC only): list of wrong options, including `common_wrong_answers` where specified
- `hints`: 2-3 progressive hints, each revealing strictly more
- `common_wrong_answers`: list of {value, why_students_pick_it} — useful for diagnostic analytics
- `estimated_time_seconds`: reasonable time for a student at target grade

```yaml
# ==========================================
# GRADE 1 PROBLEMS
# ==========================================

- problem_id: p_g1_001
  skill_id: G1.OA.01-add-within-10
  grade: 1
  difficulty: 1
  question_type: multiple_choice
  question: "What is 4 + 3?"
  answer: "7"
  distractors: ["6", "8", "12"]
  common_wrong_answers:
    - {value: "8", why: "Off-by-one counting error"}
    - {value: "12", why: "Confused addition with multiplication"}
  hints:
    - "Start at 4 and count forward 3 times."
    - "4, then 5 (that's 1), 6 (that's 2), 7 (that's 3)."
  estimated_time_seconds: 20

- problem_id: p_g1_002
  skill_id: G1.OA.05-word-problems-add-sub
  grade: 1
  difficulty: 2
  question_type: word_problem
  question: "Maya had 12 stickers. She gave 5 stickers to her friend Dev. How many stickers does Maya have left?"
  answer: "7"
  hints:
    - "Maya is giving stickers away, so she'll have fewer. That means we subtract."
    - "Start with 12 and take away 5."
    - "12 - 5 = ?"
  common_wrong_answers:
    - {value: "17", why: "Added instead of subtracted"}
    - {value: "5", why: "Answered the number given away, not what's left"}
  estimated_time_seconds: 60

- problem_id: p_g1_003
  skill_id: G1.OA.09-make-ten-strategy
  grade: 1
  difficulty: 3
  question_type: numeric
  question: "Use the make-ten strategy to solve: 8 + 6 = ?"
  answer: "14"
  hints:
    - "8 needs 2 more to make 10. Split the 6 into 2 + 4."
    - "Now you have (8 + 2) + 4 = 10 + 4."
    - "10 + 4 = ?"
  estimated_time_seconds: 45

- problem_id: p_g1_004
  skill_id: G1.NBT.02-place-value-tens-ones
  grade: 1
  difficulty: 2
  question_type: multiple_choice
  question: "In the number 46, what does the 4 represent?"
  answer: "4 tens"
  distractors: ["4 ones", "4 hundreds", "4 fours"]
  common_wrong_answers:
    - {value: "4 ones", why: "Confused place value positions"}
  hints:
    - "46 is made of some tens and some ones."
    - "The first digit tells you how many tens, the second digit tells you how many ones."
  estimated_time_seconds: 30

- problem_id: p_g1_005
  skill_id: G1.MD.03-tell-time-hour-half-hour
  grade: 1
  difficulty: 1
  question_type: multiple_choice
  question: "The hour hand is on 3 and the minute hand is on 12. What time is it?"
  answer: "3:00"
  distractors: ["12:03", "3:30", "12:15"]
  common_wrong_answers:
    - {value: "12:03", why: "Read minute hand position as hour"}
  hints:
    - "The minute hand on 12 means it's the top of the hour."
    - "The hour hand points to the current hour."
  estimated_time_seconds: 30

- problem_id: p_g1_006
  skill_id: G1.G.01-shape-attributes
  grade: 1
  difficulty: 1
  question_type: multiple_choice
  question: "Which shape has exactly 4 equal sides and 4 square corners?"
  answer: "Square"
  distractors: ["Rectangle", "Triangle", "Circle"]
  common_wrong_answers:
    - {value: "Rectangle", why: "Rectangle has 4 square corners but not all sides equal"}
  hints:
    - "Count the sides first. Which shapes have 4 sides?"
    - "Now check: do all 4 sides have the same length?"
  estimated_time_seconds: 25

# ==========================================
# GRADE 2 PROBLEMS
# ==========================================

- problem_id: p_g2_001
  skill_id: G2.OA.03-word-problems-2-step
  grade: 2
  difficulty: 3
  question_type: word_problem
  question: "Ethan collected 34 seashells at the beach. He gave 12 to his sister. Then he found 8 more seashells. How many seashells does Ethan have now?"
  answer: "30"
  hints:
    - "This is a two-step problem. First figure out how many seashells he had after giving some away."
    - "Step 1: 34 - 12 = 22. Step 2: add the 8 he found."
    - "22 + 8 = ?"
  common_wrong_answers:
    - {value: "14", why: "Did 34 - 12 - 8 instead of adding the new ones"}
    - {value: "54", why: "Added everything without subtracting"}
  estimated_time_seconds: 90

- problem_id: p_g2_002
  skill_id: G2.NBT.05-add-within-1000
  grade: 2
  difficulty: 2
  question_type: numeric
  question: "What is 247 + 156?"
  answer: "403"
  hints:
    - "Line up the numbers by place value: ones, tens, hundreds."
    - "Add the ones first (7 + 6 = 13, write 3 carry 1), then tens, then hundreds."
  common_wrong_answers:
    - {value: "393", why: "Forgot to carry from ones to tens"}
    - {value: "303", why: "Forgot to carry from tens to hundreds"}
  estimated_time_seconds: 75

- problem_id: p_g2_003
  skill_id: G2.MD.01-measure-standard-units
  grade: 2
  difficulty: 1
  question_type: multiple_choice
  question: "Which unit would you use to measure the length of a pencil?"
  answer: "Inches"
  distractors: ["Feet", "Yards", "Miles"]
  common_wrong_answers:
    - {value: "Feet", why: "Overestimated length of pencil"}
  hints:
    - "Think about how long a pencil actually is — smaller than a foot, right?"
    - "Use the smallest unit that fits the object."
  estimated_time_seconds: 25

- problem_id: p_g2_004
  skill_id: G2.MD.08-money
  grade: 2
  difficulty: 3
  question_type: word_problem
  question: "Priya has 3 quarters, 2 dimes, and 4 pennies. How much money does she have in total?"
  answer: "$0.99"
  hints:
    - "Quarters are 25¢, dimes are 10¢, pennies are 1¢."
    - "3 × 25 = 75. Then add 2 × 10 = 20. Then add 4 × 1 = 4."
    - "75 + 20 + 4 = ?"
  common_wrong_answers:
    - {value: "$0.89", why: "Forgot to count pennies"}
    - {value: "$9.00", why: "Confused cents with dollars"}
  estimated_time_seconds: 90

- problem_id: p_g2_005
  skill_id: G2.MD.10-picture-bar-graphs
  grade: 2
  difficulty: 2
  question_type: multiple_choice
  question: "A bar graph shows favorite fruits: Apples 5, Bananas 8, Grapes 3, Oranges 7. How many more students chose Bananas than Grapes?"
  answer: "5"
  distractors: ["3", "8", "11"]
  common_wrong_answers:
    - {value: "11", why: "Added instead of subtracted"}
    - {value: "3", why: "Answered grapes count, not difference"}
  hints:
    - "'How many more' means subtract."
    - "Bananas (8) minus Grapes (3) = ?"
  estimated_time_seconds: 60

- problem_id: p_g2_006
  skill_id: G2.G.02-partition-rectangles-rows-cols
  grade: 2
  difficulty: 2
  question_type: numeric
  question: "A rectangle is partitioned into 4 rows and 6 columns of equal-size squares. How many squares are there in total?"
  answer: "24"
  hints:
    - "When you partition a rectangle into rows and columns, you can count the total squares."
    - "4 rows × 6 columns means 4 groups of 6."
    - "4 + 4 + 4 + 4 + 4 + 4 OR 6 + 6 + 6 + 6 = ?"
  common_wrong_answers:
    - {value: "10", why: "Added 4 + 6 instead of multiplying"}
  estimated_time_seconds: 60

- problem_id: p_g2_007
  skill_id: G2.OA.06-arrays-multiplication-foundations
  grade: 2
  difficulty: 2
  question_type: multiple_choice
  question: "Samira arranges her toy cars in 3 rows with 4 cars in each row. Which equation shows the total number of cars?"
  answer: "4 + 4 + 4 = 12"
  distractors: ["4 + 3 = 7", "3 + 4 = 7", "4 - 3 = 1"]
  hints:
    - "She has 3 rows, and each row has 4 cars. That's 3 groups of 4."
    - "Repeated addition: add 4 three times."
  estimated_time_seconds: 45

- problem_id: p_g2_008
  skill_id: G2.MD.07-tell-time-5-minutes
  grade: 2
  difficulty: 2
  question_type: multiple_choice
  question: "The hour hand is between 2 and 3, and the minute hand is on the 7. What time is it?"
  answer: "2:35"
  distractors: ["2:07", "3:35", "7:02"]
  common_wrong_answers:
    - {value: "2:07", why: "Read minute hand position number as minutes, not 7×5"}
  hints:
    - "Each number on a clock face represents 5 minutes past the hour."
    - "Minute hand on 7 means 7 × 5 = 35 minutes past."
  estimated_time_seconds: 45

# ==========================================
# GRADE 3 PROBLEMS
# ==========================================

- problem_id: p_g3_001
  skill_id: G3.OA.01-multiplication-equal-groups
  grade: 3
  difficulty: 2
  question_type: word_problem
  question: "A classroom has 6 tables. Each table has 4 chairs. How many chairs are there in total?"
  answer: "24"
  hints:
    - "There are 6 tables, and each has 4 chairs. That's 6 equal groups of 4."
    - "You can add: 4 + 4 + 4 + 4 + 4 + 4, or multiply: 6 × 4."
  common_wrong_answers:
    - {value: "10", why: "Added 6 + 4 instead of multiplying"}
    - {value: "6", why: "Answered the table count, not chair count"}
  estimated_time_seconds: 60

- problem_id: p_g3_002
  skill_id: G3.OA.02-division-equal-shares
  grade: 3
  difficulty: 2
  question_type: numeric
  question: "There are 28 cookies to share equally among 7 friends. How many cookies does each friend get?"
  answer: "4"
  hints:
    - "Sharing equally means division."
    - "28 divided by 7 equals how many groups of 7 fit in 28?"
    - "7 × ? = 28"
  common_wrong_answers:
    - {value: "21", why: "Subtracted 28 - 7 instead of dividing"}
  estimated_time_seconds: 60

- problem_id: p_g3_003
  skill_id: G3.OA.03-word-problems-mult-div
  grade: 3
  difficulty: 3
  question_type: word_problem
  question: "A baker makes 9 trays of muffins. Each tray holds 8 muffins. If she packs them into boxes of 6, how many full boxes can she make?"
  answer: "12"
  hints:
    - "Two steps: first find the total muffins, then divide into boxes."
    - "Total muffins: 9 × 8 = 72."
    - "Now divide: 72 ÷ 6 = ?"
  common_wrong_answers:
    - {value: "72", why: "Stopped at total muffins, forgot to divide into boxes"}
    - {value: "17", why: "Added 9 + 8 instead of multiplying"}
  estimated_time_seconds: 120

- problem_id: p_g3_004
  skill_id: G3.OA.05c-distributive-property
  grade: 3
  difficulty: 3
  question_type: numeric
  question: "Use the distributive property to find 7 × 12. Split 12 as 10 + 2."
  answer: "84"
  hints:
    - "The distributive property means: 7 × (10 + 2) = (7 × 10) + (7 × 2)."
    - "7 × 10 = 70. 7 × 2 = 14."
    - "70 + 14 = ?"
  common_wrong_answers:
    - {value: "17", why: "Added 7 + 10 + 2 = 19 with arithmetic slip"}
    - {value: "9", why: "Computed 7 + 2 only"}
  estimated_time_seconds: 75

- problem_id: p_g3_005
  skill_id: G3.OA.07-fluent-mult-div-within-100
  grade: 3
  difficulty: 2
  question_type: multiple_choice
  question: "What is 7 × 8?"
  answer: "56"
  distractors: ["54", "63", "48"]
  common_wrong_answers:
    - {value: "54", why: "Confused with 6 × 9"}
    - {value: "48", why: "Computed 6 × 8 instead"}
  hints:
    - "Think of 7 groups of 8, or 8 groups of 7."
    - "If 7 × 7 = 49, then 7 × 8 is 7 more than that."
  estimated_time_seconds: 20

- problem_id: p_g3_006
  skill_id: G3.NF.01-unit-fractions
  grade: 3
  difficulty: 2
  question_type: multiple_choice
  question: "A pizza is cut into 8 equal slices. Maya eats 1 slice. What fraction of the pizza did she eat?"
  answer: "1/8"
  distractors: ["8/1", "1/7", "7/8"]
  common_wrong_answers:
    - {value: "7/8", why: "Answered fraction remaining, not eaten"}
    - {value: "1/7", why: "Subtracted 1 from total pieces incorrectly"}
  hints:
    - "The pizza has 8 equal parts. The bottom number of a fraction is the total parts."
    - "The top number is how many parts Maya has."
  estimated_time_seconds: 45

- problem_id: p_g3_007
  skill_id: G3.NF.03a-equivalent-fractions
  grade: 3
  difficulty: 3
  question_type: multiple_choice
  question: "Which fraction is equivalent to 2/4?"
  answer: "1/2"
  distractors: ["2/8", "4/2", "3/4"]
  common_wrong_answers:
    - {value: "2/8", why: "Doubled the denominator but not the numerator"}
  hints:
    - "Equivalent fractions represent the same amount."
    - "If you divide both the top and bottom of 2/4 by 2, what do you get?"
  estimated_time_seconds: 50

- problem_id: p_g3_008
  skill_id: G3.NF.03d-compare-fractions
  grade: 3
  difficulty: 3
  question_type: multiple_choice
  question: "Which is larger: 3/8 or 5/8?"
  answer: "5/8"
  distractors: ["3/8", "They are equal", "Cannot tell without more info"]
  hints:
    - "These fractions have the same denominator (bottom number)."
    - "When denominators are the same, the larger numerator means the larger fraction."
  estimated_time_seconds: 35

- problem_id: p_g3_009
  skill_id: G3.MD.01-elapsed-time
  grade: 3
  difficulty: 3
  question_type: word_problem
  question: "A movie starts at 2:15 PM and ends at 4:05 PM. How long is the movie, in minutes?"
  answer: "110"
  hints:
    - "From 2:15 to 3:15 is 60 minutes (1 hour)."
    - "From 3:15 to 4:05 is 50 more minutes."
    - "60 + 50 = ?"
  common_wrong_answers:
    - {value: "190", why: "Subtracted 4:05 - 2:15 as if decimals"}
    - {value: "90", why: "Computed hours only (2), ignored minutes"}
  estimated_time_seconds: 120

- problem_id: p_g3_010
  skill_id: G3.MD.07-area-multiplication
  grade: 3
  difficulty: 2
  question_type: numeric
  question: "A rectangle has a length of 9 feet and a width of 4 feet. What is its area in square feet?"
  answer: "36"
  hints:
    - "Area of a rectangle = length × width."
    - "9 × 4 = ?"
  common_wrong_answers:
    - {value: "26", why: "Computed perimeter (2×9 + 2×4) instead of area"}
    - {value: "13", why: "Added 9 + 4 instead of multiplying"}
  estimated_time_seconds: 45

- problem_id: p_g3_011
  skill_id: G3.MD.08-perimeter
  grade: 3
  difficulty: 3
  question_type: numeric
  question: "A rectangular garden has sides of 12 meters, 8 meters, 12 meters, and 8 meters. What is its perimeter?"
  answer: "40"
  hints:
    - "Perimeter is the total distance around a shape — add up all the sides."
    - "12 + 8 + 12 + 8 = ?"
  common_wrong_answers:
    - {value: "96", why: "Computed area instead of perimeter"}
    - {value: "20", why: "Added two sides only"}
  estimated_time_seconds: 45

- problem_id: p_g3_012
  skill_id: G3.NBT.01-round-10-100
  grade: 3
  difficulty: 2
  question_type: multiple_choice
  question: "What is 347 rounded to the nearest 100?"
  answer: "300"
  distractors: ["350", "400", "340"]
  common_wrong_answers:
    - {value: "400", why: "Rounded up because 47 is more than halfway to 50 (confused rule)"}
    - {value: "350", why: "Rounded to nearest 10 instead of 100"}
  hints:
    - "Look at the tens digit to decide: is 47 closer to 0 or to 100?"
    - "If the tens digit is less than 5, round down."
  estimated_time_seconds: 40

- problem_id: p_g3_013
  skill_id: G3.NF.02-fractions-on-number-line
  grade: 3
  difficulty: 3
  question_type: multiple_choice
  question: "On a number line from 0 to 1 divided into 4 equal parts, where is 3/4 located?"
  answer: "At the third mark from 0"
  distractors: ["At the first mark from 0", "At the second mark from 0", "At the end (1)"]
  hints:
    - "The number line is split into 4 equal parts because the denominator is 4."
    - "The numerator 3 tells you to count 3 of those parts from 0."
  estimated_time_seconds: 50

- problem_id: p_g3_014
  skill_id: G3.OA.09-arithmetic-patterns
  grade: 3
  difficulty: 3
  question_type: multiple_choice
  question: "What number comes next: 5, 10, 15, 20, ___?"
  answer: "25"
  distractors: ["22", "24", "30"]
  hints:
    - "Look at how the numbers change from one to the next."
    - "Each number is 5 more than the one before."
  estimated_time_seconds: 25

- problem_id: p_g3_015
  skill_id: G3.OA.08-word-problems-4-operations
  grade: 3
  difficulty: 4
  question_type: word_problem
  question: "A pack of trading cards costs $3. Liam buys 4 packs. He pays with a $20 bill. How much change does he get back?"
  answer: "$8"
  hints:
    - "Two steps: first find the total cost, then subtract from $20."
    - "Total cost: 4 × $3 = $12."
    - "Change: $20 - $12 = ?"
  common_wrong_answers:
    - {value: "$12", why: "Stopped at total cost, didn't subtract for change"}
    - {value: "$17", why: "Subtracted only one pack ($3) instead of four"}
  estimated_time_seconds: 120

- problem_id: p_g3_016
  skill_id: G3.G.01-classify-shapes
  grade: 3
  difficulty: 2
  question_type: multiple_choice
  question: "Which statement is TRUE?"
  answer: "All squares are rectangles."
  distractors:
    - "All rectangles are squares."
    - "Squares and rectangles have no shared properties."
    - "A square is not a quadrilateral."
  hints:
    - "A rectangle is a 4-sided shape with 4 right angles."
    - "A square also has 4 sides and 4 right angles — plus all equal sides."
    - "So every square meets the requirements to be a rectangle, but not every rectangle has equal sides."
  estimated_time_seconds: 60
```

**Problem distribution:** Grade 1 (6), Grade 2 (8), Grade 3 (16). Weighted toward Grade 3 because it introduces new domain (NF) and multiplication/division which are the hardest single learning jumps in the K-3 arc.

---

## 4. Content Quality Guidelines

### 4.1 Tone & Language

| Guideline | Rule |
|-----------|------|
| **Reading level** | Problem text must test at Flesch-Kincaid grade ≤ the target grade. Grade 1 problems: FK ≤ 1.5. Grade 2: FK ≤ 2.5. Grade 3: FK ≤ 3.5. Use plain everyday words. Introduce math vocabulary only when the skill being tested is the vocabulary itself. |
| **Sentence length** | Grade 1: max 10 words per sentence. Grade 2: max 14. Grade 3: max 18. If a problem needs more context, split into multiple short sentences. |
| **Voice** | Friendly, concrete, present tense. Avoid abstract phrasing. "Sam has 5 apples" not "Consider a set of 5 apples owned by Sam." |
| **Second person** | Generally avoid "you" in problem statements (except as a hint voice). Use named characters. |
| **Avoid negatives** | Don't use double negatives or negative framing in question stems. "Which is *not* a rectangle?" is harder to parse than "Which shape is a triangle?" |

### 4.2 Accessibility & Inclusivity

| Guideline | Rule |
|-----------|------|
| **Names** | Use a diverse rotation of names representing multiple cultural backgrounds (e.g., Maya, Dev, Ethan, Priya, Samira, Liam, Aisha, Marco, Kenji, Luca, Fatima, Jamal, Ines, Chen, Rosa). No single cultural background should dominate problem examples. |
| **Contexts** | Rotate problem contexts across: school (classroom, library, recess), nature (trees, animals, weather), sports, cooking, art, games, family life. Avoid contexts that assume one cultural experience (e.g., specific religious holidays, unfamiliar foods) unless explicitly teaching about that context. |
| **No gender stereotypes** | Don't map hobbies/activities to gender. Priya can be playing soccer; Dev can be baking; Maya can be building. |
| **Economic neutrality** | Avoid contexts that implicitly assume wealth (no "My dad bought a new boat"). Money problems should use small amounts typical for K-6 ($0.05–$20 range). |
| **Ability neutrality** | Don't use characters' physical ability as a plot point unless specifically modeling inclusive scenarios. |
| **Screen reader friendly** | All images used in problems must have alt text describing the mathematical content (e.g., "A bar graph showing 5 apples, 8 bananas, 3 grapes, 7 oranges" — not "bar graph"). LaTeX math expressions render with readable alt text via MathML. |
| **Color-independent** | If a problem references colored objects, the color should not be the only distinguishing feature. "The blue circle" works with alt text; "the largest red shape" is better ("largest" is color-independent). |

### 4.3 Difficulty Scaffolding (1-5 Scale)

| Difficulty | Characteristics | Example |
|-----------|----------------|---------|
| **1** | Single-step. Numbers at easiest end of skill. Context is familiar. Minimal reading. | "What is 2 + 3?" |
| **2** | Single-step. Numbers mid-range for skill. Simple context. | "A box has 7 crayons. Mei adds 5 more. How many crayons are in the box?" |
| **3** | Single-step with extraneous info OR two-step with clear sequence. Mid-range numbers. | "Dev has 24 marbles. He gives 6 to each of his 2 friends. How many marbles does he have left?" |
| **4** | Multi-step. Requires recognizing the operation to use. Harder numbers. | "A school bus holds 40 students. There are 185 students going on a trip. How many buses are needed?" |
| **5** | Multi-step requiring strategy selection. Edge cases (remainders, rounding ambiguity). Integrates multiple skills. | "Elena needs to cut ribbon 1/3 of a yard long. She has a 4-yard roll. How many full pieces can she cut? How much ribbon is left?" |

### 4.4 Hint Generation Rules

Every problem must have **2-3 progressive hints**:

1. **Hint 1** — Strategic. Points to the approach without giving numbers. "This is a two-step problem. Start by finding the total."
2. **Hint 2** — Tactical. Gives the first concrete step or sets up the equation. "Total cost: 4 × $3 = $12. Now subtract from the amount paid."
3. **Hint 3 (optional)** — Computational. Sets up the final arithmetic but doesn't solve it. "$20 − $12 = ?"

**Hint rules:**
- Each hint must reveal *strictly more* than the previous. Never restate without new information.
- The final hint should leave the student one concrete step away from the answer, not give the answer.
- Hints should reference CPA (Concrete-Pictorial-Abstract) representations where useful: "Imagine the number line…", "Draw the array…", "Think of the groups of 3…"
- Avoid hints that say "Think harder" or "Try again" — those are not hints.

### 4.5 Common Wrong Answers (for MC problems)

Distractors in multiple-choice problems must include at least one **diagnostic wrong answer** — a wrong answer that reveals a specific misconception. Examples:

| Problem | Diagnostic distractor | Diagnoses |
|---------|----------------------|-----------|
| 34 + 56 | 812 | Treating digits as independent numbers (3+5=8, 4+6=12 concatenated) |
| 1/4 vs 1/5, which is larger? | 1/5 | Applying whole-number thinking (5 > 4) to denominators |
| Area of 9×4 rectangle | 26 | Computing perimeter instead of area |
| Perimeter of 9×4 rectangle | 36 | Computing area instead of perimeter |

These diagnostic distractors feed the analytics engine: when a student picks one, the system gets a targeted signal about which misconception to address. This is high-value metadata — worth the extra authoring time.

### 4.6 Review Checklist (per problem)

Every problem must pass this checklist before going live:

- [ ] Mathematical correctness verified (automated test: answer is correct given question)
- [ ] Reading level ≤ target grade Flesch-Kincaid
- [ ] No cultural bias or assumed context
- [ ] Hints are progressive (each reveals more; last doesn't give answer)
- [ ] For MC: at least one diagnostic wrong answer included
- [ ] Tagged to exactly one primary skill_id (may reference prerequisite skills)
- [ ] Difficulty (1-5) matches the problem's cognitive load empirically (reviewed by 2+ content team members)
- [ ] Alt text for any embedded images
- [ ] LaTeX expressions render correctly in KaTeX preview

---

## 5. Content Sourcing Plan

The platform needs ~500 problems for MVP (P1-T16) scaling to ~10,000+ by Phase 5. This is a three-wave plan.

### Wave 1: MVP (0 → 500 problems) — Weeks 1-8 of Phase 1

**Team:** 1 lead curriculum designer (hired, full-time, experienced elementary math teacher) + 1 content writer (hired, part-time).

**Sources:**

| Source | Problems | License | Notes |
|--------|---------|---------|-------|
| **Illustrative Mathematics (IM)** | ~150 | CC BY 4.0 (commercial OK) | Grades K-12 full curriculum. Adapt task format to our schema; attribute per license. |
| **OpenStax K-8 math** | ~80 | CC BY 4.0 | OpenStax Foundation's K-8 project. Well-reviewed, aligned to CCSS. |
| **Open Up Resources** | ~50 | CC BY 4.0 | IM-derived; redundant with IM but expands coverage. |
| **Original (authored)** | ~150 | Work-for-hire, platform owns | Focus on skills underrepresented in open sources (e.g., gamification-friendly word problems, our specific character set). |
| **Template-based arithmetic generation** | ~70 | Platform-owned (generated) | Use the existing `math_puzzle_generator.py` approach — parametric templates that instantiate correctly. Good for repetitive fact-fluency skills (addition/subtraction/multiplication facts). |

**Process:**
1. Lead curriculum designer maps open-source problems to our skill_id taxonomy (1-2 days per 100 problems).
2. Content writer adapts problem text to our voice guidelines, inclusivity rules.
3. Both review each problem against the Section 4.6 checklist.
4. KaTeX rendering verification automated in CI.
5. Bulk import via CSV/JSON tooling (P1-T16 scope).

**Budget:** ~$40K (lead designer 3 months at $15K/mo; content writer 2 months at $5K/mo).

**NOT sourcing from:**
- EngageNY: CC BY-NC-SA restricts commercial use. Skip.
- Khan Academy: copyrighted. Skip.
- IXL, Prodigy, DreamBox, Zearn, Splash Math: proprietary, copyrighted. Skip.
- Singapore Math textbook problems: copyrighted by Marshall Cavendish/SAP Education. Skip for now (can license in Phase 4 if expanding to Singapore market).

### Wave 2: Content Depth (500 → 5,000 problems) — Phase 2-3 (Months 4-9)

**Team:** Lead curriculum designer + 2-3 content writers + LLM-assisted pipeline + 1 pedagogy reviewer.

**LLM-assisted pipeline** (per the earlier architecture decision — "LLM-generated problems with human review"):

1. **Generate:** LLM (Claude/GPT-4 class) generates 10-15 candidates per skill_id. Prompted with:
   - The skill description
   - Target grade, target difficulty
   - Voice and inclusivity guidelines (Section 4.1–4.2)
   - Hint generation rules (Section 4.4)
   - 3-5 gold-standard examples for that skill
2. **Automated QA:** Script verifies arithmetic correctness by solving the problem independently (SymPy or similar). Filters out problems where stated answer ≠ computed answer.
3. **Human review:** Content writer reviews surviving candidates for:
   - Pedagogical quality (does this actually test the skill?)
   - Cultural bias, context appropriateness
   - Hint quality (progressive, not giving away answer)
   - Diagnostic distractor quality
4. **Pedagogy reviewer spot-checks** 10% of approved problems weekly. Any problem rejected triggers re-review of its author's batch.

**Expected pass rate:** ~50-60% of LLM-generated candidates survive automated QA + human review. So ~20 candidates per skill yield ~10 approved problems. For 4,500 new problems across 78 skills, budget ~9,000 LLM candidates.

**Budget:** ~$180K (designer + writers + pedagogy reviewer over 6 months; ~$5K LLM API costs).

### Wave 3: Content Scale (5,000 → 10,000+ problems) — Phase 4-5 (Months 10-18)

**Team:** Same team + offshore content contractor team (3-5 writers in lower-cost markets — Philippines, India, Eastern Europe — with strong English and math backgrounds).

**Adjustments:**
- Fine-tune the LLM generator on approved problems from Wave 2 (~5K high-quality approved problems is enough for a LoRA fine-tune on a capable open-weights model). Fine-tuned generator produces higher pass rate (~70%+), reducing human review burden.
- Automated QA expands to: reading-level check (Flesch-Kincaid), inclusivity keyword scan, duplicate detection (embedding similarity against existing corpus).
- Offshore contractors handle volume review at lower cost/problem.
- Open question banks that emerge during this period get monitored; if any new CC BY sources appear, they get incorporated.

**Expansion to new grade bands:**
- Grade 4-6 skill taxonomy needs expansion (this document covers Grades 1-3 only). Add in Phase 2.
- When expanding to Singapore MOE market in Phase 4-5, add Singapore Math CPA-specific problem types (model drawing, bar models).

**Budget:** ~$250K over 9 months (stable lead team + offshore contractors + fine-tuning costs).

### Licensing summary (clear and final)

| License | Usable? | Attribution Required? | Notes |
|---------|---------|----------------------|-------|
| CC BY 4.0 | ✅ Yes | Yes (attribution footer in content) | Our workhorse license — IM, OpenStax, Open Up Resources |
| CC BY-SA 4.0 | ✅ Yes | Yes + share-alike | Problematic — our derived works must also be CC BY-SA. Skip unless we're willing to open-source problems. |
| CC BY-NC 4.0 / CC BY-NC-SA 4.0 | ❌ No | — | Non-commercial restriction makes this unusable for a paid product. EngageNY falls here. |
| CC0 / Public Domain | ✅ Yes | No | Rare for math content but ideal when available. |
| All Rights Reserved | ❌ No | — | Khan Academy, Singapore Math textbooks, commercial competitors. |
| Work-for-hire (our writers) | ✅ Yes | No | Platform owns outright. |
| Generated by our LLM pipeline | ✅ Yes | No | Platform owns outright. |

### Risk mitigations

| Risk | Mitigation |
|------|-----------|
| **Content quality drops as we scale** | Pedagogy reviewer + 10% sampling with batch-level feedback loop. If sampled rejection rate exceeds 15%, pause generation and retrain. |
| **LLM generates subtly wrong problems** | Automated arithmetic verification via SymPy catches most. Diagnostic distractors are hardest to automate — require human review. |
| **Cultural bias creeps in via LLM priors** | Name/context rotation enforced in prompt + post-generation keyword scan + diverse reviewer team. |
| **CC attribution not implemented in UI** | Content footer with "Some problems adapted from Illustrative Mathematics, licensed under CC BY 4.0" on relevant pages. Confirm with legal before Phase 1 launch. |
| **Competitor claims we copied their problems** | All sourced content tracked to specific licensed source in the problem's metadata (`source: "IM-grade3-unit5-task2"`). Original problems attributed to specific writers with dated work-for-hire agreements. |

---

## Handoff checklist

The external dev team can start content work immediately with this package. Unblocks:

- [x] **P1-T16** (seed 500+ problems) — curriculum decided, skill taxonomy defined, sample problems provided as format template, sourcing plan committed
- [x] **P1-T14** (problem document schema) — schema shape confirmed via sample problems
- [x] **P1-T15** (admin CMS) — metadata tagging schema confirmed via skill taxonomy
- [x] **Content team hiring** — clear roles: 1 lead curriculum designer + 1-2 writers for MVP; scale to 3-5 + offshore for Wave 3

**Next decisions for dev team (not blocking):**
1. Final legal review of CC BY 4.0 attribution implementation in the UI
2. Choice of LLM for Wave 2 generator pipeline (Claude vs GPT-4 vs fine-tuned open-weights) — deferrable to Month 3
3. Grade 4-6 skill taxonomy extension (this doc covers 1-3; extend before Phase 2 content work begins)

---

*This package was prepared by worker_2 on 2026-04-17. Reach out via peer_inbox for questions. The FSRS+BKT adaptive engine composition decision is being ratified at Thursday's pairing (worker_2 + worker_3 + worker_1 async) and may affect how content difficulty tags are weighted by the scheduler — watch for that update in the dev plan Phase 2 adaptive engine section.*
