
const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Validate that an ID is a positive integer
function isValidId(id) {
    return Number.isInteger(Number(id)) && Number(id) > 0;
}

// GET all bays
router.get('/', (req, res) => {
    try {
        const bays = db.prepare(`
            SELECT id, name, vehicle
            FROM bays
            ORDER BY id
        `).all();

        res.status(200).json(bays);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve bays' });
    }
});

// GET assignment details with mechanic and bay names
router.get('/assignments', (req, res) => {
    try {
        const assignments = db.prepare(`
            SELECT
                assignments.id AS assignment_id,
                mechanics.name AS mechanic_name,
                bays.name AS bay_name,
                bays.vehicle,
                assignments.assigned_at,
                assignments.returned_at
            FROM assignments
            INNER JOIN mechanics
                ON assignments.mechanic_id = mechanics.id
            INNER JOIN bays
                ON assignments.bay_id = bays.id
            ORDER BY assignments.id
        `).all();

        res.status(200).json(assignments);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to retrieve assignment details'
        });
    }
});

// GET one bay by ID
router.get('/:id', (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid bay ID' });
    }

    try {
        const bay = db.prepare(`
            SELECT id, name, vehicle
            FROM bays
            WHERE id = ?
        `).get(Number(req.params.id));

        if (!bay) {
            return res.status(404).json({ error: 'Bay not found' });
        }

        res.status(200).json(bay);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve bay' });
    }
});

// POST a new bay
router.post('/', (req, res) => {
    const { name, vehicle } = req.body || {};

    if (
        typeof name !== 'string' || !name.trim() ||
        typeof vehicle !== 'string' || !vehicle.trim()
    ) {
        return res.status(400).json({
            error: 'Name and vehicle are required'
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO bays (name, vehicle)
            VALUES (?, ?)
        `).run(name.trim(), vehicle.trim());

        const newBay = db.prepare(`
            SELECT id, name, vehicle
            FROM bays
            WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(newBay);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create bay' });
    }
});

// PUT update a bay
router.put('/:id', (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid bay ID' });
    }

    const { name, vehicle } = req.body || {};

    if (
        typeof name !== 'string' || !name.trim() ||
        typeof vehicle !== 'string' || !vehicle.trim()
    ) {
        return res.status(400).json({
            error: 'Name and vehicle are required'
        });
    }

    try {
        const result = db.prepare(`
            UPDATE bays
            SET name = ?, vehicle = ?
            WHERE id = ?
        `).run(name.trim(), vehicle.trim(), Number(req.params.id));

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Bay not found' });
        }

        const updatedBay = db.prepare(`
            SELECT id, name, vehicle
            FROM bays
            WHERE id = ?
        `).get(Number(req.params.id));

        res.status(200).json(updatedBay);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update bay' });
    }
});

// DELETE a bay
router.delete('/:id', (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid bay ID' });
    }

    try {
        const result = db.prepare(`
            DELETE FROM bays
            WHERE id = ?
        `).run(Number(req.params.id));

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Bay not found' });
        }

        res.status(200).json({ message: 'Bay deleted successfully' });
} catch (error) {
    if (
        error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' ||
        error.code === 'SQLITE_CONSTRAINT_TRIGGER'
    ) {
        return res.status(409).json({
            error: 'Cannot delete bay because assignment history exists'
        });
    }

    console.error(error);
    res.status(500).json({ error: 'Failed to delete bay' });
}
});

module.exports = router;
