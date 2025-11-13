// client/src/hooks/useBooks.js
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import {
  apiGetBooks,
  apiCreateBook,
  apiUpdateBook,
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

  // Función para obtener todos los libros del usuario (desde el backend)
  async function fetchUserBooks() {
    try {
      setLoading(true);
      const data = await apiGetBooks();
      // data viene del backend /api/books (user_books + books)

      const transformedBooks = data.map((item) => {
        const book = item.book || {}; // por si viene null

        const totalPages =
          item.total_pages || book.page_count || 0;

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
          review: null, // más adelante lo conectamos con la tabla reviews
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

  // Agregar un libro a la lectura (usa el backend)
  async function handleAddReading(googleBook) {
    try {
      const volume = googleBook.volumeInfo || {};

      const payload = {
        google_volume_id: googleBook.id,
        title: volume.title,
        author: volume.authors?.join(", ") || "Autor desconocido",
        cover_url: volume.imageLinks?.thumbnail || null,
        page_count: volume.pageCount || 0,
        status: "reading",
        started_at: new Date().toISOString(),
        current_page: 0,
        total_pages: volume.pageCount || 0,
      };

      await apiCreateBook(payload);

      // Recargar los libros
      await fetchUserBooks();
      setPage("home");
    } catch (error) {
      console.error("Error adding book:", error);
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

      if (
        book.totalPages > 0 &&
        currentPage >= book.totalPages
      ) {
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

  // Agregar reseña y finalizar libro
  // (por ahora solo marcamos como terminado; después podemos
  // crear rutas específicas en el backend para la tabla reviews)
  async function handleAddReview(userBookId, reviewData) {
    try {
      const updates = {
        status: "finished",
        finished_at: new Date().toISOString(),
        // TODO: guardar rating/notes en backend cuando tengamos /api/reviews
      };

      await apiUpdateBook(userBookId, updates);
      await fetchUserBooks();
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  }

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
  };
}

// Funciones auxiliares para colores (las mismas que tenías)
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
