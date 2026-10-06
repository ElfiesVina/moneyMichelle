// ==================== HALAMAN DETAIL DOMPET ====================
let wpId = null, wpMode = 'month', wpAnchor = new Date(), wpMetric = 'expense', wpChart = null;
const MODES = [['day','Hari'],['week','Pekan'],['month','Bulan'],['year','Tahun'],['custom','Rentang']];
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const dOnly = d => { const x = new Date(d); return new Date(x.getFullYear(), x.getMonth(), x.getDate()); };
const fmtD = d => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

function periodRange() {
  const a = dOnly(wpAnchor); let from, to;
  if (wpMode === 'day') { from = to = a; }
  else if (wpMode === 'week') { const k = (a.getDay() + 6) % 7; from = new Date(a.getFullYear(), a.getMonth(), a.getDate() - k); to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 6); }
  else if (wpMode === 'month') { from = new Date(a.getFullYear(), a.getMonth(), 1); to = new Date(a.getFullYear(), a.getMonth() + 1, 0); }
  else if (wpMode === 'custom') {
    const f = document.getElementById('wp-from').value, t = document.getElementById('wp-to').value;
    from = f ? new Date(f + 'T00:00:00') : new Date(a.getFullYear(), a.getMonth(), 1);
    to = t ? new Date(t + 'T00:00:00') : a;
    if (to < from) to = from;
  }
  else { from = new Date(a.getFullYear(), 0, 1); to = new Date(a.getFullYear(), 11, 31); }
  return { from, to };
}
function openWalletPage(id) {
  wpId = id; wpAnchor = new Date();
  const el = document.getElementById('page-wallet'); el.classList.remove('hidden'); el.classList.add('flex');
  renderWalletPage();
}
function closeWalletPage() {
  const el = document.getElementById('page-wallet'); el.classList.add('hidden'); el.classList.remove('flex');
  if (wpChart) { wpChart.destroy(); wpChart = null; }
}
function toggleModeMenu() { document.getElementById('wp-mode-menu').classList.toggle('hidden'); }
document.addEventListener('click', e => {
  const m = document.getElementById('wp-mode-menu');
  if (m && !m.classList.contains('hidden') && !e.target.closest('#wp-mode-wrap')) m.classList.add('hidden');
});
function setPeriodMode(m) {
  document.getElementById('wp-mode-menu').classList.add('hidden');
  wpMode = m;
  if (m === 'custom' && !document.getElementById('wp-from').value) {
    const r = { from: new Date(wpAnchor.getFullYear(), wpAnchor.getMonth(), 1), to: dOnly(wpAnchor) };
    const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    document.getElementById('wp-from').value = iso(r.from); document.getElementById('wp-to').value = iso(r.to);
  }
  renderWalletPage();
}
function setStatMetric(m) { wpMetric = m; renderWalletPage(); }
function jumpDate(v) { if (v) { wpAnchor = new Date(v + 'T00:00:00'); renderWalletPage(); } }
function shiftPeriod(n) {
  if (wpMode === 'custom') return;
  const a = dOnly(wpAnchor);
  if (wpMode === 'day') a.setDate(a.getDate() + n);
  else if (wpMode === 'week') a.setDate(a.getDate() + 7 * n);
  else if (wpMode === 'month') a.setMonth(a.getMonth() + n, 1);
  else a.setFullYear(a.getFullYear() + n, 0, 1);
  wpAnchor = a; renderWalletPage();
}

function renderWalletPage() {
  const w = state.wallets.find(x => x.id === wpId); if (!w) return closeWalletPage();
  document.getElementById('wp-logo').innerHTML = walletLogoHTML(w, 'w-11 h-11');
  document.getElementById('wp-name').textContent = w.name;
  document.getElementById('wp-balance').textContent = (w.balance < 0 ? '-' : '') + formatRp(w.balance);
  document.getElementById('wp-mode-label').textContent = MODES.find(m => m[0] === wpMode)[1];
  document.getElementById('wp-mode-menu').innerHTML = MODES.map(([k, l]) =>
    `<button onclick="setPeriodMode('${k}')" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left ${k === wpMode ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'hover:bg-slate-50'}">${l}${k === wpMode ? '<i class="fas fa-check text-xs"></i>' : ''}</button>`).join('');
  document.getElementById('wp-custom').classList.toggle('hidden', wpMode !== 'custom');
  const { from, to } = periodRange();
  document.getElementById('wp-range').innerHTML = wpMode === 'day' ? fmtD(from) : fmtD(from) + '<span class="block text-xs font-medium text-slate-500">s/d ' + fmtD(to) + '</span>';

  const txs = state.transactions.filter(t => t.walletId === wpId && dOnly(t.date) >= from && dOnly(t.date) <= to)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const inc = txs.filter(t => t.type !== 'expense').reduce((s, t) => s + t.amount, 0);
  const out = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  document.getElementById('wp-in').textContent = formatRp(inc);
  document.getElementById('wp-out').textContent = formatRp(out);
  document.getElementById('wp-net').textContent = (inc - out < 0 ? '-' : '+') + formatRp(inc - out);

  // daftar dikelompokkan per tanggal
  const groups = {};
  txs.forEach(t => { const k = dOnly(t.date).getTime(); (groups[k] = groups[k] || []).push(t); });
  document.getElementById('wp-list').innerHTML = txs.length ? Object.keys(groups).sort((a, b) => b - a).map(k => {
    const g = groups[k], net = g.reduce((s, t) => s + (t.type === 'expense' ? -t.amount : t.amount), 0);
    return `<div class="px-4 py-2 bg-slate-50 flex justify-between text-xs font-semibold text-slate-600"><span>${fmtD(new Date(+k))}</span><span class="${net < 0 ? 'text-rose-600' : 'text-emerald-600'}">${net < 0 ? '-' : '+'} ${formatRp(net)}</span></div>` +
      g.map(t => {
        const c = state.categories.find(x => x.id === t.categoryId), e = t.type === 'expense';
        return `<div class="px-4 py-3 flex items-center gap-3 border-b border-slate-50">
          <div class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${e ? 'bg-rose-50' : 'bg-emerald-50'}">${c ? catIcon(c) : (e ? '📤' : '📥')}</div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium break-words">${escapeHtml(c ? c.name : 'Lainnya')}${t.note ? ' · ' + escapeHtml(t.note) : ''}</p>
            <p class="text-sm font-semibold mt-0.5 ${e ? 'text-rose-600' : 'text-emerald-600'}">${e ? '-' : '+'} ${formatRp(t.amount)}</p></div></div>`;
      }).join('');
  }).join('') : '<p class="p-8 text-center text-sm text-slate-400">' + t('no_tx_period') + '</p>';

  // Statistik 3 bulan di halaman dompet dihapus (sudah ada di tab Statistik)
  if (wpChart) { try { wpChart.destroy(); } catch (e) {} wpChart = null; }
}

