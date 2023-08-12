import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsNumber,
  Equals,
} from 'class-validator';
import { Equal } from 'typeorm';

export class DebugCharacterDto {
  @Matches(/^[a-zA-Z0-9]+$/)
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @IsNotEmpty()
  playerName: string;

  @Equals('1' || '2' || '3')
  @IsString()
  @IsNotEmpty()
  empire: string;
}
