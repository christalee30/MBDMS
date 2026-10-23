const { Router } = require("express");
const { db, rowExists, listAll } = require("../db");
const { HttpError, text, isPositiveInt, handler } = require("../utils");

const OUTCOMES = ["Cleared", "Not cleared"];
const router = Router();

const present = r => ({
  id: r.id,
  donorId: r.donor_id,
  activityId: r.activity_id,
  outcome: r.outcome
});

// Outcomes are recorded by authorized personnel; this app never decides eligibility.
router.get("/", handler(async (req, res) => {
  res.json((await listAll("screenings")).map(present));
}));

router.post("/", handler(async (req, res) => {
  const donorId = Number(req.body.donorId);
  const activityId = Number(req.body.activityId);
  const outcome = text(req.body.outcome);

  if (!isPositiveInt(donorId) || !(await rowExists("donors", donorId))) throw new HttpError(400, "Unknown donor.");
  if (!isPositiveInt(activityId) || !(await rowExists("activities", activityId))) throw new HttpError(400, "Unknown activity.");
  if (!OUTCOMES.includes(outcome)) throw new HttpError(400, "Invalid outcome.");

  const { data, error } = await db
    .from("screenings")
    .insert({ donor_id: donorId, activity_id: activityId, outcome })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(present(data));
}));

module.exports = router;
