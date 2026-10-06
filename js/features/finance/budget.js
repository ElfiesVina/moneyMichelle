// ==================== ANGGARAN ====================
function budgetMonthKey(d) {
  const x = d || new Date();
  return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0');
}
function openBudgetForm() {
  const sel = document.getElementById('budget-cat');
  if (!sel) return;
  sel.innerHTML = state.categories.map(c => '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>').join('');
  document.getElementById('budget-limit').value = '';
  const m = document.getElementById('modal-budget');
  m.classList.remove('hidden'); m.classList.add('flex');
}
function saveBudget() {
  const catId = document.getElementById('budget-cat').value;
  const limit = Math.round(Number(document.getElementById('budget-limit').value));
  if (!catId || !Number.isFinite(limit) || limit <= 0) { alert('Isi kategori dan batas yang valid'); return; }
  const month = budgetMonthKey();
  if (!Array.isArray(state.budgets)) state.budgets = [];
  const i = state.budgets.findIndex(b => b.categoryId === catId && b.month === month);
  if (i >= 0) state.budgets[i].limit = limit;
  else state.budgets.push({ id: 'b_' + Date.now(), categoryId: catId, limit, month });
  saveState();
  hideModal('modal-budget');
  renderBudgetPage();
}
function deleteBudget(id) {
  if (!confirm('Hapus anggaran ini?')) return;
  state.budgets = (state.budgets || []).filter(b => b.id !== id);
  saveState();
  renderBudgetPage();
}
function renderBudgetPage() {
  const month = budgetMonthKey();
  const label = document.getElementById('budget-month-label');
  if (label) {
    const [y, m] = month.split('-');
    const names = prefs.lang === 'en'
      ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      : BULAN;
    label.textContent = names[Number(m) - 1] + ' ' + y;
  }
  const list = document.getElementById('budget-list');
  const empty = document.getElementById('budget-empty');
  if (!list) return;
  const items = (state.budgets || []).filter(b => b.month === month);
  if (!items.length) {
    list.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');
  const spentByCat = {};
  state.transactions.forEach(tx => {
    if (tx.type !== 'expense') return;
    const d = String(tx.date).slice(0, 7);
    if (d !== month) return;
    spentByCat[tx.categoryId] = (spentByCat[tx.categoryId] || 0) + tx.amount;
  });
  list.innerHTML = items.map(b => {
    const c = state.categories.find(x => x.id === b.categoryId);
    const spent = spentByCat[b.categoryId] || 0;
    const pct = Math.min(100, Math.round(spent / b.limit * 100));
    const over = spent > b.limit;
    const bar = over ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
    return '<div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">' +
      '<div class="flex items-center gap-3 mb-2">' +
      '<span class="text-2xl">' + (c ? catIcon(c) : '📌') + '</span>' +
      '<div class="min-w-0 flex-1"><p class="font-semibold text-sm">' + escapeHtml(c ? c.name : b.categoryId) + '</p>' +
      '<p class="text-xs text-slate-500">' + formatRp(spent) + ' / ' + formatRp(b.limit) + ' ' + t('budget_used') + '</p></div>' +
      '<button onclick="deleteBudget(\'' + b.id + '\')" class="text-slate-400 hover:text-rose-500 p-2" aria-label="Hapus"><i class="fas fa-trash text-xs"></i></button></div>' +
      '<div class="h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full ' + bar + ' rounded-full transition-all" style="width:' + Math.min(pct, 100) + '%"></div></div>' +
      (over ? '<p class="text-xs text-rose-600 mt-1.5 font-medium">' + t('budget_over') + ' · ' + formatRp(spent - b.limit) + '</p>' : '') +
      '</div>';
  }).join('');
}


