/*
  Warnings:

  - Made the column `score_playerOne` on table `Game` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "score_playerOne" SET NOT NULL,
ALTER COLUMN "score_playerOne" SET DEFAULT 0,
ALTER COLUMN "score_playerTwo" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defeatsAsPOne" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "defeatsAsPTwo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "victoriesAsPOne" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "victoriesAsPTwo" INTEGER NOT NULL DEFAULT 0;
