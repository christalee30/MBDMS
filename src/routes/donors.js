const { Router } = require("express");
const { db, listAll } = require("../db");
const { HttpError, text, isIsoDate, handler } = require("../utils");

const router = Router();

router.get("/", handler(async (req, res) => {
  res.json(await listAll("donors"));
}));

router.post("/", handler(async (req, res) => {
  const first = text(req.body.first);
  const last = text(req.body.last);
  const birthdate = text(req.body.birthdate);
  const contact = text(req.body.contact);

  if (!first || !last || !birthdate || !contact) throw new HttpError(400, "All donor fields are required.");
  if (!isIsoDate(birthdate)) throw new HttpError(400, "Invalid birthdate.");

  const { data, error } = await db
    .from("donors")
    .insert({ first, last, birthdate, contact })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(data);
}));

module.exports = router;
