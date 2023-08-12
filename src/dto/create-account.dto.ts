import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';

export class CreateAccountDto {
  @Matches(/^[a-zA-Z0-9]+$/)
  @IsString()
  @MinLength(5)
  @MaxLength(16)
  @IsNotEmpty()
  login: string;

  @Matches(/^[a-zA-Z0-9]+$/)
  @IsString()
  @MinLength(5)
  @MaxLength(16)
  @IsNotEmpty()
  password: string;

  @Matches(/^[a-zA-Z0-9]+$/)
  @IsString()
  @MinLength(3)
  @MaxLength(16)
  @IsNotEmpty()
  real_name: string;

  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Matches(/^[a-zA-Z0-9]+$/)
  @IsString()
  @MinLength(7)
  @MaxLength(7)
  @IsNotEmpty()
  social_id: string;

  @Matches(/^[a-zA-Z0-9]+$/)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsNotEmpty()
  question1: string;

  @Matches(/^[a-zA-Z0-9]+$/)
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  answer1: string;
}
