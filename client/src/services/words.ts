// src/services/words.ts
import api from "../api";

export interface WordDTO {
  term: string;
  translation: string;
  transcription?: string;
  example?: string;
  difficulty: number;
}

export async function getWords(dictionaryId: number) {
  const res = await api.get(`/words/dictionary/${dictionaryId}`);
  return res.data;
}

export async function createWord(dictionaryId: number, dto: WordDTO) {
  const res = await api.post(`/words`, {
    dictionaryId,
    ...dto,
  });
  return res.data;
}

export async function deleteWord(id: number) {
  const res = await api.delete(`/words/${id}`);
  return res.data;
}

export async function updateWord(id: number, dto: WordDTO) {
  const res = await api.patch(`/words/${id}`, dto);
  return res.data;
}
