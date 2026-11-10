PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS mechanics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  specialization TEXT,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS bays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  vehicle TEXT NOT NULL CHECK (length(trim(vehicle)) > 0)
);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mechanic_id INTEGER NOT NULL,
  bay_id INTEGER NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  returned_at DATETIME DEFAULT NULL,
  FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE RESTRICT,
  FOREIGN KEY (bay_id) REFERENCES bays(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_mechanics_name
  ON mechanics(name);

CREATE INDEX IF NOT EXISTS idx_bays_name
  ON bays(name);

CREATE INDEX IF NOT EXISTS idx_assignments_mechanic_assigned_at
  ON assignments(mechanic_id, assigned_at DESC);

CREATE INDEX IF NOT EXISTS idx_assignments_bay_assigned_at
  ON assignments(bay_id, assigned_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_assignments_one_active_per_bay
  ON assignments(bay_id)
  WHERE returned_at IS NULL;
