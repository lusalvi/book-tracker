// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import NavTabs from "./components/NavTabs.jsx";
import DetailPanel from "./components/DetailPanel.jsx";

import HomePage from "./pages/HomePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import GoalsPage from "./pages/GoalsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

import { useBooks } from "./hooks/useBooks.js";

import AuthCallbackPage from './pages/AuthCallbackPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-sm text-stone-500">Cargando…</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

/** Shell autenticado: toda tu UI principal */
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

  const { user } = useAuth();
  const displayName = 
    user?.user_metadata?.full_name || 
    (user?.user_metadata?.nombre && user?.user_metadata?.apellido 
      ? `${user.user_metadata.nombre} ${user.user_metadata.apellido}` 
      : user?.user_metadata?.nombre) ||
    user?.email?.split('@')[0] || 
    "Usuario";

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
          {/* Título */}
          <h1 className="text-2xl font-bold tracking-tight text-stone-800 md:text-3xl">
            Mi biblioteca
          </h1>

          {/* Saludo + Logout */}
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-stone-700">Hola, {displayName}</span>

              <button
                onClick={() => {
                  // limpiar credenciales del frontend
                  localStorage.removeItem("book_token");
                  localStorage.removeItem("book_user");
                  // redirigir al login
                  window.location.href = "/login";
                }}
                className="flex items-center gap-2 rounded-md border px-3 py-1 text-xs hover:bg-stone-50"
              >
                {/* Icono de salida */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0-2h-1a2 2 0 00-2 2v14a2 2 0 002 2h1"
                  />
                </svg>
                Salir
              </button>
            </div>
          )}
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
        EGI Programacion Web
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      />
      {/* opcional, para redirigir cualquier ruta desconocida */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
