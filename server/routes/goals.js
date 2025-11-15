// server/routes/goals.js
const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");
const auth = require("../middleware/auth");

router.use(express.json());
router.use(auth);

/**
 * GET /api/goals
 * Devuelve meta anual y mensual del usuario
 */
router.get("/", async (req, res) => {
  const userId = req.user.id;
  const year = Number(req.query.year);
  const month = req.query.month ? Number(req.query.month) : null; // 1–12

  if (!year) {
    return res.status(400).json({ error: "Falta parámetro year" });
  }

  try {
    //Meta anual
    const { data: yearlyGoal, error: yearlyError } = await supabase
      .from("reading_goals_yearly")
      .select("id, year, target")
      .eq("user_id", userId)
      .eq("year", year)
      .maybeSingle();

    if (yearlyError) {
      console.error("Error leyendo meta anual:", yearlyError);
      return res.status(500).json({ error: "Error leyendo meta anual" });
    }

    let monthlyGoal = null;

    //Meta mensual (solo si mandás month)
    if (month) {
      const { data, error } = await supabase
        .from("reading_goals_monthly")
        .select("id, year, month, target")
        .eq("user_id", userId)
        .eq("year", year)
        .eq("month", month)
        .maybeSingle();

      if (error) {
        console.error("Error leyendo meta mensual:", error);
        return res.status(500).json({ error: "Error leyendo meta mensual" });
      }

      monthlyGoal = data;
    }

    return res.json({
      yearlyGoal: yearlyGoal || null,
      monthlyGoal: monthlyGoal || null,
    });
  } catch (err) {
    console.error("Error GET /api/goals:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

/**
 * PUT /api/goals
 * Body:
 * {
 *   year: 2025,
 *   month: 11,            // opcional
 *   annualTarget: 35,     // opcional
 *   monthlyTarget: 4      // opcional
 * }
 */
router.put("/", async (req, res) => {
  const userId = req.user.id;
  const { year, month, annualTarget, monthlyTarget } = req.body || {};

  if (!year) {
    return res.status(400).json({ error: "Falta year en el body" });
  }

  try {
    let yearlyGoal = null;
    let monthlyGoal = null;

    // 👉 Guardar/editar meta anual
    if (typeof annualTarget === "number") {
      const { data, error } = await supabase
        .from("reading_goals_yearly")
        .upsert(
          {
            user_id: userId,
            year,
            target: annualTarget,
          },
          {
            onConflict: "user_id,year", 
          }
        )
        .select("id, year, target")
        .maybeSingle();

      if (error) {
        console.error("Error guardando meta anual:", error);
        return res.status(500).json({ error: "Error guardando meta anual" });
      }

      yearlyGoal = data;
    }

    // Guardar/editar meta mensual
    if (month && typeof monthlyTarget === "number") {
      const { data, error } = await supabase
        .from("reading_goals_monthly")
        .upsert(
          {
            user_id: userId,
            year,
            month,
            target: monthlyTarget,
          },
          {
            onConflict: "user_id,year,month",
          }
        )
        .select("id, year, month, target")
        .maybeSingle();

      if (error) {
        console.error("Error guardando meta mensual:", error);
        return res.status(500).json({ error: "Error guardando meta mensual" });
      }

      monthlyGoal = data;
    }

    return res.json({
      message: "Metas guardadas correctamente",
      yearlyGoal,
      monthlyGoal,
    });
  } catch (err) {
    console.error("Error PUT /api/goals:", err);
    return res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
