import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';

@Injectable()
export class DictionariesService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  // -----------------------------
  // CREATE
  // -----------------------------
  async create(userId: number, dto: CreateDictionaryDto) {
    const { title, languageFrom, languageTo } = dto;

    // считаем локальный номер словаря
    const count = await this.pool.query(
      `SELECT COUNT(*) FROM "Dictionary" WHERE "userId" = $1`,
      [userId]
    );

    const localNumber = Number(count.rows[0].count) + 1;

    const result = await this.pool.query(
      `
      INSERT INTO "Dictionary"
      (title, "languageFrom", "languageTo", "userId", "localNumber")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [title, languageFrom, languageTo, userId, localNumber]
    );

    return result.rows[0];
  }

  // -----------------------------
  // GET ALL
  // -----------------------------
  async getAll(userId: number) {
    const result = await this.pool.query(
      `SELECT * FROM "Dictionary"
       WHERE "userId" = $1
       ORDER BY "localNumber" ASC`,
      [userId]
    );

    return result.rows;
  }

  // -----------------------------
  // UPDATE
  // -----------------------------
  async update(userId: number, id: number, dto: UpdateDictionaryDto) {
    const check = await this.pool.query(
      `SELECT * FROM "Dictionary" WHERE id = $1`,
      [id]
    );

    if (check.rows.length === 0) {
      throw new NotFoundException('Словарь не найден');
    }

    if (check.rows[0].userId !== userId) {
      throw new ForbiddenException('Доступа к этому словарю нет');
    }

    const { title, languageFrom, languageTo } = dto;

    const result = await this.pool.query(
      `
      UPDATE "Dictionary"
      SET 
        title = COALESCE($1, title),
        "languageFrom" = COALESCE($2, "languageFrom"),
        "languageTo" = COALESCE($3, "languageTo")
      WHERE id = $4
      RETURNING *
      `,
      [title, languageFrom, languageTo, id]
    );

    return result.rows[0];
  }

  // -----------------------------
  // DELETE
  // -----------------------------
  async delete(userId: number, id: number) {
    const check = await this.pool.query(
      `SELECT * FROM "Dictionary" WHERE id = $1`,
      [id]
    );

    if (check.rows.length === 0) {
      throw new NotFoundException('Словарь не найден');
    }

    if (check.rows[0].userId !== userId) {
      throw new ForbiddenException('Доступа к этому словарю нет');
    }

    await this.pool.query(`DELETE FROM "Dictionary" WHERE id = $1`, [id]);

    return { message: 'Словарь удален' };
  }
}
