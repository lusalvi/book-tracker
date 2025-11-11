import { isDark, randomColor } from '../utils/helpers';


export default function Spine({ book, onOpen, heightClass = "h-36", widthClass = "w-10" }) {
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