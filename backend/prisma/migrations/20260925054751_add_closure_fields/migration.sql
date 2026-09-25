-- AlterTable
ALTER TABLE "Permit" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "completionNotes" TEXT,
ADD COLUMN     "verificationComment" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);
