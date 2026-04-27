variable "env" {
  description = "Deployment environment (production | staging)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging"], var.env)
    error_message = "env must be 'production' or 'staging'."
  }
}

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "image_tag" {
  description = "Docker image tag to deploy. Overridden by CI with the Git SHA."
  type        = string
  default     = "latest"
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for the ALB HTTPS listener (must be in the same region as the ALB)."
  type        = string
  # No default — must be provided. Create the cert in ACM and validate via DNS before apply.
}

variable "db_username" {
  description = "Master username for the RDS PostgreSQL instance"
  type        = string
  default     = "koblio"
}

variable "db_name" {
  description = "Initial database name"
  type        = string
  default     = "koblio"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "api_cpu" {
  description = "ECS task CPU units for the API container (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "api_memory" {
  description = "ECS task memory (MB) for the API container"
  type        = number
  default     = 1024
}

variable "web_cpu" {
  description = "ECS task CPU units for the web container"
  type        = number
  default     = 512
}

variable "web_memory" {
  description = "ECS task memory (MB) for the web container"
  type        = number
  default     = 1024
}

variable "api_desired_count" {
  description = "Desired number of API ECS tasks"
  type        = number
  default     = 2
}

variable "web_desired_count" {
  description = "Desired number of web ECS tasks"
  type        = number
  default     = 2
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}
