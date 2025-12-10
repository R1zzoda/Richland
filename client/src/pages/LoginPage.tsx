import { useState } from "react";
import { loginUser } from "../services/auth";
import { saveToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ email, password });
      saveToken(data.access_token);

      nav("/dictionaries");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка авторизации");
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold">Авторизация</h1>

        {error && <div className="text-red-500">{error}</div>}

        <input
          type="email"
          className="w-full border p-2 rounded"
          placeholder="Электронная почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 rounded"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Авторизоваться
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => nav("/register")}
            className="text-blue-600 underline"
          >
            Зарегистрироваться
          </button>
        </div>

      </form>
    </div>
  );
}
