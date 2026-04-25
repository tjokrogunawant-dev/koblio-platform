-- AlterTable
ALTER TABLE "users" ADD COLUMN "password_hash" TEXT,
ADD COLUMN "picture_password" TEXT[] DEFAULT ARRAY[]::TEXT[];
