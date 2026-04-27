# ---------------------------------------------------------------------------
# ECS Cluster
# ---------------------------------------------------------------------------
resource "aws_ecs_cluster" "main" {
  name = "koblio-${var.env}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "koblio-${var.env}"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# ---------------------------------------------------------------------------
# CloudWatch Log Groups
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/koblio-${var.env}/api"
  retention_in_days = 30

  tags = {
    Name = "koblio-${var.env}-api-logs"
  }
}

resource "aws_cloudwatch_log_group" "web" {
  name              = "/ecs/koblio-${var.env}/web"
  retention_in_days = 30

  tags = {
    Name = "koblio-${var.env}-web-logs"
  }
}

# ---------------------------------------------------------------------------
# API Task Definition
# ---------------------------------------------------------------------------
resource "aws_ecs_task_definition" "api" {
  family                   = "koblio-${var.env}-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = "${aws_ecr_repository.api.repository_url}:${var.image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]

      # All secrets injected from Secrets Manager — no plaintext env vars for sensitive values
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "${aws_secretsmanager_secret.db_password.arn}:DATABASE_URL::"
        },
        {
          name      = "AUTH0_DOMAIN"
          valueFrom = "${aws_secretsmanager_secret.auth0.arn}:AUTH0_DOMAIN::"
        },
        {
          name      = "AUTH0_AUDIENCE"
          valueFrom = "${aws_secretsmanager_secret.auth0.arn}:AUTH0_AUDIENCE::"
        },
        {
          name      = "AUTH0_CLIENT_ID"
          valueFrom = "${aws_secretsmanager_secret.auth0.arn}:AUTH0_CLIENT_ID::"
        },
        {
          name      = "AUTH0_CLIENT_SECRET"
          valueFrom = "${aws_secretsmanager_secret.auth0.arn}:AUTH0_CLIENT_SECRET::"
        },
        {
          name      = "STRIPE_SECRET_KEY"
          valueFrom = "${aws_secretsmanager_secret.stripe.arn}:STRIPE_SECRET_KEY::"
        },
        {
          name      = "STRIPE_WEBHOOK_SECRET"
          valueFrom = "${aws_secretsmanager_secret.stripe.arn}:STRIPE_WEBHOOK_SECRET::"
        },
        {
          name      = "SENDGRID_API_KEY"
          valueFrom = "${aws_secretsmanager_secret.sendgrid.arn}:SENDGRID_API_KEY::"
        },
        {
          name      = "SENTRY_DSN"
          valueFrom = "${aws_secretsmanager_secret.sentry.arn}:SENTRY_DSN::"
        },
        {
          name      = "REDIS_URL"
          valueFrom = "${aws_secretsmanager_secret.redis_url.arn}:REDIS_URL::"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "3001"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.api.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "api"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3001/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "koblio-${var.env}-api"
  }
}

# ---------------------------------------------------------------------------
# Web Task Definition
# ---------------------------------------------------------------------------
resource "aws_ecs_task_definition" "web" {
  family                   = "koblio-${var.env}-web"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.web_cpu
  memory                   = var.web_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "web"
      image     = "${aws_ecr_repository.web.repository_url}:${var.image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      secrets = [
        {
          name      = "AUTH0_DOMAIN"
          valueFrom = "${aws_secretsmanager_secret.auth0.arn}:AUTH0_DOMAIN::"
        },
        {
          name      = "AUTH0_CLIENT_ID"
          valueFrom = "${aws_secretsmanager_secret.auth0.arn}:AUTH0_CLIENT_ID::"
        },
        {
          name      = "AUTH0_CLIENT_SECRET"
          valueFrom = "${aws_secretsmanager_secret.auth0.arn}:AUTH0_CLIENT_SECRET::"
        },
        {
          name      = "SENTRY_DSN"
          valueFrom = "${aws_secretsmanager_secret.sentry.arn}:SENTRY_DSN::"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "3000"
        },
        {
          # Next.js standalone — point internal API calls to the ECS service DNS
          name  = "NEXT_PUBLIC_API_URL"
          value = "https://${aws_lb.main.dns_name}/api"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.web.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "web"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name = "koblio-${var.env}-web"
  }
}

# ---------------------------------------------------------------------------
# Application Load Balancer
# ---------------------------------------------------------------------------
resource "aws_lb" "main" {
  name               = "koblio-${var.env}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  enable_deletion_protection = true
  enable_http2               = true

  access_logs {
    bucket  = aws_s3_bucket.alb_logs.bucket
    prefix  = "koblio-${var.env}-alb"
    enabled = true
  }

  tags = {
    Name = "koblio-${var.env}-alb"
  }
}

# S3 bucket for ALB access logs
resource "aws_s3_bucket" "alb_logs" {
  bucket        = "koblio-${var.env}-alb-logs"
  force_destroy = false

  tags = {
    Name = "koblio-${var.env}-alb-logs"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    id     = "expire-old-logs"
    status = "Enabled"

    expiration {
      days = 90
    }
  }
}

# ELB service account needs write access to the log bucket
data "aws_elb_service_account" "main" {}

resource "aws_s3_bucket_policy" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { AWS = data.aws_elb_service_account.main.arn }
        Action    = "s3:PutObject"
        Resource  = "${aws_s3_bucket.alb_logs.arn}/koblio-${var.env}-alb/AWSLogs/*"
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# Target Groups
# ---------------------------------------------------------------------------
resource "aws_lb_target_group" "api" {
  name        = "koblio-${var.env}-api-tg"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # Fargate requires IP target type

  health_check {
    enabled             = true
    path                = "/api/health"
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = {
    Name = "koblio-${var.env}-api-tg"
  }
}

resource "aws_lb_target_group" "web" {
  name        = "koblio-${var.env}-web-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = {
    Name = "koblio-${var.env}-web-tg"
  }
}

# ---------------------------------------------------------------------------
# ALB Listeners
# ---------------------------------------------------------------------------

# HTTP listener — redirect all traffic to HTTPS
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS listener — default action routes to web; /api/* routes to api
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn

  # Default: send all traffic to the web target group
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# Listener rule: /api/* → API target group (higher priority than default)
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# ---------------------------------------------------------------------------
# ECS Services
# ---------------------------------------------------------------------------
resource "aws_ecs_service" "api" {
  name            = "koblio-${var.env}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 3001
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  # Ignore task_definition changes from external CI deploys
  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  depends_on = [
    aws_lb_listener.https,
    aws_iam_role_policy_attachment.ecs_task_execution_managed
  ]

  tags = {
    Name = "koblio-${var.env}-api"
  }
}

resource "aws_ecs_service" "web" {
  name            = "koblio-${var.env}-web"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = var.web_desired_count
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_groups  = [aws_security_group.web.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = 3000
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  depends_on = [
    aws_lb_listener.https,
    aws_iam_role_policy_attachment.ecs_task_execution_managed
  ]

  tags = {
    Name = "koblio-${var.env}-web"
  }
}
