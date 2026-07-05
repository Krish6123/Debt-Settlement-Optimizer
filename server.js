/**
 * server.js
 * ----------
 * Root entry point for the debt settlement tracking application.
 *
 * Responsibilities:
 *   - Parse incoming JSON request bodies
 *   - Serve the static frontend from /public (same-origin, avoids CORS)
 *   - Mount the optimization API route
 *   - Attach the global error handler (must be registered last)
 */

const express = require('express');
const path = require('path');
const optimizeRouter = require('./routes/optimize');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = 3000;

// --- Middleware -------------------------------------------------------------
app.use(express.json()); // Parses application/json bodies; malformed JSON is
                          // caught downstream by errorHandler.

app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend assets.

// --- Routes -------------------------------------------------------------------
app.use('/api/v1/optimize', optimizeRouter);

// --- Error handling (must be registered after all routes/middleware) ---------
app.use(errorHandler);

// --- Start server ---------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

module.exports = app;
