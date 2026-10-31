-- CreateTable
CREATE TABLE "SleepGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetMinutes" INTEGER NOT NULL DEFAULT 480,
    "targetBedtime" TEXT,
    "targetWakeTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SleepGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "bedtime" TIMESTAMP(3),
    "wakeTime" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL,
    "quality" INTEGER,
    "energy" INTEGER,
    "stress" INTEGER,
    "awakenings" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SleepLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SleepGoal_userId_key" ON "SleepGoal"("userId");

-- CreateIndex
CREATE INDEX "SleepLog_userId_dateKey_idx" ON "SleepLog"("userId", "dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "SleepLog_userId_dateKey_key" ON "SleepLog"("userId", "dateKey");

-- AddForeignKey
ALTER TABLE "SleepGoal" ADD CONSTRAINT "SleepGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SleepLog" ADD CONSTRAINT "SleepLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
