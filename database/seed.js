const fs = require('node:fs');
const path = require('node:path');
const db = require('../config/database');

const seedPath = path.join(__dirname, 'seed.sql');

try {
  const seedSql = fs.readFileSync(seedPath, 'utf8');
  db.transaction(() => db.exec(seedSql))();
  console.log('AutoFix Garage sample data seeded successfully.');
} catch (error) {
  console.error('Failed to seed the AutoFix Garage database:', error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
