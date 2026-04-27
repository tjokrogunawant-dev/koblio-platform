# Koblio Platform — Procurement & Credentials Checklist

**Version:** 1.0
**Date:** 2026-04-17
**Purpose:** Every service, account, and credential the dev team needs to have in place BEFORE Day 1 coding begins. Handoff-readiness artifact.

---

## TL;DR — The critical path

**Three items have long lead times (2-4 weeks each) and MUST start Day 0 of Week -4:**

1. **Business entity** (LLC / Pte Ltd) — required to open all other accounts
2. **Apple Developer Program** — 2-4 week verification (requires D-U-N-S number, often itself a 1-2 week wait)
3. **Legal counsel / COPPA compliance review** — starts the privacy policy and ToS drafting that blocks auth flow work

**Eight items are Week-0 Day-1 blockers** (AWS, GitHub org, Auth0 tenant, Stripe account, domain, SendGrid, Sentry, Figma) — none have long lead times individually but all need to be sequenced BEFORE the team starts coding, or DevOps (P1-T05, P1-T06) is blocked on Day 1.

If the business entity doesn't exist yet and Apple enrollment hasn't started, **the project isn't handoff-ready** regardless of how polished the technical docs are. Start the clock 4 weeks before target kickoff.

---

## Tier 1: CRITICAL — long lead time, block project kickoff if missing

| # | Item | Monthly cost | Lead time | Owner (role) | Credential format | Day-1 blocker? | Notes |
|---|------|--------------|-----------|--------------|-------------------|----------------|-------|
| 1 | **Business entity** (LLC / Pte Ltd / equivalent) | $0 (incorporation fees vary by jurisdiction, ~$500-$2K one-time) | **2-6 weeks** depending on jurisdiction | Founder / legal counsel | Entity certificate, EIN/tax ID, registered address | **YES — blocks Tier 2 items** | Without this: can't open Apple Dev, Stripe, most corporate accounts. **Start first.** |
| 2 | **D-U-N-S number** (Dun & Bradstreet) | Free | 1-2 weeks (free D-U-N-S via Apple) | Founder | D-U-N-S number (string) | YES — gates Apple enrollment | Apple REQUIRES a D-U-N-S for org-type developer accounts. Individual dev accounts don't need it but can't publish kids' apps on an individual account (Apple rejects). |
| 3 | **Apple Developer Program** | $99/year | **2-4 weeks** after D-U-N-S arrives | CTO or designated Apple admin | Apple ID login + 2FA device; App Store Connect access | YES — blocks Phase 2 P2-T12 (App Store submission) | Longest lead time in the entire project. Enroll IMMEDIATELY. Reviews can bounce for kids-category apps; allocate buffer. |
| 4 | **Legal counsel engagement** (COPPA/PDPA/GDPR) | $3K-8K retainer for drafting; ~$500/mo ongoing | 1-2 weeks to onboard counsel | Founder | Drafted privacy policy + ToS + consent language documents | **YES — blocks auth flow work P1-T07, P1-T10, P1-T12** | Counsel must be COPPA-literate. Privacy policy and ToS must be published at stable URLs before any child account is created. |
| 5 | **kidSAFE certification** (iKeepSafe or equivalent) | ~$3K-$5K/year | 4-8 weeks application review | PM / Legal | Certification logo + audit report | Not Day-1 blocker; blocks US public launch | Start application in parallel with Phase 1 build. Required for US marketplace confidence even if not strictly legal-mandated. |

---

## Tier 2: URGENT — Day-1 blockers, sequence during Week -1

