import { IsString } from 'class-validator';

export class CreateDictionaryDto {
  @IsString()
  title: string;

  @IsString()
  languageFrom: string;

  @IsString()
  languageTo: string;
}
