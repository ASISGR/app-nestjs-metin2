import { IsString, IsNotEmpty } from 'class-validator';

export class RecaptchaDTO {
  @IsString()
  @IsNotEmpty()
  response: string;
}
