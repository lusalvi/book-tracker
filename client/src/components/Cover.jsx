import { isDark, randomColor } from '../utils/helpers';

export default function Cover({ title, coverUrl, cover_url, book }) {
  // Intentamos obtener la URL desde distintos lugares
  const finalCoverUrl =
    coverUrl || cover_url || book?.cover_url || book?.coverUrl || null;

  // Si hay URL, mostramos imagen
  if (finalCoverUrl) {
    return (
      <div className="flex aspect-[2/3] w-24 overflow-hidden rounded border shadow">
        <img
          src={finalCoverUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Si el libro no cuenta con portada, se toma por defecto lo siguiente
  const bg = randomColor(title);
  const initials = title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const dark = isDark('#a8a29e');

  return (
    <div
      className="flex aspect-[2/3] w-24 items-center justify-center rounded border shadow"
      style={{ background: bg, borderColor: '#e5e7eb' }}
    >
      <span
        className={`text-lg font-bold ${
          dark ? 'text-white' : 'text-stone-800'
        }`}
      >
        {initials}
      </span>
    </div>
  );
}
