# Bootstrap resources for Terraform remote state.
# Apply this ONCE with a local backend before running `terraform init`
# with the S3 backend configured in main.tf.
#
# Bootstrap steps:
#   1. Comment out the `backend "s3"` block in main.tf
#   2. Run: terraform init && terraform apply -target=aws_s3_bucket.terraform_state -target=aws_dynamodb_table.terraform_lock
#   3. Uncomment the backend block in main.tf
#   4. Run: terraform init -backend-config="bucket=koblio-terraform-state" -backend-config="region=ap-southeast-1"

resource "aws_s3_bucket" "terraform_state" {
  bucket = "koblio-terraform-state"

  # Prevent accidental deletion of state
  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "koblio-terraform-state"
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_lock" {
  name         = "koblio-terraform-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  # Prevent accidental deletion of lock table
  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "koblio-terraform-lock"
    Environment = var.env
    ManagedBy   = "terraform"
  }
}
