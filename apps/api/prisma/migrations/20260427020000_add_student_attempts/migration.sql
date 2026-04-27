CREATE TABLE "student_problem_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "answer" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "time_spent_ms" INTEGER NOT NULL,
    "hint_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_problem_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "student_problem_attempts_student_id_problem_id_idx" ON "student_problem_attempts"("student_id", "problem_id");
CREATE INDEX "student_problem_attempts_student_id_created_at_idx" ON "student_problem_attempts"("student_id", "created_at");

ALTER TABLE "student_problem_attempts" ADD CONSTRAINT "student_problem_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_problem_attempts" ADD CONSTRAINT "student_problem_attempts_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
