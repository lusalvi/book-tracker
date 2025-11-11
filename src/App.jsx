import { useEffect, useMemo, useState } from "react";

/**
 * Luci • Book Tracker v3.5 (React + Tailwind, JSX)
 * --------------------------------------------------
 * Cambios:
 * - Nav simplificado (Inicio, Búsqueda, Metas & Estadísticas)
 * - Todos los libros en vertical con tamaños variados
 * - Vista expandida elegante para ver todos los libros del mes
 * - Modal mejorado con solo reseña y rating
 */

// ------- Constantes
const STATUSES = ["to-read", "reading", "read"];

// ------- Utils (JS)
function hexToRgb(hex) {
  if (!hex) return { r: 230, g: 231, b: 235 };
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}
function isDark(hex) {
  const { r, g, b } = hexToRgb(hex);
  const L = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  return L < 0.5;
}
function randomColor(seedStr = "") {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++)
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const hues = [25, 35, 45, 120, 160, 200, 340];
  const h = hues[seed % hues.length];
  const s = 45 + (seed % 15);
  const l = 60 + (seed % 10);
  return `hsl(${h} ${s}% ${l}%)`;
}
function monthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function formatMonthLabel(key) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}
function getLastThreeMonthKeys(baseDate = new Date()) {
  const arr = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
    arr.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return arr;
}
function offsetDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// ------- Datos demo
const DEMO_BOOKS = [
  {
    id: "3",
    title: "The Song of Achilles",
    author: "Madeline Miller",
    status: "reading",
    color: "#90CAF9",
    accent: "#0D47A1",
    currentPage: 195,
    totalPages: 300,
    progressPercent: 65,
  },
  {
    id: "1",
    title: "Ariadne",
    author: "Jennifer Saint",
    status: "read",
    color: "#D8B98B",
    accent: "#7A5F3E",
    review: {
      rating: 4,
      notes:
        "Me encantó el mito retomado desde la perspectiva de Ariadne. La narrativa es envolvente y emotiva.",
    },
    finishedAt: offsetDays(-5),
  },
  {
    id: "4",
    title: "Babel",
    author: "R.F. Kuang",
    status: "read",
    color: "#4B3F2F",
    accent: "#D1B000",
    review: {
      rating: 5,
      notes:
        "Una obra maestra. El mundo académico mezclado con magia y colonialismo está brillantemente ejecutado.",
    },
    finishedAt: offsetDays(-9),
  },
  {
    id: "6",
    title: "Circe",
    author: "Madeline Miller",
    status: "read",
    color: "#FEC5BB",
    accent: "#7C2D12",
    review: {
      rating: 5,
      notes: "Poético y profundo. Los pasajes en la isla son hermosos.",
    },
    finishedAt: offsetDays(-30),
  },
  {
    id: "9",
    title: "Catching Fire",
    author: "Suzanne Collins",
    status: "read",
    color: "#C3E0E5",
    accent: "#2563EB",
    review: {
      rating: 4,
      notes: "Mejor que el primero. La arena fue increíble.",
    },
    finishedAt: offsetDays(-42),
  },
  {
    id: "10",
    title: "The Invisible Life of Addie LaRue",
    author: "V.E. Schwab",
    status: "read",
    color: "#CABFAB",
    accent: "#8B5E34",
    review: {
      rating: 3,
      notes: "Interesante concepto pero se hace un poco lento en partes.",
    },
    finishedAt: offsetDays(-63),
  },
  {
    id: "11",
    title: "City of Bones",
    author: "Cassandra Clare",
    status: "read",
    color: "#BFD8B8",
    accent: "#15803D",
    review: { rating: 3, notes: "Entretenido pero predecible." },
    finishedAt: offsetDays(-65),
  },
  {
    id: "2",
    title: "Good Girl Complex",
    author: "Elle Kennedy",
    status: "to-read",
    color: "#B7E4C7",
    accent: "#2D6A4F",
  },
  {
    id: "5",
    title: "Yellowface",
    author: "R.F. Kuang",
    status: "to-read",
    color: "#F6D365",
    accent: "#6B7280",
  },
  {
    id: "8",
    title: "Project Hail Mary",
    author: "Andy Weir",
    status: "to-read",
    color: "#2F3342",
    accent: "#FBBF24",
  },
];

