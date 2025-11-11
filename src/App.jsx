import NavTabs from './components/NavTabs';
import DetailPanel from './components/DetailPanel';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import GoalsPage from './pages/GoalsPage';
import { useBooks } from './hooks/useBooks';

export default function App() {
  const { books, open, setOpen, page, setPage, handleAddReading, handleUpdateProgress, handleAddReview } = useBooks();

  return (
    <div className="min-h-screen w-full bg-stone-50 px-4 py-8 md:px-8">
      <header className="mx-auto mb-6 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-stone-800 md:text-3xl">Mi biblioteca</h1>
        </div>
        <NavTabs page={page} setPage={setPage} />
      </header>

      <main className="mx-auto max-w-6xl">
        {page === 'home' && <HomePage books={books} onOpen={setOpen} />}
        {page === 'search' && <SearchPage onAddReading={handleAddReading} />}
        {page === 'goals' && <GoalsPage books={books} />}
      </main>

      <DetailPanel book={open} onClose={() => setOpen(null)} onUpdateProgress={handleUpdateProgress} onAddReview={handleAddReview} />

      <footer className="mx-auto mt-10 max-w-6xl text-center text-xs text-stone-400">v3.6 • React + Tailwind • JSX ✨</footer>
    </div>
  );
}