import { Prisma, Avatar, Subscription } from "@prisma/client";

export const userProfileQuery = Prisma.validator<Prisma.UserArgs>()({
    select: {
        username: true,
        victoriesAsPOne: true,
        victoriesAsPTwo: true,
        defeatsAsPOne: true,
        defeatsAsPTwo: true,
    },
});

export const userWholeQuery = Prisma.validator<Prisma.UserArgs>()({
    select: {
        username: true,
        email: true,
        TwoFA: true,
        TwoFASecret: true,
        auth42: true,
        auth42Id: true,
        createdAt: true,
        updatedAt: true,
        victoriesAsPOne: true,
        victoriesAsPTwo: true,
        defeatsAsPOne: true,
        defeatsAsPTwo: true,
        refresh_token: true,
        password: true,
        avatars: {
            select: {
                linkThumbnail: true,
                linkMedium: true,
                linkLarge: true,
                linkOriginal: true,
                updatedAt: true,
            },
        },
        channelSubscriptions: {
            select: {
                channelId: true,
                role: true,
                stateActiveUntil: true,
                state: true,
                channel: {
                    select: {
                        subscribedUsers: {
                            select: {
                                username: true,
                                role: true,
                                state: true,
                                stateActiveUntil: true,
                            },
                        },
                        id: true,
                        name: true,
                        channelType: true,
                        hash: true,
                        passwordProtected: true,
                        messages: true,
                    },
                },
            },
        },
        followedBy: {
            select: {
                followerId: true,
                id: true,
            },
        },
        following: {
            select: {
                followingId: true,
                id: true,
            },
        },
        blocking: {
            select: {
                blockingId: true,
                id: true,
            },
        },
        blockedBy: {
            select: {
                blockerId: true,
                id: true,
            },
        },
    },
});
export type UserWhole = Prisma.UserGetPayload<typeof userWholeQuery>;

export type UserProfile = Prisma.UserGetPayload<typeof userProfileQuery>;

export interface IGames {
    total: number;
    result: IResultGames[];
}

export interface IResultGames {
    id: string;
    finishedAt: Date;
    startedAt: Date;
    score_playerOne: number;
    score_playerTwo: number;
    playerOneName: string;
    playerTwoName: string;
}

// interface UserWholeOutput extends Omit<UserWhole, "avatar" | "password" | "refresh_token"> {}

// const toto: UserWholeOutput = {};

import { Exclude } from "class-transformer";

export class UserWholeOutput implements UserWhole {
    username: string;
    email: string;
    TwoFA: boolean;
    createdAt: Date;
    updatedAt: Date;
    victoriesAsPOne: number;
    victoriesAsPTwo: number;
    defeatsAsPOne: number;
    defeatsAsPTwo: number;
    @Exclude()
    refresh_token: string;
    @Exclude()
    password: string;
    @Exclude()
    avatars: Avatar;
    @Exclude()
    TwoFASecret: string;
    @Exclude()
    auth42: boolean;
    @Exclude()
    auth42Id: string;
    @Exclude()
    blockedBy: any[];
    channelSubscriptions: any[];
    followedBy: any[];
    following: any[];
    blocking: any[];
}
