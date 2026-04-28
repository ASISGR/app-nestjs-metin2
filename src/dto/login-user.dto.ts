import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class LoginUserDto {
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

  @IsString()
  @IsNotEmpty()
  recaptchaToken: string;
}
