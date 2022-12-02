/*
  Warnings:

  - The primary key for the `Blocks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Follows` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Blocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Follows` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Blocks` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Follows` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Blocks" DROP CONSTRAINT "Blocks_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Blocks_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Follows" DROP CONSTRAINT "Follows_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Follows_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Blocks_id_key" ON "Blocks"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Follows_id_key" ON "Follows"("id");
