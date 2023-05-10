import { Message, Subscription } from "@prisma/client";
import { UserWhole, UserWholeOutput } from "../types/users.types";

export function toUserWholeOutput(user: UserWhole): UserWholeOutput {
    delete user.password;
    delete user.avatars;
    delete user.refresh_token;
    delete user.TwoFASecret;
    delete user.auth42;
    delete user.auth42Id;
    delete user.blockedBy;
    user.channelSubscriptions.forEach((sub: any) => {
        sub.channel.messages = sub.channel?.messages.filter((message: Message) => !user.blocking.find((b) => b.blockingId === message.username));
    });

    return user as UserWholeOutput;
}
