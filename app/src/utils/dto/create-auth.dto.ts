import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateAuthDto {}

export class TwoFaAuthDto {
    @MaxLength(6)
    @IsNotEmpty()
    @IsString()
    code: string;
}
