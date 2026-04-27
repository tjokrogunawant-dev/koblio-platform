# ---------------------------------------------------------------------------
# ECS Task Execution Role
# Used by the ECS agent to pull images from ECR and push logs to CloudWatch.
# Also allows reading secrets from Secrets Manager during task startup.
# ---------------------------------------------------------------------------
resource "aws_iam_role" "ecs_task_execution" {
  name = "koblio-${var.env}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "koblio-${var.env}-ecs-task-execution-role"
  }
}

# Attach the AWS-managed ECS task execution policy (ECR pull + CloudWatch logs)
resource "aws_iam_role_policy_attachment" "ecs_task_execution_managed" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Custom policy — allow the execution role to read Secrets Manager secrets
# so ECS can inject them into container env vars at launch time.
resource "aws_iam_policy" "ecs_secrets_read" {
  name        = "koblio-${var.env}-ecs-secrets-read"
  description = "Allow ECS task execution role to read Koblio secrets from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsManagerRead"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.db_password.arn,
          aws_secretsmanager_secret.auth0.arn,
          aws_secretsmanager_secret.stripe.arn,
          aws_secretsmanager_secret.sendgrid.arn,
          aws_secretsmanager_secret.sentry.arn,
          aws_secretsmanager_secret.redis_url.arn
        ]
      },
      {
        Sid    = "KMSDecrypt"
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "kms:ViaService" = "secretsmanager.${var.aws_region}.amazonaws.com"
          }
        }
      }
    ]
  })

  tags = {
    Name = "koblio-${var.env}-ecs-secrets-read"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_secrets" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = aws_iam_policy.ecs_secrets_read.arn
}

# ---------------------------------------------------------------------------
# ECS Task Role
# Assumed by the running application containers themselves.
# Separate from the execution role — least-privilege for app-level AWS calls.
# ---------------------------------------------------------------------------
resource "aws_iam_role" "ecs_task" {
  name = "koblio-${var.env}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "koblio-${var.env}-ecs-task-role"
  }
}

# Task role policy — app-level permissions:
# - Secrets Manager (in case app reads secrets at runtime, not just at startup)
# - S3 assets bucket (for presigned URL generation, avatar uploads)
resource "aws_iam_policy" "ecs_task_permissions" {
  name        = "koblio-${var.env}-ecs-task-permissions"
  description = "App-level permissions for Koblio ECS tasks"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsManagerRuntimeRead"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.db_password.arn,
          aws_secretsmanager_secret.auth0.arn,
          aws_secretsmanager_secret.stripe.arn,
          aws_secretsmanager_secret.sendgrid.arn,
          aws_secretsmanager_secret.sentry.arn,
          aws_secretsmanager_secret.redis_url.arn
        ]
      },
      {
        Sid    = "S3AssetsAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.assets.arn,
          "${aws_s3_bucket.assets.arn}/*"
        ]
      },
      {
        Sid    = "CloudWatchMetrics"
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "Koblio/${var.env}"
          }
        }
      }
    ]
  })

  tags = {
    Name = "koblio-${var.env}-ecs-task-permissions"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_permissions" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = aws_iam_policy.ecs_task_permissions.arn
}
