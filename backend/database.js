
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

// La base sera créée dans le dossier backend.
const db = new DatabaseSync(
  path.join(__dirname, "telemetry.db")
);

// Table contenant l'historique des mesures du moteur.
db.exec(`
  CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    is_on INTEGER NOT NULL CHECK (is_on IN (0, 1)),
    speed_rpm REAL NOT NULL,
    rotation TEXT NOT NULL
  )
`);

// Préparer l'insertion des mesures.
const insertStatement = db.prepare(`
  INSERT INTO telemetry (
    timestamp,
    is_on,
    speed_rpm,
    rotation
  )
  VALUES (?, ?, ?, ?)
`);

function saveTelemetry(state) {
  if (
    typeof state.isOn !== "boolean" ||
    !Number.isFinite(state.speed) ||
    state.speed < 0 ||
    typeof state.rotation !== "string"
  ) {
    throw new Error("Invalid telemetry data");
  }

  insertStatement.run(
    new Date().toISOString(),
    state.isOn ? 1 : 0,
    state.speed,
    state.rotation
  );
}

function getRecentTelemetry(limit = 100) {
  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 500)
    : 100;

  return db.prepare(`
    SELECT
      id,
      timestamp,
      is_on AS isOn,
      speed_rpm AS speed,
      rotation
    FROM telemetry
    ORDER BY id DESC
    LIMIT ?
  `).all(safeLimit).reverse();
}

function closeDatabase() {
  db.close();
}

module.exports = {
  saveTelemetry,
  getRecentTelemetry,
  closeDatabase
};
