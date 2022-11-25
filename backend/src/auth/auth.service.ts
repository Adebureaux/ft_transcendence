import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

import { User } from '@prisma/client';

import { UsersService } from '../users/users.service';
import { PrismaService } from 'src/prisma.service';

import { CreateUserDto, UpdateUserDto } from '../users/dto/users.dto';

import * as bcrypt from 'bcrypt';



@Injectable()
export class AuthService {
	constructor(private prismaService:PrismaService) {}

	async register(userDto: CreateUserDto) : Promise<User> {
		userDto.password = await this.hashPassword(userDto.password);
		try {
			const user = await this.prismaService.user.create({data: userDto})
			delete user.password;
			return user;
		}
		catch(error) {
			throw new BadRequestException("User already exists");
		}
	}

	async hashPassword(password : string) : Promise<string> {
		const hash_password = await bcrypt.hash(password, 10);
		return hash_password;
	}
}

// export class AuthenticationService {
//   constructor(
//     private readonly usersService: UsersService
//   ) {}
 
//   public async register(registrationData: RegisterDto) {
//     const hashedPassword = await bcrypt.hash(registrationData.password, 10);
//     try {
//       const createdUser = await this.usersService.create({
//         ...registrationData,
//         password: hashedPassword
//       });
//       createdUser.password = undefined;
//       return createdUser;
//     } catch (error) {
//       if (error?.code === PostgresErrorCode.UniqueViolation) {
//         throw new HttpException('User with that email already exists', HttpStatus.BAD_REQUEST);
//       }
//       throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }
//   // (...)
// }