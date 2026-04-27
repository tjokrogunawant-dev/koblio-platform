# ---------------------------------------------------------------------------
# ElastiCache Redis 7 (single-node for MVP)
# Upgrade to aws_elasticache_replication_group for multi-AZ at Section 9 scale.
# ---------------------------------------------------------------------------

resource "aws_elasticache_subnet_group" "redis" {
  name       = "koblio-${var.env}-redis-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = {
    Name = "koblio-${var.env}-redis-subnet-group"
  }
}

resource "aws_elasticache_parameter_group" "redis7" {
  name   = "koblio-${var.env}-redis7"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  tags = {
    Name = "koblio-${var.env}-redis7"
  }
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "koblio-${var.env}-redis"
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  parameter_group_name = aws_elasticache_parameter_group.redis7.name
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]

  port = 6379

  # Maintenance + snapshot windows (UTC)
  maintenance_window       = "sun:05:00-sun:06:00"
  snapshot_window          = "04:00-05:00"
  snapshot_retention_limit = 3

  apply_immediately = false

  tags = {
    Name = "koblio-${var.env}-redis"
  }
}
