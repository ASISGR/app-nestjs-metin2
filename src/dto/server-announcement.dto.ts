import {
  IsString,
  Matches,
  IsEmail,
  IsOptional,
  IsArray,
} from 'class-validator';

export class ServerAnnouncementDto {
  @IsString()
  subject: string;
  @IsString()
  title: string;
  @IsString()
  content: string;
  @IsOptional()
  @IsString()
  locale: string;

  @IsOptional()
  @IsArray()
  emails: [];
}
