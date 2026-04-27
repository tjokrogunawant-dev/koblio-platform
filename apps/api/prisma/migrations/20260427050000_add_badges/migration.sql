CREATE TYPE "BadgeType" AS ENUM ('FIRST_CORRECT', 'PERFECT_10', 'STREAK_7', 'STREAK_30', 'PROBLEMS_100', 'CORRECT_50', 'FRACTION_MASTER', 'SPEED_DEMON', 'MATH_EXPLORER', 'TOP_OF_CLASS');

CREATE TABLE "badges" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "student_id" UUID NOT NULL,
  "type" "BadgeType" NOT NULL,
  "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "badges_student_id_type_key" ON "badges"("student_id", "type");
CREATE INDEX "badges_student_id_idx" ON "badges"("student_id");
ALTER TABLE "badges" ADD CONSTRAINT "badges_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
