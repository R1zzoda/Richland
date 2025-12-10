import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateWordDto {
  @IsInt()
  dictionaryId: number;

  @IsString()
  term: string;

  @IsString()
  translation: string;

  @IsOptional()
  @IsString()
  transcription?: string;

  @IsOptional()
  @IsString()
  example?: string;

  @IsOptional()
  @IsInt()
  difficulty?: number; // 1–5
}
