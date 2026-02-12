-- Normalize existing category types before enum cast
UPDATE "Category"
SET "type" = 'expense'
WHERE "type" NOT IN ('income', 'expense');

-- Convert category type to enum and enforce uniqueness per user/category/type
ALTER TABLE "Category"
ALTER COLUMN "type" TYPE "CategoryType" USING "type"::"CategoryType";

CREATE UNIQUE INDEX "Category_userId_name_type_key" ON "Category"("userId", "name", "type");

-- New enum for investment tracking
CREATE TYPE "InvestmentAssetType" AS ENUM (
  'stock',
  'crypto',
  'real_estate',
  'etf',
  'bond',
  'mutual_fund',
  'cash',
  'other'
);

-- Investments table
CREATE TABLE "Investment" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "assetType" "InvestmentAssetType" NOT NULL,
  "name" TEXT NOT NULL,
  "symbol" TEXT,
  "amountInvested" DECIMAL(12,2) NOT NULL,
  "currentValue" DECIMAL(12,2) NOT NULL,
  "purchasedOn" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- Daily digest audit table to avoid duplicate sends
CREATE TABLE "EmailDigestLog" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "digestDate" DATE NOT NULL,
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "totalExpense" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailDigestLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailDigestLog_userId_digestDate_key"
ON "EmailDigestLog"("userId", "digestDate");

ALTER TABLE "Investment"
ADD CONSTRAINT "Investment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmailDigestLog"
ADD CONSTRAINT "EmailDigestLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
