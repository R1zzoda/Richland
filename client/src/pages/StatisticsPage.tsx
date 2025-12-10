import { useEffect, useState } from "react";
import { getStatistics } from "../services/statistics";

export default function StatisticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStatistics();
        setStats(data);
      } catch (err) {
        console.error("Statistics error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-6 text-lg">Загрузка статистики...</div>;

  if (!stats)
    return <div className="p-6 text-red-600">Не удалось загрузить статистику</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Ваша статистика</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Общее количество слов" value={stats.totalWords} />
        <StatCard title="Выученные слова" value={stats.learned} />
        <StatCard title="Подлежит пересмотру" value={stats.due} />
        <StatCard title="Правильные ответы" value={stats.correct} />
        <StatCard title="Неправильные ответы" value={stats.wrong} />
        <StatCard title="Точность" value={`${stats.accuracy}%`} />
        <StatCard title="Длина полосы" value={stats.streak} />
      </div>

      {/* Hardest Words */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-3">Самые трудные слова</h2>

        {stats.topHard.length === 0 ? (
          <div className="text-gray-500">Пока нет сложных слов 🎉</div>
        ) : (
          <ul className="space-y-2">
            {stats.topHard.map((w: any) => (
              <li
                key={w.id}
                className="p-3 bg-white shadow rounded border flex justify-between"
              >
                <div>
                  <b>{w.term}</b> — {w.translation}
                </div>
                <span className="text-red-600">ошибки: {w.errors}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="p-4 bg-white shadow rounded border text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-gray-600">{title}</div>
    </div>
  );
}
