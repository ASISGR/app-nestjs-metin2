import { IsString, Matches, IsEmail, IsOptional } from 'class-validator';

export class ApplyResetPasswordDto {
  @Matches(/^[a-zA-Z0-9]+$/)
  @IsString()
  login: string;

  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  @IsString()
  @IsEmail()
  email: string;
}
