
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { User } from '@prisma/client';

import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { ITokenPayload } from '../auths.interface';
import * as dotenv from 'dotenv';
dotenv.config();
 
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  	constructor(private readonly userService: UsersService){
		super({
			secretOrKey: `${process.env.JWT_REFRESH_SECRET}`,
			passReqToCallback: true,
			jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
				return request?.cookies?.Refresh;
			}]),
		});
	}
 
	async validate(request: Request, payload: ITokenPayload, ) {
		const refreshToken = request?.cookies?.Refresh;
		return this.userService.getUserIfRefreshTokenMatches(refreshToken, payload.username);
	}
}