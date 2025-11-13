// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx"; // ← Cambiar a .jsx

import NavTabs from "./components/NavTabs.jsx";
import DetailPanel from "./components/DetailPanel.jsx";

import HomePage from "./pages/HomePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import GoalsPage from "./pages/GoalsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

import { useBooks } from "./hooks/useBooks.js";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 text-sm text-stone-500">Cargando…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

/** Shell autenticado: tu UI completa */
function AppShell() {
  const {
    books,
    loading,
    open,
    setOpen,
    page,
    setPage,
    handleAddReading,
    handleUpdateProgress,
    handleAddReview,
  } = useBooks();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-stone-500">Cargando libros...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-stone-50 px-4 py-8 md:px-8">
      <header className="mx-auto mb-6 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-stone-800 md:text-3xl">
            Mi biblioteca
          </h1>
        </div>
        <NavTabs page={page} setPage={setPage} />
      </header>

      <main className="mx-auto max-w-6xl">
        {page === "home" && <HomePage books={books} onOpen={setOpen} />}
        {page === "search" && <SearchPage onAddReading={handleAddReading} />}
        {page === "goals" && <GoalsPage books={books} />}
      </main>

      <DetailPanel
        book={open}
        onClose={() => setOpen(null)}
        onUpdateProgress={handleUpdateProgress}
        onAddReview={handleAddReview}
      />

      <footer className="mx-auto mt-10 max-w-6xl text-center text-xs text-stone-400">
        v4.0 • React + Tailwind + Supabase ✨
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
    </Routes>
  );
}