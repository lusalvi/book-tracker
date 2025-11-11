export default function NavTabs({ page, setPage }) {
const tabs = [
{ id: 'home', label: 'Inicio' },
{ id: 'search', label: 'Búsqueda' },
{ id: 'goals', label: 'Metas & estadísticas' },
];
return (
<nav className="mb-6 w-full border-b border-stone-200 bg-white/70 backdrop-blur">
<ul className="mx-auto flex max-w-6xl items-stretch gap-6 px-2">
{tabs.map((t) => {
const active = page === t.id;
return (
<li key={t.id}>
<button
onClick={() => setPage(t.id)}
className={`group relative px-1 py-3 text-sm font-medium transition-colors ${
active ? 'text-stone-900' : 'text-stone-600 hover:text-stone-900'
}`}
>
<span>{t.label}</span>
<span className={`absolute left-0 right-0 -bottom-px h-[2px] transition-all ${
active ? 'bg-stone-900' : 'bg-transparent group-hover:bg-stone-300'
}`} />
</button>
</li>
);
})}
</ul>
</nav>
);
}