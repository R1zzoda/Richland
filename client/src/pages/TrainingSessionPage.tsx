import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessionDetails, getWeakWords } from "../services/training";

export default function TrainingSessionPage() {
  const { id } = useParams();
  const sessionId = Number(id);

  const [session, setSession] = useState<any>(null);
  const [weakWords, setWeakWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();

  async function load() {
    try {
      const data = await getSessionDetails(sessionId);
      setSession(data);

      const ww = await getWeakWords(sessionId);
      setWeakWords(ww);
    } catch (err) {
      console.error("Ошибка при загрузке сеанса:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-6 text-lg">Загрузка...</div>;
  if (!session) return <div className="p-6 text-lg">Сессия не найдена</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <button
        className="mb-4 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        onClick={() => nav(-1)}
      >
        ← Назад
      </button>

      <h1 className="text-3xl font-bold">
        Учебная сессия #{session.localNumber}
      </h1>

      {/* SESSION INFO */}
      <div className="bg-white border p-4 rounded shadow space-y-2">
        <div>
          <b>Словарь:</b> {session.dictionaryId}
        </div>

        <div>
          <b>Режим:</b> {session.mode}
        </div>

        <div>
          <b>Словарь:</b>{" "}
          {session.direction === "en-ru" ? "EN → RU" : "RU → EN"}
        </div>

        <div>
          <b>Правильных:</b>{" "}
          <span className="text-green-600 font-bold">{session.correct}</span>
        </div>

        <div>
          <b>Неправильных:</b>{" "}
          <span className="text-red-600 font-bold">{session.wrong}</span>
        </div>

        <div>
          <b>Начало:</b> {new Date(session.startedAt).toLocaleString()}
        </div>

        <div>
          <b>Конец:</b>{" "}
          {session.finishedAt
            ? new Date(session.finishedAt).toLocaleString()
            : "Not finished"}
        </div>
      </div>

      {/* ANSWERS */}
      <h2 className="text-xl font-bold">Ответы</h2>

      <div className="space-y-3">
        {session.answers.map((a: any) => {
          // correct answer depends on direction
          const correctAnswer =
            session.direction === "en-ru" ? a.translation : a.term;

          return (
            <div
              key={a.id}
              className={`p-3 border rounded shadow ${
                a.correct
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">
                    {session.direction === "en-ru" ? a.term : a.translation}
                  </div>

                  <div className="text-gray-700">
                    Ваш ответ:{" "}
                    <span
                      className={
                        a.correct
                          ? "text-green-700"
                          : "text-red-700 font-bold"
                      }
                    >
                      {a.userAnswer || "(empty)"}
                    </span>
                  </div>

                  {!a.correct && (
                    <div className="text-gray-700 mt-1">
                      Правильный ответ:{" "}
                      <span className="text-blue-700 font-semibold">
                        {correctAnswer}
                      </span>
                    </div>
                  )}

                  {a.example && (
                    <div className="italic text-gray-500 text-sm mt-2">
                      {a.example}
                    </div>
                  )}
                </div>

                <div className="text-3xl font-bold">
                  {a.correct ? "✅" : "❌"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* WEAK WORDS */}
      {weakWords.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-red-600 mb-3">
            Слабые слова (Ошибки)
          </h2>

          <div className="space-y-3">
            {weakWords.map((w) => (
              <div
                key={w.id}
                className="p-3 border rounded bg-red-50 border-red-300 shadow-sm"
              >
                <div className="font-bold text-lg">{w.term}</div>
                <div className="text-gray-600">{w.translation}</div>

                <div className="text-red-700 font-semibold mt-1">
                  Ошибки: {w.mistakes}
                </div>

                {w.example && (
                  <div className="italic text-gray-500 text-sm mt-1">
                    {w.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
