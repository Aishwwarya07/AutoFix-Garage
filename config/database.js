const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const databasePath = path.join(__dirname, '..', 'autofix.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const db = new Database(databasePath);

try {
  db.pragma('foreign_keys = ON');
  db.exec(fs.readFileSync(schemaPath, 'utf8'));
} catch (error) {
  console.error('Failed to initialize the AutoFix Garage database:', error.message);
  db.close();
  throw error;
}

if (require.main === module) {
  console.log(`AutoFix Garage database ready at ${databasePath}`);
}

module.exports = db;
