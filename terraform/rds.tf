# ---------------------------------------------------------------------------
# RDS PostgreSQL 16
# ---------------------------------------------------------------------------

resource "aws_db_subnet_group" "postgres" {
  name       = "koblio-${var.env}-postgres-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = {
    Name = "koblio-${var.env}-postgres-subnet-group"
  }
}

resource "aws_db_parameter_group" "postgres16" {
  name   = "koblio-${var.env}-postgres16"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # Log queries slower than 1 second
  }

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  tags = {
    Name = "koblio-${var.env}-postgres16"
  }
}

# Generate a random master password — stored in Secrets Manager via secrets.tf
resource "random_password" "db_master" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_db_instance" "postgres" {
  identifier = "koblio-${var.env}-postgres"

  engine         = "postgres"
  engine_version = "16"
  instance_class = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 100 # Autoscale storage up to 100 GB
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_master.result

  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.postgres16.name

  backup_retention_period  = 7
  backup_window            = "03:00-04:00"       # UTC
  maintenance_window       = "Mon:04:00-Mon:05:00"
  delete_automated_backups = false
  skip_final_snapshot      = false

  final_snapshot_identifier = "koblio-${var.env}-postgres-final-snapshot"

  deletion_protection = true

  performance_insights_enabled          = true
  performance_insights_retention_period = 7

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  auto_minor_version_upgrade = true
  apply_immediately          = false

  tags = {
    Name = "koblio-${var.env}-postgres"
  }
}

# Store the generated password + full DATABASE_URL in Secrets Manager
# so the API container and developers can retrieve it.
# The secrets.tf bootstrap version has ignore_changes = [secret_string],
# so this separate resource writes the real value after RDS is created.
resource "aws_secretsmanager_secret_version" "db_password_real" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    password     = random_password.db_master.result
    DATABASE_URL = "postgresql://${var.db_username}:${random_password.db_master.result}@${aws_db_instance.postgres.address}:5432/${var.db_name}"
  })

  depends_on = [aws_db_instance.postgres]
}
