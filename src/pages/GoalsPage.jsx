import { useMemo } from 'react';

export default function GoalsPage({ books }) {
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