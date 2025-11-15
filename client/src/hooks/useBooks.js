// client/src/hooks/useBooks.js
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import {
  apiGetBooks,
  apiCreateBook,
  apiUpdateBook,
  apiSearchBooks,
} from "../lib/api";

export function useBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null); // libro abierto en modal
  const [page, setPage] = useState("home");

  // Cargar libros del usuario al iniciar o cuando cambie el usuario
  useEffect(() => {
    if (user) {
      fetchUserBooks();
    } else {
      setBooks([]);
      setLoading(false);
    }
  }, [user]);

  // Obtener todos los libros del usuario desde el backend
  async function fetchUserBooks() {
    try {
      setLoading(true);
      const data = await apiGetBooks();

      const transformedBooks = data.map((item) => {
        const book = item.book || {};

        const totalPages = item.total_pages || book.page_count || 0;

        const progressPercent =
          totalPages > 0
            ? Math.round((item.current_page / totalPages) * 100)
            : 0;

        return {
          id: item.id, // id de user_books
          bookId: book.id,
          title: book.title,
          author: book.author,
          coverUrl: book.cover_url,
          status: item.status,
          currentPage: item.current_page,
          totalPages,
          progressPercent,
          startedAt: item.started_at,
          finishedAt: item.finished_at,
          review: null, // más adelante conectamos con reviews
          color: randomColor(book.title || ""),
          accent: randomAccent(book.title || ""),
        };
      });

      setBooks(transformedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  }

  // 👉 Agregar libro desde Google Books como "en lectura"
  async function handleAddReading(googleBook) {
    try {
      console.log("handleAddReading - libro elegido:", googleBook);

      // MUY IMPORTANTE: Google Books usa volumeInfo, no volume_info
      const volume = googleBook.volumeInfo || {};

      let title = "";
      if (typeof volume.title === "string" && volume.title.trim()) {
        title = volume.title.trim();
      } else if (
        typeof googleBook.title === "string" &&
        googleBook.title.trim()
      ) {
        title = googleBook.title.trim();
      }

      // pageCount como número o null
      const pageCountRaw = volume.pageCount ?? googleBook.pageCount ?? null;
      const pageCount =
        pageCountRaw && !Number.isNaN(Number(pageCountRaw))
          ? Number(pageCountRaw)
          : null;

      const payload = {
        google_volume_id: googleBook.id,
        title, // si está vacío, el backend lo reemplaza por "Sin título"
        author:
          (Array.isArray(volume.authors) && volume.authors[0]) ||
          googleBook.author ||
          "Autor desconocido",
        cover_url: volume.imageLinks?.thumbnail || null,
        page_count: pageCount,
        // status/fechas/progreso los maneja el backend
      };

      console.log("📦 Payload para POST /books:", payload);

      await apiCreateBook(payload);
      await fetchUserBooks();
      setPage("home");
    } catch (error) {
      console.error("❌ Error adding book:", error);
      alert(error.message || "No se pudo agregar el libro. Mirá la consola.");
      throw error;
    }
  }

  // Actualizar progreso de lectura
  async function handleUpdateProgress(userBookId, currentPage) {
    try {
      const book = books.find((b) => b.id === userBookId);
      if (!book) return;

      const updates = {
        current_page: currentPage,
      };

      if (book.totalPages > 0 && currentPage >= book.totalPages) {
        updates.status = "finished";
        updates.finished_at = new Date().toISOString();
      }

      await apiUpdateBook(userBookId, updates);
      await fetchUserBooks();
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  }

  // Marcar libro como terminado (luego conectamos con reviews)
  async function handleAddReview(userBookId, reviewData) {
    try {
      const updates = {
        status: "finished",
        finished_at: new Date().toISOString(),
        // TODO: guardar rating/notes cuando tengamos /api/reviews
      };

      await apiUpdateBook(userBookId, updates);
      await fetchUserBooks();
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  }

  // Libros en curso (status = "reading")
  const readingBooks = books
    .filter((b) => b.status === "reading")
    .sort(
      (a, b) =>
        new Date(b.startedAt || b.started_at || 0) -
        new Date(a.startedAt || a.started_at || 0)
    );

  // Última lectura en proceso (el más reciente)
  const currentReading = readingBooks[0] || null;
  //  Cuando cambian los libros, actualizamos también el libro abierto en el panel
  useEffect(() => {
    if (!open) return;
    const updated = books.find((b) => b.id === open.id);
    if (updated && updated !== open) {
      setOpen(updated);
    }
  }, [books, open]);

  return {
    books,
    setBooks,
    loading,
    open,
    setOpen,
    page,
    setPage,
    handleAddReading,
    handleUpdateProgress,
    handleAddReview,
    refetch: fetchUserBooks,
    searchBooks: apiSearchBooks,
    readingBooks,
    currentReading,
  };
}

// Funciones auxiliares para colores
function randomColor(seedStr = "") {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  const hues = [25, 35, 45, 120, 160, 200, 340];
  const h = hues[seed % hues.length];
  const s = 45 + (seed % 15);
  const l = 60 + (seed % 10);
  return `hsl(${h} ${s}% ${l}%)`;
}

function randomAccent(seedStr = "") {
  const base = randomColor(seedStr + "accent");
  return base;
}
