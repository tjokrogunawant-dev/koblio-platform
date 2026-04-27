-- CreateTable: assignments
CREATE TABLE "assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "classroom_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "strand" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "problem_ids" UUID[] NOT NULL,
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: assignment_submissions
CREATE TABLE "assignment_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "attempt_id" UUID,
    "submitted_at" TIMESTAMP(3),
    "correct" BOOLEAN,
    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assignments_classroom_id_idx" ON "assignments"("classroom_id");
CREATE INDEX "assignments_teacher_id_idx" ON "assignments"("teacher_id");
CREATE INDEX "assignment_submissions_student_id_idx" ON "assignment_submissions"("student_id");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "assignment_submissions_assignment_id_student_id_problem_id_key"
    ON "assignment_submissions"("assignment_id", "student_id", "problem_id");

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_classroom_id_fkey"
    FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacher_id_fkey"
    FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_fkey"
    FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_problem_id_fkey"
    FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_attempt_id_fkey"
    FOREIGN KEY ("attempt_id") REFERENCES "student_problem_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
