import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateWordDto {
  @IsOptional()
  @IsString()
  term?: string;

  @IsOptional()
  @IsString()
  translation?: string;

  @IsOptional()
  @IsString()
  transcription?: string;

  @IsOptional()
  @IsString()
  example?: string;

  @IsOptional()
  @IsInt()
  difficulty?: number;
}
