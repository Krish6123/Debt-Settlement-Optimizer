/**
 * settlementEngine.js
 * --------------------
 * Pure module implementing the "minimum cash flow" greedy algorithm.
 *
 * Goal: given net balances per participant, produce the smallest possible
 * set of transfers that settles all debts.
 *
 * Strategy (greedy, two-pointer on sorted arrays):
 *   1. Split participants into creditors (balance > 0) and debtors (balance < 0).
 *   2. Sort creditors ascending and debtors ascending (by their negative amount),
 *      so the pointers can walk from the largest creditor/debtor down to the smallest
 *      if we point at the end of each array — this is the classic two-pointer sweep.
 *   3. At each step, match the largest creditor with the largest debtor.
 *      Transfer the smaller of the two magnitudes. Whichever balance hits zero
 *      first advances its pointer; the other retains its remainder for the next round.
 *   4. Repeat until all balances are settled (all pointers exhausted).
 *
 * This does not guarantee the mathematically optimal minimum number of
 * transactions in all edge cases (that problem is NP-hard in general),
 * but the greedy largest-first approach is the standard, well-performing
 * heuristic used in real-world settle-up apps (e.g. Splitwise-style).
 */

const EPSILON = 0.01; // Treat balances smaller than 1 cent as settled.

/**
 * Computes the minimal set of settlement transfers from net balances.
 * @param {Object<string, number>} balances map of participant -> net balance
 * @returns {Array<{from: string, to: string, amount: number}>} optimized settlements
 */
function optimizeSettlements(balances) {
  // Separate participants into creditors (owed money) and debtors (owe money).
  // We store amounts as absolute values to simplify comparison logic.
  const creditors = [];
  const debtors = [];

  for (const [participant, balance] of Object.entries(balances)) {
    if (balance > EPSILON) {
      creditors.push({ name: participant, amount: balance });
    } else if (balance < -EPSILON) {
      debtors.push({ name: participant, amount: -balance }); // store as positive owed amount
    }
    // balances within EPSILON of zero are already settled; skip them.
  }

  // Sort ascending so the "largest" party sits at the end of the array.
  // Two pointers (i, j) start at the end and move toward the front as
  // each party's balance is fully consumed.
  creditors.sort((a, b) => a.amount - b.amount);
  debtors.sort((a, b) => a.amount - b.amount);

  const settlements = [];
  let i = creditors.length - 1; // pointer to largest remaining creditor
  let j = debtors.length - 1;   // pointer to largest remaining debtor

  while (i >= 0 && j >= 0) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    // The transferable amount is capped by whichever side has less to settle.
    const transferAmount = Math.round(Math.min(creditor.amount, debtor.amount) * 100) / 100;

    if (transferAmount > EPSILON) {
      settlements.push({
        from: debtor.name,   // debtor pays...
        to: creditor.name,   // ...creditor
        amount: transferAmount,
      });
    }

    // Deduct the transferred amount from both sides.
    creditor.amount = Math.round((creditor.amount - transferAmount) * 100) / 100;
    debtor.amount = Math.round((debtor.amount - transferAmount) * 100) / 100;

    // Advance whichever pointer(s) have been fully settled.
    if (creditor.amount <= EPSILON) i--;
    if (debtor.amount <= EPSILON) j--;
  }

  return settlements;
}

module.exports = { optimizeSettlements };
