import { IsOptional, IsString } from 'class-validator';

export class UpdateDictionaryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  languageFrom?: string;

  @IsOptional()
  @IsString()
  languageTo?: string;
}
