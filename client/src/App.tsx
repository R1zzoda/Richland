import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DictionariesPage from "./pages/DictionariesPage";
import WordsPage from "./pages/WordsPage";
import TrainingPage from "./pages/TrainingPage";
import TrainingHistoryPage from "./pages/TrainingHistoryPage";
import TrainingSessionPage from "./pages/TrainingSessionPage";
import DashboardPage from "./pages/DashboardPage";
import StatisticsPage from "./pages/StatisticsPage";

import ProtectedRoute from "./router/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      {/* 👇 ЭТО ГЛАВНОЕ — решает проблему */}
      <Route
        path="/"
        element={
          localStorage.getItem("token")
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* PUBLIC */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* PROTECTED */}
      <Route
        path="/dictionaries"
        element={
          <ProtectedRoute>
            <Layout>
              <DictionariesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/words/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <WordsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/training/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TrainingPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/training-history"
        element={
          <ProtectedRoute>
            <Layout>
              <TrainingHistoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/training/session/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TrainingSessionPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <Layout>
              <StatisticsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
