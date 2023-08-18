import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNewsDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  postContent: string;

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsNotEmpty()
  @IsDate()
  @IsOptional()
  created_at?: Date;

  @IsNotEmpty()
  @IsDate()
  @IsOptional()
  updated_at?: Date;
}