| # | Item | Monthly cost | Lead time | Owner (role) | Credential format | Day-1 blocker? | Notes |
|---|------|--------------|-----------|--------------|-------------------|----------------|-------|
| 6 | **AWS account** | ~$576/mo Phase 1 per budget doc | 1-3 days setup | DevOps / Tech Lead | Root account email + IAM admin user access keys | **YES** — P1-T05 (Terraform provisioning) | Enable **billing alerts** at $500, $1000, $2000. Enable **AWS Organizations** early even if only one account today — much harder to retrofit. Enable **CloudTrail** in Org. Enable MFA on root. |
| 7 | **Domain registration** | $12/year | Hours | Tech Lead | Registrar login; ability to manage DNS | **YES** — P1-T05 (ACM SSL cert validation requires DNS) | Recommended registrar: Cloudflare or Namecheap (avoid GoDaddy). Secure at least the primary `.com`. Consider defensive registrations (`.app`, `.io`, country TLDs for target markets). |
| 8 | **DNS provider** (AWS Route 53 OR Cloudflare) | $6/mo (Route 53) or $0 (Cloudflare free) | Hours | DevOps | DNS zone admin access | **YES** | Cloudflare tier: free DDoS + CDN benefits on top of DNS. Route 53: tighter AWS integration. Recommend Cloudflare for cost + security, Route 53 for the analytics use case. |
| 9 | **GitHub organization** | $4/user/mo for Team; $21/user/mo for Enterprise | Hours | Tech Lead | GitHub org owner seat; billing configured | **YES** — blocks ALL code work | Create repos as **private**. Enable branch protection on `main`. Enable **Dependabot**. Enable **CodeQL**. Turn on **secret scanning**. |
| 10 | **Auth0 tenant** | $0 (dev tier <7.5K MAU) → $23+/mo | Hours | Backend lead | Auth0 tenant URL, management API credentials | **YES** — P1-T07 (Auth0 COPPA configuration) | Configure **COPPA age-gating rules** from day 1. Set up: custom domain, application (SPA + native), API, social connections (Google for parents/teachers ONLY — never children). Alternative: AWS Cognito (no cost under 50K MAU, less rich SSO). |
| 11 | **Stripe account** (live + test keys) | 2.9% + $0.30/txn | 1-3 days for tax verification | Founder / CFO | Publishable key + secret key per environment | **YES** (test keys) for P2-T19 | Set up **Stripe Billing** for subscription management. Register for tax collection in target markets (Stripe Tax handles this; fee is 0.5% on transactions). Webhook endpoint secret for `/billing/stripe/webhook` signature verification. |
| 12 | **SendGrid or AWS SES** | ~$15/mo (SendGrid Essentials) / $0.10/1K emails (SES) | Hours (SES) / 1 day verification (SendGrid) | Backend lead | API key; verified sending domain | **YES** for registration email flow P1-T10 | SES cheaper; SendGrid has better deliverability + template management. Domain verification requires DNS access — sequence AFTER #7. |
| 13 | **Sentry account** | $0 (free tier) → $26+/mo | Hours | DevOps | Project DSN per environment (dev, staging, prod) | **YES** — P1-T09 | Separate projects for web + API + mobile. Configure source map upload in CI. Set alert rules (>10 errors/min → Slack). |
| 14 | **Figma team** | $15/user/mo Professional | Hours | Designer | Team invite links | **YES** — blocks P1-T08 design system | Professional tier (not Free) needed for team libraries, dev mode, design tokens export. |

---

## Tier 3: NEEDED — within first 2-4 weeks, not Day-1 blockers

