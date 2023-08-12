import { IsString, Matches, IsNotEmpty } from 'class-validator';

export class accountActivationDto {
  @Matches(/^[0-9a-fA-F]{32}$/)
  @IsString({})
  @IsNotEmpty()
  hash: string;
}
