import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainingService } from './training.service';
import { Pool } from 'pg';

@Controller('training')
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(
    private readonly trainingService: TrainingService,
    @Inject('PG_POOL') private readonly pool: Pool,
  ) {}

  // START
  @Post('start')
  async start(
    @Req() req,
    @Body() body: { dictionaryId: number; mode: string; direction?: 'en-ru' | 'ru-en' },
  ) {
    const userId = req.user.id;
    const direction = body.direction || 'en-ru';

    const dictCheck = await this.pool.query(
      `SELECT * FROM "Dictionary" WHERE id = $1`,
      [body.dictionaryId]
    );
    if (!dictCheck.rows.length) throw new NotFoundException('Словарь не найден');
    if (dictCheck.rows[0].userId !== userId)
      throw new ForbiddenException('Нет доступа к этому словарю');

    return this.trainingService.startSession(
      userId,
      body.dictionaryId,
      body.mode,
      direction
    );
  }

  // FINISH
  @Post('finish/:id')
  async finish(@Param('id') id: number, @Req() req) {
    const userId = req.user.id;
    const check = await this.pool.query(
      `SELECT * FROM "TrainingSession" WHERE id = $1`,
      [id]
    );

    if (!check.rows.length) throw new NotFoundException('Тренировка не найдена');
    if (check.rows[0].userId !== userId)
      throw new ForbiddenException('Нет доступа к этому сеансу');
    if (check.rows[0].finishedAt)
      throw new ForbiddenException('Сессия уже закончена');

    return this.trainingService.finishSession(Number(id));
  }

  // HISTORY
  @Get('history')
  async history(@Req() req) {
    return this.trainingService.history(req.user.id);
  }

  // NEXT WORD
  @Get('session/:id/next-word')
  async nextWord(@Param('id') sessionId: number, @Req() req) {
    const userId = req.user.id;

    const check = await this.pool.query(
      `SELECT * FROM "TrainingSession" WHERE id = $1`,
      [sessionId]
    );
    if (!check.rows.length) throw new NotFoundException('Тренировка не найдена');
    if (check.rows[0].userId !== userId)
      throw new ForbiddenException('Нет доступа к этому сеансу');

    return this.trainingService.getNextWord(sessionId, userId);
  }

  // ANSWER (FIXED)
  @Post('answer')
  async answer(
    @Req() req,
    @Body()
    body: {
      sessionId: number;
      wordId: number;
      correct: boolean;
      userAnswer: string | null;
    },
  ) {
    const userId = req.user.id;

    const check = await this.pool.query(
      `SELECT * FROM "TrainingSession" WHERE id = $1`,
      [body.sessionId],
    );
    if (!check.rows.length) throw new NotFoundException('Тренировка не найдена');
    if (check.rows[0].userId !== userId)
      throw new ForbiddenException('Нет доступа к этому сеансу');

    return this.trainingService.addAnswer(
      body.sessionId,
      body.wordId,
      body.correct,
      body.userAnswer
    );
  }

  // SESSION DETAILS
  @Get('session/:id')
  async getSession(@Param('id') id: number, @Req() req) {
    const userId = req.user.id;

    const check = await this.pool.query(
      `SELECT * FROM "TrainingSession" WHERE id = $1`,
      [id]
    );
    if (!check.rows.length) throw new NotFoundException('Тренировка не найдена');
    if (check.rows[0].userId !== userId)
      throw new ForbiddenException('Нет доступа к этому сеансу');

    return this.trainingService.getSessionDetails(id, userId);
  }

  // WEAK WORDS
  @Get('session/:id/weak-words')
  async getWeakWords(@Param('id') id: number, @Req() req) {
    const userId = req.user.id;

    const check = await this.pool.query(
      `SELECT * FROM "TrainingSession" WHERE id = $1`,
      [id]
    );
    if (!check.rows.length) throw new NotFoundException('Тренировка не найдена');
    if (check.rows[0].userId !== userId)
      throw new ForbiddenException('Нет доступа к этому сеансу');

    return this.trainingService.getWeakWords(Number(id), userId);
  }
}
