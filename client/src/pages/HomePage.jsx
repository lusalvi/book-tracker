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

function MonthListModal({ monthKeyValue, books, onClose, onOpenBook }) {
  if (!monthKeyValue) return null;
  const list = books || [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
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
                  {new Date(b.finishedAt).toLocaleDateString("es-AR")}
                </div>
              </div>
              <button
                onClick={() => onOpenBook(b)}
                className="rounded border px-2 py-1 text-xs"
              >
                Ver
              </button>
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
/* Opcion para ver elcturas en progreso */
function ReadingListModal({ books, onClose, onOpenBook }) {
  if (!books || !books.length) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
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
                  <div className="text-xs text-stone-400 mt-1">
                    {b.currentPage} / {b.totalPages} páginas (
                    {b.progressPercent ?? 0}
                    %)
                  </div>
                )}
              </div>
              <button
                onClick={() => onOpenBook(b)}
                className="rounded border px-2 py-1 text-xs" 
              ><strong>
                Actualizar Progreso</strong>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function HomePage({ books, onOpen }) {
  const grouped = useMemo(() => groupByStatus(books), [books]);
  const lastThree = getLastThreeMonthKeys();
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

  /* Lectura en progreso */
  return (
    <div className="rounded-3xl border border-stone-200 bg-gradient-to-b from-stone-50 to-stone-100/60 p-6 shadow">
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
                    style={{ width: `${currentReading.progressPercent || 0}%` }}
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

      {lastThree.map((key) => {
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
                className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full border text-stone-700 hover:bg-stone-50"
                aria-label={`Ver todo ${formatMonthLabel(key)}`}
                title={`Ver todo ${formatMonthLabel(key)}`}
              >
                +
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

      {monthModal.open && (
        <MonthListModal
          monthKeyValue={monthModal.key}
          books={(byMonth[monthModal.key] || []).sort(
            (a, b) => new Date(b.finishedAt) - new Date(a.finishedAt)
          )}
          onClose={() => setMonthModal({ key: null, open: false })}
          onOpenBook={onOpen}
        />
      )}
      {showReadingModal && (
        <ReadingListModal
          books={otherReading}
          onClose={() => setShowReadingModal(false)}
          onOpenBook={(b) => {
            onOpen(b); // reutiliza el DetailPanel que ya tenés
            setShowReadingModal(false);
          }}
        />
      )}
    </div>
  );
}
