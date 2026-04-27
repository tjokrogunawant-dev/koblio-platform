output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer. Point your domain's CNAME here."
  value       = aws_lb.main.dns_name
}

output "api_ecr_repository_url" {
  description = "ECR repository URL for the NestJS API image"
  value       = aws_ecr_repository.api.repository_url
}

output "web_ecr_repository_url" {
  description = "ECR repository URL for the Next.js web image"
  value       = aws_ecr_repository.web.repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint (host)"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].port
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name for static assets"
  value       = aws_cloudfront_distribution.assets.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (used for cache invalidation in CI)"
  value       = aws_cloudfront_distribution.assets.id
}

output "assets_bucket_name" {
  description = "S3 bucket name for static assets"
  value       = aws_s3_bucket.assets.bucket
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "secret_arns" {
  description = "Map of Secrets Manager secret ARNs. Share with developers who need to populate values."
  value = {
    db_password = aws_secretsmanager_secret.db_password.arn
    auth0       = aws_secretsmanager_secret.auth0.arn
    stripe      = aws_secretsmanager_secret.stripe.arn
    sendgrid    = aws_secretsmanager_secret.sendgrid.arn
    sentry      = aws_secretsmanager_secret.sentry.arn
  }
  sensitive = true
}
