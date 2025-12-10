import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

interface WordRow {
  id: number;
  term: string;
  translation: string;
  example: string | null;
  transcription?: string | null;
  repetitions: number;
  nextReview: Date | null;
  dictionaryId: number;
}

@Injectable()
export class TrainingService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  // ======================================================
  // START SESSION (transaction + advisory lock)
  // ======================================================
  async startSession(
    userId: number,
    dictionaryId: number,
    mode: string,
    direction: 'en-ru' | 'ru-en' = 'en-ru'
  ) {
    try {
      await this.pool.query('BEGIN');
      await this.pool.query(
        'SELECT pg_advisory_xact_lock($1, $2)',
        [userId, dictionaryId]
      );

      const existing = await this.pool.query(
        `
        SELECT *
        FROM "TrainingSession"
        WHERE "userId" = $1
          AND "dictionaryId" = $2
          AND "finishedAt" IS NULL
        ORDER BY "startedAt" DESC
        LIMIT 1
        `,
        [userId, dictionaryId],
      );

      if (existing.rows.length) {
        await this.pool.query('COMMIT');
        return existing.rows[0];
      }

      const count = await this.pool.query(
        `SELECT COUNT(*) FROM "TrainingSession" WHERE "userId" = $1`,
        [userId]
      );

      const localNumber = Number(count.rows[0].count) + 1;

      const result = await this.pool.query(
        `
        INSERT INTO "TrainingSession"
          ("userId", "dictionaryId", "mode", "direction", "localNumber")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [userId, dictionaryId, mode, direction, localNumber],
      );

      await this.pool.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await this.pool.query('ROLLBACK');
      throw err;
    }
  }

  // ======================================================
  // FINISH SESSION
  // ======================================================
  async finishSession(sessionId: number) {
    const result = await this.pool.query(
      `
      UPDATE "TrainingSession"
      SET "finishedAt" = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [sessionId],
    );

    if (!result.rows.length) throw new NotFoundException('Сессия не найдена');
    return result.rows[0];
  }

  // ======================================================
  // ADD ANSWER (+ SRS)
  // ======================================================
  async addAnswer(
    sessionId: number,
    wordId: number,
    correct: boolean,
    userAnswer: string | null = null
  ) {
    await this.pool.query(
      `
      INSERT INTO "TrainingAnswer" ("sessionId", "wordId", correct, "userAnswer")
      VALUES ($1, $2, $3, $4)
      `,
      [sessionId, wordId, correct, userAnswer],
    );

    await this.pool.query(
      `
      UPDATE "TrainingSession"
      SET correct = correct + $2,
          wrong = wrong + $3
      WHERE id = $1
      `,
      [sessionId, correct ? 1 : 0, correct ? 0 : 1],
    );

    const w = await this.pool.query(`SELECT repetitions FROM "Word" WHERE id = $1`, [wordId]);
    if (!w.rows.length) throw new NotFoundException('Слово не найдено');

    const reps = w.rows[0].repetitions ?? 0;
    const nextReps = correct ? reps + 1 : Math.max(0, reps - 1);

    const now = new Date();
    let nextReview: Date;

    switch (nextReps) {
      case 0: nextReview = new Date(now.getTime() + 10 * 60 * 1000); break;
      case 1: nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000); break;
      case 2: nextReview = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); break;
      case 3: nextReview = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); break;
      case 4: nextReview = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); break;
      default: nextReview = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    await this.pool.query(
      `
      UPDATE "Word"
      SET repetitions = $1, "nextReview" = $2
      WHERE id = $3
      `,
      [nextReps, nextReview, wordId],
    );
  }

  // ======================================================
  // HISTORY
  // ======================================================
  async history(userId: number) {
    const res = await this.pool.query(
      `
      SELECT *
      FROM "TrainingSession"
      WHERE "userId" = $1
      ORDER BY "localNumber" DESC
      `,
      [userId],
    );
    return res.rows;
  }

  // ======================================================
  // NEXT WORD (fix: guaranteed fallback + done)
  // ======================================================
  async getNextWord(sessionId: number, userId: number) {
    const sessionRes = await this.pool.query(
      `SELECT * FROM "TrainingSession" WHERE id = $1 AND "userId" = $2`,
      [sessionId, userId],
    );
    if (!sessionRes.rows.length) throw new NotFoundException('Тренировка не найдена');

    const session = sessionRes.rows[0];

    const ans = await this.pool.query(
      `SELECT "wordId" FROM "TrainingAnswer" WHERE "sessionId" = $1`,
      [sessionId],
    );
    const answeredIds = ans.rows.map(r => r.wordId);
    const notIn = answeredIds.length ? `AND id NOT IN (${answeredIds.join(',')})` : '';

    let candidates: WordRow[] = [];

    // 1. due
    const due = await this.pool.query(
      `
      SELECT * FROM "Word"
      WHERE "dictionaryId" = $1
        AND ( "nextReview" IS NULL OR "nextReview" <= NOW() )
        ${notIn}
      LIMIT 20
      `,
      [session.dictionaryId],
    );
    candidates = due.rows;

    // 2. new
    if (!candidates.length) {
      const news = await this.pool.query(
        `
        SELECT * FROM "Word"
        WHERE "dictionaryId" = $1
          AND repetitions = 0
          ${notIn}
        LIMIT 20
        `,
        [session.dictionaryId],
      );
      candidates = news.rows;
    }

    // 3. ALL remaining words
    if (!candidates.length) {
      const all = await this.pool.query(
        `
        SELECT * FROM "Word"
        WHERE "dictionaryId" = $1
        ${notIn}
        LIMIT 20
        `,
        [session.dictionaryId],
      );
      candidates = all.rows;
    }

    // NOTHING AT ALL → FINISH
    if (!candidates.length) {
      return { done: true };
    }

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    const term = session.direction === 'en-ru' ? chosen.term : chosen.translation;
    const correctAnswer = session.direction === 'en-ru' ? chosen.translation : chosen.term;

    const distractRes = await this.pool.query(
      `
      SELECT term, translation
      FROM "Word"
      WHERE id != $1
      ORDER BY RANDOM()
      LIMIT 3
      `,
      [chosen.id],
    );

    const distractors = distractRes.rows.map(row =>
      session.direction === 'en-ru' ? row.translation : row.term,
    );

    return {
      id: chosen.id,
      term,
      correctAnswer,
      options: [correctAnswer, ...distractors].sort(() => Math.random() - 0.5),
    };
  }

  // ======================================================
  // SESSION DETAILS
  // ======================================================
  async getSessionDetails(sessionId: number, userId: number) {
    const sess = await this.pool.query(
      `SELECT * FROM "TrainingSession" WHERE id = $1 AND "userId" = $2`,
      [sessionId, userId],
    );
    if (!sess.rows.length) throw new NotFoundException('Тренировка не найдена');

    const answers = await this.pool.query(
      `
      SELECT ta.*, w.term, w.translation, w.example
      FROM "TrainingAnswer" ta
      JOIN "Word" w ON w.id = ta."wordId"
      WHERE ta."sessionId" = $1
      ORDER BY ta.id ASC
      `,
      [sessionId],
    );

    return { ...sess.rows[0], answers: answers.rows };
  }

  // ======================================================
  // WEAK WORDS
  // ======================================================
  async getWeakWords(sessionId: number, userId: number) {
    const sess = await this.pool.query(
      `SELECT * FROM "TrainingSession" WHERE id = $1 AND "userId" = $2`,
      [sessionId, userId]
    );
    if (!sess.rows.length) throw new NotFoundException('Сессия не найдена');

    const res = await this.pool.query(
      `
      SELECT w.id, w.term, w.translation, w.example,
             SUM(CASE WHEN ta.correct = false THEN 1 ELSE 0 END) AS mistakes
      FROM "TrainingAnswer" ta
      JOIN "Word" w ON w.id = ta."wordId"
      WHERE ta."sessionId" = $1
      GROUP BY w.id
      HAVING SUM(CASE WHEN ta.correct = false THEN 1 ELSE 0 END) > 0
      ORDER BY mistakes DESC
      LIMIT 10
      `,
      [sessionId]
    );

    return res.rows;
  }
}
