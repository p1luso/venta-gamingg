-- CreateEnum
CREATE TYPE "TransferMethod" AS ENUM ('COMFORT_TRADE', 'PLAYER_AUCTION');

-- AlterTable
ALTER TABLE "orders"
  ADD COLUMN "transferMethod"      "TransferMethod" NOT NULL DEFAULT 'COMFORT_TRADE',
  ADD COLUMN "auctionPlayerName"   TEXT,
  ADD COLUMN "auctionPlayerRating" INTEGER,
  ADD COLUMN "auctionStartPrice"   DECIMAL(10,2),
  ADD COLUMN "auctionBuyNowPrice"  DECIMAL(10,2);
