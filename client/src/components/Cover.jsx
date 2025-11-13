import { isDark, randomColor } from '../utils/helpers';


export default function Cover({ title }) {
const bg = randomColor(title);
const initials = title.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
const dark = isDark('#a8a29e');
return (
<div className="flex aspect-[2/3] w-24 items-center justify-center rounded border shadow" style={{ background: bg, borderColor: '#e5e7eb' }}>
<span className={`text-lg font-bold ${dark ? 'text-white' : 'text-stone-800'}`}>{initials}</span>
</div>
);
}