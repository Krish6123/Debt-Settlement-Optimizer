/**
 * balanceCalculator.js
 * ---------------------
 * Pure module responsible for reducing a list of raw transactions
 * into a net balance per participant.
 *
 * A transaction represents "from paid to amount" or "from owes to amount".
 * We interpret it as: `from` -> `to` means `from` transferred `amount`
 * to `to`, so `from` is owed money (creditor, +amount) and `to` owes
 * money (debtor, -amount).
 *
 * Input shape:
 *   [{ from: 'Alice', to: 'Bob', amount: 50 }, ...]
 *
 * Output shape:
 *   { Alice: 50, Bob: -50 }
 */

/**
 * Calculates net balances for every participant found in the transactions.
 * @param {Array<{from: string, to: string, amount: number}>} transactions
 * @returns {Object<string, number>} map of participant -> net balance
 */
function calculateBalances(transactions) {
  if (!Array.isArray(transactions)) {
    throw new TypeError('transactions must be an array');
  }

  // Accumulator object: participant name -> running net balance.
  const balances = {};

  for (const txn of transactions) {
    const { from, to, amount } = txn;

    // Basic validation to avoid silently corrupting the ledger.
    if (typeof amount !== 'number' || amount <= 0) {
      throw new RangeError(`Invalid amount in transaction: ${JSON.stringify(txn)}`);
    }
    if (!from || !to || from === to) {
      throw new RangeError(`Invalid participants in transaction: ${JSON.stringify(txn)}`);
    }

    // Ensure both participants exist in the map before mutating.
    if (!(from in balances)) balances[from] = 0;
    if (!(to in balances)) balances[to] = 0;

    // `from` paid out on behalf of `to`, so `from` is owed money (+),
    // and `to` owes money back (-).
    balances[from] += amount;
    balances[to] -= amount;
  }

  // Round to 2 decimal places to avoid floating point drift (e.g. 0.1 + 0.2).
  for (const participant in balances) {
    balances[participant] = Math.round(balances[participant] * 100) / 100;
  }

  return balances;
}

module.exports = { calculateBalances };
