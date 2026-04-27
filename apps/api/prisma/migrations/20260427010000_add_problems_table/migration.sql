CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE "ProblemType" AS ENUM ('MCQ', 'FILL_BLANK', 'TRUE_FALSE');
CREATE TYPE "Curriculum" AS ENUM ('US_COMMON_CORE');

CREATE TABLE "problems" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "curriculum" "Curriculum" NOT NULL DEFAULT 'US_COMMON_CORE',
    "grade" INTEGER NOT NULL,
    "strand" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "type" "ProblemType" NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "problems_grade_strand_topic_idx" ON "problems"("grade", "strand", "topic");
CREATE INDEX "problems_difficulty_idx" ON "problems"("difficulty");
