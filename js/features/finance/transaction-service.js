// ============================================================
// TRANSACTION SERVICE
// Satu pintu untuk membuat/menghapus transaksi.
// Wallet balance TIDAK diubah di sini; balance selalu dihitung
// ulang dari state.transactions oleh recalculateBalances().
// ============================================================
function createTransaction(input = {}) {
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Jumlah transaksi tidak valid.');
  return {
    id: input.id || ('tx_' + Date.now() + Math.random().toString(36).slice(2, 6)),
    type: input.type === 'income' ? 'income' : 'expense',
    amount,
    walletId: input.walletId || '',
    categoryId: input.categoryId || 'lainnya',
    note: input.note || null,
    date: input.date || new Date().toISOString().slice(0, 10),
    createdAt: input.createdAt || new Date().toISOString()
  };
}

function appendTransaction(input, options = {}) {
  const tx = createTransaction(input);
  state.transactions.push(tx);
  if (options.persist !== false) saveState();
  if (options.render !== false) renderAll();
  return tx;
}

function removeTransaction(id, options = {}) {
  const before = state.transactions.length;
  state.transactions = state.transactions.filter(tx => tx.id !== id);
  const removed = state.transactions.length !== before;
  if (removed) {
    if (options.persist !== false) saveState();
    if (options.render !== false) renderAll();
  }
  return removed;
}
