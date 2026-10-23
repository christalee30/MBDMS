const { Router } = require("express");
const { db, listAll } = require("../db");
const { HttpError, text, isIsoDate, handler } = require("../utils");

const router = Router();

router.get("/", handler(async (req, res) => {
  res.json(await listAll("activities"));
}));

router.post("/", handler(async (req, res) => {
  const name = text(req.body.name);
  const date = text(req.body.date);
  const venue = text(req.body.venue);

  if (!name || !date || !venue) throw new HttpError(400, "Name, date and venue are required.");
  if (!isIsoDate(date)) throw new HttpError(400, "Invalid date.");

  const { data, error } = await db
    .from("activities")
    .insert({ name, date, venue, status: "Scheduled" })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(data);
}));

module.exports = router;
