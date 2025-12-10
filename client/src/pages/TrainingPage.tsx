import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import {
  startSession,
  getNextWord,
  sendAnswer,
  finishSession,
  type TrainingDirection,
} from "../services/training";

import { motion, AnimatePresence, type Variants } from "framer-motion";

// Word type
interface TrainingWord {
  id: number;
  term: string;
  correctAnswer: string;
  options: string[];
}

// Progress bar
function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = total === 0 ? 0 : (current / total) * 100;

  return (
    <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
      <motion.div
        className="h-full bg-blue-500"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

const cardVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 180, damping: 18 },
  },
  exit: { opacity: 0, y: -15, scale: 0.92, transition: { duration: 0.2 } },
};

const shakeVariants: Variants = {
  shake: {
    x: [0, -8, 8, -8, 8, 0],
    transition: { duration: 0.4 },
  },
};

export default function TrainingPage() {
  const { id } = useParams();
  const dictionaryId = Number(id);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const direction = (searchParams.get("direction") as TrainingDirection) || "en-ru";

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [word, setWord] = useState<TrainingWord | null>(null);
  const [loading, setLoading] = useState(true);

  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [total] = useState(20);

  const [questionType, setQuestionType] = useState<"choice" | "input">("choice");
  const [userInput, setUserInput] = useState("");

  const [answerState, setAnswerState] =
    useState<"none" | "correct" | "wrong">("none");

  const [locked, setLocked] = useState(false);
  const [streak, setStreak] = useState(0);

  // prevent double-init
  const [initRunning, setInitRunning] = useState(false);

  // TTS
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    speechSynthesis.onvoiceschanged = () => {
      setVoices(speechSynthesis.getVoices());
    };
    setVoices(speechSynthesis.getVoices());
  }, []);

  function speak(text: string, lang: string) {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    const voice =
      voices.find((v) => v.lang.toLowerCase().startsWith(lang)) ||
      voices.find((v) => v.lang.toLowerCase().includes(lang)) ||
      voices[0];
    if (voice) utter.voice = voice;
    utter.lang = lang;
    utter.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function speakWord() {
    if (!word) return;
    speak(word.term, direction === "en-ru" ? "en" : "ru");
  }

  useEffect(() => {
    if (word) speakWord();
  }, [word]);

  function chooseQuestionType() {
    return Math.random() < 0.7 ? "choice" : "input";
  }

  async function init() {
    if (initRunning) return;
    setInitRunning(true);
    setLoading(true);
    try {
      const session = await startSession(dictionaryId, "default", direction);
      setSessionId(session.id);

      const first = await getNextWord(session.id);
      if ("done" in first && first.done) {
        setFinished(true);
      } else {
        setWord(first);
        setQuestionType(chooseQuestionType());
      }
    } catch (err) {
      console.error("Ошибка инициализации обучения:", err);
    } finally {
      setLoading(false);
      setInitRunning(false);
    }
  }

  useEffect(() => {
    init();
  }, [dictionaryId, direction]);

  async function loadNext() {
    if (!sessionId) return;
    const next = await getNextWord(sessionId);
    if ("done" in next && next.done) {
      await finishSession(sessionId);
      setFinished(true);
      return;
    }
    setWord(next);
    setAnswerState("none");
    setLocked(false);
    setUserInput("");
    setQuestionType(chooseQuestionType());
  }

  async function answer(isCorrect: boolean, userAnswer: string = "") {
    if (!sessionId || !word || locked) return;

    setLocked(true);
    setAnswerState(isCorrect ? "correct" : "wrong");

    await sendAnswer(sessionId, word.id, isCorrect, userAnswer);

    if (isCorrect) {
      setCorrectCount((p) => p + 1);
      setStreak((s) => s + 1);
    } else {
      setWrongCount((p) => p + 1);
      setStreak(0);
    }

    setTimeout(loadNext, 900);
  }

  function submitText() {
    if (!word) return;
    const clean = userInput.trim().toLowerCase();
    const correct = (word.correctAnswer || "").trim().toLowerCase();
    answer(clean === correct, userInput.trim());
  }

  async function finishEarly() {
    if (sessionId) await finishSession(sessionId);
    setFinished(true);
  }

  if (loading) return <div className="p-6 text-lg">Загрузка тренировки...</div>;

  if (finished)
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-6">
        <h1 className="text-3xl font-bold text-green-600">
          Обучение завершено! 🎉
        </h1>

        <div className="text-xl">
          Правильных:{" "}
          <b className="text-green-600">{correctCount}</b> • Неправильных:{" "}
          <b className="text-red-600">{wrongCount}</b>
        </div>

        <button
          onClick={() => navigate(`/training/session/${sessionId}`)}
          className="px-6 py-3 bg-blue-600 text-white rounded text-lg"
        >
          Просмотр подробной информации о сеансе
        </button>

        <button
          onClick={() => navigate("/training-history")}
          className="px-5 py-2 bg-gray-300 rounded"
        >
          Назад к истории
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Обучение ({direction.toUpperCase()})</h1>

      <ProgressBar current={correctCount + wrongCount} total={total} />

      {streak > 1 && (
        <motion.div
          key={streak}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-yellow-500 font-bold text-xl"
        >
          🔥 {streak} комбо!
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {word && (
          <motion.div
            key={word.id}
            variants={{ ...cardVariants, ...shakeVariants }}
            initial="initial"
            animate={answerState === "wrong" ? "shake" : "animate"}
            exit="exit"
            className={`p-6 border rounded shadow text-center space-y-4 bg-white ${
              answerState === "correct"
                ? "border-green-400"
                : answerState === "wrong"
                ? "border-red-400"
                : ""
            }`}
          >
            <div className="text-3xl font-bold flex items-center justify-center gap-3">
              {word.term}
              <button
                onClick={speakWord}
                disabled={locked}
                className="text-blue-600 hover:text-blue-800 text-2xl"
              >
                🔊
              </button>
            </div>

            {questionType === "choice" && (
              <div className="grid grid-cols-1 gap-3 mt-4">
                {word.options.map((opt: string, idx: number) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={locked}
                    onClick={() =>
                      answer(
                        opt.trim().toLowerCase() ===
                          word.correctAnswer.trim().toLowerCase(),
                        opt
                      )
                    }
                    className="px-4 py-2 rounded text-lg border bg-gray-100"
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            )}

            {questionType === "input" && (
              <div className="space-y-4 mt-4">
                <input
                  type="text"
                  disabled={locked}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full p-3 border rounded text-lg"
                  placeholder="Перевод текста..."
                />
                <button
                  onClick={submitText}
                  disabled={locked || userInput.trim() === ""}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-lg"
                >
                  Показать
                </button>
              </div>
            )}

            {locked && (
              <div className="pt-3 text-lg font-medium">
                Правильный ответ:{" "}
                <span className="text-blue-700">{word.correctAnswer}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center pt-4">
        <button
          onClick={finishEarly}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Завершить раньше
        </button>
      </div>
    </div>
  );
}