| # | Item | Monthly cost | Lead time | Owner (role) | Credential format | Day-1 blocker? | Notes |
|---|------|--------------|-----------|--------------|-------------------|----------------|-------|
| 15 | **MongoDB Atlas** | $60/mo (M10) → $300/mo (M30) at Phase 3 | Hours | Backend lead | Atlas project admin access, connection string | No (Docker Mongo works locally) — needed by end of Week 2 for staging | Atlas vs. self-hosted: Atlas wins for managed backups, cross-region, encryption. Use **M0 free tier** initially for cost savings if team doesn't need production-like staging Day 1. |
| 16 | **Google Workspace** (business email) | $6/user/mo Starter; $12/user/mo Standard | Hours | Founder | Admin console access; user accounts created | Soft-needed — some services require corporate email | Standard tier recommended for Google Meet + 2TB storage. Alternative: Zoho Mail (cheaper). |
| 17 | **Google Play Developer Console** | $25 one-time | 1-2 days verification | Mobile lead / CTO | Play Console login + API access | No until P2-T12 mobile release | Cheap and fast vs. Apple; do same week as Apple for parallel completion. |
| 18 | **Firebase project** (for FCM push notifications) | Free (FCM is free) | Hours | Mobile lead | Firebase admin SDK service account JSON | No until Flutter app integration in P2-T09 | iOS push additionally requires Apple APNs cert (generated from Apple Developer account — chained to #3). |
| 19 | **CI/CD runner budget** (GitHub Actions minutes) | Free tier 2K min/mo → $0.008/min after | Included with GitHub seat | DevOps | Configured in GitHub org billing | No | Budget 3K-5K min/mo for Phase 1; scale to 10K+ at Phase 3. Self-hosted runners on spot EC2 for budget relief if usage climbs. |
| 20 | **1Password or Bitwarden** (team password manager) | $8/user/mo | Hours | Ops | Vault invitation | Soft-needed for credential sharing hygiene | DO NOT share credentials via Slack/email. Required for COPPA audit trail of who has access to what. |
| 21 | **Slack or Discord workspace** | $7/user/mo Pro (Slack); free (Discord) | Hours | PM | Workspace invite | Soft-needed for team coordination | GitHub/Sentry/PagerDuty integrations required — Slack ecosystem stronger. Discord cheaper. |

---

## Tier 4: DEFERRED — Phase 3+ procurement, not Day-1 concerns

| # | Item | Monthly cost | Lead time | Owner (role) | Credential format | Phase trigger | Notes |
|---|------|--------------|-----------|--------------|-------------------|---------------|-------|
| 22 | **Twilio SMS** | ~$5-$400/mo scaling | Hours | Backend lead | Account SID + auth token | Phase 3 (optional OTP) | Can defer if email-only verification is acceptable through Phase 2. AWS SNS is a cheaper SMS alternative if already using AWS. |
| 23 | **Datadog** (APM + infra monitoring) | ~$200+/mo | Hours | DevOps | API key + app key | Phase 4 (P4-T16 optimization) | CloudWatch-only is sufficient through Phase 3. Datadog becomes valuable once distributed tracing matters (>5 services). Grafana Cloud is a cheaper alternative ($49/mo Pro). |
| 24 | **Mux** (video hosting + streaming) | ~$20-500/mo | Hours | Backend / content lead | API key pair | Phase 2 (P2-T06 animated solutions) for low volume; Phase 3 (P3-T09) scale | Alternatives: Cloudflare Stream (per-minute pricing), self-host S3+CloudFront with HLS encoding via MediaConvert (cheapest at scale, no analytics). |
| 25 | **Meilisearch Cloud** (or self-hosted on ECS) | $0 (self-hosted) → $100+/mo managed | Hours | Backend | API key | Phase 3 (P3-T01 problem search) | Self-hosted on ECS Fargate is straightforward and cheap under our volumes. Managed saves operational time. |
| 26 | **Clever** (SSO for US schools) | Free to integrate; Clever charges schools | 2-4 weeks partner onboarding | Backend / BD | Clever app OAuth credentials | Phase 3 (P3-T13) | Clever requires signing their partner agreement + going through their app review. Start application at Phase 2 for Phase 3 go-live. |
| 27 | **Google Classroom API** | Free | 1 week OAuth verification | Backend | OAuth client credentials | Phase 3 (P3-T12) | OAuth verification review for sensitive scopes (roster read) is Google's standard process — allocate 1 week. |
| 28 | **Snyk** (dependency + code vulnerability scanning) | $0 (free tier) → $52+/user/mo Team | Hours | DevOps / Security | API token | Phase 3 (P3-T07 security hardening) | GitHub Dependabot + CodeQL cover basics for free. Snyk adds runtime context and license scanning. Defer if budget-constrained. |
| 29 | **Penetration testing firm** | $8K-$25K per engagement | 2-4 weeks to schedule | PM / Security | N/A (one-time engagement) | Phase 4 (P4-T18) | Start vendor selection at end of Phase 3. Budget for 2 rounds: initial findings + remediation re-test. |
| 30 | **LaunchDarkly or Unleash** (feature flags) | $0 (self-hosted Unleash) → $75+/mo LaunchDarkly | Hours | Backend | SDK keys per environment | Phase 4 (P4-T04 A/B testing) | Unleash self-hosted is fine for Phase 4 A/B tests; LaunchDarkly's advanced targeting + audit matters more at Phase 5 scale. |
| 31 | **Anthropic API** (Claude, for Phase 5 AI features) | ~$200-$1000/mo | Hours | ML Engineer | API key | Phase 5 (P5-T02 LLM hints) | Consider also OpenAI as failover. Set per-student daily caps; cache common hint patterns. |
| 32 | **Paddle (alternative to Stripe for global tax)** | ~5% of revenue | 1-2 weeks tax verification | Founder | Merchant of record setup | Phase 5 (international expansion) | Stripe handles US/major markets well; Paddle becomes attractive when tax compliance in 20+ countries is a real burden. |

---

## Week -4 to Week 0 execution sequence

**Week -4 (Critical path items):**

- Day 1: File business entity (#1). Simultaneously apply for D-U-N-S (#2).
- Day 3: Engage legal counsel for COPPA package (#4).
- Day 7: As soon as entity certificate arrives, open Apple Developer Program (#3). Start kidSAFE application (#5).

**Week -2 (Tier 2 foundation):**

- Day 1: Open AWS account + enable org/billing alerts (#6). Register domain (#7). Set up DNS (#8).
- Day 2: Create GitHub organization (#9).
- Day 3: Create Auth0 tenant with COPPA config (#10).
- Day 4: Open Stripe account, start tax verification (#11).
- Day 5: Configure SendGrid + domain verification (#12). Sentry projects (#13). Figma team (#14).

**Week -1 (Team enablement):**

- Day 1: Grant all Tier 2 credentials to DevOps + Tech Lead.
- Day 2: Kickoff meeting with dev team — walk through credentials, confirm access to all systems.
- Day 3: Run a dry-run provisioning with Terraform against staging environment.
- Day 4: Receive kidSAFE certification guidance and privacy policy draft from legal.
- Day 5: Team ready for Week 0 Day 1.

**Week 0 Day 1:**

- DevOps starts Terraform provisioning (P1-T05) with working AWS creds.
- Backend starts NestJS scaffolding with Auth0 tenant configured.
- Frontend starts Next.js scaffold with design system kickoff.
- Content team begins curriculum taxonomy work (parallel; not blocked on credentials).

---

## Credentials delivery format

When provisioning accounts, deliver credentials to the dev team in a **single standardized format** per service, saved to the team password manager (1Password/Bitwarden vault):

```
[Service Name]
  Environment: dev | staging | prod
  Owner: <email>
  Admin console URL: <url>
  Access method: <IAM user | OAuth app | API key | etc>
  Required scopes: <list>
  Credential storage: AWS Secrets Manager at <arn>
  Rotation policy: <yearly | quarterly | on-breach>
  Emergency contact: <email + phone>
  Billing alerts: <threshold + notification target>
```

Do NOT share credentials via Slack, email, or chat. Use the password manager. Generate separate credentials per environment (never reuse prod keys in staging).

---

## Monthly cost summary at Phase 1 launch

| Tier | Cost |
|------|------|
| AWS (Phase 1 spec) | $200/mo |
| MongoDB Atlas M10 | $60/mo |
| Auth0 (free) | $0/mo |
| GitHub Team (5 seats) | $20/mo |
| Sentry (free) | $0/mo |
| SendGrid Essentials | $15/mo |
| Figma (3 seats) | $45/mo |
| Google Workspace (5 seats) | $30/mo |
| Stripe fees (low volume) | $50/mo |
| Domain + DNS | $2/mo amortized |
| 1Password (10 seats) | $80/mo |
| Slack Pro (10 seats) | $70/mo |
| CloudFlare Pro | $20/mo |
| Apple + Google Dev fees | $11/mo amortized |
| COPPA/kidSAFE amortized | $300/mo |
| **Month 1 total** | **~$903/mo** |

This is the **true** monthly burn including SaaS overhead, not just the server costs specced in `koblio_budget_estimation.md` (which was $576/mo, infrastructure-only). Budget accordingly.

---

## Ownership table — who is accountable

| Role | Items owned |
|------|-------------|
| **Founder / CEO** | #1 Business entity, #11 Stripe (legally), #16 Google Workspace, #31 Anthropic API billing |
| **Legal counsel** | #4 Legal engagement, #5 kidSAFE (with PM), #26 Clever partner agreement |
| **CTO / Tech Lead** | #3 Apple Dev, #6 AWS root, #9 GitHub org, #17 Play Console, #29 Pentest vendor selection |
| **DevOps** | #6 AWS IAM / billing, #7 Domain, #8 DNS, #13 Sentry, #19 CI/CD budget, #20 Password manager, #28 Snyk |
| **Backend lead** | #10 Auth0, #12 SendGrid, #15 MongoDB Atlas, #22 Twilio, #25 Meilisearch, #27 Google Classroom, #30 Feature flags |
| **Mobile lead** | #17 Play Console, #18 Firebase, iOS/Android provisioning profiles |
| **Designer** | #14 Figma team admin |
| **PM** | #5 kidSAFE application, #21 Slack workspace, #29 Pentest scheduling |
| **ML engineer** | #31 Anthropic API key management |

---

## Red flags to catch during procurement

- **Apple rejections for kids' apps** are common. Study Apple's guidelines for kids category (section 1.3, 5.1.4). Privacy policy must be linked from the app listing BEFORE first submission.
- **COPPA violations carry FTC fines up to $43K per violation.** Legal sign-off on consent flow wording is mandatory, not optional. Don't ship auth without it.
- **Stripe tax verification can hold transactions** if the business entity's tax info is incomplete. Verify tax settings are green before going live.
- **AWS "surprise bills"** — set hard billing alerts at $500/$1K/$2K from Day 1. Most dev-team surprises are someone accidentally spinning up a GPU instance or leaving a database unencrypted/public.
- **GitHub seat costs scale faster than you think.** Free tier is generous but once you add contractors + QA + PM, $4-$21/seat/mo adds up. Budget for a team of 11-13 by Phase 3, not the Day 1 team of 5-8.
- **Auth0 MAU pricing cliff.** Free tier is 7,500 MAU — once platform crosses into real usage, price jumps to ~$240/mo then to ~$800+/mo. Plan migration to Cognito or self-hosted (Keycloak) if MAU crosses 25K without corresponding revenue.

---

*This is a living checklist. Update as items are procured. Mark each as COMPLETE with the date and owner so handoff audit is traceable.*
