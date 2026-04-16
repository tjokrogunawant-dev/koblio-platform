# Koblio Multi-Agent System

Three Claude agents run on a recurring schedule to drive the Koblio platform development. Each has a distinct role and communicates via files in `sprint_tracker/`.

---

## Agent Map

```
                    ┌─────────────────────────────────────────────┐
                    │           KOBLIO MULTI-AGENT SYSTEM         │
                    └─────────────────────────────────────────────┘

  Monday (Sprint Start)              Daily (Weekdays)              Friday (Sprint End)
         │                                  │                               │
         ▼                                  ▼                               ▼
  ┌─────────────┐                  ┌─────────────────┐             ┌──────────────┐
  │  PM Agent   │                  │ Implementation  │             │  QC Agent    │
  │             │                  │     Agent       │             │              │
  │ • Reads     │─── sprint plan──▶│ • Reads sprint  │──commits──▶│ • Reviews    │
  │   plan docs │                  │   task list     │             │   all code   │
  │ • Writes    │                  │ • Implements    │             │   vs. AC     │
  │   sprint    │◀── QC report ───│   1 task/day    │             │ • Writes QC  │
  │   plan      │                  │ • Commits code  │             │   report     │
  │ • Writes    │                  │ • Updates task  │             │ • Flags      │
  │   retro     │                  │   status        │             │   blockers   │
  └─────────────┘                  └─────────────────┘             └──────────────┘
         │                                  │                               │
         └──────────────────────────────────┴───────────────────────────────┘
                                            │
                              sprint_tracker/current_sprint.md
                              sprint_tracker/history/sprint_NN_*.md
```

---

## File Protocol

| File | Written By | Read By | Purpose |
|---|---|---|---|
| `sprint_tracker/current_sprint.md` | PM Agent, Implementation Agent | All agents | Live task status |
| `sprint_tracker/history/sprint_NN_plan.md` | PM Agent | Implementation Agent, QC Agent | Sprint goals and task list |
| `sprint_tracker/history/sprint_NN_retro.md` | PM Agent | PM Agent (next sprint) | Retrospective and velocity data |
| `sprint_tracker/history/sprint_NN_qc.md` | QC Agent | PM Agent | Code review findings and blockers |
| `sprint_tracker/SPRINT_OVERVIEW.md` | PM Agent (updates status) | All | High-level 36-sprint calendar |
| `sprint_tracker/PHASE_GATE_RISK.md` | PM Agent | PM Agent, stakeholders | Alert when phase gate is at risk |

---

## Agent Schedules

| Agent | Schedule (cron) | Prompt File |
|---|---|---|
| PM Agent (Sprint Start) | `0 9 * * MON` every other week | `agents/pm_agent.md` |
| PM Agent (Sprint End) | `0 17 * * FRI` every other week | `agents/pm_agent.md` |
| Implementation Agent | `0 9 * * MON-FRI` | `agents/implementation_agent.md` |
| QC Agent | `0 16 * * FRI` | `agents/qc_agent.md` |

---

## How to Check Progress (for humans)

1. **Current status:** Read `sprint_tracker/current_sprint.md`
2. **Sprint plan:** Read `sprint_tracker/history/sprint_NN_plan.md`
3. **Latest QC findings:** Read `sprint_tracker/history/sprint_NN_qc.md`
4. **Sprint retrospective:** Read `sprint_tracker/history/sprint_NN_retro.md`
5. **Big picture:** Read `sprint_tracker/SPRINT_OVERVIEW.md`

---

## How to Intervene

To override an agent's decision or redirect work:
1. Edit `sprint_tracker/current_sprint.md` — change a task status or add a note
2. For PM-level changes: add a `## Stakeholder Notes` section to the latest sprint plan
3. For architecture changes: update `CLAUDE.md` — agents re-read it every run
4. To pause implementation: add `HOLD: [reason]` to the task row in `current_sprint.md`
