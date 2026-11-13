
const express = require('express');
const db = require('./config/database');
const mechanicsRouter = require('./routes/mechanics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON
app.use(express.json());
app.use('/mechanics', mechanicsRouter);

// API welcome route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to AutoFix Garage API'
    });
});

// Database health-check route
app.get('/health', (req, res) => {
    try {
        db.prepare('SELECT 1').get();

        res.status(200).json({
            status: 'OK',
            database: 'Connected'
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Database connection failed'
        });
    }
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// Start the server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`AutoFix Garage server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
