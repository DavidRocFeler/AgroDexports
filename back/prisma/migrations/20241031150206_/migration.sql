-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "tax_identification_number" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "postal_code" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "industry" DROP NOT NULL,
ALTER COLUMN "isActive" DROP NOT NULL;
