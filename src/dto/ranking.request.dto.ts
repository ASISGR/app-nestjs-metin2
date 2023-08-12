import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RankingIndex {
  @IsString()
  @IsOptional()
  index: string;
}
