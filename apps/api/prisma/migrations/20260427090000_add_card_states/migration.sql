-- CreateTable
CREATE TABLE "card_states" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "due_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_review" TIMESTAMP(3),
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "card_states_student_id_due_date_idx" ON "card_states"("student_id", "due_date");

-- CreateIndex
CREATE UNIQUE INDEX "card_states_student_id_problem_id_key" ON "card_states"("student_id", "problem_id");

-- AddForeignKey
ALTER TABLE "card_states" ADD CONSTRAINT "card_states_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_states" ADD CONSTRAINT "card_states_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
