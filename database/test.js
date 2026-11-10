const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const Database = require('better-sqlite3');

test('database schema supports mechanics, bays, and assignment history', () => {
  const db = new Database(':memory:');

  try {
    db.pragma('foreign_keys = ON');
    db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all()
      .map((row) => row.name);
    assert.deepEqual(tables, ['assignments', 'bays', 'mechanics']);

    const mechanicResult = db
      .prepare('INSERT INTO mechanics (name, specialization, phone) VALUES (?, ?, ?)')
      .run('Test Mechanic', 'General repair', '555-0199');
    const bayResult = db
      .prepare('INSERT INTO bays (name, vehicle) VALUES (?, ?)')
      .run('Test Bay', 'Subaru Outback');

    assert.equal(
      db.prepare('SELECT name FROM mechanics WHERE id = ?').get(mechanicResult.lastInsertRowid).name,
      'Test Mechanic',
    );
    assert.equal(
      db.prepare('SELECT vehicle FROM bays WHERE id = ?').get(bayResult.lastInsertRowid).vehicle,
      'Subaru Outback',
    );

    const insertAssignment = db.prepare(
      'INSERT INTO assignments (mechanic_id, bay_id) VALUES (?, ?)',
    );
    assert.throws(() => insertAssignment.run(9999, bayResult.lastInsertRowid), /FOREIGN KEY constraint failed/);
    assert.throws(() => insertAssignment.run(mechanicResult.lastInsertRowid, 9999), /FOREIGN KEY constraint failed/);

    const firstAssignment = insertAssignment.run(mechanicResult.lastInsertRowid, bayResult.lastInsertRowid);
    assert.throws(
      () => insertAssignment.run(mechanicResult.lastInsertRowid, bayResult.lastInsertRowid),
      /UNIQUE constraint failed/,
    );

    db.prepare('UPDATE assignments SET returned_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(firstAssignment.lastInsertRowid);

    const secondAssignment = insertAssignment.run(mechanicResult.lastInsertRowid, bayResult.lastInsertRowid);
    assert.ok(secondAssignment.lastInsertRowid > firstAssignment.lastInsertRowid);

    const history = db
      .prepare('SELECT returned_at FROM assignments WHERE bay_id = ? ORDER BY id')
      .all(bayResult.lastInsertRowid);
    assert.equal(history.length, 2);
    assert.notEqual(history[0].returned_at, null);
    assert.equal(history[1].returned_at, null);

    assert.throws(
      () => db.prepare('DELETE FROM mechanics WHERE id = ?').run(mechanicResult.lastInsertRowid),
      /FOREIGN KEY constraint failed/,
    );
    assert.throws(
      () => db.prepare('DELETE FROM bays WHERE id = ?').run(bayResult.lastInsertRowid),
      /FOREIGN KEY constraint failed/,
    );
  } finally {
    db.close();
  }
});
