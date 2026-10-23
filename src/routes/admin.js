const { Router } = require("express");
const { db, countRows } = require("../db");
const { handler } = require("../utils");

const router = Router();

router.get("/health", (req, res) => res.json({ ok: true }));

router.get("/summary", handler(async (req, res) => {
  const [activities, donors, screenings, donations] = await Promise.all([
    countRows("activities"),
    countRows("donors"),
    countRows("screenings"),
    countRows("donations", q => q.eq("status", "Completed"))
  ]);
  res.json({ activities, donors, screenings, donations });
}));

// Calls reset_demo_data() defined in supabase/schema.sql
router.post("/reset", handler(async (req, res) => {
  const { error } = await db.rpc("reset_demo_data");
  if (error) throw error;
  res.json({ ok: true });
}));

module.exports = router;
