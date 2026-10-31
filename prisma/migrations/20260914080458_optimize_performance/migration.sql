-- DropIndex
DROP INDEX "Workout_userId_idx";

-- CreateIndex
CREATE INDEX "PersonalRecord_userId_exerciseId_estimated1RM_idx" ON "PersonalRecord"("userId", "exerciseId", "estimated1RM");

-- CreateIndex
CREATE INDEX "Workout_userId_status_completedAt_idx" ON "Workout"("userId", "status", "completedAt");
