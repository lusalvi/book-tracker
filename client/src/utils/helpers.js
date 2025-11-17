// Colores
export function hexToRgb(hex) {
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
export function isDark(hex) {
  const { r, g, b } = hexToRgb(hex);
  const L = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  return L < 0.5;
}

export function randomColor(seedStr = "") {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++)
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const hues = [25, 35, 45, 120, 160, 200, 340];
  const h = hues[seed % hues.length];
  const s = 45 + (seed % 15);
  const l = 60 + (seed % 10);
  return `hsl(${h} ${s}% ${l}%)`;
}

// Fechas / Meses
export function monthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
export function formatMonthLabel(key) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}
export function getLastThreeMonthKeys(baseDate = new Date()) {
  const arr = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
    arr.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return arr;
}
export function offsetDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// Agrupadores
export function groupByStatus(books) {
  return books.reduce(
    (acc, b) => {
      (acc[b.status] ||= []).push(b);
      return acc;
    },
    { "to-read": [], reading: [], read: [] }
  );
}
export function groupByMonth(books) {
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
