import { IsBoolean, IsNotEmpty } from 'class-validator';

export class registerSwitchDto {
  @IsBoolean()
  @IsNotEmpty()
  register: boolean;
}

export class registerSwitchVerificationDto {
  @IsBoolean()
  @IsNotEmpty()
  registerEmailVerification: boolean;
}
