import { IsString, IsNotEmpty } from 'class-validator';

export class RecaptchaDTO {
  @IsString()
  @IsNotEmpty()
  secret: string;

  @IsString()
  @IsNotEmpty()
  response: string;
}
