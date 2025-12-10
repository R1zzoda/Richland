import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getWords,
  createWord,
  deleteWord,
  updateWord,
} from "../services/words";
import type { WordDTO } from "../services/words";

export default function WordsPage() {
  const { id } = useParams(); // dictionaryId
  const dictionaryId = Number(id);

  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editWord, setEditWord] = useState<any | null>(null);

  const emptyForm: WordDTO = {
    term: "",
    translation: "",
    transcription: "",
    example: "",
    difficulty: 1,
  };

  const [form, setForm] = useState<WordDTO>(emptyForm);

  async function loadWords() {
    setLoading(true);
    const data = await getWords(dictionaryId);
    setWords(data);
    setLoading(false);
  }

  useEffect(() => {
    loadWords();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createWord(dictionaryId, form);
    setForm(emptyForm);
    setShowForm(false);
    loadWords();
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editWord) return;

    await updateWord(editWord.id, form);
    setEditWord(null);
    setForm(emptyForm);
    setShowForm(false);
    loadWords();
  }

  function startEdit(word: any) {
    setEditWord(word);
    setForm({
      term: word.term,
      translation: word.translation,
      transcription: word.transcription,
      example: word.example,
      difficulty: word.difficulty,
    });
    setShowForm(true);
  }

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Слова в словаре #{id}</h1>

      {/* Add/Edit Word Button */}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => {
          setShowForm(!showForm);
          setEditWord(null);
          setForm(emptyForm);
        }}
      >
        {editWord ? "Отменить редактирование" : "+ Добавить слово"}
      </button>

      {/* Word Form */}
      {showForm && (
        <form
          onSubmit={editWord ? handleUpdate : handleCreate}
          className="bg-white shadow p-4 rounded space-y-3"
        >
          <h2 className="text-xl font-bold">
            {editWord ? "Редактировать слово" : "Добавить слово"}
          </h2>

          <input
            className="border p-2 w-full"
            placeholder="Термин"
            value={form.term}
            onChange={(e) => setForm({ ...form, term: e.target.value })}
          />

          <input
            className="border p-2 w-full"
            placeholder="Перевод"
            value={form.translation}
            onChange={(e) =>
              setForm({ ...form, translation: e.target.value })
            }
          />

          <input
            className="border p-2 w-full"
            placeholder="Транскрипция (необязательно)"
            value={form.transcription}
            onChange={(e) =>
              setForm({ ...form, transcription: e.target.value })
            }
          />

          <input
            className="border p-2 w-full"
            placeholder="Пример (необязательно)"
            value={form.example}
            onChange={(e) =>
              setForm({ ...form, example: e.target.value })
            }
          />

          <select
            className="border p-2 w-full"
            value={form.difficulty}
            onChange={(e) =>
              setForm({ ...form, difficulty: Number(e.target.value) })
            }
          >
            <option value={1}>Легкий</option>
            <option value={2}>Средний</option>
            <option value={3}>Сложный</option>
          </select>

          <button className="bg-green-600 text-white px-4 py-2 rounded">
            {editWord ? "Сохранить изменения" : "Добавить слово"}
          </button>
        </form>
      )}

      {/* Words List */}
      <div className="space-y-3">
        {words.map((w) => (
          <div
            key={w.id}
            className="border rounded p-3 shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="font-bold">{w.term}</div>
              <div className="text-gray-600">{w.translation}</div>
            </div>

            <div className="flex gap-2">
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded"
                onClick={() => startEdit(w)}
              >
                Редактировать
              </button>

              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => {
                  if (confirm("Удалить слово?")) {
                    deleteWord(w.id).then(loadWords);
                  }
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
