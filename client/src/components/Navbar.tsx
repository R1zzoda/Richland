import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const base = "px-4 py-2 rounded hover:bg-gray-200 transition font-medium";
  const active = "bg-gray-300";

  return (
    <nav className="w-full bg-gray-100 border-b shadow-sm px-4 py-3 flex gap-4">
      <NavLink
        to="/dictionaries"
        className={({ isActive }) => (isActive ? `${base} ${active}` : base)}
      >
        Словари
      </NavLink>

      <NavLink
        to="/training-history"
        className={({ isActive }) => (isActive ? `${base} ${active}` : base)}
      >
        История тренировок
      </NavLink>

      <NavLink
        to="/statistics"
        className={({ isActive }) => (isActive ? `${base} ${active}` : base)}
      >
        Статистика
      </NavLink>

      <button
        onClick={logout}
        className="ml-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Выйти
      </button>
    </nav>
  );
}
