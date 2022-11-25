import { IsAlphanumeric, IsNotEmpty, IsEmail, IsOptional, MinLength, MaxLength } from "class-validator";


export class CreateUserDto {
	@IsNotEmpty()
	@IsAlphanumeric()
	@MinLength(3)
	@MaxLength(42)
	username: string;

	@IsNotEmpty()
	@IsEmail()
	@IsOptional()
	email: string;

	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(42)
	password: string;
}

export class UpdateUserDto {
	@IsNotEmpty()
	@IsAlphanumeric()
	@MinLength(3)
	@MaxLength(42)
	@IsOptional()
	username: string;

	@IsNotEmpty()
	@IsEmail()
	@IsOptional()
	email: string;

	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(42)
	@IsOptional()
	password: string;
}
