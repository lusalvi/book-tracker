import { useState } from "react";
import {} from "react";

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

  async function searchGoogleBooksAuto(query) {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query
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

  const [typingTimeout, setTypingTimeout] = useState(null);

  function handleTyping(e) {
    const value = e.target.value;
    setQ(value);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Espera 400ms después de dejar de escribir
    const timeout = setTimeout(() => {
      if (value.trim().length > 0) {
        searchGoogleBooksAuto(value);
      } else {
        setResults([]);
      }
    }, 400);

    setTypingTimeout(timeout);
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow">
      <SectionHeader
        title="Búsqueda de libros"
        subtitle="Buscá en Google Books y agregá a tu biblioteca"
      />
      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <input
          value={q}
          onChange={handleTyping}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
          placeholder="Título, autor o ISBN…"
        />
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
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

              {/* 👇 IMPORTANTE: mandar el item completo de Google Books */}
              <button
                onClick={() => onAddReading(it)}
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
