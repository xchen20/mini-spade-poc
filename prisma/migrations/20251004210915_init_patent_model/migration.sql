-- CreateEnum
CREATE TYPE "PatentStatus" AS ENUM ('Active', 'Pending', 'Expired');

-- CreateTable
CREATE TABLE "Patent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "inventors" TEXT[],
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL,
    "assignee" TEXT,
    "status" "PatentStatus",
    "cpcCodes" TEXT[],
    "claims" TEXT[],

    CONSTRAINT "Patent_pkey" PRIMARY KEY ("id")
);
