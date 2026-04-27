# P7-T02 — GitHub Actions ECS CD Pipeline

**Agent:** Dev Agent 2
**Date:** 2026-04-27
**Task:** P7-T02 — Build GitHub Actions CD workflow for AWS ECS deployment

---

## Summary

Implemented the full AWS ECS continuous-deployment pipeline triggered on pushes to `main`. The workflow covers Docker image builds, ECR pushes, ECS rolling deployments for both services, and a post-deploy migration step.

---

## Files Created / Modified

### `.github/workflows/deploy.yml` (created)

Four-job pipeline, all running on `ubuntu-latest`:

| Job | Depends on | Purpose |
|---|---|---|
| `build-and-push` | — | Build API + Web Docker images; push `:7charSHA` and `:latest` tags to ECR |
| `deploy-api` | `build-and-push` | Fetch current `koblio-api` task def, render new image, rolling deploy to `koblio-production` ECS cluster |
| `deploy-web` | `build-and-push` | Same as above for `koblio-web` service; runs in parallel with `deploy-api` |
| `run-migrations` | `deploy-api` | One-shot Fargate task overriding the container command to `npx prisma migrate deploy`; polls until stopped, fails the job on non-zero exit |

Key design decisions:
- `concurrency.cancel-in-progress: false` — in-flight deploys are never cancelled (prevents half-deployed state)
- Image tag is the first 7 characters of `GITHUB_SHA`, exposed as a job output so downstream jobs consume the exact tag that was pushed
- `wait-for-service-stability: true` on both ECS deploy steps — the job fails fast if the new task set doesn't become healthy, preventing silent bad deploys
- Migration job uses `aws ecs wait tasks-stopped` + exit-code inspection instead of a sleep loop, so it scales with actual task duration

### `terraform/ecr.tf` (created)

Extracted ECR resources from `main.tf` into a dedicated file:
- `aws_ecr_repository.api` — `koblio-api`, scan on push enabled
- `aws_ecr_repository.web` — `koblio-web`, scan on push enabled
- `aws_ecr_lifecycle_policy.api` — retain last 10 images, expire older
- `aws_ecr_lifecycle_policy.web` — same policy for web repo

### `terraform/main.tf` (modified)

Removed the duplicated ECR resource blocks that were already defined there; replaced with a single-line comment pointing to `ecr.tf`.

---

## Required GitHub Secrets

| Secret | Notes |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user / role with ECR push + ECS deploy + `ecs:RunTask` + `ecs:DescribeTasks` permissions |
| `AWS_SECRET_ACCESS_KEY` | Corresponding secret |
| `AWS_REGION` | Optional; defaults to `ap-southeast-1` |
| `AWS_ECR_API_URL` | Full ECR URI, e.g. `123456789.dkr.ecr.ap-southeast-1.amazonaws.com/koblio-api` |
| `AWS_ECR_WEB_URL` | Full ECR URI, e.g. `123456789.dkr.ecr.ap-southeast-1.amazonaws.com/koblio-web` |

---

## IAM Permissions Needed (checklist for infra team)

The CI/CD IAM user/role must have:
- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`, `ecr:PutImage`
- `ecs:DescribeTaskDefinition`, `ecs:RegisterTaskDefinition`
- `ecs:DescribeServices`, `ecs:UpdateService`
- `ecs:RunTask`, `ecs:DescribeTasks`, `ecs:StopTask`
- `iam:PassRole` (for the ECS task execution role)

---

## Acceptance Criteria Status

- [x] Workflow triggers only on `main` push (not PRs)
- [x] Docker images built for both `apps/api` and `apps/web`
- [x] Images pushed to ECR with short SHA tag + `latest`
- [x] API and Web deployed to `koblio-production` ECS cluster in parallel
- [x] Deployment waits for service stability before succeeding
- [x] Migrations run after API deploy via one-shot Fargate task
- [x] Migrations failure fails the workflow job
- [x] ECR repositories defined in Terraform with lifecycle policy (keep last 10)
- [x] All required secrets documented in workflow header comments
