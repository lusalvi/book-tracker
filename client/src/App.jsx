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

import AuthCallbackPage from "./pages/AuthCallbackPage";

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
    user?.email?.split("@")[0] ||
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
        {/* Contenedor principal con sombra sutil y borde */}
        <div className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
          {/* Barra superior con degradado sutil */}
          <div className="bg-gradient-to-r from-stone-50 to-stone-100/50 px-6 py-5 border-b border-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Título con icono */}
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-stone-100 shadow-sm p-2">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-stone-800 md:text-3xl">
                    Mi biblioteca
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Gestiona tu colección personal
                  </p>
                </div>
              </div>

              {/* Usuario y logout mejorado */}
              {user && (
                <div className="flex items-center gap-3">
                  {/* Avatar con iniciales */}
                  <div className="flex items-center gap-3 rounded-full bg-stone-100 py-1.5 px-4 pr-3 border border-stone-200">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-stone-600 to-stone-800 text-xs font-semibold text-white shadow-sm">
                      {displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-stone-600">
                      ¡Hola,{" "}
                      <span className="text-stone-700">{displayName}!</span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      localStorage.removeItem("book_token");
                      localStorage.removeItem("book_user");
                      window.location.href = "/login";
                    }}
                    className="group flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-sm transition-all hover:border-stone-300 hover:bg-stone-50 hover:shadow active:scale-95"
                  >
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
          </div>

          {/* Tabs mejorados */}
          <nav className="bg-white">
            <NavTabs page={page} setPage={setPage} />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl">
        {page === "home" && <HomePage onOpen={setOpen} />}
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
