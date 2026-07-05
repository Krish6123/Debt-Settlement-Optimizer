/**
 * routes/optimize.js
 * -------------------
 * Router for the optimization resource.
 * Mounted at /api/v1/optimize in server.js, so this file only
 * needs to define the relative path '/'.
 */

const express = require('express');
const { optimize } = require('../controllers/optimizeController');

const router = express.Router();

// POST /api/v1/optimize
router.post('/', optimize);

module.exports = router;
