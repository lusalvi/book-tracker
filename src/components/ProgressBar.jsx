export default function ProgressBar({ value = 0 }) {
const width = Math.max(0, Math.min(100, Number(value || 0)));
return (
<div className="h-2 w-full overflow-hidden rounded bg-stone-200">
<div className="h-full bg-emerald-500 transition-all" style={{ width: `${width}%` }} />
</div>
);
}