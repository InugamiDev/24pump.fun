/*
  Warnings:

  - You are about to drop the `Coin` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Coin" DROP CONSTRAINT "Coin_ownerId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Coin";

-- CreateTable
CREATE TABLE "MomentCoinSeries" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "momentDateTimeUTC" TIMESTAMP(3) NOT NULL,
    "narrative" TEXT NOT NULL,
    "totalSupply" BIGINT NOT NULL,
    "smartContractAddress" TEXT NOT NULL,
    "creationTxSignature" TEXT,
    "burnable" BOOLEAN NOT NULL DEFAULT false,
    "socialCauseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MomentCoinSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialCause" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "receivingWalletAddress" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialCause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "momentCoinSeriesId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "buyerWallet" TEXT,
    "sellerWallet" TEXT,
    "amount" BIGINT NOT NULL,
    "pricePerToken" DOUBLE PRECISION,
    "totalTransactionValue" DOUBLE PRECISION,
    "currency" TEXT NOT NULL,
    "platformFeeCollected" DOUBLE PRECISION NOT NULL,
    "onChainTxSignature" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialContribution" (
    "id" TEXT NOT NULL,
    "socialCauseId" TEXT NOT NULL,
    "momentCoinSeriesId" TEXT,
    "amountContributed" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "contributionTxSignature" TEXT NOT NULL,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MomentCoinSeries_smartContractAddress_key" ON "MomentCoinSeries"("smartContractAddress");

-- CreateIndex
CREATE UNIQUE INDEX "SocialCause_name_key" ON "SocialCause"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SocialCause_receivingWalletAddress_key" ON "SocialCause"("receivingWalletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_onChainTxSignature_key" ON "Transaction"("onChainTxSignature");

-- CreateIndex
CREATE UNIQUE INDEX "SocialContribution_contributionTxSignature_key" ON "SocialContribution"("contributionTxSignature");

-- AddForeignKey
ALTER TABLE "MomentCoinSeries" ADD CONSTRAINT "MomentCoinSeries_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MomentCoinSeries" ADD CONSTRAINT "MomentCoinSeries_socialCauseId_fkey" FOREIGN KEY ("socialCauseId") REFERENCES "SocialCause"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_momentCoinSeriesId_fkey" FOREIGN KEY ("momentCoinSeriesId") REFERENCES "MomentCoinSeries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialContribution" ADD CONSTRAINT "SocialContribution_socialCauseId_fkey" FOREIGN KEY ("socialCauseId") REFERENCES "SocialCause"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialContribution" ADD CONSTRAINT "SocialContribution_momentCoinSeriesId_fkey" FOREIGN KEY ("momentCoinSeriesId") REFERENCES "MomentCoinSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
