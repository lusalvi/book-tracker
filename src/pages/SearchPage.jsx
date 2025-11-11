import { useState } from 'react';

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

export default function SearchPage({ onAddReading }) {
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