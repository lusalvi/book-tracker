// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

/**
 * POST /api/auth/register
 * body: { email, password, nombre? }
 */
router.post('/register', async (req, res) => {
  const { email, password, nombre } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre }, // metadata opcional
    },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({
    user: data.user,
    // Si tenés confirmación por mail, capaz no querés devolver el session
    session: data.session,
  });
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  // Podés devolver el token y el frontend lo guarda (ej. en localStorage)
  return res.json({
    user: data.user,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

// POST /api/auth/login/google
router.post("/login/google", async (req, res) => {
  const { id_token } = req.body;

  if (!id_token) {
    return res.status(400).json({ error: "Falta id_token" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: id_token,
      options: {
        // Asegura que se cree el usuario si no existe
        skipNonceCheck: true,
      },
    });

    if (error) {
      console.error("❌ Error de Supabase:", error.message);
      return res.status(401).json({ error: error.message });
    }

    if (!data?.session) {
      return res.status(401).json({ error: "No se pudo crear la sesión" });
    }

    return res.json({
      user: data.user,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (e) {
    console.error("❌ Excepción en login/google:", e);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});


module.exports = router;
