// server/routes/books.js
const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");
const auth = require("../middleware/auth");

// Necesario para leer JSON del body
router.use(express.json());

// Todas las rutas requieren estar logueado
router.use(auth);

/**
 * GET /api/books
 * Devuelve los libros del usuario (user_books + books)
 */
router.get("/", async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("user_books")
    .select(
      `
      id,
      status,
      started_at,
      finished_at,
      current_page,
      total_pages,
      created_at,
      book:books (
        id,
        google_volume_id,
        title,
        author,
        cover_url,
        page_count
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error GET /books:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

/**
 * POST /api/books
 * body: {
 *   google_volume_id, title, author, cover_url, page_count
 * }
 * Crea (si hace falta) el libro en `books` y la relación en `user_books`
 */
router.post("/", async (req, res) => {
  const userId = req.user.id;
  let {
    google_volume_id,
    title,
    author,
    cover_url,
    page_count,
  } = req.body || {};

  // Asegurar page_count numérico o null
  const numericPageCount =
    page_count && !Number.isNaN(Number(page_count))
      ? Number(page_count)
      : null;

  try {
    // 1) Buscar libro por google_volume_id
    let book = null;

    if (google_volume_id) {
      const { data: existing, error: findError } = await supabase
        .from("books")
        .select("*")
        .eq("google_volume_id", google_volume_id)
        .maybeSingle();

      if (findError) {
        console.error("Error buscando book:", findError);
        return res.status(500).json({ error: findError.message });
      }

      book = existing;
    }

    // 2) Si no existe, lo creamos
    if (!book) {
      const { data: inserted, error: insertError } = await supabase
        .from("books")
        .insert([
          {
            google_volume_id: google_volume_id || null,
            title,
            author,
            cover_url,
            page_count: numericPageCount,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Error insertando book:", insertError);
        return res.status(500).json({ error: insertError.message });
      }

      book = inserted;
    }

    // 3) Crear registro en user_books
    const { data, error } = await supabase
      .from("user_books")
      .insert([
        {
          user_id: userId,
          book_id: book.id,
          status: "reading",
          started_at: new Date().toISOString(),
          current_page: 0,
          total_pages: book.page_count,
        },
      ])
      .select(
        `
        id,
        status,
        started_at,
        finished_at,
        current_page,
        total_pages,
        created_at,
        book:books (
          id,
          google_volume_id,
          title,
          author,
          cover_url,
          page_count
        )
      `
      )
      .single();

    if (error) {
      console.error("Error insertando user_book:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (e) {
    console.error("Error en POST /books:", e);
    return res.status(500).json({ error: e.message || "Error creando libro" });
  }
});

/**
 * PUT /api/books/:id
 * Actualiza registro de user_books (progreso, status, etc.)
 */
router.put("/:id", async (req, res) => {
  const userId = req.user.id;
  const userBookId = req.params.id;
  const payload = req.body;

  const { data, error } = await supabase
    .from("user_books")
    .update(payload)
    .eq("id", userBookId)
    .eq("user_id", userId)
    .select(
      `
      id,
      status,
      started_at,
      finished_at,
      current_page,
      total_pages,
      created_at,
      book:books (
        id,
        google_volume_id,
        title,
        author,
        cover_url,
        page_count
      )
    `
    )
    .single();

  if (error) {
    console.error("❌ Error PUT /books/:id:", error);
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: "Registro no encontrado" });
  }

  res.json(data);
});

/**
 * DELETE /api/books/:id
 * Elimina solo la relación en user_books
 */
router.delete("/:id", async (req, res) => {
  const userId = req.user.id;
  const userBookId = req.params.id;

  const { error } = await supabase
    .from("user_books")
    .delete()
    .eq("id", userBookId)
    .eq("user_id", userId);

  if (error) {
    console.error("❌ Error DELETE /books/:id:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(204).send();
});

module.exports = router;
