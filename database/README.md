# AutoFix Garage database

The database uses SQLite through `better-sqlite3`. The connection module creates
`autofix.db` in the project root when first imported and applies `schema.sql`.
Foreign-key enforcement is enabled on that connection.

## Tables and relationships

- `mechanics` stores each mechanic. `id` is its auto-incrementing primary key.
- `bays` stores each service bay and its current vehicle. `id` is its
  auto-incrementing primary key.
- `assignments` records each mechanic-to-bay assignment and its timestamps.
  `id` is its auto-incrementing primary key. `mechanic_id` references
  `mechanics(id)` and `bay_id` references `bays(id)`.

An assignment is active while `returned_at IS NULL`. Returning a vehicle updates
that assignment's `returned_at`; it does not delete the row. A partial unique
index allows at most one active assignment per bay but does not prevent new
assignments for that bay after it has been returned. Foreign keys restrict
deleting mechanics or bays with assignment history.

## Connect from another module

Import the shared connection with a path relative to the importing file. For
example, from a project-root module:

```js
const db = require('./config/database');

const mechanics = db.prepare('SELECT id, name FROM mechanics ORDER BY name').all();
```

From a module in a child folder, use the equivalent relative import, such as
`require('../config/database')`. The same connection can be used with
`db.prepare(...).get()`, `.all()`, or `.run()`. Use prepared statements for
values.

## Initialize, seed, and test

```sh
npm install
npm run db:init
npm run db:seed
npm test
```

Initialization is also automatic when any module imports
`config/database.js`. Seeding runs separately, in a transaction, from
`database/seed.sql`; the sample inserts are safe to run repeatedly. The test
script uses an in-memory database and does not change `autofix.db`.
