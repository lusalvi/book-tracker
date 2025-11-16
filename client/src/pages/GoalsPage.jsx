import { useEffect, useMemo, useState } from "react";
import { apiGetGoals, apiUpdateGoals } from "../lib/api";

function MonthHistoryModal({ months, onClose }) {
  if (!months) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

        {/* Header */}
        <div className="sticky top-0 bg-white pb-3 flex justify-between items-center z-10 border-b">
          <h2 className="text-lg font-semibold text-stone-800">
            Historial de metas mensuales
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Lista */}
        <ul className="divide-y mt-4">
          {months.map((m) => (
            <li key={m.key} className="py-4 flex gap-4 items-center">
              <div className="w-28 text-sm font-medium text-stone-800 capitalize">
                {m.label}
              </div>

              <div className="flex-1">
                <div className="text-xs text-stone-500">
                  Meta del mes: {m.target ?? "–"}
                </div>
                <div className="text-xs text-stone-500">
                  Libros leídos: {m.readCount}
                </div>

                <div className="mt-2 h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width:
                        m.target && m.target > 0
                          ? `${Math.min(100, (m.readCount / m.target) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>

        {months.length === 0 && (
          <p className="text-sm text-stone-500 py-6 text-center">
            No hay metas registradas.
          </p>
        )}
      </div>
    </div>
  );
}

export default function GoalsPage({ books }) {
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth(); // 0–11
  const month = monthIndex + 1; // 1–12 para la API

  //  Metas (editables)
  const [annualTarget, setAnnualTarget] = useState(0);
  const [monthlyTarget, setMonthlyTarget] = useState(0);

  // Estados de carga / guardado
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [savingGoals, setSavingGoals] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Libros leídos según tu modelo
  const readBooks = useMemo(
    () => books.filter((b) => b.status === "read"),
    [books]
  );

  const readThisYear = useMemo(
    () =>
      readBooks.filter(
        (b) => b.finishedAt && new Date(b.finishedAt).getFullYear() === year
      ),
    [readBooks, year]
  );

  const readThisMonth = useMemo(
    () =>
      readBooks.filter(
        (b) =>
          b.finishedAt &&
          new Date(b.finishedAt).getFullYear() === year &&
          new Date(b.finishedAt).getMonth() === monthIndex
      ),
    [readBooks, year, monthIndex]
  );

  // Porcentajes
  const annualProgress = useMemo(() => {
    if (!annualTarget || annualTarget <= 0) return 0;
    return Math.min(100, (readThisYear.length / annualTarget) * 100);
  }, [readThisYear.length, annualTarget]);

  const monthlyProgress = useMemo(() => {
    if (!monthlyTarget || monthlyTarget <= 0) return 0;
    return Math.min(100, (readThisMonth.length / monthlyTarget) * 100);
  }, [readThisMonth.length, monthlyTarget]);

  // Cargar metas desde el backend usando api.js
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoadingGoals(true);
        setError("");
        setSavedMessage("");

        const data = await apiGetGoals({ year, month });

        if (data.yearlyGoal?.target != null) {
          setAnnualTarget(data.yearlyGoal.target);
        }
        if (data.monthlyGoal?.target != null) {
          setMonthlyTarget(data.monthlyGoal.target);
        }
      } catch (err) {
        console.error("Error cargando metas:", err);
        setError(err.message || "Error cargando metas");
      } finally {
        setLoadingGoals(false);
      }
    };

    fetchGoals();
  }, [year, month]);

  // Guardar metas
  const handleSaveGoals = async (e) => {
    e.preventDefault();
    setSavingGoals(true);
    setError("");
    setSavedMessage("");

    try {
      await apiUpdateGoals({
        year,
        month,
        annualTarget: Number(annualTarget) || 0,
        monthlyTarget: Number(monthlyTarget) || 0,
      });

      setSavedMessage("Metas guardadas correctamente");
      setIsEditing(false);
    } catch (err) {
      console.error("Error guardando metas:", err);
      setError(err.message || "Error guardando metas");
    } finally {
      setSavingGoals(false);
    }
  };
  const [showHistory, setShowHistory] = useState(false);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  // Generar historial figurativo de los 12 meses del año
  useEffect(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const key = `${year}-${String(i + 1).padStart(2, "0")}`;

      const readCount = readBooks.filter((b) => {
        if (!b.finishedAt) return false;
        const d = new Date(b.finishedAt);
        return d.getFullYear() === year && d.getMonth() === i;
      }).length;

      return {
        key,
        label: new Date(year, i).toLocaleDateString("es-AR", {
          month: "long",
        }),
        target: i === monthIndex ? monthlyTarget : null, // Solo la meta del mes actual es real
        readCount,
      };
    });

    setMonthlyHistory(months);
  }, [readBooks, monthlyTarget, year, monthIndex]);

  return (
    <div className="space-y-6">
      {/* Panel de configuración de metas */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">
              Configurar metas de lectura
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Editá tus objetivos de lectura anual y mensual. Los libros
              marcados como &quot;leídos&quot; se suman automáticamente al
              progreso.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsEditing((prev) => !prev);
              setSavedMessage("");
              setError("");
            }}
            className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800"
          >
            {isEditing ? "Cerrar" : "Editar metas"}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {savedMessage && (
          <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
            {savedMessage}
          </p>
        )}

        {isEditing && (
          <form
            onSubmit={handleSaveGoals}
            className="mt-4 grid gap-4 md:grid-cols-[repeat(3,auto)] md:items-end"
          >
            <div className="flex flex-col">
              <label className="text-sm font-medium text-stone-700">
                Meta anual ({year})
              </label>
              <input
                type="number"
                min={0}
                value={annualTarget ?? ""}
                onChange={(e) => setAnnualTarget(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
                disabled={loadingGoals}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-stone-700">
                Meta mensual (
                {now.toLocaleDateString("es-AR", {
                  month: "long",
                })}
                )
              </label>
              <input
                type="number"
                min={0}
                value={monthlyTarget ?? ""}
                onChange={(e) => setMonthlyTarget(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
                disabled={loadingGoals}
              />
            </div>

            <button
              type="submit"
              disabled={loadingGoals || savingGoals}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingGoals ? "Guardando..." : "Guardar metas"}
            </button>
          </form>
        )}
      </div>

      {/* Meta anual */}
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
              {readThisYear.length} / {annualTarget || 0} libros
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${annualProgress}%` }}
            />
          </div>
          <p className="text-sm text-stone-600">
            {!annualTarget || annualTarget <= 0
              ? "Todavía no definiste tu meta anual."
              : readThisYear.length >= annualTarget
                ? "¡Felicitaciones! Cumpliste tu meta anual 🎉"
                : `Te faltan ${annualTarget - readThisYear.length
                } libros para cumplir tu meta`}
          </p>
        </div>
      </div>

      {/* Meta mensual */}
      <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-emerald-50 to-white p-8 shadow">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-stone-800">Meta mensual</h2>
          <p className="text-sm text-stone-600 mt-1">
            {now.toLocaleDateString("es-AR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600">Progreso</span>
            <span className="text-lg font-bold text-stone-800">
              {readThisMonth.length} / {monthlyTarget || 0} libros
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${monthlyProgress}%` }}
            />
          </div>
          <p className="text-sm text-stone-600">
            {!monthlyTarget || monthlyTarget <= 0
              ? "Todavía no definiste tu meta mensual."
              : readThisMonth.length >= monthlyTarget
                ? "¡Excelente! Cumpliste tu meta mensual 🎉"
                : `Te faltan ${monthlyTarget - readThisMonth.length
                } libros para cumplir tu meta`}
          </p>
          {/* Botón para ver historial mensual */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowHistory(true)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold shadow-md hover:bg-stone-800 transition flex items-center gap-2"
            >
              Ver metas anteriores
            </button>
          </div>

        </div>
      </div>

      {/*Estadísticas generales */}
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
      <MonthHistoryModal
        months={showHistory ? monthlyHistory : null}
        onClose={() => setShowHistory(false)}
      />

    </div>
  );
}
