import { useEffect, useState } from "react";
import Cover from "./Cover";
import ProgressBar from "./ProgressBar";

export default function DetailPanel({
  book,
  onClose,
  onUpdateProgress,
  onAddReview,
}) {
  if (!book) return null;

  // Estado local
  const [currentPage, setCurrentPage] = useState(
    book.currentPage != null ? String(book.currentPage) : ""
  );
  const [totalPages, setTotalPages] = useState(book.totalPages || 0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewRating, setReviewRating] = useState(book.rating || 0);
  const [reviewNotes, setReviewNotes] = useState(book.notes || "");

  // Cada vez que cambia de libro, reseteamos todo
  useEffect(() => {
    if (!book) return;

    setCurrentPage(
      book.currentPage != null ? String(book.currentPage) : ""
    );
    setTotalPages(book.totalPages || 0);
    setIsReviewing(false);
    setReviewRating(book.rating || 0);
    setReviewNotes(book.notes || "");
  }, [book]);


  const rating = book.rating || 0;
  const isReading = book.status === "reading";
  const isRead = book.status === "read";

  // currentPage como número seguro
  const currentPageNumber =
    currentPage === "" ? 0 : Number(currentPage || 0);

  const progressPercent = totalPages
    ? Math.min(100, Math.round((currentPageNumber / totalPages) * 100))
    : 0;

  const isComplete = progressPercent >= 100;

  const handleUpdateProgress = () => {
    const safeTotal = totalPages && totalPages > 0 ? totalPages : null;
    const page = currentPageNumber;

    // Si hay total, validamos contra eso; si no, solo que sea >= 0
    if (page >= 0 && (!safeTotal || page <= safeTotal)) {
      onUpdateProgress && onUpdateProgress(book.id, page, safeTotal);

      // Si hay total y llegamos al final, abrir reseña
      if (safeTotal && page >= safeTotal) {
        setIsReviewing(true);
      }
    }
  };


  const handleSubmitReview = () => {
    if (reviewRating > 0) {
      onAddReview &&
        onAddReview(book.id, {
          rating: reviewRating,
          notes: reviewNotes,
        });
      setIsReviewing(false);
      alert("¡Reseña guardada!");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="mb-4 flex items-start gap-4">
          <Cover
            title={book.title}
            coverUrl={book.coverUrl}
            cover_url={book.cover_url}
            book={book}
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">
              {book.title}
            </h2>
            {book.author && (
              <p className="text-sm text-gray-500 mt-1">{book.author}</p>
            )}
            {/* Fechas de lectura */}
            <div className="mt-1 flex flex-wrap gap-4 text-[11px] text-gray-500">
              {book.startedAt && (
                <span>
                  Inicio:{" "}
                  {new Date(book.startedAt).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}

              {book.finishedAt && (
                <span>
                  Finalizado:{" "}
                  {new Date(book.finishedAt).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            {/* Rating solo si está leído */}
            {isRead && (
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xl ${star <= rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* 🔹 MODAL DE ACTUALIZAR PROGRESO (el que querías) */}
        {isReading && (
          <div className="mb-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Progreso de lectura
            </h3>
            <div className="space-y-3">
              {/* Texto de páginas */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">Páginas</span>
                <span className="font-medium text-stone-800">
                  {totalPages
                    ? `${currentPage} / ${totalPages}`
                    : `${currentPage} páginas`}
                </span>
              </div>

              {/* Barra */}
              <ProgressBar value={progressPercent} />

              {/* Inputs */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Página actual */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-stone-600">
                    Página actual
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalPages || undefined}
                    value={currentPage}
                    onChange={(e) => {
                      const value = e.target.value;

                      // Permitir borrar todo
                      if (value === "") {
                        setCurrentPage("");
                        return;
                      }

                      // Solo aceptamos números positivos (sin signos, sin letras)
                      if (/^\d+$/.test(value)) {
                        setCurrentPage(value);
                      }
                    }}
                    className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                    placeholder="Página"
                  />

                </div>

                {/* Total de páginas (editable) */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-stone-600">
                    Total páginas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalPages || ""}
                    onChange={(e) => setTotalPages(Number(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                    placeholder="Ej: 350"
                  />
                </div>

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

        {/* Botón para abrir reseña cuando se completa la lectura */}
        {isReading && isComplete && !isReviewing && (
          <div className="mb-4">
            <button
              onClick={() => setIsReviewing(true)}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              Escribir reseña
            </button>
          </div>
        )}

        {/* Formulario de reseña (crear o editar) */}
        {isReviewing && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Escribir reseña
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-xs text-gray-600">
                  Calificación
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-2xl transition hover:scale-110"
                    >
                      <span
                        className={
                          star <= reviewRating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs text-gray-600">
                  Tus comentarios
                </label>
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
                  type="button"
                  onClick={() => setIsReviewing(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reseña ya guardada (modo leído) */}
        {isRead && (book.notes || rating) && !isReviewing && (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              Mi reseña
            </h3>
            <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {book.notes || "Sin comentarios."}
            </p>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsReviewing(true);
                  setReviewRating(rating || 0);
                  setReviewNotes(book.notes || "");
                }}
                className="text-xs font-medium text-stone-700 underline hover:text-stone-900"
              >
                Editar reseña
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
