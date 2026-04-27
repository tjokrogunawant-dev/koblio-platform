# ---------------------------------------------------------------------------
# S3 bucket for static assets (Next.js public/, uploaded curriculum media, etc.)
# ---------------------------------------------------------------------------
resource "aws_s3_bucket" "assets" {
  bucket        = "koblio-assets-${var.env}"
  force_destroy = false

  tags = {
    Name = "koblio-assets-${var.env}"
  }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Block ALL public access — CloudFront serves content via OAC
resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CORS for browser-initiated uploads (e.g., avatar uploads from the web app)
resource "aws_s3_bucket_cors_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["https://*.koblio.com"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# ---------------------------------------------------------------------------
# CloudFront Origin Access Control (OAC) — replaces deprecated OAI
# ---------------------------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "assets" {
  name                              = "koblio-${var.env}-assets-oac"
  description                       = "OAC for koblio-assets-${var.env} S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# S3 bucket policy — allow CloudFront OAC to read objects
resource "aws_s3_bucket_policy" "assets" {
  bucket = aws_s3_bucket.assets.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAC"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.assets.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.assets.arn
          }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.assets]
}

# ---------------------------------------------------------------------------
# CloudFront Distribution
# ---------------------------------------------------------------------------
resource "aws_cloudfront_cache_policy" "assets" {
  name        = "koblio-${var.env}-assets-cache-policy"
  comment     = "Cache policy for koblio static assets"
  default_ttl = 86400    # 1 day
  max_ttl     = 31536000 # 1 year
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }
}

resource "aws_cloudfront_distribution" "assets" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "Koblio ${var.env} static assets"
  price_class     = "PriceClass_200" # US, Europe, Asia — excludes South America/AU to save cost

  origin {
    domain_name              = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id                = "S3-koblio-assets-${var.env}"
    origin_access_control_id = aws_cloudfront_origin_access_control.assets.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-koblio-assets-${var.env}"
    cache_policy_id        = aws_cloudfront_cache_policy.assets.id
    viewer_protocol_policy = "https-only"
    compress               = true
  }

  # Cache-busted assets (e.g., /static/_next/*) — very long TTL
  ordered_cache_behavior {
    path_pattern           = "/static/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-koblio-assets-${var.env}"
    cache_policy_id        = aws_cloudfront_cache_policy.assets.id
    viewer_protocol_policy = "https-only"
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    # TODO: replace with ACM cert in us-east-1 when a custom CDN domain is configured
    # ssl_support_method             = "sni-only"
    # minimum_protocol_version       = "TLSv1.2_2021"
    # acm_certificate_arn            = var.cf_acm_certificate_arn
  }

  tags = {
    Name = "koblio-${var.env}-assets-cf"
  }

  depends_on = [aws_s3_bucket_public_access_block.assets]
}
