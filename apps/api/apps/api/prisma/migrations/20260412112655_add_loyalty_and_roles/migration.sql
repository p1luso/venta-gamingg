-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "cashback_earned" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "users"
  ADD COLUMN "role"           "UserRole"     NOT NULL DEFAULT 'USER',
  ADD COLUMN "tier"           "UserTier"     NOT NULL DEFAULT 'BRONZE',
  ADD COLUMN "wallet_balance" DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  ADD COLUMN "xp_points"      INTEGER        NOT NULL DEFAULT 0;
