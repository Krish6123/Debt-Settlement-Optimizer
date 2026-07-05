/**
 * app.js
 * -------
 * Vanilla JS controller for the debt settlement UI.
 *
 * Responsibilities:
 *   1. Hold the in-memory list of entered transactions (state).
 *   2. Re-render the transaction list and enable/disable the optimize
 *      button whenever that state changes.
 *   3. POST the transaction list to /api/v1/optimize and render the
 *      returned settlements + stats.
 */

// ----------------------------- State ---------------------------------------

/** @type {Array<{from: string, to: string, amount: number}>} */
let transactions = [];

// ----------------------------- DOM refs -------------------------------------

const form = document.getElementById('txn-form');
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const amountInput = document.getElementById('amount');
const formError = document.getElementById('form-error');

const txnList = document.getElementById('txn-list');
const txnEmpty = document.getElementById('txn-empty');
const txnCount = document.getElementById('txn-count');

const optimizeBtn = document.getElementById('optimize-btn');
const optimizeLabel = document.getElementById('optimize-label');
const optimizeSpinner = document.getElementById('optimize-spinner');

const resultsEmpty = document.getElementById('results-empty');
const resultsContent = document.getElementById('results-content');
const settlementList = document.getElementById('settlement-list');
const statOriginal = document.getElementById('stat-original');
const statOptimized = document.getElementById('stat-optimized');
const statTotal = document.getElementById('stat-total');

// ----------------------------- Helpers --------------------------------------

/** Formats a number as a USD currency string, e.g. 42 -> "$42.00". */
function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

/** Shows a transient validation message beneath the add-transaction form. */
function showFormError(message) {
  formError.textContent = message;
  formError.classList.remove('hidden');
}

function clearFormError() {
  formError.classList.add('hidden');
  formError.textContent = '';
}

// ----------------------------- Rendering ------------------------------------

/** Re-renders the transaction list from current state. */
function renderTransactions() {
  // Clear everything except the empty-state placeholder, then re-add rows.
  txnList.innerHTML = '';

  if (transactions.length === 0) {
    txnList.appendChild(txnEmpty);
    optimizeBtn.disabled = true;
  } else {
    transactions.forEach((txn, index) => {
      const li = document.createElement('li');
      li.className =
        'row-enter flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas px-3.5 py-2.5';
      li.innerHTML = `
        <div class="flex items-center gap-2 text-sm min-w-0">
          <span class="font-medium truncate">${txn.from}</span>
          <svg class="h-3.5 w-3.5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span class="font-medium truncate">${txn.to}</span>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="font-mono text-sm">${formatCurrency(txn.amount)}</span>
          <button aria-label="Remove transaction" data-index="${index}"
            class="remove-btn text-muted hover:text-debit transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      `;
      txnList.appendChild(li);
    });
    optimizeBtn.disabled = false;
  }

  txnCount.textContent = String(transactions.length);

  // Wire up the per-row delete buttons (event delegation would also work,
  // but the list is small so direct binding stays simple and readable).
  document.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      transactions.splice(idx, 1);
      renderTransactions();
    });
  });
}

/** Renders the optimized settlements + stats returned by the API. */
function renderResults({ settlements, stats }) {
  resultsEmpty.classList.add('hidden');
  resultsContent.classList.remove('hidden');
  resultsContent.classList.add('flex');

  statOriginal.textContent = stats.originalTransactions;
  statOptimized.textContent = stats.optimizedTransactions;
  statTotal.textContent = formatCurrency(stats.totalTransferred);

  settlementList.innerHTML = '';

  if (settlements.length === 0) {
    settlementList.innerHTML = `
      <li class="text-sm text-muted text-center py-6 border border-dashed border-line rounded-lg">
        Everyone is already settled up.
      </li>`;
    return;
  }

  settlements.forEach((s) => {
    const li = document.createElement('li');
    li.className =
      'row-enter flex items-center justify-between gap-3 rounded-lg border border-line px-4 py-3';
    li.innerHTML = `
      <div class="flex items-center gap-2.5 text-sm min-w-0">
        <span class="font-medium text-debit truncate">${s.from}</span>
        <svg class="h-4 w-4 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span class="font-medium text-credit truncate">${s.to}</span>
      </div>
      <span class="font-mono font-semibold text-sm shrink-0">${formatCurrency(s.amount)}</span>
    `;
    settlementList.appendChild(li);
  });
}

// ----------------------------- Event handlers --------------------------------

form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearFormError();

  const from = fromInput.value.trim();
  const to = toInput.value.trim();
  const amount = parseFloat(amountInput.value);

  // --- Client-side validation, mirrors the backend's rules ---
  if (!from || !to) {
    showFormError('Sender and receiver are both required.');
    return;
  }
  if (from.toLowerCase() === to.toLowerCase()) {
    showFormError('Sender and receiver must be different people.');
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    showFormError('Amount must be a positive number.');
    return;
  }

  transactions.push({ from, to, amount: Math.round(amount * 100) / 100 });
  renderTransactions();

  form.reset();
  fromInput.focus();
});

optimizeBtn.addEventListener('click', async () => {
  if (transactions.length === 0) return;

  // --- Loading state ---
  optimizeBtn.disabled = true;
  optimizeLabel.textContent = 'Optimizing…';
  optimizeSpinner.classList.remove('hidden');

  try {
    const response = await fetch('/api/v1/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Server responded with a structured { error } payload.
      throw new Error(data.error || 'Something went wrong while optimizing.');
    }

    renderResults(data);
  } catch (err) {
    showFormError(err.message);
  } finally {
    optimizeBtn.disabled = transactions.length === 0;
    optimizeLabel.textContent = 'Optimize settlements';
    optimizeSpinner.classList.add('hidden');
  }
});

// ----------------------------- Initial render ---------------------------------
renderTransactions();
