import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class StatisticsService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async getUserStatistics(userId: number) {
    // 1. Total words
    const totalWordsQ = await this.pool.query(
      `SELECT COUNT(*)
      FROM "Word" w
      JOIN "Dictionary" d ON d.id = w."dictionaryId"
      WHERE d."userId" = $1`,
      [userId]
    );
    const totalWords = Number(totalWordsQ.rows[0].count);

    // 2. Learned words
    const learnedQ = await this.pool.query(
      `SELECT COUNT(*)
      FROM "Word" w
      JOIN "Dictionary" d ON d.id = w."dictionaryId"
      WHERE d."userId" = $1 AND w.repetitions >= 4`,
      [userId]
    );
    const learned = Number(learnedQ.rows[0].count);

    // 3. Due words
    const dueQ = await this.pool.query(
      `SELECT COUNT(*)
      FROM "Word" w
      JOIN "Dictionary" d ON d.id = w."dictionaryId"
      WHERE d."userId" = $1
        AND (w."nextReview" IS NULL OR w."nextReview" <= NOW())`,
      [userId]
    );
    const due = Number(dueQ.rows[0].count);

    // 4. Answers (correct + wrong)
    const answersQ = await this.pool.query(
      `SELECT a.correct
      FROM "TrainingAnswer" a
      JOIN "TrainingSession" s ON s.id = a."sessionId"
      WHERE s."userId" = $1`,
      [userId]
    );

    const answers = answersQ.rows;
    const correct = answers.filter(a => a.correct).length;
    const wrong = answers.filter(a => !a.correct).length;

    const accuracy = answers.length
      ? Math.round((correct / answers.length) * 100)
      : 0;

    // 5. Streak
    let streak = 0;
    for (let i = answers.length - 1; i >= 0; i--) {
      if (answers[i].correct) streak++;
      else break;
    }

    // 6. Hardest words
    const hardQ = await this.pool.query(
      `SELECT w.id, w.term, w.translation,
              SUM(CASE WHEN a.correct = false THEN 1 ELSE 0 END) AS wrong_count
      FROM "TrainingAnswer" a
      JOIN "Word" w ON w.id = a."wordId"
      JOIN "TrainingSession" s ON s.id = a."sessionId"
      JOIN "Dictionary" d ON d.id = w."dictionaryId"
      WHERE s."userId" = $1
      GROUP BY w.id
      HAVING SUM(CASE WHEN a.correct = false THEN 1 ELSE 0 END) > 0
      ORDER BY wrong_count DESC
      LIMIT 5`,
      [userId]
    );

    return {
      totalWords,
      learned,
      due,
      correct,
      wrong,
      accuracy,
      streak,
      topHard: hardQ.rows,
    };
  }
}
