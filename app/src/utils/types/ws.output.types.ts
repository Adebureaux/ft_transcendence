import { Role, Message, ChannelType, State } from "@prisma/client";

// export type Role = "USER" | "ADMIN" | "OWNER";
export type MessageStatus = "OK" | "INVALID_PASSWORD" | "UNAUTHORIZED" | "MESSAGE_TOO_LONG" | "MESSAGE_TOO_SHORT" | "INVALID_TIMESTAMP" | "DATABASE_ERROR" | "INVALID_CHANNEL";

export type Message_output = {
    id: string;
    channelId: string;
    timestamp: Date;
    content: string;
    username: string;
};

export type Message_Aknowledgement_output = {
    status: MessageStatus;
    channelId: string;
    comment?: string;
};

export type Info_dto = {
    channelId: string;
    content: object;
    status: number;
};

export type Error_dto = {
    channelId: string;
    content: object;
    status: number;
};

export type UserInfo = {
    username: string;
    role: Role;
};

export type join_channel_output = {
    channelId?: string;
    name?: string;
    channelType?: ChannelType;
    state?: State;
    stateActiveUntil?: Date;
    messages?: Message[];
    role?: Role;
    subscribedUsers?: UserInfo[];
    username?: string;
    passwordProtected?: boolean;
};
export type running_game = {
    gameId: string;
    finishedAt?: Date;
    startedAt: Date;
    score_playerOne?: number;
    score_playerTwo?: number;
    playerOneName: string;
    playerTwoName: string;
    map: string;
};
