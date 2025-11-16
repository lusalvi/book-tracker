// server/routes/reviews.js
const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");
const auth = require("../middleware/auth");

// Todas las rutas de acá requieren estar logueado
router.use(auth);

/**
 * GET /api/reviews
 * Devuelve todas las reseñas del usuario actual
 */
router.get("/", async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, book_id, rating, notes, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error leyendo reviews:", error);
      return res.status(500).json({ error: "Error leyendo reseñas" });
    }

    return res.json(data);
  } catch (err) {
    console.error("❌ Error general GET /reviews:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
