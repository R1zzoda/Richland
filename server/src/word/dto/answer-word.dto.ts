import { IsBoolean, IsNumber } from 'class-validator';

export class AnswerWordDto {
  @IsBoolean()
  correct: boolean;

  @IsNumber()
  sessionId: number;
}
