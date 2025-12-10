import { useEffect, useState } from "react";
import {
  getDictionaries,
  createDictionary,
  deleteDictionary,
} from "../services/dictionaries";
import { useNavigate } from "react-router-dom";

export default function DictionariesPage() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dictionaries, setDictionaries] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [langFrom, setLangFrom] = useState("");
  const [langTo, setLangTo] = useState("");

  async function load() {
    setLoading(true);
    const data = await getDictionaries();
    setDictionaries(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createDictionary({
      title,
      languageFrom: langFrom,
      languageTo: langTo,
    });
    setTitle("");
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить этот словарь?")) return;
    await deleteDictionary(id);
    load();
  }

  if (loading) return <div className="p-10">Загрузка...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <button
        className="bg-purple-600 text-white px-4 py-2 rounded"
        onClick={() => nav("/training-history")}
      >
        История обучения
      </button>

      <h1 className="text-3xl font-bold">Мои словари</h1>

      {/* --- Create Form --- */}
      <form
        onSubmit={handleCreate}
        className="bg-white p-4 rounded shadow space-y-3"
      >
        <input
          className="border p-2 w-full"
          placeholder="Название словаря"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex gap-3">
          <input
            className="border p-2 w-full"
            placeholder="EN"
            value={langFrom}
            onChange={(e) => setLangFrom(e.target.value)}
          />
          <input
            className="border p-2 w-full"
            placeholder="RU"
            value={langTo}
            onChange={(e) => setLangTo(e.target.value)}
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Создать
        </button>
      </form>

      {/* --- List --- */}
      <div className="space-y-3">
        {dictionaries.map((d) => (
          <div
            key={d.id}
            className="bg-white border p-4 rounded flex justify-between items-center"
          >
            <div>
              <div className="font-bold">{d.title}</div>
              <div className="text-gray-500 text-sm">
                {d.languageFrom} → {d.languageTo}
              </div>
            </div>

            <div className="flex gap-2 items-start">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => nav(`/words/${d.id}`)}
              >
                Открыть
              </button>

              {/* START TRAINING BUTTONS */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => nav(`/training/${d.id}?direction=en-ru`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  EN → RU
                </button>

                <button
                  onClick={() => nav(`/training/${d.id}?direction=ru-en`)}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  RU → EN
                </button>
              </div>
              {/* END TRAINING BUTTONS */}

              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => handleDelete(d.id)}
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
