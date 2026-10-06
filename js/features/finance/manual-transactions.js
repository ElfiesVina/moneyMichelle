// Manual form
function showManualForm() {
  manualType = 'expense';
  setManualType('expense');
  document.getElementById('manual-amount').value = '';
  document.getElementById('manual-note').value = '';
  document.getElementById('manual-date').valueAsDate = new Date();
  populateManualSelects();
  document.getElementById('modal-manual').classList.remove('hidden');
  document.getElementById('modal-manual').classList.add('flex');
}
function setManualType(type) {
  manualType = type;
  document.getElementById('btn-type-expense').className = type === 'expense' 
    ? 'flex-1 py-2 rounded-xl bg-rose-100 text-rose-700 font-medium border-2 border-rose-300'
    : 'flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium border-2 border-transparent';
  document.getElementById('btn-type-income').className = type === 'income'
    ? 'flex-1 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-medium border-2 border-emerald-300'
    : 'flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium border-2 border-transparent';
}
function populateManualSelects() {
  const wSel = document.getElementById('manual-wallet');
  const cSel = document.getElementById('manual-category');
  wSel.innerHTML = state.wallets.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
  cSel.innerHTML = state.categories.map(c => `<option value="${c.id}">${isImgIcon(c.icon) ? '📁' : c.icon} ${c.name}</option>`).join('');
}
function addManualTransaction() {
  const amount = parseFloat(document.getElementById('manual-amount').value);
  if (!amount || amount <= 0) return alert('Jumlah tidak valid');
  const walletId = document.getElementById('manual-wallet').value;
  const categoryId = document.getElementById('manual-category').value;
  const note = document.getElementById('manual-note').value.trim() || null;
  const date = document.getElementById('manual-date').value || new Date().toISOString().slice(0,10);

  appendTransaction({ type: manualType, amount, walletId, categoryId, note, date });
  hideModal('modal-manual');
  addChatMessage('ai', `✅ Transaksi manual berhasil ditambahkan: ${manualType === 'expense' ? '−' : '+'} ${formatRp(amount)}`);
}

function deleteTransaction(id) {
  if (!confirm('Hapus transaksi ini?')) return;
  removeTransaction(id);
}

function hideModal(id) {
  document.getElementById(id).classList.add('hidden');
  document.getElementById(id).classList.remove('flex');
}
