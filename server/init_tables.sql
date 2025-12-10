-- Создание таблиц вручную
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Dictionary" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    "languageFrom" VARCHAR(50) NOT NULL,
    "languageTo" VARCHAR(50) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Word" (
    id SERIAL PRIMARY KEY,
    "dictionaryId" INTEGER NOT NULL,
    term VARCHAR(255) NOT NULL,
    translation VARCHAR(255) NOT NULL,
    transcription VARCHAR(255),
    example TEXT,
    difficulty INTEGER DEFAULT 1,
    "lastReviewed" TIMESTAMP,
    "nextReview" TIMESTAMP,
    repetitions INTEGER DEFAULT 0,
    FOREIGN KEY ("dictionaryId") REFERENCES "Dictionary"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "TrainingSession" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "dictionaryId" INTEGER,
    mode VARCHAR(50) NOT NULL,
    "startedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP,
    correct INTEGER DEFAULT 0,
    wrong INTEGER DEFAULT 0,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY ("dictionaryId") REFERENCES "Dictionary"(id)
);

CREATE TABLE IF NOT EXISTS "Statistics" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER UNIQUE NOT NULL,
    "totalLearned" INTEGER DEFAULT 0,
    accuracy FLOAT DEFAULT 0.0,
    "streakDays" INTEGER DEFAULT 0,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE "Dictionary" (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_user
      FOREIGN KEY(userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE "Word" (
    id SERIAL PRIMARY KEY,
    dictionaryId INTEGER NOT NULL,
    original TEXT NOT NULL,
    translation TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_dictionary
      FOREIGN KEY(dictionaryId) REFERENCES "Dictionary"(id) ON DELETE CASCADE
);

CREATE TABLE "WordProgress" (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    wordId INTEGER NOT NULL,
    progressLevel INTEGER DEFAULT 0,  -- 0–5
    lastReviewed TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_user_progress
      FOREIGN KEY(userId) REFERENCES "User"(id) ON DELETE CASCADE,

    CONSTRAINT fk_word_progress
      FOREIGN KEY(wordId) REFERENCES "Word"(id) ON DELETE CASCADE
);
