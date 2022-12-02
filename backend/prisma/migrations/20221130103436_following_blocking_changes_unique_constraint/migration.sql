/*
  Warnings:

  - A unique constraint covering the columns `[blockerId,blockingId]` on the table `Blocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[followerId,followingId]` on the table `Follows` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Blocks_blockerId_blockingId_key" ON "Blocks"("blockerId", "blockingId");

-- CreateIndex
CREATE UNIQUE INDEX "Follows_followerId_followingId_key" ON "Follows"("followerId", "followingId");
