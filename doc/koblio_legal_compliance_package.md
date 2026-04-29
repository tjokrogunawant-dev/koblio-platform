# Koblio Legal & Compliance Implementation Package

**Prepared:** 2026-04-16
**Audience:** External dev team building the auth, account, and data-handling layers
**Scope:** This is a **specification for what to build and what legal artifacts must contain** — not a drafted privacy policy or legal opinion.
**Critical disclaimer:** The author of this document is not a lawyer. Every artifact described here MUST be reviewed by qualified counsel before launch. See section 11 for what to engage counsel on.

---

## Table of Contents

1. [Regulatory Landscape](#1-regulatory-landscape)
2. [COPPA Requirements (US, under 13)](#2-coppa-requirements-us-under-13)
3. [GDPR-K Requirements (EU children)](#3-gdpr-k-requirements-eu-children)
4. [Data Inventory & Classification](#4-data-inventory--classification)
5. [Privacy Policy Structure](#5-privacy-policy-structure)
6. [Terms of Service Structure](#6-terms-of-service-structure)
7. [Parental Consent Flow Specification](#7-parental-consent-flow-specification)
8. [Data Subject Rights Implementation](#8-data-subject-rights-implementation)
9. [Incident Response & Breach Notification](#9-incident-response--breach-notification)
10. [Third-Party Processor List & DPAs](#10-third-party-processor-list--dpas)
11. [When to Engage Counsel](#11-when-to-engage-counsel)

---

## 1. Regulatory Landscape

A K-6 math platform serving US and EU users falls under at minimum:

| Regulation | Jurisdiction | Trigger | Key Constraint |
|------------|-------------|---------|----------------|
| **COPPA** | US federal | Service "directed to children under 13" or actual knowledge of under-13 user | Verifiable Parental Consent (VPC) before collecting personal info |
| **GDPR Art. 8** | EU | Service offered to EU residents; child users below national age of consent (13-16) | Parental consent below national age threshold |
| **CCPA/CPRA** | California | CA residents | Special protections for minors; opt-in for sale/sharing of data of those under 16 |
| **State laws** | Various US states | Varies by state | New CO, CT, VA, FL laws have specific minor protections |
| **PIPEDA** | Canada | If serving Canadian users | Consent rules for minors |
| **kidSAFE / iKeepSafe** | Voluntary certification | If pursued | Audit & seal program |

**Implementation rule:** Build to the strictest requirement, then degrade based on detected jurisdiction. Default to "child user, full protections" unless verified otherwise.

---

## 2. COPPA Requirements (US, under 13)

### 2.1 What COPPA requires

The operator of a child-directed online service (or one with actual knowledge of child users) must:

1. **Provide direct notice** to parents of data collection practices BEFORE collecting from a child
2. **Obtain Verifiable Parental Consent (VPC)** before collecting, using, or disclosing personal information from children under 13
3. **Allow parents to review** the personal information collected from their child
4. **Allow parents to revoke consent** and request deletion at any time
5. **Limit collection** to what is reasonably necessary for the activity
6. **Establish & maintain reasonable security** measures
7. **Retain personal info only as long as necessary** to fulfill the purpose

### 2.2 What counts as "personal information" under COPPA

Concrete list — implement as data classification tags in the schema:

- Full name
- Home or other physical address (including street name & city)
- Online contact info (email, IM handle, screen name that functions as contact info)
- Telephone number
- SSN
- Persistent identifier (cookie ID, IP address, device serial, IMEI) if used to recognize a user over time
- Photo, video, audio file containing the child's image or voice
- Geolocation precise enough to identify street name and city
- Information concerning the child or parents that the operator collects from the child and combines with any of the above

### 2.3 What CANNOT be collected (or only with very specific protections)

- **Behavioral advertising data** for under-13 users — no targeted ads. Period.
- **Persistent identifiers used for cross-context tracking** — CAN be collected for "internal operations" (e.g., session management, A/B testing platform health, fraud prevention) but NOT for behavioral advertising or to profile the user across services.
- **Free-form chat / open text fields where the child could share PII** — must be moderated, filtered, or disabled.
- **Social features** that allow children to interact with the public — strongly discouraged; if included, must be heavily moderated.

### 2.4 Implementation requirements for the auth module

**Account types and their data handling:**

| Account Type | Required PII | Optional PII | Notes |
|--------------|-------------|--------------|-------|
| **Child (under 13)** | Username (anonymized), grade, parent's verified email | First name (display), avatar choice | NO last name, NO photo, NO geolocation, NO email collected from child |
| **Parent** | Email, payment info (if subscriber), name | Phone number | Standard adult account |
| **Teacher** | Email, school affiliation, name | Class roster details | Educational context — see school exception below |
| **School-licensed bulk** | School admin email + roster import | Per-student PII minimized | See COPPA School Exception |

**The COPPA School Exception:** If a school contracts the service for educational use, the school can provide consent on behalf of parents for data collected solely for educational use. This SIMPLIFIES B2B (school) sales but the operator must:
- Have a written agreement with the school designating the school as agent for parental consent
- Use data only for the educational purpose authorized
- Not use the data for commercial purposes (no behavioral ads, no marketing to the child)
- Allow the school (and through them, parents) to review and delete

**Auth module concrete requirements:**

```
POST /api/auth/register/parent
  Body: { email, password, name, child_email_NOT_REQUIRED }
  Returns: parent account, NO child created yet

POST /api/auth/register/child
  Requires: valid parent_session_token + completed VPC for that parent
  Body: { parent_id, child_username, grade, avatar_choice, display_first_name? }
  Returns: child account with parent_id linkage
  Side effect: writes to consent_audit_log

POST /api/auth/login/child
  Body: { username, picture_password OR pin }  
  // No email collected; picture-password for K-2, PIN for K-6
  Returns: short-lived session token, requires renewal more often than adult sessions

GET /api/parent/children/{child_id}/data
  Auth: parent session
  Returns: full data export for child (see section 8)

DELETE /api/parent/children/{child_id}
  Auth: parent session
  Triggers: full deletion workflow (see section 8)
```

### 2.5 Data retention & deletion under COPPA

- **Active child accounts:** Retain only data necessary for the educational service.
- **Inactive child accounts (no login for 12 months):** Trigger an automated re-verification email to the parent. If no response in 30 days, archive the account; if no response in 90 days, delete.
- **On parent-requested deletion:** Complete deletion within **30 days** of request. Includes derived data (analytics aggregates that could re-identify), backups (next backup cycle), and third-party processor data (must trigger DPA-defined deletion at processors).
- **Backup deletion grace period:** Document explicitly that deletion may take up to one full backup cycle (typically 30-90 days) to propagate through cold storage. Disclose this in the privacy policy.

### 2.6 The "actual knowledge" trap

Even if your service is NOT directed at children, if you have "actual knowledge" of an under-13 user, COPPA applies to that user. Implementation implication: **your registration flow must screen age**. Don't ask "what is your birth year" with selectable years that hint at the answer (don't pre-select an adult year). If a user enters a child age without VPC, you must NOT collect their PII and should redirect to the parent flow.

---

## 3. GDPR-K Requirements (EU children)

### 3.1 GDPR Art. 8 — age of consent

GDPR sets the default at **16** for digital service consent, but allows member states to lower it to **13**. The actual age varies by country:

| Country | Age | Country | Age |
|---------|-----|---------|-----|
| Belgium, Denmark, Estonia, Finland, Latvia, Malta, Norway, Portugal, Sweden, UK | 13 | Ireland, Italy, Lithuania, Poland | 16 |
| Austria, Bulgaria, Cyprus, Czechia, Greece, Spain | 14 | France, Croatia, Slovenia | 15 |
| Germany, Hungary, Luxembourg, Netherlands, Romania, Slovakia | 16 | | |

**Implementation rule:** Detect EU country of residence at registration, apply local age threshold. Below threshold, require parental consent. The auth module must store `consent_jurisdiction` and `consent_age_threshold_at_signup` per account.

### 3.2 What GDPR-K requires beyond COPPA

- **Lawful basis for processing must be documented per data field**, not just "consent" globally
- **Privacy notices must use child-comprehensible language** — Art. 12 requires "concise, transparent, intelligible and easily accessible form, using clear and plain language, in particular for any information addressed specifically to a child"
- **Data Protection Impact Assessment (DPIA)** required because processing involves children at scale
- **Right to erasure ("right to be forgotten")** is stronger than COPPA — must propagate to all third parties
- **Data portability** — parent can export the child's data in machine-readable format (JSON or CSV)
- **No automated decision-making with legal/significant effect on the child** without explicit human review path — note: adaptive learning recommendations are likely OK because they don't have "legal effect" but the line is fuzzy; see counsel
- **Appoint an EU representative** if not established in the EU (GDPR Art. 27)
- **Designate a Data Protection Officer (DPO)** — likely required given scale of children's data

### 3.3 Cross-border data transfer

If hosting EU child data on US infrastructure (AWS US regions), the data transfer mechanism matters post-Schrems II:

- **Preferred:** Host EU user data in EU regions (AWS Frankfurt/Dublin/Stockholm). Higher cost but cleanest legally.
- **Alternative:** Use Standard Contractual Clauses (SCCs) and a Transfer Impact Assessment for transfers to US. More legal review, more risk.
- **EU-US Data Privacy Framework:** As of 2026 the framework is in force but under continued legal challenge. Don't rely on it as the only mechanism — keep SCCs in place as belt-and-suspenders.

---

## 4. Data Inventory & Classification

Required artifact: a maintained data inventory document (separate from this spec). Below is the schema for that inventory and the initial seeded entries.

### 4.1 Data classification tiers

| Tier | Definition | Examples | Storage Rules |
|------|-----------|----------|---------------|
| **C0** | Non-personal, non-identifying | Aggregate stats, anonymized usage counts | Standard storage |
| **C1** | Personal but not sensitive | Display name (first name only), grade, avatar | Encrypted at rest, access logged |
| **C2** | Personal & sensitive | Email (parent), full name (parent/teacher), school affiliation | Encrypted at rest + in transit, RBAC, access logged with reason |
| **C3** | Highly sensitive | Payment info, ID upload (if used for VPC), child's voice/photo if collected | Tokenization (Stripe for payment), encrypted with separate KMS key, access requires MFA + audit reason |

### 4.2 Initial data inventory (must be expanded by the dev team)

| Field | Tier | Collected From | Purpose | Retention | Deletion Trigger |
|-------|------|---------------|---------|-----------|-----------------|
| child.username | C1 | Parent at registration | Login identifier | Account life + 30d | Parent deletion request |
| child.display_name | C1 | Parent (optional) | UI personalization | Account life + 30d | Parent deletion request |
| child.grade | C1 | Parent | Curriculum routing | Account life + 30d | Parent deletion request |
| child.avatar_id | C0 | Child selection | UI personalization | Account life + 30d | Account deletion |
| child.password_hash | C2 | Auto-generated/parent-set | Auth | Account life + 30d | Account deletion |
| parent.email | C2 | Parent at registration | Auth, notices, parental controls | Account life + 30d | Account deletion request |
| parent.payment_token | C3 (tokenized) | Parent at subscription | Billing | Account life + payment regulatory retention (typically 7y for transactions) | Account deletion (token deleted; transaction records retained per tax/financial regs) |
| parent.consent_record | C2 | VPC flow | COPPA/GDPR-K compliance audit trail | 7 years from collection (or longer per state law) | Never (regulatory hold), unless full data subject deletion request after retention period |
| teacher.email, teacher.school | C2 | Teacher registration / school admin | Auth, school affiliation | Account life + 30d | Account deletion |
| problem_attempt.{student_id, problem_id, correct, latency, timestamp, mood_modifier_applied} | C1 (linked to student) | Auto from app | Adaptive learning, progress reports | Account life + 30d | Cascade on student deletion |
| session.ip_address | C2 | Auto from auth | Fraud prevention, session security | 90 days | Auto-deletion job |
| session.device_fingerprint | C2 | Auto from app | Multi-device session management | Account life + 30d | Account deletion |
| analytics_aggregate.* (anonymized) | C0 | Derived | Product analytics | Indefinite (no individual identifier) | N/A — but: re-identification risk audit annually |

**Critical rule:** Every new field added to any table must be assigned a tier and inventory entry as part of the schema migration. Add a CI check that fails migrations introducing new columns without inventory updates.

---

## 5. Privacy Policy Structure

A real privacy policy must be drafted by counsel. This section specs the **structure and content the policy must cover**, plus the **two versions** required (parent/adult version + child-accessible version).

### 5.1 Required sections (parent/adult version)

1. **Who we are & how to contact us** (operator legal name, address, contact email, DPO contact for EU)
2. **What data we collect**
   - From children directly (categorized)
   - From parents
   - From teachers / schools
   - Automatically (cookies, device info, usage data)
3. **How we use the data** (per category, per purpose)
4. **Lawful basis for processing** (per category — required for GDPR)
5. **Who we share data with** (third-party processors, with named list and links to their privacy policies)
6. **International data transfers** (mechanism, safeguards)
7. **Data retention periods** (per category, with deletion triggers)
8. **Security measures** (general description; don't reveal specifics that aid attackers)
9. **Children's privacy notice (COPPA disclosures)** — direct notice content per FTC requirements
10. **Your rights** (access, deletion, portability, withdrawal, complaint to supervisory authority)
11. **How to exercise your rights** (specific contact and self-service paths)
12. **Cookies & tracking technologies** (separate cookie policy or in-line)
13. **Changes to this policy** (notice mechanism for material changes)
14. **Effective date & version history**

### 5.2 Child-accessible version (Art. 12 GDPR + COPPA spirit)

A separate, simplified document accessible to a child reader. Recommended structure (each section a single short paragraph, written at ~grade 4 reading level, with friendly mascot):

- **Hi! Here's what we know about you.** (what data is collected)
- **Here's why we have it.** (purpose, in kid terms)
- **Who else sees it?** (list third parties in plain language: "the company that sends emails to your parent")
- **You can change your mind.** (parent will help you ask)
- **Talk to a grown-up if you have questions.** (route to parent contact)

This version should be linked from the child app footer and shown during account creation.

### 5.3 Required dev team artifacts

- `/legal/privacy-policy-parent.md` (source for the parent version)
- `/legal/privacy-policy-child.md` (source for the child version)
- `/legal/privacy-policy-CHANGELOG.md` (every material change logged with date, summary, and notification mechanism)
- A version field in the consent_audit_log: every consent must record which version of the policy was active at consent time

---

## 6. Terms of Service Structure

### 6.1 Two distinct ToS documents required

1. **Individual/Family ToS** — parent contracts on behalf of the child
2. **School/District License Agreement** — institutional contract; differs in scope, payment, IP, data ownership, and termination terms

### 6.2 Required sections (Individual/Family)

1. Acceptance & age requirements (parent must be 18+; child use must be by parent)
2. Account creation & security responsibilities
3. License grant (limited, revocable, non-transferable)
4. Subscription, billing, and refunds
5. Acceptable use policy
6. **Special: Minor as user, not as contracting party** — the parent enters the contract; the child is a beneficiary. Contracts with minors are voidable in most US states. Clear language required.
7. Intellectual property (yours vs theirs)
8. User-generated content (avoid this if possible; if any, moderation policy)
9. Termination (by either party)
10. Disclaimers, limitations of liability
11. Indemnification
12. Dispute resolution & governing law (note: arbitration clauses face additional scrutiny when minors are involved)
13. Modifications to terms (notice mechanism)
14. Contact

### 6.3 School/District License Agreement — additional required sections

- **Data processing addendum** explicitly designating school as agent for parental consent under COPPA School Exception
- **Data ownership** (school owns student data; operator processes on school's behalf)
- **FERPA compliance commitments** (US schools — operator agrees to handle data as a "school official" under FERPA)
- **Acceptable use within the school context** (only educational use)
- **No marketing to students** (explicit prohibition)
- **Audit rights** (school can audit operator's compliance)
- **Sub-processor restrictions** (school approval for new sub-processors)
- **Data return / deletion at contract end** (specific timeline)
- **Service-level commitments** (uptime, support response)
- **Pricing per-student or per-school, billing terms**

### 6.4 Minor contracting rules

In most US states (and many EU jurisdictions), a contract entered into by a minor is **voidable by the minor** until they reach the age of majority. Implementation implications:
- The parent must be the contracting party for Individual accounts
- ToS must clearly identify the parent as the contracting adult and the child as the beneficiary
- Don't present the child with click-through ToS as if they're entering the contract

---

## 7. Parental Consent Flow Specification

### 7.1 What VPC methods does the FTC accept

The FTC has approved several VPC methods. Pick by risk tier:

| Method | When Required | Friction | Cost per consent |
|--------|--------------|----------|------------------|
| **Email-plus** (verified email + a second confirming step like a follow-up email or call) | Acceptable for "internal use only" data — i.e., the data isn't disclosed to third parties | Low | ~$0 |
| **Credit/debit card transaction** (small charge, often $0.50-$1, refunded or applied as credit) | Required when data IS disclosed externally | Medium | $1-5 (transaction fees) |
| **Government-issued ID** (uploaded photo, verified against face) | Strongest; required when high-risk data | High | $1-3 per verification (Persona, Onfido, Stripe Identity) |
| **Knowledge-based authentication** | Acceptable, less common | Medium | Varies |
| **Connect-by-phone** (toll-free call to trained personnel) | Acceptable but operationally heavy | High | $5-10 per call |
| **Video conference** with trained personnel | Acceptable | Very high | $10+ |

**Recommendation for Koblio:** Default to email-plus for free-tier accounts where data is internal-use-only. Require credit-card-verify when subscribing (the payment itself doubles as VPC) or when the parent enables features that share data externally (school connection, classroom join, third-party single sign-on).

### 7.2 The consent flow (concrete steps)

```
1. Parent registers (parent account exists, child account does NOT yet exist)
2. Parent initiates "Add a child"
3. System shows direct notice (per COPPA): what data will be collected, how it will be used, who it will be shared with, parent rights
4. Parent reads and selects consent method (email-plus default; credit-card if subscribing)
5. System sends verification email to parent's verified address
6. Parent clicks verification link → second confirmation step (e.g., re-enter password OR confirm via SMS)
7. (Or for credit-card path: complete Stripe checkout for $0.50 verification charge, refunded immediately)
8. System creates child account, links to parent, writes consent_audit_log entry
9. Send confirmation email to parent with child account details and link to parent dashboard
10. Parent is now able to grant additional permissions per feature (class join, advanced data sharing)
```

### 7.3 Consent audit log — required schema

```
consent_audit_log
  id: uuid
  parent_id: uuid (FK)
  child_id: uuid (FK, nullable until child created)
  event_type: enum (CONSENT_GRANTED, CONSENT_REVOKED, CONSENT_REVIEWED, METHOD_UPGRADED)
  method: enum (EMAIL_PLUS, CREDIT_CARD, GOVT_ID, KBA, PHONE_CALL, VIDEO, SCHOOL_AGENT)
  privacy_policy_version: string (required — what they consented to)
  terms_version: string
  scope: jsonb (which features / data categories the consent covers)
  ip_address: string (parent's IP at consent time)
  user_agent: string
  created_at: timestamp
  evidence_uri: string (e.g., S3 path to email verification record, charge receipt, etc.)
  jurisdiction: string (US-COPPA, EU-{country}, etc.)
  notes: text
```

**Retention:** 7 years minimum (COPPA recordkeeping recommendation; varies by state — verify with counsel).

### 7.4 Re-consent triggers

The consent must be refreshed (re-prompted) when:
- Material changes to the privacy policy (new data categories, new third parties, new uses)
- New features that materially expand data collection
- Account inactive for 12+ months (re-verify the parent is still active and consenting)
- Child crosses an age threshold (turns 13 in US — system should transition to teen consent model OR continue under same consent if appropriate; check counsel)

---

## 8. Data Subject Rights Implementation

GDPR Articles 15-22 grant rights that must be operationally implementable. COPPA grants similar parent rights. Below is the API spec.

### 8.1 Right of access (data export)

```
GET /api/parent/children/{child_id}/data-export
  Auth: verified parent session
  Response: 202 Accepted, returns export_job_id

GET /api/parent/data-export/{export_job_id}
  Returns: 
    - in_progress: { status, eta }
    - ready: { status, download_url (signed S3 URL, expires 24h) }

Export format: ZIP containing:
  - profile.json (account fields)
  - learning_history.json (problem attempts, mood inferences, BKT states, session log)
  - consent_history.json (audit log entries)
  - subscription_history.json (billing summary, no full PCI data)
  - README.md (explains the format)

SLA: <30 days under GDPR; under 7 days for Koblio as a service commitment.
```

### 8.2 Right to erasure (deletion)

```
DELETE /api/parent/children/{child_id}
  Auth: verified parent session + re-confirmation step (e.g., re-enter password)
  Response: 202 Accepted, returns deletion_job_id

GET /api/parent/deletion/{deletion_job_id}
  Returns: { status, components_deleted: [...], components_pending: [...] }

Deletion workflow steps:
  1. Soft-delete in primary DB (set deleted_at, scrub PII fields, preserve internal IDs for referential integrity in aggregates if anonymized)
  2. Hard-delete in primary DB after 30 days (grace period for parent to undo)
  3. Cascade deletion to:
     - Cache layer (immediate eviction)
     - Search index (immediate)
     - Third-party processors (trigger DPA-defined deletion):
        * Auth provider (Auth0/Cognito): delete user record
        * Email provider (SES/SendGrid): suppress, then delete after retention period
        * Analytics (if any): purge user from event store
        * Stripe: delete customer + cards (transaction records retained per regulatory rule)
        * Push notification (Firebase): delete device tokens
     - Logs: scrub/anonymize PII in application logs (depends on log retention policy)
     - Backups: documented as next backup cycle (cannot retroactively remove from immutable backups)
  4. Send confirmation email to parent with deletion certificate

SLA: 30 days under GDPR/COPPA. Document backup propagation explicitly.
```

### 8.3 Right to rectification (correction)

```
PATCH /api/parent/children/{child_id}/profile
  Auth: parent session
  Body: { fields to update }
  Returns: updated profile

Accepted corrections: display_name, grade, avatar, parent contact info
NOT correctable via this endpoint: learning history (that's auto-collected behavioral data; corrections via dispute path)
```

### 8.4 Right to data portability

The data export above (8.1) satisfies this — export must be in machine-readable format (JSON, CSV).

### 8.5 Right to withdraw consent

```
POST /api/parent/consent/{consent_id}/revoke
  Auth: parent session
  Body: { reason? }
  Effect: 
    - Updates consent_audit_log with REVOKE event
    - Triggers re-evaluation: if revoked consent was the lawful basis for active data processing, that processing must stop
    - For "all consent revoked" → triggers full deletion workflow (8.2)
```

### 8.6 Right to object to automated decision-making (GDPR Art. 22)

Adaptive learning recommendations are arguably not "decisions producing legal effects or similarly significant effects" but the line is fuzzy. Implementation:
- Provide an "opt out of adaptive routing" toggle in parent dashboard
- Effect: scheduler falls back to a non-personalized curriculum order (sequential by grade)
- Document clearly that opting out reduces educational efficacy
- Record opt-out in user preferences with timestamp

---

## 9. Incident Response & Breach Notification

### 9.1 Breach notification timelines

| Regulation | Notify | Timeline |
|-----------|--------|----------|
| **GDPR Art. 33** | Supervisory authority | **72 hours** from awareness, "where feasible" |
| **GDPR Art. 34** | Affected individuals | "Without undue delay" if high risk to rights & freedoms |
| **COPPA** | No specific federal timeline, but FTC enforcement looks at promptness | "Without unreasonable delay" |
| **State laws** (e.g., California, NY SHIELD) | Affected individuals + AG | Varies: typically 30-60 days; some require parallel media notice |
| **HIPAA** | Not applicable unless health data is involved | N/A here |

### 9.2 Required incident response artifacts

- **Incident response plan document** (separate from this spec) — playbooks for: data breach, account takeover at scale, ransomware, third-party processor breach, accidental data exposure
- **Designated incident response team** with on-call rotation
- **Breach notification templates**: pre-drafted (and counsel-reviewed) notice templates for parents, teachers, schools, regulators, media
- **Forensics retention**: ability to preserve logs and system state for investigation
- **Post-incident review process**: every incident gets a written PIR within 30 days

### 9.3 Operational requirements feeding incident response

- **Centralized audit log** for security-relevant events (auth, permission changes, bulk data access)
- **Anomaly detection** on data access patterns (e.g., one user account suddenly downloading 1000 child profiles)
- **Database access logging** with reason field for any direct production data access
- **Encryption at rest & in transit** as default
- **Secrets management** (no plaintext credentials in repos, configs, or env vars)
- **Access reviews** quarterly (who has prod data access, do they still need it)

---

## 10. Third-Party Processor List & DPAs

Every third-party service that processes user data requires a Data Processing Agreement (DPA) with appropriate contractual terms. Maintain a current list.

### 10.1 Initial expected processors

| Processor | Service | Data Tier | DPA Required | Notes |
|-----------|---------|-----------|--------------|-------|
| **AWS** | Hosting, storage, compute | C0-C3 (all) | Yes (AWS standard DPA) | Region selection matters for EU data |
| **Auth0** or **Cognito** | Authentication | C2 (parent email, hashed passwords) | Yes (Auth0 DPA / AWS DPA) | Auth0 has extensive child-data clauses |
| **Stripe** | Payments | C3 (tokenized payment data) | Yes (Stripe DPA) | PCI DSS Level 1 — Stripe handles compliance |
| **SES** or **SendGrid** | Transactional email | C2 (parent email) | Yes | Suppression list is itself PII |
| **Firebase Cloud Messaging** | Push notifications | C2 (device tokens) | Yes (Google DPA) | Default: minimal child data |
| **Sentry** or equivalent | Error monitoring | Could be C1+ if not scrubbed | Yes | Configure scrubbing of PII in errors |
| **Mixpanel/Amplitude** (if used) | Product analytics | C1 if user-linked | Yes | Strongly prefer self-hosted analytics for child data |
| **A LMS or SSO integration** (Clever, Classlink) for school market | School roster sync | C1-C2 | Yes | School-specific data flows |
| **Persona** or **Stripe Identity** | ID verification (if used for VPC) | C3 | Yes | Document retention of ID images carefully |
| **Twilio** (if SMS used for VPC second factor) | SMS | C2 (phone number) | Yes | Phone numbers are PII |

### 10.2 DPA must-haves

Each DPA must include:
- Sub-processor restrictions and notification of changes
- Data location commitments (region pinning if applicable)
- Security obligations (encryption, access control, incident reporting timeline TO YOU)
- Audit rights (your right to audit them, or rely on independent audit reports like SOC 2)
- Deletion commitments at contract end and on per-user request
- Liability allocations
- Specific COPPA/GDPR-K acknowledgments (some processors will not contract for child data — verify each)

### 10.3 Sub-processor change management

When a primary processor adds or changes sub-processors, you must:
- Be notified in advance (DPA term)
- Have a documented review process
- Update your privacy policy if material
- Re-consent if the new processor materially changes data flows

---

## 11. When to Engage Counsel

This document is a **specification**, not legal advice. The author is not a lawyer. Engage qualified counsel for the items below — these are not optional.

### 11.1 Required counsel engagements

| Engagement | Specialist | When | Why |
|------------|-----------|------|-----|
| **Privacy Policy drafting & review** | Privacy lawyer with COPPA/GDPR-K experience | Before any production launch | The policy is a binding legal commitment; templates are not safe |
| **ToS drafting & review** (Individual + School) | Same or commercial contracts lawyer | Before any production launch | Limit-of-liability, indemnification, dispute resolution clauses are jurisdiction-specific |
| **DPIA (GDPR)** | Privacy lawyer or qualified DPO | Before EU launch | Required for high-risk processing including children at scale |
| **VPC method validation** | Privacy lawyer | Before production launch | FTC accepts specific methods; misimplementation = COPPA violation |
| **School license agreement template** | Education tech specialist or commercial contracts lawyer | Before B2B sales | School contracts have unique data ownership and compliance terms |
| **Sub-processor DPA review** | Privacy lawyer | Initial setup; on every new processor | DPA terms vary; some are inadequate for child data |
| **Incident response plan** | Privacy + cyber lawyer | Before production launch | Notification timelines and recipient lists are jurisdiction-specific |
| **State law review** (US) | Privacy lawyer with multi-state practice | Before any state-specific marketing | Florida, Connecticut, Colorado, others have new minor-protection laws |
| **EU representative appointment** (GDPR Art. 27) | EU privacy specialist | Before EU launch if not EU-established | Required for non-EU operators serving EU users |
| **DPO appointment evaluation** | Privacy lawyer | Before EU launch | Likely required given child data scale |
| **Trademark + IP review** of brand assets | IP lawyer | Before brand launch | Out of scope for this doc but flagged |

### 11.2 Counsel selection guidance

- Avoid generalist counsel. COPPA/GDPR-K is a niche; specialist time costs more upfront but avoids enforcement actions that cost orders of magnitude more.
- For US: look for firms or solos with FTC enforcement experience (defense or compliance).
- For EU: look for firms with experience with national data protection authorities (DPAs) in your launch countries.
- Get fixed-fee engagement for the initial documentation package; hourly thereafter for incident response and ongoing review.
- Budget: realistic privacy policy + ToS + DPIA + VPC validation engagement is **$15K-$50K** depending on scope and counsel rates. This is a non-negotiable line item.

### 11.3 Final disclaimer

This document gives a dev team enough structure to **build the technical scaffolding** for compliance and to know **what to ask counsel for**. It does not constitute legal advice and does not establish an attorney-client relationship. Every legal artifact (privacy policy, ToS, DPAs, consent notices, breach response) MUST be reviewed by qualified counsel before being shown to users.

---

**Maintenance:** This package should be reviewed and updated:
- Quarterly during active development
- Whenever a regulation changes (subscribe to FTC, EDPB, ICO, state AG newsletters)
- After any incident or near-incident
- Before any new feature that touches user data
