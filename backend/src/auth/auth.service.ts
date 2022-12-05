import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { CreateUserDto, UpdateUserDto } from '../users/dto/users.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ITokenPayload } from './auths.interface';
import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class AuthService {
	constructor(private readonly usersService:UsersService,
				private readonly jwtService: JwtService,
				) {}

	async register(userDto: CreateUserDto) : Promise<User> {
		userDto.password = await this.hashPassword(userDto.password);
		try {

			const user = await this.usersService.createUser(userDto)
			delete user.password;
			return user;
		}
		catch(error) {
			throw new BadRequestException("User already exists");
		}
	}

	async getAuthenticatedUser(name: string, password: string) {
		try {
			const user = await this.usersService.getUser(name);
			await this.checkPassword(user.password, password);
			delete user.password;
			return user;
		}
		catch (error) {
			throw new BadRequestException("Wrong Crededentials");
		}
  	}

	async removeRefreshToken(userId: string) {
    	return await this.usersService.deleteRefreshToken(userId);
    };

	async hashPassword(password : string) : Promise<string> {
		const hash_password = await bcrypt.hash(password, 10);
		return hash_password;
	}

	async checkPassword(hash : string, password: string) : Promise<void> {
		
		const res = await bcrypt.compare(password, hash);
		if (!res && password !== hash) {
			throw new BadRequestException("Wrong Credentials");
		}
	}

	getCookieWithRefreshToken(username: string): { cookie: string; token: string; }{
    	const payload: ITokenPayload = { username };
    	const token = this.jwtService.sign(payload, {
			secret: `${process.env.JWT_REFRESH_SECRET}`,
			expiresIn: `${process.env.JWT_REFRESH_EXPIRATION_TIME}`
		});
		const cookie = `Refresh=${token}; HttpOnly; Path=/api/auth/; Max-Age=${process.env.JWT_REFRESH_EXPIRATION_TIME}`;
    	return {cookie, token};
  	}

	getCookieWithAccessToken(username: string):  string{
    	const payload: ITokenPayload = { username };
    	const token = this.jwtService.sign(payload, {
			secret: `${process.env.JWT_ACCESS_SECRET}`,
			expiresIn: `${process.env.JWT_ACCESS_EXPIRATION_TIME}`
		});
		const cookie = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_ACCESS_EXPIRATION_TIME}`;
    	return cookie;
  	}

	getCookieForLogOut() { return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/api/auth/; Max-Age=0'
    ];}

	async getUserIfRefreshTokenMatches(refreshToken: string, name: string) {
    	const user = await this.usersService.getUser(name);
		const res = await bcrypt.compare(refreshToken, user.refresh_token);
		if (res) {
			return user;
		}
	}


}
