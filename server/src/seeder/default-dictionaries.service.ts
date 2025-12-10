import { Injectable, Inject } from "@nestjs/common";
import { Pool } from "pg";

@Injectable()
export class DefaultDictionariesService {
  constructor(
    @Inject("PG_POOL")
    private readonly pool: Pool
  ) {}

  // -----------------------------
  // WORD SETS
  // -----------------------------

  private beginner = [
    { term: "apple", translation: "яблоко", example: "I eat an apple every day." },
    { term: "dog", translation: "собака", example: "The dog is very friendly." },
    { term: "cat", translation: "кот", example: "The cat sleeps on the sofa." },
    { term: "water", translation: "вода", example: "I drink water." },
    { term: "book", translation: "книга", example: "This book is interesting." },
    { term: "sun", translation: "солнце", example: "The sun is shining." },
    { term: "milk", translation: "молоко", example: "I like warm milk." },
    { term: "car", translation: "машина", example: "My car is new." },
    { term: "house", translation: "дом", example: "This is my house." },
    { term: "friend", translation: "друг", example: "My friend helps me." },
    { term: "red", translation: "красный", example: "The apple is red." },
    { term: "blue", translation: "синий", example: "The sky is blue." },
    { term: "green", translation: "зеленый", example: "Grass is green." },
    { term: "school", translation: "школа", example: "I go to school." },
    { term: "work", translation: "работа", example: "I work every day." },
    { term: "food", translation: "еда", example: "The food is tasty." },
    { term: "music", translation: "музыка", example: "I listen to music." },
    { term: "phone", translation: "телефон", example: "My phone is charging." },
    { term: "table", translation: "стол", example: "The table is brown." },
    { term: "chair", translation: "стул", example: "This chair is comfortable." },
    { term: "city", translation: "город", example: "The city is big." },
    { term: "street", translation: "улица", example: "The street is empty." },
    { term: "happy", translation: "счастливый", example: "I feel happy today." },
    { term: "sad", translation: "грустный", example: "He looks sad." },
    { term: "fast", translation: "быстрый", example: "The car is fast." },
    { term: "slow", translation: "медленный", example: "The turtle is slow." },
    { term: "big", translation: "большой", example: "The house is big." },
    { term: "small", translation: "маленький", example: "The cat is small." },
    { term: "today", translation: "сегодня", example: "Today is a good day." },
    { term: "tomorrow", translation: "завтра", example: "See you tomorrow." }
  ];

  private intermediate = Array.from({ length: 40 }).map((_, i) => ({
    term: `word_${i + 1}`,
    translation: `слово_${i + 1}`,
    example: `Example sentence ${i + 1}.`
  }));

  private advanced = Array.from({ length: 80 }).map((_, i) => ({
    term: `advanced_${i + 1}`,
    translation: `продвинутое_${i + 1}`,
    example: `Advanced example ${i + 1}.`
  }));

  // -----------------------------
  // PUBLIC — CREATE DEFAULT SETS
  // -----------------------------
  async createDefaultsForUser(userId: number) {
    await this.createDictionary(userId, "Легкий", 1, this.beginner);
    await this.createDictionary(userId, "Средний", 2, this.intermediate);
    await this.createDictionary(userId, "Сложный", 3, this.advanced);

    console.log(`✓ Созданы словари по умолчанию для пользователя #${userId}`);
  }

  // -----------------------------
  // INSERT DICTIONARY + WORDS
  // -----------------------------
  private async createDictionary(
    userId: number,
    title: string,
    localNumber: number,
    words: { term: string; translation: string; example: string }[]
  ) {
    const dict = await this.pool.query(
      `
      INSERT INTO "Dictionary"
      ("userId", "title", "languageFrom", "languageTo", "localNumber")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [userId, title, "EN", "RU", localNumber]
    );

    const dictionaryId = dict.rows[0].id;

    for (const w of words) {
      await this.pool.query(
        `
        INSERT INTO "Word"
        ("dictionaryId", "term", "translation", "example")
        VALUES ($1, $2, $3, $4)
        `,
        [dictionaryId, w.term, w.translation, w.example]
      );
    }
  }
}
