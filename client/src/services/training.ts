import api from "../api";

export type TrainingDirection = "en-ru" | "ru-en";

// START SESSION
export async function startSession(
  dictionaryId: number,
  mode: string,
  direction: TrainingDirection
) {
  const res = await api.post("/training/start", {
    dictionaryId,
    mode,
    direction,
  });
  return res.data as {
    id: number;
  };
}

// NEXT WORD
export async function getNextWord(sessionId: number) {
  const res = await api.get(`/training/session/${sessionId}/next-word`);
  return res.data as
    | {
        done: false;
        id: number;
        term: string;
        correctAnswer: string;
        options: string[];
      }
    | { done: true };
}

// SEND ANSWER
export async function sendAnswer(
  sessionId: number,
  wordId: number,
  correct: boolean,
  userAnswer?: string | null
) {
  const res = await api.post("/training/answer", {
    sessionId,
    wordId,
    correct,
    userAnswer: userAnswer ?? null,
  });
  return res.data;
}

// FINISH SESSION
export async function finishSession(sessionId: number) {
  const res = await api.post(`/training/finish/${sessionId}`);
  return res.data;
}

// SESSION DETAILS
export async function getSessionDetails(sessionId: number) {
  const res = await api.get(`/training/session/${sessionId}`);
  return res.data;
}

// WEAK WORDS
export async function getWeakWords(sessionId: number) {
  const res = await api.get(`/training/session/${sessionId}/weak-words`);
  return res.data;
}

export async function getTrainingHistory() {
  const res = await api.get("/training/history");
  return res.data;
}
