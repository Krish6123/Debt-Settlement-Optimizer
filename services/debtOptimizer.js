/**
 * debtOptimizer.js
 * -----------------
 * Public-facing interface for the debt settlement tracking application.
 *
 * Orchestrates the pipeline:
 *   raw transactions -> net balances -> optimized settlements -> stats
 *
 * This is the only module consumers (controllers/routes) should import;
 * balanceCalculator and settlementEngine are internal implementation details.
 */

const { calculateBalances } = require('./balanceCalculator');
const { optimizeSettlements } = require('./settlementEngine');

/**
 * Runs the full optimization pipeline on a list of raw transactions.
 * @param {Array<{from: string, to: string, amount: number}>} originalTransactions
 * @returns {{
 *   balances: Object<string, number>,
 *   settlements: Array<{from: string, to: string, amount: number}>,
 *   stats: {
 *     originalTransactions: number,
 *     optimizedTransactions: number,
 *     totalTransferred: number
 *   }
 * }}
 */
function optimizeDebts(originalTransactions) {
  // Step 1: Reduce raw transaction history to net balance per participant.
  const balances = calculateBalances(originalTransactions);

  // Step 2: Run the greedy min-cash-flow algorithm to minimize transfers.
  const settlements = optimizeSettlements(balances);

  // Step 3: Sum the total value actually moved by the optimized settlements.
  // (Should always equal the sum of all positive balances in a closed ledger.)
  const totalTransferred = Math.round(
    settlements.reduce((sum, s) => sum + s.amount, 0) * 100
  ) / 100;

  // Step 4: Assemble the statistics object for reporting/UI consumption.
  const stats = {
    originalTransactions: originalTransactions.length,
    optimizedTransactions: settlements.length,
    totalTransferred,
  };

  return { balances, settlements, stats };
}

module.exports = { optimizeDebts };
