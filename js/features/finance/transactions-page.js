// ==================== HALAMAN TRANSAKSI ====================
function renderTxPage() {
  const list = document.getElementById('tx-page-list');
  if (!list) return;
  const filt = (document.getElementById('tx-filter') || {}).value || 'all';
  const wFilt = (document.getElementById('tx-wallet-filter') || {}).value || 'all';
  const wSel = document.getElementById('tx-wallet-filter');
  if (wSel) {
    const cur = wSel.value;
    wSel.innerHTML = '<option value="all">' + t('all_wallets') + '</option>' +
      state.wallets.map(w => '<option value="' + w.id + '">' + escapeHtml(w.name) + '</option>').join('');
    wSel.value = state.wallets.some(w => w.id === cur) ? cur : 'all';
  }
  let txs = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (filt === 'expense') txs = txs.filter(x => x.type === 'expense');
  if (filt === 'income') txs = txs.filter(x => x.type !== 'expense');
  if (wFilt !== 'all') txs = txs.filter(x => x.walletId === wFilt);
  if (!txs.length) {
    list.innerHTML = '<p class="p-10 text-center text-sm text-slate-400">' + t('no_tx') + '</p>';
    return;
  }
  const groups = {};
  txs.forEach(tx => {
    const k = String(tx.date).slice(0, 10);
    (groups[k] = groups[k] || []).push(tx);
  });
  list.innerHTML = Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(day => {
    const g = groups[day];
    const net = g.reduce((s, x) => s + (x.type === 'expense' ? -x.amount : x.amount), 0);
    const head = '<div class="px-4 py-2 bg-slate-50 flex justify-between text-xs font-semibold text-slate-600"><span>' +
      escapeHtml(day) + '</span><span class="' + (net < 0 ? 'text-rose-600' : 'text-emerald-600') + '">' +
      (net < 0 ? '-' : '+') + ' ' + formatRp(Math.abs(net)) + '</span></div>';
    const rows = g.map(tx => {
      const c = state.categories.find(x => x.id === tx.categoryId);
      const w = state.wallets.find(x => x.id === tx.walletId);
      const e = tx.type === 'expense';
      return '<div class="px-4 py-3 flex items-center gap-3">' +
        '<div class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ' + (e ? 'bg-rose-50' : 'bg-emerald-50') + '">' +
        (c ? catIcon(c) : (e ? '📤' : '📥')) + '</div>' +
        '<div class="min-w-0 flex-1"><p class="text-sm font-medium break-words">' + escapeHtml(c ? c.name : 'Lainnya') +
        (tx.note ? ' · ' + escapeHtml(tx.note) : '') + '</p>' +
        '<p class="text-xs text-slate-400">' + escapeHtml(w ? w.name : '') + '</p></div>' +
        '<p class="text-sm font-semibold whitespace-nowrap ' + (e ? 'text-rose-600' : 'text-emerald-600') + '">' +
        (e ? '-' : '+') + ' ' + formatRp(tx.amount) + '</p></div>';
    }).join('');
    return head + rows;
  }).join('');
}

