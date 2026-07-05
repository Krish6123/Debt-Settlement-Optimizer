/**
 * controllers/optimizeController.js
 * -----------------------------------
 * Handles POST /api/v1/optimize.
 *
 * Contract:
 *   Request body:  { transactions: [{ from, to, amount }, ...] }
 *   Response body: { settlements: [...], stats: { ... } }
 */

const { optimizeDebts } = require('../services/debtOptimizer');

/**
 * Express handler for the optimize endpoint.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function optimize(req, res, next) {
  try {
    const { transactions } = req.body;

    // --- Basic validation -------------------------------------------------
    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: '"transactions" must be an array' });
    }
    if (transactions.length === 0) {
      return res.status(400).json({ error: '"transactions" array must not be empty' });
    }

    // --- Delegate to the core business logic service ----------------------
    const { settlements, stats } = optimizeDebts(transactions);

    // --- Respond with the API contract shape -------------------------------
    return res.status(200).json({ settlements, stats });
  } catch (err) {
    // Pass any unexpected errors (e.g. invalid transaction shape thrown by
    // the service layer) to the global error handler.
    next(err);
  }
}

module.exports = { optimize };
