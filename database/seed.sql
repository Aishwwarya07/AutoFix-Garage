INSERT INTO mechanics (name, specialization, phone)
SELECT 'Maya Chen', 'Engine repair', '555-0101'
WHERE NOT EXISTS (SELECT 1 FROM mechanics WHERE name = 'Maya Chen');

INSERT INTO mechanics (name, specialization, phone)
SELECT 'Luis Ortega', 'Diagnostics', '555-0102'
WHERE NOT EXISTS (SELECT 1 FROM mechanics WHERE name = 'Luis Ortega');

INSERT INTO mechanics (name, specialization, phone)
SELECT 'Aisha Patel', 'Brakes and electrical', '555-0103'
WHERE NOT EXISTS (SELECT 1 FROM mechanics WHERE name = 'Aisha Patel');

INSERT INTO bays (name, vehicle)
SELECT 'Bay 1', 'Toyota Camry'
WHERE NOT EXISTS (SELECT 1 FROM bays WHERE name = 'Bay 1');

INSERT INTO bays (name, vehicle)
SELECT 'Bay 2', 'Honda Civic'
WHERE NOT EXISTS (SELECT 1 FROM bays WHERE name = 'Bay 2');

INSERT INTO bays (name, vehicle)
SELECT 'Bay 3', 'Ford Focus'
WHERE NOT EXISTS (SELECT 1 FROM bays WHERE name = 'Bay 3');

INSERT INTO bays (name, vehicle)
SELECT 'Bay 4', 'Chevrolet Malibu'
WHERE NOT EXISTS (SELECT 1 FROM bays WHERE name = 'Bay 4');

INSERT INTO assignments (mechanic_id, bay_id, assigned_at, returned_at)
SELECT m.id, b.id, '2026-11-08 08:00:00', '2026-11-08 10:15:00'
FROM mechanics AS m
JOIN bays AS b ON b.name = 'Bay 1'
WHERE m.name = 'Maya Chen'
  AND NOT EXISTS (
    SELECT 1
    FROM assignments AS a
    WHERE a.mechanic_id = m.id
      AND a.bay_id = b.id
      AND a.assigned_at = '2026-11-08 08:00:00'
  );

INSERT INTO assignments (mechanic_id, bay_id, assigned_at, returned_at)
SELECT m.id, b.id, '2026-11-08 10:30:00', NULL
FROM mechanics AS m
JOIN bays AS b ON b.name = 'Bay 1'
WHERE m.name = 'Luis Ortega'
  AND NOT EXISTS (
    SELECT 1
    FROM assignments AS a
    WHERE a.mechanic_id = m.id
      AND a.bay_id = b.id
      AND a.assigned_at = '2026-11-08 10:30:00'
  );

INSERT INTO assignments (mechanic_id, bay_id, assigned_at, returned_at)
SELECT m.id, b.id, '2026-11-08 09:00:00', NULL
FROM mechanics AS m
JOIN bays AS b ON b.name = 'Bay 2'
WHERE m.name = 'Aisha Patel'
  AND NOT EXISTS (
    SELECT 1
    FROM assignments AS a
    WHERE a.mechanic_id = m.id
      AND a.bay_id = b.id
      AND a.assigned_at = '2026-11-08 09:00:00'
  );

INSERT INTO assignments (mechanic_id, bay_id, assigned_at, returned_at)
SELECT m.id, b.id, '2026-11-07 13:00:00', '2026-11-07 14:45:00'
FROM mechanics AS m
JOIN bays AS b ON b.name = 'Bay 3'
WHERE m.name = 'Maya Chen'
  AND NOT EXISTS (
    SELECT 1
    FROM assignments AS a
    WHERE a.mechanic_id = m.id
      AND a.bay_id = b.id
      AND a.assigned_at = '2026-11-07 13:00:00'
  );