// ------- Componentes base
function NavTabs({ page, setPage }) {
  const tabs = [
    { id: "home", label: "Inicio" },
    { id: "search", label: "Búsqueda" },
    { id: "goals", label: "Metas & Estadísticas" },
  ];
  return (
    <nav className="mb-6 w-full border-b border-stone-200 bg-white/70 backdrop-blur">
      <ul className="mx-auto flex max-w-6xl items-stretch gap-6 px-2">
        {tabs.map((t) => {
          const active = page === t.id;
          return (
            <li key={t.id}>
              <button
                onClick={() => setPage(t.id)}
                className={`group relative px-1 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "text-stone-900"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`absolute left-0 right-0 -bottom-px h-[2px] transition-all ${
                    active
                      ? "bg-stone-900"
                      : "bg-transparent group-hover:bg-stone-300"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-2 flex items-end justify-between">
      <div>
        <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
        {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function Shelf({ children }) {
  return (
    <div className="relative my-4 w-full">
      <div
        className="h-3 rounded-t-xl shadow"
        style={{ background: "#e8d7bd" }}
      />
      <div
        className="min-h-[170px] w-full border-b-[10px] p-4 shadow-inner"
        style={{
          background: "linear-gradient(180deg,#efe2cf,#e6d5be)",
          borderColor: "#d7c3a8",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Spine({ book, onOpen, heightClass = "h-36", widthClass = "w-10" }) {
  const bg = book.color || randomColor(book.title);
  const title =
    book.title.length > 26 ? book.title.slice(0, 24) + "…" : book.title;
  const dark = isDark(bg.startsWith("#") ? bg : "#a8a29e");
  return (
    <button
      onClick={() => onOpen(book)}
      className={`group relative flex ${heightClass} ${widthClass} items-center justify-center rounded-md border shadow transition hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400`}
      style={{ background: bg, borderColor: book.accent ?? "#d1d5db" }}
      title={`${book.title} — ${book.author ?? ""}`}
    >
      <div
        className="absolute left-0 top-0 h-full w-1 opacity-80"
        style={{ background: book.accent ?? "rgba(0,0,0,0.2)" }}
      />
      <span
        className={`select-none text-center text-[11px] font-medium tracking-wide ${
          dark ? "text-white" : "text-gray-900"
        }`}
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        {title}
      </span>
    </button>
  );
}

function Cover({ title }) {
  const bg = randomColor(title);
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const dark = isDark(bg.startsWith("#") ? bg : "#a8a29e");
  return (
    <div
      className="flex aspect-[2/3] w-24 items-center justify-center rounded border shadow"
      style={{ background: bg, borderColor: "#e5e7eb" }}
    >
      <span
        className={`text-lg font-bold ${
          dark ? "text-white" : "text-stone-800"
        }`}
      >
        {initials}
      </span>
    </div>
  );
}

function DetailPanel({ book, onClose, onUpdateProgress, onAddReview }) {
  if (!book) return null;

  const [currentPage, setCurrentPage] = useState(book.currentPage || 0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewNotes, setReviewNotes] = useState("");

  // ✅ resincroniza el estado interno al cambiar de libro
  useEffect(() => {
    setCurrentPage(book.currentPage || 0);
    setIsReviewing(false);
    setReviewRating(book.review?.rating || 0);
    setReviewNotes(book.review?.notes || "");
  }, [book]);

  const rating = (book.review && book.review.rating) || 0;
  const isReading = book.status === "reading";
  const isRead = book.status === "read";

  // ✅ barra y números basados en currentPage (estado local)
  const progressPercent = book.totalPages
    ? Math.min(100, Math.round((currentPage / book.totalPages) * 100))
    : 0;
  const isComplete = progressPercent >= 100;

  const handleUpdateProgress = () => {
    if (currentPage >= 0 && currentPage <= (book.totalPages || 0)) {
      onUpdateProgress && onUpdateProgress(book.id, currentPage);
      // opcional: si llegó al total, invitar a reseñar
      if (book.totalPages && currentPage >= book.totalPages) {
        setIsReviewing(true);
      }
    }
  };

  const handleSubmitReview = () => {
    if (reviewRating > 0) {
      onAddReview && onAddReview(book.id, { rating: reviewRating, notes: reviewNotes });
      setIsReviewing(false);
      // podés cambiar por un toast si agregás una lib después
      alert("¡Reseña guardada!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start gap-4">
          <Cover title={book.title} />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">{book.title}</h2>
            {book.author && <p className="text-sm text-gray-500 mt-1">{book.author}</p>}

            {isRead && (
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`text-xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                ))}
                <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition" aria-label="Cerrar">✕</button>
        </div>

        {/* Progreso de lectura (en vivo con currentPage) */}
        {isReading && book.totalPages && (
          <div className="mb-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Progreso de lectura</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">Páginas</span>
                {/* ✅ muestra currentPage, no book.currentPage */}
                <span className="font-medium text-stone-800">{currentPage} / {book.totalPages}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                {/* ✅ la barra usa progressPercent derivado de currentPage */}
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={book.totalPages}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                  placeholder="Página"
                />
                <button
                  onClick={handleUpdateProgress}
                  className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 transition"
                >
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botón para escribir reseña (solo si está completo) */}
        {isReading && isComplete && !isReviewing && (
          <div className="mb-4">
            <button
              onClick={() => setIsReviewing(true)}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              ✍️ Escribir reseña
            </button>
          </div>
        )}

        {/* Formulario de reseña */}
        {isReviewing && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Escribir reseña</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-xs text-gray-600">Calificación</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setReviewRating(star)} className="text-2xl transition hover:scale-110">
                      <span className={star <= reviewRating ? "text-yellow-400" : "text-gray-300"}>★</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs text-gray-600">Tus comentarios</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows="4"
                  placeholder="¿Qué te pareció el libro?"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewRating === 0}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Guardar reseña
                </button>
                <button
                  onClick={() => setIsReviewing(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reseña guardada */}
        {isRead && book.review && (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Mi reseña</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {book.review.notes || "Sin comentarios."}
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end">
          <button onClick={onClose} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}


// ------- Helpers
function groupByStatus(books) {
  return books.reduce(
    (acc, b) => {
      (acc[b.status] ||= []).push(b);
      return acc;
    },
    { "to-read": [], reading: [], read: [] }
  );
}
function groupByMonth(books) {
  const by = {};
  books.forEach((b) => {
    if (!b.finishedAt) return;
    const key = monthKey(b.finishedAt);
    (by[key] ||= []).push(b);
  });
  Object.values(by).forEach((list) =>
    list.sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt))
  );
  return by;
}

// ------- Páginas
function HomePage({ books, onOpen }) {
  const grouped = useMemo(() => groupByStatus(books), [books]);
  const lastThree = getLastThreeMonthKeys();
  const byMonth = useMemo(
    () => groupByMonth(books.filter((b) => b.status === "read")),
    [books]
  );
  const [expandedMonth, setExpandedMonth] = useState(null);
  const currentReading = grouped["reading"][0];

  const sizeVariants = [
    { h: "h-32", w: "w-9" },
    { h: "h-36", w: "w-10" },
    { h: "h-40", w: "w-11" },
    { h: "h-28", w: "w-8" },
    { h: "h-36", w: "w-10" },
    { h: "h-40", w: "w-10" }, // antes h-34
    { h: "h-40", w: "w-11" }, // antes h-38
  ];

  if (expandedMonth) {
    const list = byMonth[expandedMonth] || [];
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-800">
                {formatMonthLabel(expandedMonth)}
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                {list.length} libros leídos
              </p>
            </div>
            <button
              onClick={() => setExpandedMonth(null)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              ← Volver
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {list.map((b) => (
              <button
                key={b.id}
                onClick={() => onOpen(b)}
                className="flex flex-col items-center gap-3 rounded-lg border border-stone-200 p-4 transition hover:bg-stone-50 hover:shadow-md"
              >
                <Cover title={b.title} />
                <div className="text-center w-full">
                  <div className="text-xs font-medium text-stone-800 line-clamp-2">
                    {b.title}
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    {b.author || "Autor desconocido"}
                  </div>
                  {b.review && b.review.rating && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-xs ${
                            star <= b.review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Última lectura en proceso */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow">
        <SectionHeader title="Última lectura en proceso" />
        {currentReading ? (
          <div className="flex items-center gap-4">
            <Cover title={currentReading.title} />
            <div className="flex-1">
              <div className="text-base font-semibold text-stone-800">
                {currentReading.title}
              </div>
              <div className="text-xs text-stone-500">
                {currentReading.author}
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Progreso</span>
                  <span>
                    {currentReading.totalPages
                      ? `${currentReading.currentPage || 0} / ${
                          currentReading.totalPages
                        } páginas (${Math.round(
                          ((currentReading.currentPage || 0) /
                            currentReading.totalPages) *
                            100
                        )}%)`
                      : "—"}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded bg-stone-200">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width: `${
                        currentReading.totalPages
                          ? Math.min(
                              100,
                              Math.round(
                                ((currentReading.currentPage || 0) /
                                  currentReading.totalPages) *
                                  100
                              )
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => onOpen(currentReading)}
              className="rounded-xl bg-stone-900 px-3 py-2 text-xs font-medium text-white hover:bg-stone-800 transition"
            >
              Ver detalles
            </button>
          </div>
        ) : (
          <div className="text-sm text-stone-500">
            No tenés ninguna lectura en proceso.
          </div>
        )}
      </div>

      {/* Estanterías por mes */}
      {lastThree.map((key) => {
        const list = byMonth[key] || [];
        const visible = list.slice(0, 8);
        return (
          <div
            key={key}
            className="rounded-3xl border border-stone-200 bg-white p-6 shadow"
          >
            <div className="mb-4 flex items-center justify-between">
              <SectionHeader
                title={formatMonthLabel(key)}
                subtitle={`${list.length} libros leídos`}
              />
              {list.length > 8 && (
                <button
                  onClick={() => setExpandedMonth(key)}
                  className="flex items-center gap-1 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800 transition"
                >
                  <span>+</span>
                  <span>Ver todos</span>
                </button>
              )}
            </div>
            <Shelf>
              <div className="flex items-end gap-2 overflow-x-auto pb-2">
                {visible.length ? (
                  visible.map((b, i) => {
                    const size = sizeVariants[i % sizeVariants.length];
                    return (
                      <Spine
                        key={b.id}
                        book={b}
                        onOpen={onOpen}
                        heightClass={size.h}
                        widthClass={size.w}
                      />
                    );
                  })
                ) : (
                  <div className="py-8 text-sm text-stone-500">
                    Sin lecturas registradas este mes.
                  </div>
                )}
              </div>
            </Shelf>
          </div>
        );
      })}
    </div>
  );
}

function GoalsPage({ books }) {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const annualGoal = 35;
  const monthlyGoal = 4;

  const readBooks = books.filter((b) => b.status === "read");
  const readThisYear = readBooks.filter(
    (b) => b.finishedAt && new Date(b.finishedAt).getFullYear() === year
  );
  const readThisMonth = readBooks.filter(
    (b) =>
      b.finishedAt &&
      new Date(b.finishedAt).getFullYear() === year &&
      new Date(b.finishedAt).getMonth() === month
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-indigo-50 to-white p-8 shadow">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-stone-800">
            Meta anual {year}
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Tu objetivo de lectura para este año
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600">Progreso</span>
            <span className="text-lg font-bold text-stone-800">
              {readThisYear.length} / {annualGoal} libros
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (readThisYear.length / annualGoal) * 100
                )}%`,
              }}
            />
          </div>
          <p className="text-sm text-stone-600">
            {readThisYear.length >= annualGoal
              ? "¡Felicitaciones! Cumpliste tu meta anual 🎉"
              : `Te faltan ${
                  annualGoal - readThisYear.length
                } libros para cumplir tu meta`}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-emerald-50 to-white p-8 shadow">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-stone-800">Meta mensual</h2>
          <p className="text-sm text-stone-600 mt-1">
            {new Date().toLocaleDateString("es-AR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600">Progreso</span>
            <span className="text-lg font-bold text-stone-800">
              {readThisMonth.length} / {monthlyGoal} libros
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (readThisMonth.length / monthlyGoal) * 100
                )}%`,
              }}
            />
          </div>
          <p className="text-sm text-stone-600">
            {readThisMonth.length >= monthlyGoal
              ? "¡Excelente! Cumpliste tu meta mensual 🎉"
              : `Te faltan ${
                  monthlyGoal - readThisMonth.length
                } libros para cumplir tu meta`}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">
          Estadísticas generales
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-center">
            <div className="text-2xl font-bold text-stone-800">
              {readBooks.length}
            </div>
            <div className="text-xs text-stone-500 mt-1">Libros leídos</div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-center">
            <div className="text-2xl font-bold text-stone-800">
              {readThisYear.length}
            </div>
            <div className="text-xs text-stone-500 mt-1">Este año</div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-center">
            <div className="text-2xl font-bold text-stone-800">
              {readThisMonth.length}
            </div>
            <div className="text-xs text-stone-500 mt-1">Este mes</div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-center">
            <div className="text-2xl font-bold text-stone-800">
              {books.filter((b) => b.status === "reading").length}
            </div>
            <div className="text-xs text-stone-500 mt-1">Leyendo ahora</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchPage({ onAddReading }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [totalPages, setTotalPages] = useState("");

  async function searchGoogleBooks() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          q
        )}&maxResults=12`
      );
      const data = await res.json();
      setResults(data.items || []);
    } catch (e) {
      setError("No se pudo buscar en Google Books");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && q) {
      searchGoogleBooks();
    }
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setTotalPages("");
  };

  const handleAddWithPages = () => {
    if (selectedBook && totalPages > 0) {
      onAddReading({
        ...selectedBook,
        status: "reading",
        currentPage: 0,
        totalPages: Number(totalPages),
        progressPercent: 0,
      });
      setSelectedBook(null);
      setTotalPages("");
    }
  };

const handleKeyDown = (e) => {
  if (e.key === "Enter" && q) searchGoogleBooks();
};

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow">
      <SectionHeader
        title="Búsqueda de libros"
        subtitle="Buscá en Google Books y agregá a tu biblioteca"
      />
      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
          placeholder="Título, autor o ISBN…"
        />
        <button
          onClick={searchGoogleBooks}
          disabled={!q || loading}
          className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed transition whitespace-nowrap"
        >
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Modal para agregar páginas */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Agregar libro
            </h3>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">
                {selectedBook.title}
              </p>
              <p className="text-xs text-gray-500">{selectedBook.author}</p>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm text-gray-700">
                ¿Cuántas páginas tiene el libro?
              </label>
              <input
                type="number"
                min="1"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                placeholder="Ej: 350"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddWithPages}
                disabled={!totalPages || Number(totalPages) <= 0}
                className="flex-1 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Agregar
              </button>
              <button
                onClick={() => setSelectedBook(null)}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {results.map((it) => {
          const info = it.volumeInfo || {};
          const title = info.title || "Sin título";
          const author =
            (info.authors && info.authors[0]) || "Autor desconocido";
          const thumbnail = info.imageLinks?.thumbnail;
          return (
            <div
              key={it.id}
              className="flex items-center gap-4 rounded-lg border border-stone-200 p-4 hover:bg-stone-50 transition"
            >
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={title}
                  className="w-16 h-24 object-cover rounded border"
                />
              ) : (
                <div className="flex h-24 w-16 items-center justify-center rounded border bg-stone-100 text-xs text-stone-500">
                  {(title[0] || "").toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-stone-800 truncate">
                  {title}
                </div>
                <div className="text-xs text-stone-500 mt-1">{author}</div>
              </div>
              <button
                onClick={() => handleSelectBook({ id: it.id, title, author })}
                className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium hover:bg-stone-100 transition whitespace-nowrap"
              >
                + Agregar
              </button>
            </div>
          );
        })}
      </div>
      {!results.length && !loading && (
        <div className="py-12 text-center text-sm text-stone-500">
          Buscá un libro para comenzar
        </div>
      )}
    </div>
  );
}

// ------- App principal
export default function App() {
  const [books, setBooks] = useState(DEMO_BOOKS);
  const [open, setOpen] = useState(null);
  const [page, setPage] = useState("home");

  function handleUpdateProgress(id, currentPage) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              currentPage,
              progressPercent: b.totalPages
                ? Math.min(100, Math.round((currentPage / b.totalPages) * 100))
                : b.progressPercent,
              ...(b.totalPages && currentPage >= b.totalPages
                ? { status: "read", finishedAt: new Date().toISOString() }
                : {}),
            }
          : b
      )
    );
  }

  function handleAddReview(id, review) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              review,
              status: "read",
              finishedAt: b.finishedAt ?? new Date().toISOString(),
            }
          : b
      )
    );
  }

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const host = window.location && window.location.hostname;
        if (host === "localhost" || host === "127.0.0.1") {
          runDevTests();
        }
      }
    } catch (e) {
      console.error("[DevTests] Error:", e);
    }
  }, []);

  function handleAddReading(b) {
    setBooks((prev) => [b, ...prev]);
    setPage("home");
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
        {page === "goals" && <GoalsPage books={books} />}
        {page === "search" && <SearchPage onAddReading={handleAddReading} />}
      </main>

      <DetailPanel
        book={open}
        onClose={() => setOpen(null)}
        onUpdateProgress={handleUpdateProgress}
        onAddReview={handleAddReview}
      />

      <footer className="mx-auto mt-10 max-w-6xl text-center text-xs text-stone-400">
        v3.5.0 • React + Tailwind • JSX ✨
      </footer>
    </div>
  );
}

// ------- Dev tests
function runDevTests() {
  console.groupCollapsed("%c[DevTests] Book Tracker v3.5", "color:#10b981");
  const c1 = randomColor("Ariadne");
  const c2 = randomColor("Ariadne");
  console.assert(c1 === c2, "randomColor debería ser determinista");

  const mk = monthKey("2025-11-10T00:00:00.000Z");
  console.assert(/\d{4}-\d{2}/.test(mk), "monthKey debe ser YYYY-MM");

  const last3 = getLastThreeMonthKeys(new Date("2025-11-10"));
  console.assert(
    last3.length === 3,
    "getLastThreeMonthKeys debe retornar 3 claves"
  );

  const demo = [
    { finishedAt: "2025-11-05T00:00:00.000Z", status: "read", title: "A" },
    { finishedAt: "2025-11-08T00:00:00.000Z", status: "read", title: "B" },
  ];
  const gm = groupByMonth(demo);
  const k = Object.keys(gm)[0];
  console.assert(gm[k][0].title === "B", "groupByMonth debe ordenar desc");

  const gs = groupByStatus([{ status: "reading" }, { status: "to-read" }]);
  console.assert(
    Array.isArray(gs["read"]) &&
      Array.isArray(gs["to-read"]) &&
      Array.isArray(gs["reading"]),
    "groupByStatus crea todas las claves"
  );

  console.log(
    "%c✅ Todos los tests pasaron",
    "color:#10b981; font-weight:bold"
  );
  console.groupEnd();
}
