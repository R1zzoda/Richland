import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { DefaultDictionariesService } from '../seeder/default-dictionaries.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('PG_POOL') private readonly pool: Pool,
    private readonly defaultDictionariesService: DefaultDictionariesService
  ) {}

  async getUsers() {
    const result = await this.pool.query(
      'SELECT id, email, username, "createdAt" FROM "User" ORDER BY id'
    );
    return result.rows;
  }

  async findByEmail(email: string) {
    const result = await this.pool.query(
      'SELECT * FROM "User" WHERE email = $1 LIMIT 1',
      [email],
    );
    return result.rows[0] || null;
  }

  async findById(id: number) {
    const result = await this.pool.query(
      'SELECT id, email, username, "createdAt" FROM "User" WHERE id = $1',
      [id],
    );
    return result.rows[0] || null;
  }

  async createUser(dto: CreateUserDto) {
    const { email, password, username } = dto;

    const existing = await this.pool.query(
      'SELECT id FROM "User" WHERE email = $1 LIMIT 1',
      [email],
    );

    if (existing.rows.length > 0) {
      throw new BadRequestException('Электронная почта уже существует');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this.pool.query(
      `INSERT INTO "User" (email, password, username)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, "createdAt"`,
      [email, hashedPassword, username ?? null],
    );

    const user = result.rows[0];

    // Создаём стандартные словари и слова
    await this.defaultDictionariesService.createDefaultsForUser(user.id);

    return user;
  }
}
