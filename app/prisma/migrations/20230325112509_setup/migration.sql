-- CreateEnum
CREATE TYPE "State" AS ENUM ('BANNED', 'MUTED', 'OK');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('PUBLIC', 'PRIVATE', 'ONE_TO_ONE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "TwoFA" BOOLEAN DEFAULT false,
    "auth42" BOOLEAN NOT NULL DEFAULT false,
    "auth42Id" TEXT NOT NULL DEFAULT '',
    "TwoFASecret" TEXT DEFAULT '',
    "password" TEXT NOT NULL DEFAULT 'null',
    "refresh_token" TEXT,
    "victoriesAsPOne" INTEGER NOT NULL DEFAULT 0,
    "victoriesAsPTwo" INTEGER NOT NULL DEFAULT 0,
    "defeatsAsPOne" INTEGER NOT NULL DEFAULT 0,
    "defeatsAsPTwo" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "Follows" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "Follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blocks" (
    "blockerId" TEXT NOT NULL,
    "blockingId" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "Blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ReceivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "channelType" "ChannelType" NOT NULL DEFAULT 'PUBLIC',
    "hash" TEXT,
    "passwordProtected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "username" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "state" "State" NOT NULL DEFAULT 'OK',
    "stateActiveUntil" TIMESTAMP(3),

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "finishedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score_playerOne" INTEGER NOT NULL DEFAULT 0,
    "score_playerTwo" INTEGER NOT NULL DEFAULT 0,
    "playerOneName" TEXT,
    "playerTwoName" TEXT,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT,
    "linkOriginal" TEXT NOT NULL DEFAULT '_default.original.webp',
    "linkThumbnail" TEXT NOT NULL DEFAULT '_default.thumbnail.webp',
    "linkMedium" TEXT NOT NULL DEFAULT '_default.medium.webp',
    "linkLarge" TEXT NOT NULL DEFAULT '_default.large.webp',

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Follows_id_key" ON "Follows"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Follows_followerId_followingId_key" ON "Follows"("followerId", "followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Blocks_id_key" ON "Blocks"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Blocks_blockerId_blockingId_key" ON "Blocks"("blockerId", "blockingId");

-- CreateIndex
CREATE INDEX "Message_CreatedAt_idx" ON "Message"("CreatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_id_key" ON "Channel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_id_key" ON "Subscription"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_channelId_username_key" ON "Subscription"("channelId", "username");

-- CreateIndex
CREATE UNIQUE INDEX "Game_id_key" ON "Game"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_id_key" ON "Avatar"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_username_key" ON "Avatar"("username");

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blocks" ADD CONSTRAINT "Blocks_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blocks" ADD CONSTRAINT "Blocks_blockingId_fkey" FOREIGN KEY ("blockingId") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playerOneName_fkey" FOREIGN KEY ("playerOneName") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playerTwoName_fkey" FOREIGN KEY ("playerTwoName") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
