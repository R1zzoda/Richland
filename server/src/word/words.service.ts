import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { TrainingService } from '../training/training.service';

@Injectable()
export class WordsService {
  constructor(
    @Inject('PG_POOL') private readonly pool: Pool,
    private readonly trainingService: TrainingService,
  ) {}

  // --------------------------
  // CREATE WORD
  // --------------------------
  async create(userId: number, dto: CreateWordDto) {
    const result = await this.pool.query(
      `
      INSERT INTO "Word"
      ("dictionaryId", term, translation, transcription, example, difficulty)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [
        dto.dictionaryId,
        dto.term,
        dto.translation,
        dto.transcription ?? null,
        dto.example ?? null,
        dto.difficulty ?? 1,
      ],
    );

    return result.rows[0];
  }

  // --------------------------
  // GET WORDS BY DICTIONARY
  // --------------------------
  async getByDictionary(dictionaryId: number) {
    const res = await this.pool.query(
      `SELECT * FROM "Word" WHERE "dictionaryId" = $1 ORDER BY id ASC`,
      [dictionaryId],
    );
    return res.rows;
  }

  // --------------------------
  // UPDATE WORD
  // --------------------------
  async update(wordId: number, dto: UpdateWordDto) {
    const old = await this.pool.query(`SELECT * FROM "Word" WHERE id = $1`, [
      wordId,
    ]);

    if (!old.rows.length) {
      throw new NotFoundException('Слово не найдено');
    }

    const current = old.rows[0];

    const updated = await this.pool.query(
      `
      UPDATE "Word"
      SET term = $1,
          translation = $2,
          transcription = $3,
          example = $4,
          difficulty = $5
      WHERE id = $6
      RETURNING *;
      `,
      [
        dto.term ?? current.term,
        dto.translation ?? current.translation,
        dto.transcription ?? current.transcription,
        dto.example ?? current.example,
        dto.difficulty ?? current.difficulty,
        wordId,
      ],
    );

    return updated.rows[0];
  }

  // --------------------------
  // SM-2 IMPLEMENTATION + logging answer into session
  // --------------------------
  async answerWord(
    wordId: number,
    isCorrect: boolean,
    userId: number,
    sessionId: number,
  ) {
    // 1) load word
    const result = await this.pool.query(`SELECT * FROM "Word" WHERE id = $1`, [
      wordId,
    ]);
    const word = result.rows[0];
    if (!word) throw new NotFoundException('Слово не найдено');

    // 2) SM-2 calculation
    let easiness = word.easiness ?? 2.5;
    let interval = word.intervalDays ?? 1;
    let repetitions = word.repetitions ?? 0;

    if (!isCorrect) {
      easiness = Math.max(1.3, easiness - 0.2);
      interval = 1;
      repetitions = 0;
    } else {
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 6;
      else interval = Math.round(interval * easiness);

      repetitions += 1;
      easiness = easiness + 0.1;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    // 3) update word
    const updated = await this.pool.query(
      `
      UPDATE "Word"
      SET
        easiness = $1,
        "intervalDays" = $2,
        repetitions = $3,
        "lastReviewed" = NOW(),
        "nextReview" = $4
      WHERE id = $5
      RETURNING *
      `,
      [easiness, interval, repetitions, nextReview, wordId],
    );

    // 4) save answer in training session and update session stats
    // trainingService.addAnswer(sessionId, wordId, correct)
    await this.trainingService.addAnswer(sessionId, wordId, isCorrect);

    return updated.rows[0];
  }

  // --------------------------
  // DELETE WORD
  // --------------------------
  async delete(wordId: number) {
    await this.pool.query(`DELETE FROM "Word" WHERE id = $1`, [wordId]);
    return { message: 'Word deleted' };
  }

  // --------------------------
  // GET WORDS DUE FOR REVIEW
  // --------------------------
  async getDueWords(userId: number) {
    const result = await this.pool.query(
      `
      SELECT w.*
      FROM "Word" w
      JOIN "Dictionary" d ON d.id = w."dictionaryId"
      WHERE d."userId" = $1
        AND (w."nextReview" IS NULL OR w."nextReview" <= NOW())
      ORDER BY w.id;
      `,
      [userId],
    );

    return result.rows;
  }
}
