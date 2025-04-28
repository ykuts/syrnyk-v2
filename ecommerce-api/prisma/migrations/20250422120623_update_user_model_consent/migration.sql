-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dataConsentAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataConsentDate" TIMESTAMP(3),
ADD COLUMN     "dataConsentVersion" TEXT,
ADD COLUMN     "marketingConsent" BOOLEAN NOT NULL DEFAULT false;
