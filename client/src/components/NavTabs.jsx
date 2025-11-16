export default function NavTabs({ page, setPage }) {
  const tabs = [
    { id: 'home', label: 'Inicio' },
    { id: 'search', label: 'Búsqueda' },
    { id: 'goals', label: 'Metas & estadísticas' },
  ];
  
  return (
    <ul className="flex items-stretch">
      {tabs.map((t, idx) => {
        const active = page === t.id;
        return (
          <li key={t.id} className="flex-1">
            <button
              onClick={() => setPage(t.id)}
              className={`group relative w-full px-4 py-4 text-sm font-medium transition-all ${
                active 
                  ? 'text-stone-900 bg-stone-50/50' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/30'
              } ${idx !== 0 ? 'border-l border-stone-200' : ''}`}
            >
              <span className="relative z-10">{t.label}</span>
              <span 
                className={`absolute left-0 right-0 bottom-0 h-0.5 transition-all ${
                  active 
                    ? 'bg-stone-900 shadow-sm' 
                    : 'bg-transparent group-hover:bg-stone-300'
                }`} 
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}