# ---------------------------------------------------------------------------
# VPC
# ---------------------------------------------------------------------------
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "koblio-${var.env}"
  }
}

# ---------------------------------------------------------------------------
# Availability Zones
# ---------------------------------------------------------------------------
data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  az_a = data.aws_availability_zones.available.names[0]
  az_b = data.aws_availability_zones.available.names[1]
}

# ---------------------------------------------------------------------------
# Public subnets (ALB lives here)
# ---------------------------------------------------------------------------
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = local.az_a
  map_public_ip_on_launch = true

  tags = {
    Name = "koblio-${var.env}-public-a"
    Tier = "public"
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = local.az_b
  map_public_ip_on_launch = true

  tags = {
    Name = "koblio-${var.env}-public-b"
    Tier = "public"
  }
}

# ---------------------------------------------------------------------------
# Private subnets (ECS tasks, RDS, Redis)
# ---------------------------------------------------------------------------
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = local.az_a

  tags = {
    Name = "koblio-${var.env}-private-a"
    Tier = "private"
  }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = local.az_b

  tags = {
    Name = "koblio-${var.env}-private-b"
    Tier = "private"
  }
}

# ---------------------------------------------------------------------------
# Internet Gateway
# ---------------------------------------------------------------------------
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "koblio-${var.env}-igw"
  }
}

# ---------------------------------------------------------------------------
# Elastic IPs for NAT gateways
# ---------------------------------------------------------------------------
resource "aws_eip" "nat_a" {
  domain = "vpc"

  tags = {
    Name = "koblio-${var.env}-nat-eip-a"
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_eip" "nat_b" {
  domain = "vpc"

  tags = {
    Name = "koblio-${var.env}-nat-eip-b"
  }

  depends_on = [aws_internet_gateway.main]
}

# ---------------------------------------------------------------------------
# NAT Gateways (one per AZ for HA)
# ---------------------------------------------------------------------------
resource "aws_nat_gateway" "a" {
  allocation_id = aws_eip.nat_a.id
  subnet_id     = aws_subnet.public_a.id

  tags = {
    Name = "koblio-${var.env}-nat-a"
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "b" {
  allocation_id = aws_eip.nat_b.id
  subnet_id     = aws_subnet.public_b.id

  tags = {
    Name = "koblio-${var.env}-nat-b"
  }

  depends_on = [aws_internet_gateway.main]
}

# ---------------------------------------------------------------------------
# Route tables — public
# ---------------------------------------------------------------------------
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "koblio-${var.env}-public-rt"
  }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

# ---------------------------------------------------------------------------
# Route tables — private (each AZ routes through its own NAT)
# ---------------------------------------------------------------------------
resource "aws_route_table" "private_a" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.a.id
  }

  tags = {
    Name = "koblio-${var.env}-private-rt-a"
  }
}

resource "aws_route_table" "private_b" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.b.id
  }

  tags = {
    Name = "koblio-${var.env}-private-rt-b"
  }
}

resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private_a.id
}

resource "aws_route_table_association" "private_b" {
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private_b.id
}

# ---------------------------------------------------------------------------
# Security Groups
# ---------------------------------------------------------------------------

# ALB — accepts HTTP/HTTPS from the internet
resource "aws_security_group" "alb" {
  name        = "koblio-${var.env}-alb-sg"
  description = "Allow HTTP and HTTPS inbound to ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "koblio-${var.env}-alb-sg"
  }
}

# API (NestJS) — accepts 3001 only from ALB
resource "aws_security_group" "api" {
  name        = "koblio-${var.env}-api-sg"
  description = "Allow port 3001 from ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "NestJS API port from ALB"
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "koblio-${var.env}-api-sg"
  }
}

# Web (Next.js) — accepts 3000 only from ALB
resource "aws_security_group" "web" {
  name        = "koblio-${var.env}-web-sg"
  description = "Allow port 3000 from ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Next.js web port from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "koblio-${var.env}-web-sg"
  }
}

# RDS — accepts 5432 only from API tasks
resource "aws_security_group" "rds" {
  name        = "koblio-${var.env}-rds-sg"
  description = "Allow PostgreSQL from API security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from API tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "koblio-${var.env}-rds-sg"
  }
}

# Redis — accepts 6379 only from API tasks
resource "aws_security_group" "redis" {
  name        = "koblio-${var.env}-redis-sg"
  description = "Allow Redis from API security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis from API tasks"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "koblio-${var.env}-redis-sg"
  }
}
