import { IsString, Matches, IsEmail, IsOptional } from 'class-validator';

export class AsyncValidationDTO {
  @Matches(/^[a-zA-Z0-9]+$/)
  @IsString()
  @IsOptional()
  login: string;

  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  @IsString()
  @IsEmail()
  @IsOptional()
  email: string;
}
