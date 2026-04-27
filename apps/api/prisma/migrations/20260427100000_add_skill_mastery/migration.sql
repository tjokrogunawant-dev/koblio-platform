-- CreateTable
CREATE TABLE "skill_masteries" (
    "id"           UUID         NOT NULL DEFAULT gen_random_uuid(),
    "student_id"   UUID         NOT NULL,
    "skill"        TEXT         NOT NULL,
    "mastery_prob" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "attempt_count" INTEGER     NOT NULL DEFAULT 0,
    "mastered"     BOOLEAN      NOT NULL DEFAULT false,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_masteries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skill_masteries_student_id_skill_key" ON "skill_masteries"("student_id", "skill");

-- CreateIndex
CREATE INDEX "skill_masteries_student_id_mastered_idx" ON "skill_masteries"("student_id", "mastered");

-- AddForeignKey
ALTER TABLE "skill_masteries" ADD CONSTRAINT "skill_masteries_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
