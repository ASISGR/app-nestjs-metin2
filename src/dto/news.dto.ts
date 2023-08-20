import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { zonedTimeToUtc } from 'date-fns-tz';

export class CreateNewsDto {
  @IsNumber()
  @IsOptional()
  id: number;

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
  @Transform(() => zonedTimeToUtc(new Date(), 'GMT+2')) //Set createdAt to GMT+2
  @IsOptional()
  created_at?: Date;

  @IsNotEmpty()
  @IsDate()
  @Transform(() => zonedTimeToUtc(new Date(), 'GMT+2')) //Set createdAt to GMT+2
  @IsOptional()
  updated_at?: Date;
}

export class DeleteNewsDto {
  @IsNumber()
  id: number;
}

export class updateNewsDto {
  @IsNumber()
  @IsOptional()
  id: number;

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
  @Transform(() => zonedTimeToUtc(new Date(), 'GMT+2')) //Set createdAt to GMT+2
  @IsOptional()
  created_at?: Date;

  @IsNotEmpty()
  @IsDate()
  @Transform(() => zonedTimeToUtc(new Date(), 'GMT+2')) //Set createdAt to GMT+2
  @IsOptional()
  updated_at?: Date;
}
