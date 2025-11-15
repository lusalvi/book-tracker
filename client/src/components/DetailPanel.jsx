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

  const [currentPage, setCurrentPage] = useState(book.currentPage || 0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    setCurrentPage(book.currentPage || 0);
    setIsReviewing(false);
    setReviewRating(book.review?.rating || 0);
    setReviewNotes(book.review?.notes || "");
  }, [book]);

  const rating = book.review?.rating || 0;
  const isReading = book.status === "reading";
  const isRead = book.status === "read";
  const progressPercent = book.totalPages
    ? Math.min(100, Math.round((currentPage / book.totalPages) * 100))
    : 0;
  const isComplete = progressPercent >= 100;

  const handleUpdateProgress = () => {
    if (currentPage >= 0 && currentPage <= (book.totalPages || 0)) {
      onUpdateProgress && onUpdateProgress(book.id, currentPage);
      if (book.totalPages && currentPage >= book.totalPages)
        setIsReviewing(true);
    }
  };

  const handleSubmitReview = () => {
    if (reviewRating > 0) {
      onAddReview &&
        onAddReview(book.id, { rating: reviewRating, notes: reviewNotes });
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
        <div className="mb-4 flex items-start gap-4">
          <Cover
            title={book.title}
            coverUrl={book.coverUrl}
            cover_url={book.cover_url}
            book={book}
          />
          <div className="flex-1">
            ...
            <h2 className="text-xl font-semibold text-gray-800">
              {book.title}
            </h2>
            {book.author && (
              <p className="text-sm text-gray-500 mt-1">{book.author}</p>
            )}
            {isRead && (
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xl ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
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

        {isReading && book.totalPages && (
          <div className="mb-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Progreso de lectura
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">Páginas</span>
                <span className="font-medium text-stone-800">
                  {currentPage} / {book.totalPages}
                </span>
              </div>
              <ProgressBar value={progressPercent} />
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
                  onClick={() => setIsReviewing(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {isRead && book.review && (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              Mi reseña
            </h3>
            <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {book.review.notes || "Sin comentarios."}
            </p>
          </div>
        )}

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
