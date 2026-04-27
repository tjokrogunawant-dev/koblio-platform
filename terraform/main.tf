terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }

  # S3 backend — bootstrapped by backend.tf resources.
  # Before first use run:
  #   terraform init \
  #     -backend-config="bucket=koblio-terraform-state" \
  #     -backend-config="key=koblio/${var.env}/terraform.tfstate" \
  #     -backend-config="region=ap-southeast-1" \
  #     -backend-config="dynamodb_table=koblio-terraform-lock" \
  #     -backend-config="encrypt=true"
  backend "s3" {
    bucket         = "koblio-terraform-state"
    key            = "koblio/production/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "koblio-terraform-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "koblio"
      Environment = var.env
      ManagedBy   = "terraform"
    }
  }
}

# CloudFront requires ACM certificates in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "koblio"
      Environment = var.env
      ManagedBy   = "terraform"
    }
  }
}

# ECR repositories are defined in ecr.tf
