import api from "../api";

export async function getDictionaries() {
  const res = await api.get("/dictionaries");
  return res.data;
}

export async function createDictionary(data: {
  title: string;
  languageFrom: string;
  languageTo: string;
}) {
  const res = await api.post("/dictionaries", data);
  return res.data;
}

export async function deleteDictionary(id: number) {
  const res = await api.delete(`/dictionaries/${id}`);
  return res.data;
}
