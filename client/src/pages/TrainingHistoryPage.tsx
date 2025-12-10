import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTrainingHistory } from "../services/training";

interface TrainingSession {
  id: number;
  localNumber: number;
  dictionaryId: number;
  mode: string;
  correct: number;
  wrong: number;
  startedAt: string;
  finishedAt: string | null;
}

export default function TrainingHistoryPage() {
  const [history, setHistory] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();

  async function load() {
    try {
      const data = await getTrainingHistory();

      // сортируем от новых к старым
      const sorted = [...data].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );

      setHistory(sorted);
    } catch (err) {
      console.error("Ошибка загрузки истории:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-6 text-lg">Загрузка истории...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">История обучения</h1>

      {history.length === 0 && (
        <div className="text-gray-600">
          У вас еще нет тренировок.
        </div>
      )}

      <div className="space-y-4">
        {history.map((s) => (
          <div
            key={s.id}
            className="border rounded p-4 bg-white shadow-sm space-y-2"
          >
            <div className="font-bold text-xl">Обучение #{s.localNumber}</div>

            <div className="text-gray-700">
              Словарь ID:
              <span className="font-semibold"> {s.dictionaryId}</span>
            </div>

            <div className="text-gray-700">
              Режим: <span className="font-semibold">{s.mode}</span>
            </div>

            <div className="text-gray-700">
              Правильных:
              <span className="text-green-600"> {s.correct}</span>
              {" • "}
              Неправильных:
              <span className="text-red-600"> {s.wrong}</span>
            </div>

            <div className="text-gray-700">
              Начало: {new Date(s.startedAt).toLocaleString()}
            </div>

            <div className="text-gray-700">
              Конец:{" "}
              {s.finishedAt
                ? new Date(s.finishedAt).toLocaleString()
                : "Не закончено"}
            </div>

            <button
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => nav(`/training/session/${s.id}`)}
            >
              Просмотр подробной информации
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
