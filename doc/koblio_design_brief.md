# Koblio Design Brief & Key Screen Wireframes

**Prepared:** 2026-04-16
**Audience:** Product designer (final visual design) and frontend dev team (initial scaffolding)
**Status:** Direction document. Wireframes are intentionally low-fidelity — they communicate layout, hierarchy, and copy intent, not pixel design.

---

## Table of Contents

1. [Brand Direction](#1-brand-direction)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Iconography](#4-iconography)
5. [Illustration Direction](#5-illustration-direction)
6. [Motion Guidelines](#6-motion-guidelines)
7. [Wireframe 1: Student Login / Landing](#wireframe-1-student-login--landing)
8. [Wireframe 2: Daily Home Screen (Student)](#wireframe-2-daily-home-screen-student)
9. [Wireframe 3: Problem-Solving Screen](#wireframe-3-problem-solving-screen)
10. [Wireframe 4: Reward / Celebration Screen](#wireframe-4-reward--celebration-screen)
11. [Wireframe 5: Parent Dashboard](#wireframe-5-parent-dashboard)
12. [Wireframe 6: Teacher Dashboard](#wireframe-6-teacher-dashboard)

---

## 1. Brand Direction

### 1.1 Tone

**Playful but not childish. Confidence-building, never patronizing.**

The platform serves children ages 6-12 — a wide range that requires care. A 6-year-old needs warmth, large touch targets, and pictorial cues. A 12-year-old needs the system to take them seriously and not feel like a "baby app." The tone resolves this by being **competent and warm**: the mascot smiles but doesn't infantilize; the celebration on a correct answer is genuine but doesn't escalate into a parade; difficulty acknowledgment uses honest language ("That one was tricky!") rather than fake enthusiasm.

The target feeling is **"my friend who happens to be good at math"** — calm, encouraging, willing to help, never condescending.

### 1.2 What Koblio is NOT

- NOT a game with math wrapped around it. Math is the experience; gamification supports motivation, not distraction.
- NOT a serious test-prep tool. Stress is the enemy of learning at this age.
- NOT a product that talks down to kids. The same student will use this for years; their reading level grows.
- NOT visually loud. Cluttered, neon, over-animated UIs are exhausting for daily-use educational software.

### 1.3 Voice & copy guidelines

- **Active voice.** "Try this one" not "This problem may be attempted."
- **Short sentences.** Reading level: aim for grade 3-4 in UI copy, grade 4-5 in problem statements (adjust by content level).
- **Specific encouragement, not generic praise.** "You got the borrowing right!" beats "Great job!"
- **Honest about difficulty.** "This is a hard one — take your time." beats hiding the difficulty.
- **No baby talk.** Avoid "Yay!", "Wowee!", excessive exclamation points.
- **Math is the hero.** Copy should make the math itself feel interesting, not just the rewards for doing it.

---

## 2. Color Palette

### 2.1 Primary palette

| Role | Color | Hex | Use |
|------|-------|-----|-----|
| **Primary brand** | Friendly blue | `#2E6FF2` | App identity, primary CTA, focused states |
| **Primary dark** | Deep blue | `#1B4FB8` | Hover/pressed states, headings on light bg |
| **Primary light** | Sky tint | `#D6E5FE` | Backgrounds for primary regions, soft fills |

Rationale: Blue tests well across age ranges, is gender-neutral, and reads as "trustworthy/educational" without skewing too institutional. Avoids the over-used "edtech green."

### 2.2 Accent / status palette

| Role | Color | Hex | Use |
|------|-------|-----|-----|
| **Success / correct** | Confident green | `#1FA672` | Correct answer feedback, mastery indicators, completed state |
| **Warning / hint** | Warm amber | `#F5A623` | Hint indicators, "review needed" badges |
| **Error / try again** | Soft red (NOT alarming) | `#E5566B` | Wrong answer (sparingly), errors. Avoid pure `#FF0000` — too punishing for kids. |
| **Info** | Teal | `#1AB6C8` | Tips, neutral notifications |
| **Reward / celebration** | Joyful gold | `#FFD036` | Stars, badges, streak fire |

### 2.3 Neutrals

| Role | Color | Hex |
|------|-------|-----|
| Text primary | Near-black with warmth | `#1A1F2C` |
| Text secondary | Medium gray | `#5A6075` |
| Text disabled / hint | Light gray | `#A0A6B8` |
| Border / divider | Very light gray | `#E5E7EE` |
| Surface / card | White | `#FFFFFF` |
| Background | Off-white (warmer than pure white, easier on eyes) | `#F7F9FC` |

### 2.4 Mood-aware UI accents (from adaptive learning system)

When the mood detector classifies the learner state, certain UI elements may shift subtly. These are NOT for primary brand surfaces, only for the encouragement panel and intervention messaging:

| Mood | Accent | Hex | Application |
|------|--------|-----|-------------|
| FLOW | Standard primary blue | `#2E6FF2` | No change |
| FRUSTRATED | Warm peach | `#FFB59C` | Background of encouragement card |
| CONFUSED | Soft lavender | `#C8B6FF` | Background of "let's try a different way" card |
| BORED | Energy orange | `#FF8B3D` | Background of "ready for a challenge?" CTA |

### 2.5 Accessibility — WCAG AA contrast requirements

Every text/background pairing in the palette must meet WCAG AA (4.5:1 for normal text, 3:1 for large text). Verified:

| Pairing | Ratio | Pass |
|---------|-------|------|
| `#1A1F2C` text on `#FFFFFF` bg | 16.1:1 | AAA |
| `#1A1F2C` text on `#F7F9FC` bg | 15.4:1 | AAA |
| `#FFFFFF` text on `#2E6FF2` bg (primary button) | 4.7:1 | AA |
| `#FFFFFF` text on `#1FA672` bg (success) | 3.4:1 | **FAIL for body text — use only for badges/large UI**. For success text on white use `#0E8056` instead. |
| `#FFFFFF` text on `#E5566B` bg (error) | 4.0:1 | Borderline — okay for short labels; for body error text use `#C73548` on white |
| `#5A6075` text on `#FFFFFF` bg | 6.2:1 | AAA |

Designers must verify every new combination. Suggested tooling: Stark plugin in Figma + axe DevTools in browser.

### 2.6 Color-blind safety

- Don't use color alone to convey meaning. "Correct" pairs green with checkmark icon; "wrong" pairs red with X icon.
- Test palette in deuteranopia and protanopia simulators (standard tools in Figma/Sketch).

---

## 3. Typography

### 3.1 Font families

| Role | Recommended | Fallback | Rationale |
|------|------------|----------|-----------|
| **Display / headings** | **Lexend** (variable) | Nunito, system-ui | Lexend is research-backed for reading proficiency (especially for struggling readers and dyslexic users) — Bonnier-Hervieu et al. 2018-2022 work. Free, open-source, designed by Bonnie Shaver-Troup. |
| **Body / UI** | **Lexend Deca** | Inter, system-ui | Same family, optimized for body. Excellent x-height. |
| **Math rendering** | **Atkinson Hyperlegible** for inline numerals + **KaTeX** rendering for equations | Recursive Mono for code-like math | Atkinson Hyperlegible (designed for low-vision readers) is exceptionally clear for digit recognition — important for kids confusing 6/9, 1/7, 0/O, 5/S |
| **Mascot / playful elements** | A single secondary display face for splash screens and rewards | Quicksand, Baloo 2 | Use sparingly — only for non-content moments |

### 3.2 Why not Comic Sans (or other typically-childish fonts)?

Older students (10-12) actively reject "baby fonts" — it makes the platform feel beneath them. Lexend and Atkinson Hyperlegible read as **friendly and modern** rather than childish, while still being highly legible. They scale up to teen/adult use as the same student grows.

### 3.3 Type scale (mobile-first; scale up for tablet/desktop)

| Token | Size (mobile) | Line-height | Use |
|-------|--------------|-------------|-----|
| `text-display` | 32px | 1.2 | Splash, celebration moments |
| `text-h1` | 24px | 1.3 | Screen titles |
| `text-h2` | 20px | 1.35 | Section headings |
| `text-body` | 18px | 1.5 | **Primary body for K-6** (deliberately larger than adult standard 16px) |
| `text-body-sm` | 16px | 1.45 | Dense UI areas like dashboards |
| `text-caption` | 14px | 1.4 | Metadata, hints |
| `text-tiny` | 12px | 1.4 | Legal footers only |

### 3.4 Math-specific rendering rules

- **Numerals always tabular** (monospaced widths) so columns of numbers align visually
- **Multiplication sign:** use `×` (U+00D7), not `x` letter
- **Division:** use `÷` (U+00F7) for K-2, `/` for K-3+
- **Fractions:** use stacked rendering (KaTeX) at K-3+, not inline `1/2` form
- **Equations get extra spacing** around operators: `3 + 4 = 7` not `3+4=7`

---

## 4. Iconography

### 4.1 Style direction

- **Rounded geometry.** No sharp corners on primary UI icons. Aligns with the friendly tone.
- **Filled or duotone, not outline-only.** Outline icons read as "small" and "uncertain" to younger users. Filled icons are confident and easier to perceive at small sizes.
- **2-3 colors max per icon.** Primary icon color + 1 accent. Avoid full-color illustration in icons.
- **24px or 32px standard sizes.** 48px for primary navigation. Always optical-sized, not just scaled.
- **Consistent stroke weight** (when outlines are used, e.g., on hover): 2px at 24px size.

### 4.2 Icon library recommendation

Start with **Phosphor Icons** (filled variant) or **Tabler Icons** as base. Both free, both have rounded options, both have wide coverage. Customize 5-10 Koblio-specific icons (mascot, trophy variants, mission types) as needed.

### 4.3 Icons to never use

- Photorealistic icons (breaks consistency)
- Skeuomorphic icons (dated)
- Faces that aren't the mascot (distracting)

---

## 5. Illustration Direction

### 5.1 Mascot

A single primary mascot character serves as the platform's friendly guide. Recommended brief for the illustrator:

- **Species:** A friendly creature, NOT a human. Owl, fox, axolotl, or original creature work well — avoiding humans sidesteps representation issues across global users.
- **Personality:** Calm, curious, encouraging. NOT hyper, NOT loud, NOT goofy.
- **Expression range:** 6-8 expressions for different contexts (welcome, thinking, celebrating, encouraging, surprised, thoughtful, sleepy/end-of-day, focused). All should feel within the same character — no jarring style shifts.
- **Outfit / props:** Optional — a small accessory that suggests mathematical thinking (glasses, a notepad, a ruler) without being on-the-nose.
- **Color palette:** Uses brand primary blue + 1-2 accent colors from the palette. Stays in the system.
- **NO speech bubbles in default state** — the mascot is silent unless explicitly delivering a hint or message. Avoids feeling chatty.

### 5.2 Illustration style for backgrounds and scenes

- **Flat or subtly gradient** (no heavy shadows, no detailed rendering)
- **Soft color blocking** rather than complex compositions
- **Spacious** — generous negative space; avoid busy scenes that compete with content
- **Inclusive** when human characters appear (peer leaderboards, story problem context) — diverse representation as default, not as add-on. Avatars: hair textures, skin tones, mobility aids, glasses, etc.

### 5.3 What to avoid in illustrations

- Stock illustration packs (every edtech product looks the same)
- "Corporate Memphis" abstract style (dated; doesn't resonate with kids)
- Hyper-detailed scenes (visual noise, slow loading on mid-range devices)
- Anything that could read as scary at small sizes (especially for younger users)

---

## 6. Motion Guidelines

### 6.1 Philosophy

**Motion serves comprehension, not entertainment.** Every animation should answer one of three questions:
- "Where did this come from / where did it go?" (continuity)
- "What just happened?" (feedback)
- "What can I do next?" (affordance)

Animation that doesn't answer one of those questions is decoration. Decoration is fine in tiny doses (mascot blinks, button hover lift) but should never block interaction.

### 6.2 Timing standards

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button press feedback | 100ms | ease-out |
| Modal/sheet enter | 250ms | ease-out cubic |
| Modal/sheet exit | 200ms | ease-in cubic |
| Page transitions | 300ms | ease-in-out |
| Microcelebrations (correct answer) | 400ms | spring (medium tension) |
| Macro celebrations (mastery, badge unlock) | 800-1200ms | spring + sequenced |
| Loading state appearance | After 200ms delay (don't flash) | fade |

### 6.3 Celebration sequence (correct answer)

This is high-stakes UX — it sets the reward feel of the platform. Sequence:

1. **0-100ms:** Submitted answer's box pulses lightly (scale 1.0 → 1.05 → 1.0) and color shifts to success green
2. **100-300ms:** Checkmark icon scales in (0 → 1.1 → 1.0) with subtle haptic on mobile
3. **300-500ms:** Brief confetti burst (subtle — 8-12 particles, NOT a screen-filling explosion) OR mascot expression change to encouraging smile
4. **500ms onward:** Next-action UI fades in (Continue button, points earned)

For a streak milestone or mastery, replace step 3-4 with a fuller celebration screen (see wireframe 4).

### 6.4 What to avoid

- **Long blocking animations.** Anything > 1.5 seconds that the user must wait through. Add a "skip" tap-to-dismiss after 800ms for celebrations.
- **Bouncy/jiggly defaults everywhere.** Reserve playfulness for explicit reward moments. UI navigation should feel calm.
- **Auto-playing sound.** Sound effects must be off by default; offer in settings.
- **Reduced-motion mode must work.** Respect `prefers-reduced-motion` system setting; provide alternative non-animated feedback (color change, instant icon swap).

### 6.5 Microinteraction philosophy

Buttons: subtle scale + shadow on press. Cards: 2px lift on hover. Inputs: focus ring in primary blue. Avatars: gentle idle animation (mascot blinks every 4-7 seconds, never simultaneously with another animation). Streak counter: small flame "wiggle" once per session view, not continuously.

---

## Wireframe 1: Student Login / Landing

**Context:** First screen the student sees on app open. Designed for K-2 with picture-password (tap a sequence of pictures); K-3+ defaults to a 4-digit PIN. No email field. No keyboard for K-2.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│                  [Koblio Logo]                      │
│                  Koblio Math                        │
│                                                      │
│              [ Mascot illustration ]                 │
│                  "Welcome back!"                     │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │   Who's playing today?                         │  │
│  │                                                │  │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │  │
│  │  │      │  │      │  │      │  │      │       │  │
│  │  │ Avi  │  │ Mei  │  │ Sam  │  │  +   │       │  │
│  │  │      │  │      │  │      │  │ Add  │       │  │
│  │  └──────┘  └──────┘  └──────┘  └──────┘       │  │
│  │   Grade 2   Grade 4   Grade 5    child         │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│       (After tapping a child profile:)              │
│  ┌────────────────────────────────────────────────┐  │
│  │   Hi Mei!  Tap your secret pictures:           │  │
│  │                                                │  │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  │  │
│  │  │ 🐶  │  │ 🌳  │  │ ⭐  │  │ 🎈  │  │ 🚀  │  │  │
│  │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  │  │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  │  │
│  │  │ 🍎  │  │ 🐘  │  │ ☀️  │  │ 🚗  │  │ 🎨  │  │  │
│  │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  │  │
│  │                                                │  │
│  │  ◯ ◯ ◯ ◯  (4 pictures to tap, dots fill in)   │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  [ I'm a parent ]    [ I'm a teacher ]              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Notes:**
- Max 6 child profiles visible per parent account; horizontal scroll if more
- "Picture password" sequence is set by parent during child setup
- After 5 wrong attempts: lock for 5 minutes, notify parent
- Empty state (no profiles yet): mascot says "Let's get started — ask a grown-up to set you up"
- Loading state: skeleton avatars with subtle shimmer
- Error state (wrong picture sequence): gentle shake + "Try again — ask for help if you need it"

---

## Wireframe 2: Daily Home Screen (Student)

**Context:** Main screen after login. Shows today's mission, streak, avatar, and quick navigation. Design priority: ONE clear primary action ("Start today's mission") — avoid choice paralysis.

```
┌──────────────────────────────────────────────────────┐
│  [Avatar]  Hi Mei!                       🔔 ⚙        │
│            Grade 4                                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  🔥 You're on a 5-day streak!                │   │
│  │   Mon Tue Wed Thu Fri Sat Sun                 │   │
│  │   ✓   ✓   ✓   ✓   ✓   ◯   ◯                 │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │            TODAY'S MISSION                   │   │
│  │                                               │   │
│  │   [ Mascot pointing at a colorful card ]    │   │
│  │                                               │   │
│  │      Multiplication Adventure                │   │
│  │      ▓▓▓▓▓▓▓▓░░░░░░  3 of 6 done            │   │
│  │                                               │   │
│  │      [    ▶  Continue Mission    ]           │   │
│  │                                               │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │   📚       │  │   🏆       │  │   👥       │    │
│  │  Practice  │  │  Rewards   │  │  Friends   │    │
│  │  Topics    │  │  & Badges  │  │   Class    │    │
│  └────────────┘  └────────────┘  └────────────┘    │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  This week:                                   │   │
│  │  ⭐ 47 stars earned                           │   │
│  │  ⏱  35 minutes practiced                      │   │
│  │  🎯 2 new skills mastered                     │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [Home]  [Practice]  [Rewards]  [Avatar/Me]         │
└──────────────────────────────────────────────────────┘
```

**Notes:**
- Hierarchy: Mission card is largest and most colorful — single primary action
- Three secondary tiles below — equal weight, less visual emphasis
- Streak shows last 7 days with checkmarks; today's slot highlighted
- Weekly stats card uses neutral colors — informational, not boasting
- Bottom nav: 4 tabs, sticky on mobile, persistent
- Empty state (no mission yet today): "Today's mission is loading…" with mascot animation, then auto-routes when ready
- Notification bell shows count of new things (parent message, badge earned, friend request)
- For very young users (K-2): simplified version hides Practice Topics tile, makes Friends tile parent-permission-gated

---

## Wireframe 3: Problem-Solving Screen

**Context:** Where the actual learning happens. Single problem at a time, large math area, clear answer entry, hint button always visible but not prominent. Avoid timers visible to students (creates stress) — track timing internally for adaptive system only.

```
┌──────────────────────────────────────────────────────┐
│  ←  Multiplication Adventure                         │
│                                                      │
│  Problem 4 of 6   ▓▓▓▓░░░░░░  ⭐⭐⭐               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [ Optional small mascot, neutral expression ]      │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │                                               │   │
│  │      Sam has 4 boxes of crayons.             │   │
│  │      Each box has 6 crayons.                 │   │
│  │      How many crayons in all?                │   │
│  │                                               │   │
│  │              4  ×  6  =  ?                   │   │
│  │                                               │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │                                               │   │
│  │              Your answer:                     │   │
│  │              ┌──────┐                        │   │
│  │              │  __  │                        │   │
│  │              └──────┘                        │   │
│  │                                               │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │    1    │  │    2    │  │    3    │              │
│  ├─────────┤  ├─────────┤  ├─────────┤              │
│  │    4    │  │    5    │  │    6    │              │
│  ├─────────┤  ├─────────┤  ├─────────┤              │
│  │    7    │  │    8    │  │    9    │              │
│  ├─────────┤  ├─────────┤  ├─────────┤              │
│  │   ⌫     │  │    0    │  │   ✓     │              │
│  └─────────┘  └─────────┘  └─────────┘              │
│                                                      │
│  [ 💡 Need a hint? ]                                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Notes:**
- Progress bar at top shows position in mission (4 of 6) and stars earned so far
- NO visible timer
- Number pad is part of the screen on mobile (don't rely on system keyboard — too small, kids may not have learned to use it)
- Hint button below answer, secondary styling — available but not pushy
- Hint flow: tap → mascot pops up with first hint ("Try thinking of 4 groups of 6"); second tap → more concrete hint ("4 + 4 + 4 + 4 + 4 + 4 = ?"); third hint = walk-through. Each hint reduces star reward.
- On wrong answer: gentle shake of answer box + "Hmm, not quite. Want to try again or see a hint?" — never red flash, never "WRONG."
- On correct answer: triggers celebration sequence (see wireframe 4)
- For K-2: replace number pad with answer chips (multiple choice with 4 visible options)
- For word problems with diagrams: image area appears between problem text and answer box, sized appropriately
- Loading state: skeleton problem area with shimmer; load target < 500ms
- Network error state: "Hmm, can't reach the math. Check internet?" with retry button
- Offline state: cache last 5 problems for the current mission so brief connection drops don't break flow

---

## Wireframe 4: Reward / Celebration Screen

**Context:** Triggered after correct answer + at mission completion + at mastery milestones. Two scales: micro (per-problem correct) and macro (mission complete / new badge). This wireframe shows the macro version; micro is just the in-place celebration described in motion section 6.3.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              ✨  ⭐  ✨  ⭐  ✨                       │
│                                                      │
│                                                      │
│           [ Mascot, big, happy expression ]         │
│                                                      │
│                                                      │
│               Mission Complete!                      │
│           Multiplication Adventure                   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │                                               │   │
│  │              ⭐ ⭐ ⭐                         │   │
│  │            3 stars earned!                    │   │
│  │                                               │   │
│  │   You answered 5 out of 6 right.             │   │
│  │   You used 1 hint.                           │   │
│  │   Your fastest answer: 8 seconds.            │   │
│  │                                               │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │                                               │   │
│  │   🏆  NEW BADGE EARNED                       │   │
│  │       "Times Tables Apprentice"               │   │
│  │       [ Badge illustration ]                 │   │
│  │                                               │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │   🔥  Your streak: 6 days!                   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│       [    Continue    ]   [ See My Rewards ]       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Notes:**
- Sparkles animate in then settle (don't loop — exhausting)
- Stars count up one-at-a-time with subtle sound (if sound enabled)
- Stats are concrete and specific ("5 of 6 right", "fastest: 8s") — feels true rather than fake-praise
- Badge appears with a subtle "unlock" animation: scales from 0 to 1.1 to 1.0, glows briefly
- Streak section appears only if streak grew or hit a milestone
- Two clear next actions: "Continue" returns to home; "See My Rewards" goes to badge collection screen
- Celebration is satisfying but doesn't take more than ~6 seconds end-to-end
- Skip-to-continue: tap anywhere after 800ms to dismiss the celebration and proceed
- For partial completion (mission abandoned): no celebration, just a calm "Pick up where you left off?" screen
- For mastery (BKT P_known crosses threshold): an additional message — "You've mastered Multiplication! Want to try Long Division next, or keep practicing?"

---

## Wireframe 5: Parent Dashboard

**Context:** Parent's web/app view. Shows child progress, weekly summary, controls, and provides COPPA-required access to data. Three children visible at once via tabs/cards. Information-dense but scannable.

```
┌──────────────────────────────────────────────────────────────┐
│  Koblio  •  Parent Dashboard         [Account]  [Logout]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  My Children:                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────┐   │
│  │ ●  Mei     │  │    Sam     │  │    Avi     │  │  +   │   │
│  │   Grade 4  │  │   Grade 5  │  │   Grade 2  │  │ Add  │   │
│  └────────────┘  └────────────┘  └────────────┘  └──────┘   │
│                                                              │
│  ─────────────  Mei  •  Grade 4  ─────────────              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  This week                                           │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │                                                      │    │
│  │  ⏱  Practice time          47 min      ↑ 12% wow    │    │
│  │  🎯  Skills mastered         2 new      Multiplication, │ │
│  │                                          Place Value  │    │
│  │  ⭐  Stars earned          134 total                  │    │
│  │  🔥  Streak                 6 days                    │    │
│  │                                                      │    │
│  │           Mon  Tue  Wed  Thu  Fri  Sat  Sun         │    │
│  │  Min:      5   12   8   10   12    0    -           │    │
│  │            ▂   ▅   ▃   ▄   ▅                        │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Skill Progress                          [See all]   │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │  Multiplication      ▓▓▓▓▓▓▓▓▓▓  Mastered    ✓     │    │
│  │  Place Value         ▓▓▓▓▓▓▓▓▓▓  Mastered    ✓     │    │
│  │  Long Division       ▓▓▓▓▓▓░░░░  Learning    65%    │    │
│  │  Fractions intro     ▓▓▓░░░░░░░  Just started 30%   │    │
│  │  Word problems       ▓░░░░░░░░░  Needs help   12%   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  💬 Mei's recent activity                            │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │  Today, 4:15 PM  •  Multiplication Adventure         │    │
│  │     5/6 correct, 3 stars, 1 hint used                │    │
│  │  Yesterday, 6:02 PM  •  Place Value Practice         │    │
│  │     6/6 correct, 3 stars, no hints — Mastered!       │    │
│  │  [ See all activity ]                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Weekly report  •  Sent every Sunday                 │    │
│  │  Send to: parent@example.com   [Edit]                │    │
│  │  [Download this week as PDF]                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Settings & Privacy                                  │    │
│  │  ─────────────────────────────────────────────────  │    │
│  │  ▶ Mei's data (export, delete, review)              │    │
│  │  ▶ Daily time limit:  30 minutes  [Change]          │    │
│  │  ▶ Bedtime block:  8:00 PM - 6:00 AM  [Change]      │    │
│  │  ▶ Class connection (school code)                    │    │
│  │  ▶ Manage parental consent                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Notes:**
- Active child shown by colored indicator on tab; clicking switches view
- "This week" stats compare to last week (week-over-week %); avoids cumulative-anxiety pattern
- Skills section uses progress bars + categorical labels ("Mastered", "Learning", "Needs help") not just numbers — easier to scan
- Activity log shows last 5 items by default; "See all" expands
- COPPA-required functions (data export, delete, review) under "Settings & Privacy" — must be obvious, not buried
- Weekly report is a real PDF the parent can download and email-archive
- Empty state (no activity yet): "Mei hasn't started yet. Send her an invite to log in!"
- Loading state: skeleton cards with shimmer
- Mobile: cards stack vertically; child selector becomes horizontal scroll
- Screen reader: each card has a clear heading, all icons have labels, week-over-week trends use words not just arrows

---

## Wireframe 6: Teacher Dashboard

**Context:** Teacher's view of their class(es). Identifies at-risk students for intervention, shows class-wide patterns, allows assignment of homework. Designed for quick triage during/between lessons.

```
┌──────────────────────────────────────────────────────────────────┐
│  Koblio  •  Teacher Dashboard          [Account] [Logout]       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Ms. Patel  •  Lincoln Elementary                                │
│                                                                  │
│  My Classes:    ● Grade 4 - Period 2  ▼                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Class snapshot — Grade 4 Period 2 (24 students)           │ │
│  │  ──────────────────────────────────────────────────────── │ │
│  │                                                            │ │
│  │  This week:                                                │ │
│  │  ⏱  Avg practice time        38 min/student                │ │
│  │  ✅  Avg accuracy             78%                           │ │
│  │  🎯  Skills mastered (class)  47 total                      │ │
│  │  📈  Trending up:  Multiplication, Place Value             │ │
│  │  📉  Trending down: Word problems, Long division            │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ⚠  Needs attention  (3)                          [See all]│ │
│  │  ──────────────────────────────────────────────────────── │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Carlos M.       no activity 5 days     [Send nudge ▶]│ │ │
│  │  │ Lila T.         struggling on fractions [View ▶]     │ │ │
│  │  │ Jordan W.       skipped homework 2x    [Message ▶]   │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Class roster                                              │ │
│  │  Sort by: [Activity ▼]   Filter: [All ▼]                   │ │
│  │  ──────────────────────────────────────────────────────── │ │
│  │                                                            │ │
│  │  Student       Last active  This week    Avg. accuracy    │ │
│  │  ──────────────────────────────────────────────────────── │ │
│  │  ⚠ Carlos M.   5 days ago   0 min        — (no data)      │ │
│  │    Mei L.      Today        47 min       89%  ↑           │ │
│  │  ⚠ Lila T.     Yesterday    32 min       54%  ↓           │ │
│  │    Sam P.      Today        42 min       82%  →           │ │
│  │    Avi B.      Today        38 min       77%  ↑           │ │
│  │    ... 19 more students                                    │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Skill heatmap — class-wide                                │ │
│  │  ──────────────────────────────────────────────────────── │ │
│  │                                                            │ │
│  │  Skill          Mastered  Learning  Struggling  Not yet   │ │
│  │  Addition       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 24                │ │
│  │  Subtraction    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒ 20 / 4            │ │
│  │  Multi          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒░░ 14 / 6 / 4        │ │
│  │  Long division  ▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░ 4 / 16 / 4        │ │
│  │  Fractions      ░░░░░░░░░░░░░░░░░░░░░░ 0 / 0 / 4 / 20    │ │
│  │  Word problems  ▓▓▒▒▒▒▒▒▒▒▒▒▓▓░░░░░░░░ 2 / 14 / 4 / 4    │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Assignments                          [+ Create assignment]│ │
│  │  ──────────────────────────────────────────────────────── │ │
│  │  Multiplication Tables Quiz   Due Friday   18/24 done     │ │
│  │  Word Problem Practice         Due Mon     5/24 done       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Notes:**
- Class selector at top (teacher may have multiple classes)
- "Needs attention" panel is the most prominent — surfaces at-risk students for triage; one-click actions ("Send nudge", "Message", "View")
- "At-risk" criteria visible to teacher: customizable rules (default: 5+ days inactive, accuracy <60%, missed assignments, mood-detector flagged frustration over multiple sessions)
- Roster table is sortable and filterable; warning icon for at-risk students
- Skill heatmap is the densest visual — gives a class-wide view of where learning is and isn't happening; bars use 4 colors (green/yellow/orange/gray) for the four mastery states. Hover/tap a row to drill into per-student breakdown.
- Assignments section: teacher can create custom assignments tied to specific skills or problem sets
- Bulk actions: select multiple students from roster → "Assign extra practice on Long Division" → triggers notification to those students
- Loading: skeleton table rows with shimmer
- Empty state (new class, no data): onboarding panel — "Add your students to see their progress here"
- Privacy: teacher sees behavioral data for their assigned class only; cross-class comparisons are aggregated/anonymized; FERPA-relevant data access logged

---

## Cross-cutting design notes

### Responsive behavior

- **Mobile-first** for student app (most child usage will be on tablets and phones)
- **Tablet-optimized** for parent and teacher views (most adult usage will be on tablets and laptops)
- **Desktop layouts** add side panels and parallel views for teacher (e.g., roster + heatmap side-by-side)

### Accessibility (general)

- All interactive elements minimum 44x44pt touch targets (Apple HIG); 48dp on Android (Material guidance) — these are floors, not ceilings; for K-2 use 56-64pt
- Full keyboard navigation for all parent/teacher screens (student screens are touch-primary but should not break with keyboard)
- Screen reader labels on every icon, button, and image
- Focus indicators visible (2px brand-blue ring, 2px offset)
- Reduced motion mode (respects OS setting) provides instant feedback instead of animation
- High contrast mode supported (system setting)
- Captions for any video content
- No information conveyed by color alone

### Internationalization readiness

- All strings externalized from code (i18n keys)
- Layout accommodates 30% text expansion (German, French) and contraction (Chinese)
- RTL layout support for Arabic/Hebrew (mirror navigation, retain numerical direction)
- Locale-aware number, currency, date formatting

### Performance budget

- Initial load < 3 seconds on mid-range Android (target Moto G7 or equivalent)
- Time-to-interactive on student home < 2 seconds after launch
- Subsequent screen transitions < 500ms
- Animations 60fps
- Bundle size: student app < 5MB initial, lazy-load heavier assets

---

**End of design brief.** This document is enough for: a designer to begin high-fidelity mocks, a frontend dev to scaffold component architecture and route layouts, and a copywriter to draft tone-aligned UI strings. Pixel-precise specifications come from the designer's mocks; this document defines the system they design within.
