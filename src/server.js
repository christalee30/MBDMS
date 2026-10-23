const path = require("path");
const express = require("express");
const { port } = require("./config");
const { HttpError } = require("./utils");

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api", require("./routes/admin"));
app.use("/api/activities", require("./routes/activities"));
app.use("/api/donors", require("./routes/donors"));
app.use("/api/screenings", require("./routes/screenings"));
app.use("/api/donations", require("./routes/donations"));

app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON." });
  console.error(err);
  res.status(500).json({ error: "Database error. Please try again." });
});

app.listen(port, () => console.log(`Blood Drive Manager listening on port ${port}`));
