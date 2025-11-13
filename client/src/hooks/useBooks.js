import { useState, useEffect } from "react";
import { supabase } from "../lib/api";
import { useAuth } from "./useAuth";

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

  // Función para obtener todos los libros del usuario
  async function fetchUserBooks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_books")
        .select(
          `
          *,
          book:books(*),
          review:reviews(*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transformar los datos al formato que espera la UI
      const transformedBooks = data.map((item) => ({
        id: item.id,
        bookId: item.book_id,
        title: item.book.title,
        author: item.book.author,
        coverUrl: item.book.cover_url,
        status: item.status,
        currentPage: item.current_page,
        totalPages: item.total_pages || item.book.page_count,
        progressPercent: item.total_pages
          ? Math.round((item.current_page / item.total_pages) * 100)
          : 0,
        startedAt: item.started_at,
        finishedAt: item.finished_at,
        review: item.review?.[0]
          ? {
              rating: item.review[0].rating,
              notes: item.review[0].notes,
            }
          : null,
        // Colores aleatorios basados en el título (puedes mejorar esto)
        color: randomColor(item.book.title),
        accent: randomAccent(item.book.title),
      }));

      setBooks(transformedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  }

  // Agregar un libro a la lectura
  async function handleAddReading(googleBook) {
    try {
      // 1. Primero verificar si el libro ya existe en la tabla books
      let bookId;
      const { data: existingBook } = await supabase
        .from("books")
        .select("id")
        .eq("google_volume_id", googleBook.id)
        .single();

      if (existingBook) {
        bookId = existingBook.id;
      } else {
        // 2. Si no existe, crear el libro
        const { data: newBook, error: bookError } = await supabase
          .from("books")
          .insert({
            google_volume_id: googleBook.id,
            title: googleBook.volumeInfo.title,
            author:
              googleBook.volumeInfo.authors?.join(", ") || "Autor desconocido",
            cover_url: googleBook.volumeInfo.imageLinks?.thumbnail || null,
            page_count: googleBook.volumeInfo.pageCount || 0,
          })
          .select()
          .single();

        if (bookError) throw bookError;
        bookId = newBook.id;
      }

      // 3. Crear la entrada en user_books
      const { data: userBook, error: userBookError } = await supabase
        .from("user_books")
        .insert({
          user_id: user.id,
          book_id: bookId,
          status: "reading",
          started_at: new Date().toISOString(),
          current_page: 0,
          total_pages: googleBook.volumeInfo.pageCount || 0,
        })
        .select()
        .single();

      if (userBookError) throw userBookError;

      // 4. Recargar los libros
      await fetchUserBooks();
      setPage("home");

      return userBook;
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

      const newProgress = book.totalPages
        ? Math.min(100, Math.round((currentPage / book.totalPages) * 100))
        : 0;

      // Si llegó al 100%, marcar como terminado
      const updates = {
        current_page: currentPage,
      };

      if (currentPage >= book.totalPages && book.totalPages > 0) {
        updates.status = "finished";
        updates.finished_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("user_books")
        .update(updates)
        .eq("id", userBookId);

      if (error) throw error;

      // Recargar los libros
      await fetchUserBooks();
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  }

  // Agregar reseña y finalizar libro
  async function handleAddReview(userBookId, reviewData) {
    try {
      const book = books.find((b) => b.id === userBookId);
      if (!book) return;

      // 1. Actualizar el estado del libro a "finished"
      const { error: updateError } = await supabase
        .from("user_books")
        .update({
          status: "finished",
          finished_at: new Date().toISOString(),
        })
        .eq("id", userBookId);

      if (updateError) throw updateError;

      // 2. Verificar si ya existe una reseña
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", book.bookId)
        .single();

      if (existingReview) {
        // Actualizar reseña existente
        const { error: reviewError } = await supabase
          .from("reviews")
          .update({
            rating: reviewData.rating,
            notes: reviewData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id);

        if (reviewError) throw reviewError;
      } else {
        // Crear nueva reseña
        const { error: reviewError } = await supabase.from("reviews").insert({
          user_id: user.id,
          book_id: book.bookId,
          rating: reviewData.rating,
          notes: reviewData.notes,
        });

        if (reviewError) throw reviewError;
      }

      // 3. Recargar los libros
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

// Funciones auxiliares para colores (mejoradas de tus helpers)
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
  return base; // Podrías hacer que sea más oscuro si quieres
}
