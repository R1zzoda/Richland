import { useEffect, useState } from "react";
import { getStatistics } from "../services/statistics";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStatistics();
        setStats(data);
      } catch (e) {
        console.error("Не удалось загрузить статистику", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-6">Загрузка...</div>;
  if (!stats) return <div className="p-6">Статистика отсутствует</div>;

  const pctLearned = stats.totalWords ? Math.round((stats.learned / stats.totalWords) * 100) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Приборная панель</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Общее количество слов</div>
          <div className="text-3xl font-bold">{stats.totalWords}</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Изученные</div>
          <div className="text-3xl font-bold">{stats.learned}</div>
          <div className="text-sm text-gray-500 mt-2">({pctLearned}% изученные)</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Сделать сейчас</div>
          <div className="text-3xl font-bold">{stats.due}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-sm text-gray-500">Точность</div>
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
          </div>
          <div className="text-sm text-gray-500">Полоса: <span className="font-semibold">{stats.streak} дни</span></div>
        </div>

        <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
          <div
            className="h-full bg-green-500"
            style={{ width: `${Math.min(stats.accuracy, 100)}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Топ трудных слов</h2>
        {stats.topHard.length === 0 && <div className="text-gray-500">Пока нет трудных слов</div>}
        <ul className="space-y-2">
          {stats.topHard.map((w: any) => (
            <li key={w.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{w.term}</div>
                <div className="text-gray-600">{w.translation}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
