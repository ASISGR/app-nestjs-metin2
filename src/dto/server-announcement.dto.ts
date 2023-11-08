import { IsString, Matches, IsEmail, IsOptional } from 'class-validator';

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
}
