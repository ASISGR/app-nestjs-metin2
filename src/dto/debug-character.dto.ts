import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsNumber,
  Equals,
} from 'class-validator';

export class DebugCharacterDto {
  @Matches(/^[a-zA-Z0-9]+$/)
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @IsNotEmpty()
  playerName: string;

  @IsNumber()
  @IsNotEmpty()
  empire: number;
}
