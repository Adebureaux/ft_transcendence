import { Transform } from "class-transformer";
import {
    IsAlphanumeric,
    IsNotEmpty,
    IsEmail,
    IsOptional,
    MinLength,
    MaxLength,
    IsNumber,
    IsPositive,
    Min,
    Max,
    IsIn,
    IsBoolean,
    isDateString,
    IsDateString,
    IsUUID,
    isNumberString,
    IsObject,
    IsString,
} from "class-validator";

export class ReceivedMessage {
    @IsUUID()
    channelId!: string;

    @IsNotEmpty()
    @IsDateString({ strict: true } as any)
    timestamp!: Date;

    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(128)
    content!: string;

    @IsOptional()
    password?: string;
}
export class NewMessageDto {
    // @IsNotEmpty()
    // @IsDateString({ strict: true } as any)
    // timestamp!: Date;
    // @IsUUID()
    // channelId: string;

    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(128)
    content: string;

    @IsOptional()
    password?: string;

    @IsString()
    socketId!: string;
    // @MinLength(8)
    // @MaxLength(42)
}

export class ReceivedInfos {
    @IsUUID()
    channelId!: string;

    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    status!: number;

    @IsObject()
    content?: Object;
}

export class ReceivedJoinRequest {
    @IsUUID()
    channelId!: string;
    @IsOptional()
    @IsUUID()
    last_received_message_id?: string;

    @IsOptional()
    password?: string;
}
export interface IJoinRequestDto {
    last_received_message_id?: string;
    password?: string;
    socketId: string;
}
export class JoinRequestDto implements IJoinRequestDto {
    @IsOptional()
    @IsUUID()
    last_received_message_id?: string;

    @IsString()
    socketId!: string;

    @IsOptional()
    @MaxLength(18)
    password?: string;
}

export class ReceivedLeaveRequest {
    @IsUUID()
    channelId!: string;
}

export class GameInvitePayload {
    @IsNotEmpty()
    @IsAlphanumeric()
    @MinLength(3)
    @MaxLength(12)
    target_user!: string;

    @IsAlphanumeric()
    map!: string;

    @IsNumber()
    difficulty!: number;
}
export class GameOptions {
    @IsAlphanumeric()
    map!: string;

    difficulty!: string;
}
