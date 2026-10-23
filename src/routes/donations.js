const { Router } = require("express");
const { db, rowExists, listAll } = require("../db");
const { HttpError, isPositiveInt, handler } = require("../utils");

const router = Router();
const UNIQUE_VIOLATION = "23505";

const present = r => ({
  id: r.id,
  donorId: r.donor_id,
  activityId: r.activity_id,
  status: r.status
});

router.get("/", handler(async (req, res) => {
  res.json((await listAll("donations")).map(present));
}));

// A donation needs the donor's most recent screening for that activity to be "Cleared".
router.post("/", handler(async (req, res) => {
  const donorId = Number(req.body.donorId);
  const activityId = Number(req.body.activityId);

  if (!isPositiveInt(donorId) || !(await rowExists("donors", donorId))) throw new HttpError(400, "Unknown donor.");
  if (!isPositiveInt(activityId) || !(await rowExists("activities", activityId))) throw new HttpError(400, "Unknown activity.");

  const { data: recent, error: lookupError } = await db
    .from("screenings")
    .select("outcome")
    .eq("donor_id", donorId)
    .eq("activity_id", activityId)
    .order("id", { ascending: false })
    .limit(1);
  if (lookupError) throw lookupError;

  if (!recent.length || recent[0].outcome !== "Cleared") {
    throw new HttpError(400, "Donor needs a 'Cleared' screening record for this activity first.");
  }

  const { data, error } = await db
    .from("donations")
    .insert({ donor_id: donorId, activity_id: activityId, status: "Completed" })
    .select()
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) throw new HttpError(400, "Donation already recorded for this donor and activity.");
    throw error;
  }
  res.status(201).json(present(data));
}));

module.exports = router;
