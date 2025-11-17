// server/routes/auth.js
const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");


// Helper para asegurar que el perfil en public.profiles esté creado/actualizado
async function ensureProfileForUser(user, extra = {}) {
  if (!user) return;

  const { nombre, apellido } = extra;

  const fullNameFromProvider =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "";

  let firstName = nombre || "";
  let lastName = apellido || "";

  // Si no me mandaron nombre/apellido desde el front, uso el display name del proveedor
  if ((!firstName || !lastName) && fullNameFromProvider) {
    const parts = fullNameFromProvider.trim().split(/\s+/);
    if (!firstName) firstName = parts[0]; 
    if (!lastName && parts.length > 1) {
      lastName = parts.slice(1).join(" "); 
    }
  }

  // Último fallback: parte local del email
  const emailLocal = user.email?.split("@")[0] ?? "";
  if (!firstName) firstName = emailLocal;

  await supabase.from("profiles").upsert({
    id: user.id,
    first_name: firstName,
    last_name: lastName || "",
  });
}


/**
 * POST /api/auth/register
 * body: { email, password, nombre, apellido }
 */

router.post("/register", async (req, res) => {
  const { email, password, nombre, apellido } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email y contraseña son obligatorios" });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre: nombre || email.split("@")[0],
        apellido: apellido || "",
        full_name: `${nombre || ""} ${apellido || ""}`.trim(),
      },
      emailRedirectTo: "http://localhost:5173/auth/callback",
    },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const user = data.user;

  try {
    await ensureProfileForUser(user, { nombre, apellido });
  } catch (e) {
    console.error(" Error creando perfil:", e);
  }

  return res.status(201).json({
    user: data.user,
    session: data.session,
    message: "Revisa tu email para confirmar tu cuenta",
  });
});

// POST /api/auth/verify-email
router.post("/verify-email", async (req, res) => {
  const { token_hash, type } = req.body;

  if (!token_hash || !type) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type,
    });

    if (error) {
      console.error("Error verificando email:", error.message);
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
    console.error(" Excepción en verify-email:", e);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email y contraseña son obligatorios" });
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
      console.error(" Error de Supabase:", error.message);
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
    console.error(" Excepción en login/google:", e);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});


module.exports = router;
