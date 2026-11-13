
const express = require('express');
const db = require('../config/database');

const router = express.Router();

// GET: Retrieve all mechanics
router.get('/', (req, res) => {
    try {
        const mechanics = db.prepare(
            'SELECT * FROM mechanics ORDER BY id'
        ).all();

        res.status(200).json(mechanics);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to retrieve mechanics'
        });
    }
});

// GET: Retrieve one mechanic by ID
router.get('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'Invalid mechanic ID'
            });
        }

        const mechanic = db.prepare(
            'SELECT * FROM mechanics WHERE id = ?'
        ).get(id);

        if (!mechanic) {
            return res.status(404).json({
                error: 'Mechanic not found'
            });
        }

        res.status(200).json(mechanic);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to retrieve mechanic'
        });
    }
});

// POST: Add a new mechanic
router.post('/', (req, res) => {
    try {
        const { name, specialization, phone } = req.body;

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                error: 'Mechanic name is required'
            });
        }

        if (
            (specialization != null && typeof specialization !== 'string') ||
            (phone != null && typeof phone !== 'string')
        ) {
            return res.status(400).json({
                error: 'Specialization and phone must be strings'
            });
        }

        const result = db.prepare(`
            INSERT INTO mechanics (name, specialization, phone)
            VALUES (?, ?, ?)
        `).run(
            name.trim(),
            specialization?.trim() || null,
            phone?.trim() || null
        );

        const newMechanic = db.prepare(
            'SELECT * FROM mechanics WHERE id = ?'
        ).get(result.lastInsertRowid);

        res.status(201).json({
            message: 'Mechanic created successfully',
            mechanic: newMechanic
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to create mechanic'
        });
    }
});

// PUT: Update an existing mechanic
router.put('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, specialization, phone } = req.body ?? {};

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'Invalid mechanic ID'
            });
        }

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                error: 'A valid mechanic name is required'
            });
        }

        if (
            (specialization != null && typeof specialization !== 'string') ||
            (phone != null && typeof phone !== 'string')
        ) {
            return res.status(400).json({
                error: 'Specialization and phone must be strings'
            });
        }

        const existingMechanic = db.prepare(
            'SELECT * FROM mechanics WHERE id = ?'
        ).get(id);

        if (!existingMechanic) {
            return res.status(404).json({
                error: 'Mechanic not found'
            });
        }

        db.prepare(`
            UPDATE mechanics
            SET name = ?, specialization = ?, phone = ?
            WHERE id = ?
        `).run(
            name.trim(),
            specialization?.trim() || null,
            phone?.trim() || null,
            id
        );

        const updatedMechanic = db.prepare(
            'SELECT * FROM mechanics WHERE id = ?'
        ).get(id);

        res.status(200).json({
            message: 'Mechanic updated successfully',
            mechanic: updatedMechanic
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to update mechanic'
        });
    }
});

// DELETE: Remove a mechanic
router.delete('/:id', (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'Invalid mechanic ID'
            });
        }

        const existingMechanic = db.prepare(
            'SELECT * FROM mechanics WHERE id = ?'
        ).get(id);

        if (!existingMechanic) {
            return res.status(404).json({
                error: 'Mechanic not found'
            });
        }

        db.prepare(
            'DELETE FROM mechanics WHERE id = ?'
        ).run(id);

        res.status(200).json({
            message: 'Mechanic deleted successfully'
        });
    } catch (error) {
        console.error(error);

        if (
            error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' ||
            error.message === 'FOREIGN KEY constraint failed'
        ) {
            return res.status(409).json({
                error: 'Cannot delete mechanic because assignment history exists'
            });
        }

        return res.status(500).json({
            error: 'Failed to delete mechanic'
        });
    }
});

module.exports = router;
