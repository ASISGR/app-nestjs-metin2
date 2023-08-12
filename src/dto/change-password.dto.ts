import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class ChangePasswordDto {
  @Matches(/^[a-zA-Z0-9]+$/)
  @IsString()
  @MinLength(5)
  @MaxLength(16)
  @IsNotEmpty()
  previousPassword: string;

  @Matches(/^[a-zA-Z0-9]+$/)
  @IsString()
  @MinLength(5)
  @MaxLength(16)
  @IsNotEmpty()
  updatePassword: string;
}
