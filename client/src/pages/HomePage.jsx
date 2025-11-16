// client/src/pages/HomePage.jsx
import { useMemo, useState } from "react";
import Shelf from "../components/Shelf";
import Spine from "../components/Spine";
import Cover from "../components/Cover";
import {
  groupByStatus,
  groupByMonth,
  getLastThreeMonthKeys,
  formatMonthLabel,
} from "../utils/helpers";
import { useBooks } from "../hooks/useBooks";

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

function MonthListModal({
  monthKeyValue,
  books,
  onClose,
  onOpenBook,
  onDeleteBook,
}) {
  if (!monthKeyValue) return null;
  const list = books || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-white py-2">
          <h2 className="text-lg font-semibold text-stone-800">
            Lecturas de {formatMonthLabel(monthKeyValue)}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <ul className="divide-y">
          {list.map((b) => (
            <li key={b.id} className="flex items-center gap-4 py-3">
              <Cover
                title={b.title}
                coverUrl={b.coverUrl}
                cover_url={b.cover_url}
                book={b.book}
              />
              <div className="flex-1">
                <div className="font-medium text-stone-800">{b.title}</div>
                <div className="text-xs text-stone-500">
                  {b.author || "Autor desconocido"}
                </div>
                <div className="text-xs text-stone-400">
                  Terminado:{" "}
                  {b.finishedAt
                    ? new Date(b.finishedAt).toLocaleDateString("es-AR")
                    : "—"}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onOpenBook(b)}
                  className="rounded border px-2 py-1 text-xs"
                >
                  Ver
                </button>

                {onDeleteBook && (
                  <button
                    type="button"
                    onClick={() => {
                      const ok = window.confirm(
                        "¿Seguro que querés eliminar este libro?"
                      );
                      if (!ok) return;
                      onDeleteBook(b.id);
                    }}
                    className="rounded border px-2 py-1 text-[11px] text-red-600"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}

          {!list.length && (
            <li className="py-6 text-sm text-stone-500">
              No hay lecturas en este mes.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* Modal lecturas en progreso */
function ReadingListModal({ books, onClose, onOpenBook, onDeleteBook }) {
  if (!books || !books.length) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-800">
            Otras lecturas en proceso
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <ul className="divide-y">
          {books.map((b) => (
            <li key={b.id} className="flex items-center gap-4 py-3">
              <Cover
                title={b.title}
                coverUrl={b.coverUrl}
                cover_url={b.cover_url}
                book={b.book}
              />
              <div className="flex-1">
                <div className="font-medium text-stone-800">{b.title}</div>
                <div className="text-xs text-stone-500">
                  {b.author || "Autor desconocido"}
                </div>
                {b.totalPages && (
                  <div className="mt-1 text-xs text-stone-400">
                    {b.currentPage} / {b.totalPages} páginas (
                    {b.progressPercent ?? 0}%)
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onOpenBook(b)}
                  className="rounded border px-2 py-1 text-xs"
                >
                  <strong>Actualizar Progreso</strong>
                </button>

                {onDeleteBook && (
                  <button
                    type="button"
                    onClick={() => {
                      const ok = window.confirm(
                        "¿Seguro que querés eliminar esta lectura?"
                      );
                      if (!ok) return;
                      onDeleteBook(b.id);
                    }}
                    className="rounded border px-2 py-1 text-[11px] text-red-600"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function HomePage({ onOpen }) {
  const { books, handleDeleteBook } = useBooks();

  const grouped = useMemo(() => groupByStatus(books), [books]);
  const byMonth = useMemo(
    () => groupByMonth(books.filter((b) => b.status === "read")),
    [books]
  );

  const readingBooks = grouped["reading"] || [];
  const currentReading = readingBooks[0];
  const otherReading = readingBooks.slice(1);

  const [monthModal, setMonthModal] = useState({ key: null, open: false });
  const [showReadingModal, setShowReadingModal] = useState(false);

  const sizeCycle = ["s", "m", "l", "m", "xl", "l", "m"];

  // ---- Filtros año / mes ----
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const allMonthKeys = Object.keys(byMonth); // ej: ["2025-09", "2025-10"]
  const yearsInData = allMonthKeys.map((k) => k.split("-")[0]);

  const currentYear = new Date().getFullYear();

  // Últimos 10 años desde el actual
  const lastTenYears = Array.from({ length: 10 }, (_, i) =>
    String(currentYear - i)
  );

  // Unión: últimos 10 años + años que existan en los datos
  const yearsForSelect = Array.from(
    new Set([...lastTenYears, ...yearsInData])
  ).sort((a, b) => Number(b) - Number(a));

  const baseLastThree = getLastThreeMonthKeys();

  function resolveYearForFilter() {
    if (filterYear) return filterYear;
    if (yearsForSelect.includes("2025")) return "2025";
    return yearsForSelect[0] || String(currentYear);
  }

  let shelfKeys;
  if (!filterMonth) {
    // Sin mes elegido → últimos 3 meses como antes
    shelfKeys = baseLastThree;
  } else {
    const y = resolveYearForFilter();
    shelfKeys = [`${y}-${filterMonth}`];
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-gradient-to-b from-stone-50 to-stone-100/60 p-6 shadow">
      {/* Última lectura en proceso */}
      <div className="mb-6 rounded-2xl border bg-white p-4 shadow">
        <SectionHeader title="Última lectura en proceso" />
        {currentReading ? (
          <div className="flex items-center gap-4">
            <Cover
              title={currentReading.title}
              coverUrl={currentReading.coverUrl}
              cover_url={currentReading.cover_url}
              book={currentReading.book}
            />
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
                    {currentReading.progressPercent != null
                      ? `${currentReading.progressPercent}%`
                      : currentReading.currentChapter &&
                        currentReading.totalChapters
                      ? `Cap. ${currentReading.currentChapter}/${currentReading.totalChapters}`
                      : "—"}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded bg-stone-200">
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${currentReading.progressPercent || 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => onOpen(currentReading)}
                className="rounded-xl bg-stone-900 px-3 py-2 text-xs font-medium text-white"
              >
                Actualizar Progreso
              </button>

              <button
                type="button"
                onClick={() => {
                  const ok = window.confirm(
                    "¿Seguro que querés eliminar esta lectura en progreso?"
                  );
                  if (!ok) return;
                  handleDeleteBook(currentReading.id);
                }}
                className="text-[11px] text-red-600 underline hover:text-red-800"
              >
                Eliminar
              </button>

              {otherReading.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowReadingModal(true)}
                  className="text-[11px] text-stone-600 underline hover:text-stone-900"
                >
                  <strong>Ver más lecturas</strong>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-stone-500">
            No tenés ninguna lectura en proceso.
          </div>
        )}
      </div>

      {/* Filtros año / mes */}
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3 text-xs">
        <div className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2 shadow-sm">
          <span className="text-stone-500">Año</span>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-transparent text-stone-700 outline-none"
          >
            <option value="">Auto</option>
            {yearsForSelect.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2 shadow-sm">
          <span className="text-stone-500">Mes</span>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-transparent text-stone-700 outline-none"
          >
            <option value="">Últimos 3</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
            <option value="04">Abril</option>
            <option value="05">Mayo</option>
            <option value="06">Junio</option>
            <option value="07">Julio</option>
            <option value="08">Agosto</option>
            <option value="09">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>
      </div>

      {/* Estanterías */}
      {shelfKeys.map((key) => {
        const list = byMonth[key] || [];
        const visible = list.slice(0, 5);

        return (
          <div
            key={key}
            className="mb-6 rounded-2xl border bg-white p-4 shadow"
          >
            <div className="flex items-center justify-between">
              <SectionHeader
                title={`Estantería • ${formatMonthLabel(key)}`}
                subtitle="Últimas lecturas del mes"
              />
              <button
                onClick={() => setMonthModal({ key, open: true })}
                className="ml-3 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-stone-700 hover:bg-stone-50"
                aria-label={`Ver todo ${formatMonthLabel(key)}`}
                title={`Ver todo ${formatMonthLabel(key)}`}
              >
                <span className="text-lg leading-none">+</span>
              </button>
            </div>

            <div className="relative my-6 w-full">
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
                <div className="flex items-end gap-2 overflow-x-auto pb-2">
                  {visible.length ? (
                    visible.map((b, i) => (
                      <Spine
                        key={b.id}
                        book={b}
                        onOpen={onOpen}
                        size={sizeCycle[i % sizeCycle.length]}
                        lean={(i % 6) - 2}
                      />
                    ))
                  ) : key.endsWith("-09") || key.endsWith("-10") ? (
                    // Libros figurativos para septiembre / octubre
                    [...Array(3)].map((_, i) => {
                      const fakeBook = {
                        id: `fake-${key}-${i}`,
                        title: `Libro de ejemplo ${i + 1}`,
                        author: "Autor desconocido",
                        coverUrl: null,
                        bookId: `fake-${i}`,
                      };

                      return (
                        <Spine
                          key={fakeBook.id}
                          book={fakeBook}
                          onOpen={() => {}}
                          size={sizeCycle[i % sizeCycle.length]}
                          lean={(i % 6) - 2}
                        />
                      );
                    })
                  ) : (
                    <div className="text-sm text-stone-500">
                      Sin lecturas registradas.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modales */}
      {monthModal.open && (
        <MonthListModal
          monthKeyValue={monthModal.key}
          books={(byMonth[monthModal.key] || []).sort(
            (a, b) => new Date(b.finishedAt) - new Date(a.finishedAt)
          )}
          onClose={() => setMonthModal({ key: null, open: false })}
          onOpenBook={onOpen}
          onDeleteBook={handleDeleteBook}
        />
      )}

      {showReadingModal && (
        <ReadingListModal
          books={otherReading}
          onClose={() => setShowReadingModal(false)}
          onOpenBook={(b) => {
            onOpen(b);
            setShowReadingModal(false);
          }}
          onDeleteBook={handleDeleteBook}
        />
      )}
    </div>
  );
}
