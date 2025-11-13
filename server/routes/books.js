// server/routes/books.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');

// Todas las rutas requieren estar logueado
router.use(auth);

/**
 * Helper: crea o busca un libro en `books` por google_volume_id.
 */
async function findOrCreateBook(payload) {
  const {
    google_volume_id,
    title,
    author,
    cover_url,
    page_count,
  } = payload;

  // 1) Buscar por google_volume_id si viene
  if (google_volume_id) {
    const { data: existing, error: findError } = await supabase
      .from('books')
      .select('*')
      .eq('google_volume_id', google_volume_id)
      .maybeSingle();

    if (findError) throw findError;
    if (existing) return existing;
  }

  // 2) Insertar nuevo libro
  const { data, error } = await supabase
    .from('books')
    .insert([
      {
        google_volume_id: google_volume_id || null,
        title,
        author,
        cover_url,
        page_count,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * GET /api/books
 * Devuelve los libros del usuario (user_books + books)
 */
router.get('/', async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('user_books')
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

/**
 * POST /api/books
 * body: {
 *   google_volume_id, title, author, cover_url, page_count,
 *   status, started_at, finished_at, current_page, total_pages
 * }
 */
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const {
    google_volume_id,
    title,
    author,
    cover_url,
    page_count,
    status = 'reading',
    started_at = null,
    finished_at = null,
    current_page = 0,
    total_pages = null,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'El título es obligatorio' });
  }

  try {
    // 1) Asegurar libro en `books`
    const book = await findOrCreateBook({
      google_volume_id,
      title,
      author,
      cover_url,
      page_count,
    });

    // 2) Crear entrada en `user_books`
    const { data, error } = await supabase
      .from('user_books')
      .insert([
        {
          user_id: userId,
          book_id: book.id,
          status,
          started_at,
          finished_at,
          current_page,
          total_pages: total_pages || book.page_count || null,
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
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Error creando libro' });
  }
});

/**
 * PUT /api/books/:id
 * Actualiza el registro de user_books (progreso, status, fechas)
 */
router.put('/:id', async (req, res) => {
  const userId = req.user.id;
  const userBookId = req.params.id;
  const payload = req.body;

  const { data, error } = await supabase
    .from('user_books')
    .update(payload)
    .eq('id', userBookId)
    .eq('user_id', userId)
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
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'Registro no encontrado' });
  }

  res.json(data);
});

/**
 * DELETE /api/books/:id
 * Borra solo la relación en user_books
 */
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;
  const userBookId = req.params.id;

  const { error } = await supabase
    .from('user_books')
    .delete()
    .eq('id', userBookId)
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(204).send();
});

module.exports = router;
