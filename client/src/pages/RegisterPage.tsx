import { useState } from "react";
import { registerUser, loginUser } from "../services/auth";
import { saveToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
  });

  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await registerUser(form);

      // auto-login after registration
      const res = await loginUser({
        email: form.email,
        password: form.password,
      });

      saveToken(res.access_token);
      nav("/dictionaries");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка регистрации");
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold">Регистрация</h1>

        {error && <div className="text-red-500">{error}</div>}

        <input
          type="email"
          className="w-full border p-2 rounded"
          placeholder="Электронная почта"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="Имя пользователя"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          type="password"
          className="w-full border p-2 rounded"
          placeholder="Пароль"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Зарегистрироваться
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => nav("/login")}
            className="text-blue-600 underline"
          >
            Авторизоваться
          </button>
        </div>

      </form>
    </div>
  );
}
