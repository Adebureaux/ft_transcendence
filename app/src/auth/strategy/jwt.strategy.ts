import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { ITokenPayload } from "../auths.interface";
import * as dotenv from "dotenv";
import { PrismaService } from "src/prisma.service";
import { AuthService } from "../auth.service";
import { UserWhole } from "src/utils/types/users.types";
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(private readonly prismaService: PrismaService, private readonly authService: AuthService) {
        super({
            secretOrKey: `${process.env.JWT_ACCESS_SECRET}`,
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.Authentication;
                },
            ]),
            passReqToCallback: true,
        });
    }
    async validate(req: Request, payload: ITokenPayload): Promise<UserWhole> {
        const user = await this.prismaService.getWholeUserByEmail(payload.email).catch((e) => {
            throw new UnauthorizedException(e.message);
        });
        if (user?.refresh_token) {
            if (!user.TwoFA) return user;
            else if (user.TwoFA && payload.TwoFAAuthenticated) return user;
            else throw new UnauthorizedException(["2FA is enabled"]);
        }
        throw new UnauthorizedException(["invalid token"]);
    }
}
