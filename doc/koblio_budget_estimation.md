# Operational Cost Estimation: EdTech Platform (Koblio-Style)
## Server & Platform Running Costs — No Manpower/Salary Costs

**Prepared:** 2026-04-16
**Currency:** USD
**Scope:** Recurring operational expenses to keep the platform running. Excludes all human salaries, team costs, content creation labor, and marketing spend.
**Reference Platform:** Koblio Learning — gamified adaptive math for K-6, with leaderboards, teacher/parent dashboards, progress tracking, and curriculum-aligned content.

---

## Table of Contents

1. [Cloud Infrastructure Costs](#1-cloud-infrastructure-costs)
2. [Third-Party SaaS Services](#2-third-party-saas-services)
3. [Domain, SSL & Foundational Services](#3-domain-ssl--foundational-services)
4. [CI/CD Pipeline & Developer Tooling](#4-cicd-pipeline--developer-tooling)
5. [Compliance & Security Services](#5-compliance--security-services)
6. [Miscellaneous Recurring Operational Costs](#6-miscellaneous-recurring-operational-costs)
7. [Monthly & Annual Summary Tables](#7-monthly--annual-summary-tables)

---

## 1. Cloud Infrastructure Costs

All pricing based on AWS on-demand rates (early 2026). GCP/Azure costs are comparable within 10-15%.

### 1.1 Compute (API Servers & Application Hosting)

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | 2x t3.medium (2 vCPU, 4 GB) on ECS Fargate or EC2 | $60 |
| **10K MAU** | 4x t3.large (2 vCPU, 8 GB) + Application Load Balancer | $350 |
| **100K MAU** | ECS/EKS cluster, 8-12x m6i.xlarge instances, auto-scaling groups | $2,500 |

**Notes:** Includes container orchestration overhead. At 100K MAU, expect burst capacity during peak homework hours (3-6 PM school-day windows). Reserved Instances (1-yr commit) reduce these costs by 30-40%.

### 1.2 Database (Primary Datastore)

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | RDS PostgreSQL db.t3.medium, 50 GB storage, single-AZ | $70 |
| **10K MAU** | RDS db.r6g.large, 200 GB storage, 1 read replica | $450 |
| **100K MAU** | RDS db.r6g.2xlarge, Multi-AZ, 2 read replicas, 1 TB storage | $2,800 |

**Notes:** Student progress data, problem history, leaderboard rankings, and user profiles are write-heavy. Read replicas offload analytics and dashboard queries. At 100K MAU, consider DynamoDB for session/real-time data (~$200-400/mo additional).

### 1.3 Caching Layer

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | ElastiCache Redis cache.t3.micro, single node | $15 |
| **10K MAU** | ElastiCache cache.r6g.large, single node | $200 |
| **100K MAU** | ElastiCache cluster, 3x cache.r6g.xlarge nodes | $1,200 |

**Notes:** Caches leaderboard rankings, session data, frequently-accessed problem sets, and adaptive learning state. Critical for real-time leaderboard updates and gamification responsiveness.

### 1.4 Object Storage (S3)

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | 50 GB stored, minimal transfer | $5 |
| **10K MAU** | 500 GB stored | $15 |
| **100K MAU** | 5 TB stored | $120 |

**Notes:** Stores math problem illustrations, character/avatar assets, badge images, tutorial thumbnails, user-uploaded profile pictures, and exported PDF reports.

### 1.5 CDN (Content Delivery Network)

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | CloudFront, 100 GB/mo transfer | $10 |
| **10K MAU** | CloudFront, 1 TB/mo transfer | $85 |
| **100K MAU** | CloudFront, 10 TB/mo transfer | $750 |

**Notes:** Serves static assets (JS/CSS bundles, images, animations) and cached API responses. Animated tutorial content is the biggest bandwidth driver.

### 1.6 Media & Asset Delivery

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | S3 + CloudFront for illustrations, audio clips | $10 |
| **10K MAU** | S3 + CloudFront, increased transfer | $50 |
| **100K MAU** | S3 + CloudFront, high transfer + video streaming support | $300 |

**Notes:** Animated math tutorials, gamification animations (badge unlocks, leaderboard celebrations), character animations, and audio feedback for younger students.

### 1.7 Search Service

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | OpenSearch t3.small.search (optional — can use DB queries) | $35 |
| **10K MAU** | OpenSearch m5.large.search | $120 |
| **100K MAU** | OpenSearch 3-node cluster (m5.xlarge.search) | $500 |

**Notes:** Powers problem search, curriculum topic browsing, teacher content search for assignment creation. At 1K MAU, basic PostgreSQL full-text search may suffice.

### 1.8 Message Queue & Event Bus

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | SQS + SNS, low volume | $2 |
| **10K MAU** | SQS + SNS, moderate volume | $10 |
| **100K MAU** | SQS + SNS + EventBridge | $80 |

**Notes:** Handles async tasks: badge/achievement processing, leaderboard recalculation, notification dispatch, homework auto-grading queues, analytics event ingestion.

### 1.9 Real-Time Services (Leaderboards, Live Challenges)

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | Included in cache layer above | $0 |
| **10K MAU** | Included in cache layer above | $0 |
| **100K MAU** | Dedicated ElastiCache / AppSync for WebSocket connections | $200 |

**Notes:** Live leaderboard updates, peer challenge matchmaking, and real-time classroom activity feeds at scale require dedicated real-time infrastructure.

### 1.10 Backup & Disaster Recovery

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | Automated RDS snapshots (included in RDS cost) | $0 |
| **10K MAU** | Automated snapshots + S3 versioning | $30 |
| **100K MAU** | Cross-region replication + point-in-time recovery | $150 |

### 1.11 Cloud Infrastructure Subtotals

| Scale | Monthly Total | Annual Total |
|-------|---------------|--------------|
| **1K MAU** | **$207** | **$2,484** |
| **10K MAU** | **$1,310** | **$15,720** |
| **100K MAU** | **$8,600** | **$103,200** |

---

## 2. Third-Party SaaS Services

### 2.1 Authentication Provider

| Scale | Provider Options | Monthly Cost |
|-------|-----------------|-------------|
| **1K MAU** | AWS Cognito (free tier covers 50K MAU) / Firebase Auth (free tier) | $0 |
| **10K MAU** | AWS Cognito ($0.0055/MAU after 50K) / Auth0 Essentials | $23 |
| **100K MAU** | Auth0 Professional / Cognito | $250 |

**Notes:** Must support school bulk onboarding (CSV import, SSO/SAML for school districts), parent-child account linking, and COPPA-compliant parental consent flows. Auth0 is pricier but richer in SSO/SAML for school integration.

### 2.2 Transactional Email Service

| Scale | Provider Options | Monthly Cost |
|-------|-----------------|-------------|
| **1K MAU** | AWS SES ($0.10/1K emails) | $1 |
| **10K MAU** | SES or SendGrid Essentials | $15 |
| **100K MAU** | SendGrid Pro / SES | $80 |

**Notes:** Sends password resets, welcome emails, weekly progress reports to parents, homework assignment notifications to students, subscription receipts. Volume scales with parent engagement emails (weekly digests).

### 2.3 Push Notification Service

| Scale | Provider Options | Monthly Cost |
|-------|-----------------|-------------|
| **1K MAU** | Firebase Cloud Messaging (free) | $0 |
| **10K MAU** | Firebase (free) / OneSignal free tier | $0 |
| **100K MAU** | OneSignal Growth / Firebase + custom targeting | $100 |

**Notes:** Daily challenge reminders, streak maintenance nudges, achievement unlocks, homework due alerts. Critical for student retention and habit formation.

### 2.4 SMS Service (OTP & Alerts)

| Scale | Provider Options | Monthly Cost |
|-------|-----------------|-------------|
| **1K MAU** | Twilio / AWS SNS (~$0.05/SMS) | $5 |
| **10K MAU** | Twilio / SNS | $50 |
| **100K MAU** | Twilio / SNS (bulk rates) | $400 |

**Notes:** Primarily for parent account verification OTP and optional SMS alerts. Can be deferred at MVP stage if email-only verification is acceptable.

### 2.5 Payment Gateway

| Scale | Provider Options | Monthly Cost |
|-------|-----------------|-------------|
| **1K MAU** | Stripe (2.9% + $0.30/txn) | $50 |
| **10K MAU** | Stripe / Paddle (handles sales tax) | $500 |
| **100K MAU** | Stripe + Paddle (tax compliance in multi-country) | $5,000 |

**Notes:** Fees scale with revenue, not MAU. Estimates assume: 1K MAU → ~$1,700 MRR (10% conversion × $10/mo); 10K MAU → ~$17K MRR; 100K MAU → ~$170K MRR. Paddle charges ~5% but handles global sales tax/VAT compliance. School invoicing (B2B) may bypass gateway (wire/ACH).

### 2.6 Analytics & Product Intelligence

| Scale | Provider Options | Monthly Cost |
|-------|-----------------|-------------|
| **1K MAU** | Google Analytics 4 (free) + Mixpanel free tier (20M events) | $0 |
| **10K MAU** | GA4 + Mixpanel/Amplitude free tier (may still fit) | $0 |
| **100K MAU** | Mixpanel Growth / Amplitude Plus | $500 |

**Notes:** Tracks student engagement funnels, feature adoption, session duration, drop-off points, conversion rates. Critical for optimizing gamification loops and identifying at-risk students. Amplitude's education pricing may offer discounts.

### 2.7 Error Tracking & Application Monitoring

| Scale | Provider Options | Monthly Cost |
|-------|-----------------|-------------|
| **1K MAU** | Sentry free tier (5K errors/mo) | $0 |
| **10K MAU** | Sentry Team ($26/mo, 50K events) | $26 |
| **100K MAU** | Sentry Business ($80/mo) or Datadog APM | $80 |

**Notes:** Captures frontend JS errors, backend exceptions, mobile crash reports. Essential for maintaining reliability of auto-grading, leaderboard calculations, and payment flows.

### 2.8 Infrastructure Monitoring & Observability

| Scale | Provider Options | Monthly Cost |
|-------|-----------------|-------------|
| **1K MAU** | AWS CloudWatch Basic (included) | $15 |
| **10K MAU** | CloudWatch + X-Ray traces | $50 |
| **100K MAU** | CloudWatch + X-Ray + Grafana Cloud or Datadog Infrastructure | $200 |

**Notes:** Monitors server health, response latencies, database performance, cache hit rates, queue depths. At scale, Datadog ($15/host/mo for infra + $31/host/mo for APM) is powerful but costly — Grafana Cloud is a budget-friendly alternative.

### 2.9 Video Hosting (Tutorial Content)

| Scale | Provider Options | Monthly Cost |
|-------|-----------------|-------------|
| **1K MAU** | Mux ($0.007/min watched) / Cloudflare Stream ($1/1K min) | $20 |
| **10K MAU** | Mux / Cloudflare Stream | $100 |
| **100K MAU** | Mux / Cloudflare Stream / self-hosted via S3+CloudFront | $500 |

**Notes:** Hosts 1,000+ animated math tutorial videos. Mux provides adaptive bitrate streaming and analytics. At scale, self-hosting on S3+CloudFront may be cheaper if analytics aren't needed.

### 2.10 Feature Flags & Remote Configuration

| Scale | Provider Options | Monthly Cost |
|-------|-----------------|-------------|
| **1K MAU** | Unleash (self-hosted, free) / LaunchDarkly Starter | $0 |
| **10K MAU** | Unleash self-hosted / LaunchDarkly free tier | $0 |
| **100K MAU** | LaunchDarkly Pro / Unleash self-hosted | $75 |

**Notes:** Enables A/B testing of gamification mechanics, gradual feature rollouts, and per-school feature toggling. Self-hosted Unleash avoids recurring cost.

### 2.11 Third-Party SaaS Subtotals

| Scale | Monthly Total | Annual Total |
|-------|---------------|--------------|
| **1K MAU** | **$91** | **$1,092** |
| **10K MAU** | **$764** | **$9,168** |
| **100K MAU** | **$7,185** | **$86,220** |

---

## 3. Domain, SSL & Foundational Services

| Item | Cost | Billing |
|------|------|---------|
| Domain registration (.com) | $12 | Annual |
| Additional domains (.io, .edu, country TLDs) | $15-50 each | Annual |
| SSL/TLS Certificates | $0 | Free (Let's Encrypt / AWS ACM) |
| DNS Hosting (AWS Route 53) | $6 ($0.50/hosted zone/mo) | Annual |
| Google Workspace (business email, docs — per seat) | $72/seat | Annual |
| **Subtotal (foundation, ~3 domains)** | **~$120/yr** | **Annual** |

**Notes:** Google Workspace listed here is for system/operational email (noreply@, support@, admin@) not staff accounts. 1-2 seats for platform operations.

---

## 4. CI/CD Pipeline & Developer Tooling

These are infrastructure costs for build/deploy automation, not developer salaries.

### 4.1 CI/CD Pipeline

| Scale | Provider Options | Monthly Cost |
|-------|-----------------|-------------|
| **1K MAU** | GitHub Actions (2,000 free min/mo) / AWS CodePipeline | $10 |
| **10K MAU** | GitHub Actions Team (3,000 min/mo + paid runners) | $20 |
| **100K MAU** | GitHub Actions + self-hosted runners on EC2 | $50 |

**Notes:** Runs automated tests, linting, build, and deployment on every code push. At scale, self-hosted runners on spot instances reduce per-minute costs. Includes build for web app, mobile apps (iOS/Android), and backend services.

### 4.2 Container Registry

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | ECR (500 MB free tier, then $0.10/GB) | $1 |
| **10K MAU** | ECR, ~5 GB stored | $2 |
| **100K MAU** | ECR, ~20 GB stored + lifecycle policies | $5 |

### 4.3 Secrets Management

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | AWS Secrets Manager ($0.40/secret/mo), ~10 secrets | $4 |
| **10K MAU** | ~25 secrets | $10 |
| **100K MAU** | ~50 secrets + rotation policies | $20 |

**Notes:** Stores API keys, database credentials, third-party service tokens. Secrets Manager provides automatic rotation for RDS credentials.

### 4.4 Code Repository Hosting

| Scale | Provider | Monthly Cost |
|-------|----------|-------------|
| **1K MAU** | GitHub Team ($4/user/mo, assume 5 contributors) | $20 |
| **10K MAU** | GitHub Team (10 contributors) | $40 |
| **100K MAU** | GitHub Enterprise / Team (15 contributors) | $60 |

### 4.5 Infrastructure-as-Code State

| Scale | Provider | Monthly Cost |
|-------|----------|-------------|
| All scales | Terraform Cloud Free / S3 backend | $0 |

### 4.6 CI/CD & Tooling Subtotals

| Scale | Monthly Total | Annual Total |
|-------|---------------|--------------|
| **1K MAU** | **$35** | **$420** |
| **10K MAU** | **$72** | **$864** |
| **100K MAU** | **$135** | **$1,620** |

---

## 5. Compliance & Security Services

### 5.1 Web Application Firewall (WAF)

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | Not required at this scale | $0 |
| **10K MAU** | AWS WAF (COPPA compliance, bot protection) | $25 |
| **100K MAU** | AWS WAF + Shield Advanced (DDoS protection) | $100 |

### 5.2 COPPA/GDPR Compliance Certification

| Scale | Spec | Monthly Cost (amortized) |
|-------|------|-------------------------|
| **1K MAU** | kidSAFE / iKeepSafe annual certification | $300 |
| **10K MAU** | kidSAFE + legal compliance review | $300 |
| **100K MAU** | kidSAFE + GDPR-K compliance + annual audit | $500 |

**Notes:** COPPA certification is mandatory for US-facing children's platforms. kidSAFE costs ~$3,000-5,000/yr; amortized monthly. GDPR-K (children's data) required for EU markets.

### 5.3 Penetration Testing & Security Scanning

| Scale | Spec | Monthly Cost (amortized) |
|-------|------|-------------------------|
| **1K MAU** | OWASP ZAP (free, self-run) / Snyk free tier | $0 |
| **10K MAU** | Snyk Team ($25/mo) + annual pentest ($5K amortized) | $67 |
| **100K MAU** | Snyk Business + quarterly pentests ($20K/yr amortized) | $250 |

### 5.4 DDoS Protection

| Scale | Spec | Monthly Cost |
|-------|------|-------------|
| **1K MAU** | AWS Shield Standard (free, included) | $0 |
| **10K MAU** | AWS Shield Standard | $0 |
| **100K MAU** | AWS Shield Advanced ($3,000/mo) or Cloudflare Pro ($20/mo) | $100* |

*\*Using Cloudflare Pro rather than AWS Shield Advanced for cost efficiency. Shield Advanced at $3,000/mo is only justified for very high-profile targets.*

### 5.5 Compliance & Security Subtotals

| Scale | Monthly Total | Annual Total |
|-------|---------------|--------------|
| **1K MAU** | **$300** | **$3,600** |
| **10K MAU** | **$392** | **$4,704** |
| **100K MAU** | **$950** | **$11,400** |

---

## 6. Miscellaneous Recurring Operational Costs

### 6.1 App Store Fees

| Item | Cost | Notes |
|------|------|-------|
| Apple Developer Program | $99/yr | Required to publish on iOS App Store |
| Google Play Developer | $25 (one-time) | Lifetime registration |
| Apple/Google commission on in-app purchases | 15-30% of revenue | Typically 15% for small business program (<$1M revenue/yr), 30% above |

**Notes:** App store commissions are a significant operational cost at scale. At 100K MAU with ~$170K MRR, the 15% commission = ~$25,500/mo. Consider directing school/parent signups to the web to avoid app store cuts.

### 6.2 Data Lake / Analytics Infrastructure (100K MAU only)

| Component | Spec | Monthly Cost |
|-----------|------|-------------|
| S3 Data Lake | Raw event storage | $50 |
| AWS Athena | Serverless SQL queries on S3 | $150 |
| QuickSight / Metabase | BI dashboards for internal use | $200 |
| **Subtotal** | | **$400** |

**Notes:** Only needed at 100K MAU scale. At smaller scale, database queries and product analytics tools (Mixpanel/Amplitude) suffice.

### 6.3 Uptime Monitoring (External)

| Scale | Provider | Monthly Cost |
|-------|----------|-------------|
| **1K MAU** | UptimeRobot free tier (50 monitors) | $0 |
| **10K MAU** | UptimeRobot Pro or Pingdom | $15 |
| **100K MAU** | Pingdom / Better Uptime + status page | $40 |

### 6.4 Log Management (if not using CloudWatch)

| Scale | Provider | Monthly Cost |
|-------|----------|-------------|
| **1K MAU** | CloudWatch Logs (included in monitoring above) | $0 |
| **10K MAU** | CloudWatch Logs | $0 |
| **100K MAU** | Datadog Logs / ELK on EC2 (self-hosted) | $150 |

### 6.5 Miscellaneous Subtotals (Excluding App Store Commissions)

| Scale | Monthly Total | Annual Total |
|-------|---------------|--------------|
| **1K MAU** | **$8** | **$99** |
| **10K MAU** | **$15** | **$180** |
| **100K MAU** | **$590** | **$7,080** |

*App store commissions excluded from subtotals as they scale with revenue, not infrastructure.*

---

## 7. Monthly & Annual Summary Tables

### 7.1 Detailed Monthly Breakdown by Category

| Category | 1K MAU | 10K MAU | 100K MAU |
|----------|--------|---------|----------|
| Cloud Infrastructure (compute, DB, cache, storage, CDN, search, queues, backups) | $207 | $1,310 | $8,600 |
| Third-Party SaaS (auth, email, SMS, payments, analytics, error tracking, video hosting) | $91 | $764 | $7,185 |
| Domain, SSL & Foundational Services | $10 | $10 | $10 |
| CI/CD Pipeline & Developer Tooling (GitHub, runners, registry, secrets) | $35 | $72 | $135 |
| Compliance & Security (WAF, COPPA cert, pentests, DDoS) | $300 | $392 | $950 |
| Miscellaneous (uptime monitoring, data lake, log management) | $8 | $15 | $590 |
| **Monthly Total (excl. app store commissions)** | **$651** | **$2,563** | **$17,470** |

### 7.2 Annual Summary

| Category | 1K MAU | 10K MAU | 100K MAU |
|----------|--------|---------|----------|
| Cloud Infrastructure | $2,484 | $15,720 | $103,200 |
| Third-Party SaaS Services | $1,092 | $9,168 | $86,220 |
| Domain, SSL & Foundational | $120 | $120 | $120 |
| CI/CD & Developer Tooling | $420 | $864 | $1,620 |
| Compliance & Security | $3,600 | $4,704 | $11,400 |
| Miscellaneous Operational | $99 | $180 | $7,080 |
| **Annual Total** | **$7,815** | **$30,756** | **$209,640** |

### 7.3 LOW / MEDIUM / HIGH Estimate Ranges

Applying -20% (LOW, aggressive optimization) and +30% (HIGH, conservative/premium services) adjustments:

| Estimate | 1K MAU/mo | 1K MAU/yr | 10K MAU/mo | 10K MAU/yr | 100K MAU/mo | 100K MAU/yr |
|----------|-----------|-----------|------------|------------|-------------|-------------|
| **LOW** | $521 | $6,252 | $2,050 | $24,605 | $13,976 | $167,712 |
| **MEDIUM** | $651 | $7,815 | $2,563 | $30,756 | $17,470 | $209,640 |
| **HIGH** | $846 | $10,160 | $3,332 | $39,983 | $22,711 | $272,532 |

**LOW assumptions:** Reserved instances (1-yr commit), self-hosted alternatives where possible (Unleash, Metabase, ELK), aggressive use of free tiers, Cloudflare free/pro instead of AWS WAF+CloudFront.

**HIGH assumptions:** On-demand pricing, premium SaaS tiers (Datadog over CloudWatch, Auth0 over Cognito, LaunchDarkly over Unleash), multi-region redundancy, higher compliance costs.

### 7.4 App Store Commission Impact (Revenue-Dependent)

| Scale | Est. Monthly Revenue | Commission (15%) | Commission (30%) |
|-------|---------------------|-------------------|-------------------|
| 1K MAU | $1,700 | $255 | $510 |
| 10K MAU | $17,000 | $2,550 | $5,100 |
| 100K MAU | $170,000 | $25,500 | $51,000 |

*Assumes 10% of MAU convert to paid subscribers at $10/mo. Commission rate depends on Apple/Google small business program eligibility. Web-direct signups avoid these fees entirely.*

---

## Key Assumptions & Notes

1. **Pricing Basis:** AWS on-demand pricing as of early 2026. GCP/Azure costs are comparable (within 10-15%). Reserved Instances or Savings Plans (1-yr commit) reduce compute + DB costs by 30-40%.

2. **Scaling is Non-Linear:** Costs do not scale linearly with MAU. Infrastructure costs roughly follow a step-function pattern — you provision for the next tier, then grow into capacity.

3. **Payment Gateway Fees Scale with Revenue:** Stripe's 2.9% + $0.30/txn is the largest variable operational cost at scale. Paddle (~5%) handles tax compliance but takes a bigger cut. School B2B invoicing (wire/ACH) bypasses gateway fees.

4. **COPPA Compliance is Non-Negotiable:** kidSAFE/iKeepSafe certification ($3K-5K/yr) is mandatory for US-facing children's platforms. Budget for this from day one.

5. **Build vs. Buy Trade-offs:** Using Firebase (auth + hosting + analytics + push) can reduce 1K MAU infrastructure costs by 40-60% but limits flexibility at scale. Managed Kubernetes (EKS) adds overhead vs. simpler ECS Fargate.

6. **Not Included in This Document:**
   - All human salaries (engineers, designers, PMs, QA, support, content creators)
   - Office space, equipment, and team tools (Slack, Figma, etc.)
   - Content creation costs (problem authoring, illustrations, animations)
   - Marketing and customer acquisition costs
   - Legal counsel fees (only certification/audit costs included)
   - Founder compensation and insurance
   - One-time development/build costs

7. **Cost Optimization Levers:**
   - Reserved Instances: saves 30-40% on compute + DB
   - Spot Instances for CI/CD runners: saves 60-70% on build costs
   - Cloudflare (free/pro): replaces CloudFront + WAF at lower cost
   - Self-hosted open-source alternatives: Unleash, Metabase, Grafana, ELK
   - Web-direct subscriptions: avoids 15-30% app store commission
   - S3 Intelligent Tiering: auto-optimizes storage costs
