# ---------------------------------------------------------------------------
# Secrets Manager secrets
#
# IMPORTANT: No plaintext secret values are stored in Terraform state.
# After `terraform apply`, populate each secret manually:
#
#   aws secretsmanager put-secret-value \
#     --secret-id koblio/production/db-password \
#     --secret-string '{"password":"<YOUR_DB_PASSWORD>","DATABASE_URL":"postgresql://koblio:<PW>@<HOST>:5432/koblio"}'
#
# The secret ARNs are exported as outputs for use in CI and documentation.
# ---------------------------------------------------------------------------

# DB password — consumed by RDS resource and API container
resource "aws_secretsmanager_secret" "db_password" {
  name        = "koblio/${var.env}/db-password"
  description = "RDS PostgreSQL master password and DATABASE_URL for Koblio ${var.env}"

  recovery_window_in_days = 7

  tags = {
    Name = "koblio-${var.env}-db-password"
  }
}

# The db_password secret version (with the real generated password + DATABASE_URL)
# is written by rds.tf after the RDS instance is created, so that the endpoint
# is available to construct the full connection string.

# Auth0 credentials
resource "aws_secretsmanager_secret" "auth0" {
  name        = "koblio/${var.env}/auth0"
  description = "Auth0 credentials for Koblio ${var.env}"

  recovery_window_in_days = 7

  tags = {
    Name = "koblio-${var.env}-auth0"
  }
}

# Populate with:
# {
#   "AUTH0_DOMAIN": "<tenant>.auth0.com",
#   "AUTH0_AUDIENCE": "https://api.koblio.com",
#   "AUTH0_CLIENT_ID": "<client_id>",
#   "AUTH0_CLIENT_SECRET": "<client_secret>"
# }

# Stripe credentials
resource "aws_secretsmanager_secret" "stripe" {
  name        = "koblio/${var.env}/stripe"
  description = "Stripe API keys and webhook secret for Koblio ${var.env}"

  recovery_window_in_days = 7

  tags = {
    Name = "koblio-${var.env}-stripe"
  }
}

# Populate with:
# {
#   "STRIPE_SECRET_KEY": "sk_live_...",
#   "STRIPE_WEBHOOK_SECRET": "whsec_..."
# }

# SendGrid API key
resource "aws_secretsmanager_secret" "sendgrid" {
  name        = "koblio/${var.env}/sendgrid"
  description = "SendGrid API key for Koblio ${var.env} transactional email"

  recovery_window_in_days = 7

  tags = {
    Name = "koblio-${var.env}-sendgrid"
  }
}

# Populate with:
# {
#   "SENDGRID_API_KEY": "SG...."
# }

# Sentry DSN
resource "aws_secretsmanager_secret" "sentry" {
  name        = "koblio/${var.env}/sentry"
  description = "Sentry DSN for Koblio ${var.env} error tracking"

  recovery_window_in_days = 7

  tags = {
    Name = "koblio-${var.env}-sentry"
  }
}

# Populate with:
# {
#   "SENTRY_DSN": "https://...@sentry.io/..."
# }

# Redis connection URL (constructed from ElastiCache endpoint after apply)
resource "aws_secretsmanager_secret" "redis_url" {
  name        = "koblio/${var.env}/redis"
  description = "Redis connection URL for Koblio ${var.env} (ElastiCache)"

  recovery_window_in_days = 7

  tags = {
    Name = "koblio-${var.env}-redis"
  }
}

# After apply, populate with the ElastiCache endpoint from outputs:
# {
#   "REDIS_URL": "redis://<elasticache_host>:6379"
# }

# ---------------------------------------------------------------------------
# Outputs of secret ARNs (needed by IAM policies and ECS task definitions)
# ---------------------------------------------------------------------------
output "secret_arn_db_password" {
  description = "Secrets Manager ARN — DB password + DATABASE_URL"
  value       = aws_secretsmanager_secret.db_password.arn
  sensitive   = true
}

output "secret_arn_auth0" {
  description = "Secrets Manager ARN — Auth0 credentials"
  value       = aws_secretsmanager_secret.auth0.arn
  sensitive   = true
}

output "secret_arn_stripe" {
  description = "Secrets Manager ARN — Stripe API keys"
  value       = aws_secretsmanager_secret.stripe.arn
  sensitive   = true
}

output "secret_arn_sendgrid" {
  description = "Secrets Manager ARN — SendGrid API key"
  value       = aws_secretsmanager_secret.sendgrid.arn
  sensitive   = true
}

output "secret_arn_sentry" {
  description = "Secrets Manager ARN — Sentry DSN"
  value       = aws_secretsmanager_secret.sentry.arn
  sensitive   = true
}
