// ==================== HALAMAN STATISTIK ====================
let stMode = 'day', stMetric = 'expense', stWallet = 'all', stChart = null, stLastMode = null;
function niceStep(max) {
  if (max <= 0) return 20000;
  const raw = max / 5, pow = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / pow;
  return Math.max(1, (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow);
}
function fmtShort(v) {
  if (v >= 1e9) return +(v / 1e9).toFixed(1) + ' M';
  if (v >= 1e6) return +(v / 1e6).toFixed(1) + ' jt';
  if (v >= 1e3) return +(v / 1e3).toFixed(1) + ' rb';
  return String(v);
}
const BLN3 = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function renderStatPage() {
  const sel = document.getElementById('st-wallet');
  sel.innerHTML = '<option value="all">Semua Dompet</option>' + state.wallets.map(w => `<option value="${w.id}">${escapeHtml(w.name)}</option>`).join('');
  if (stWallet !== 'all' && !state.wallets.some(w => w.id === stWallet)) stWallet = 'all';
  sel.value = stWallet;
  document.getElementById('st-tabs').innerHTML = [['day','Harian'],['week','Mingguan'],['month','Bulanan']].map(([k, l]) =>
    `<button onclick="stMode='${k}';renderStatPage()" class="py-2 rounded-xl text-sm ${k === stMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}">${l}</button>`).join('');
  ['expense', 'income'].forEach(m => {
    document.getElementById('st-m-' + m).className = 'px-3 py-1 rounded-lg ' + (m === stMetric ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600');
  });
  const txs = state.transactions.filter(t => stWallet === 'all' || t.walletId === stWallet);
  const now = new Date(), Y = now.getFullYear(), M = now.getMonth();
  const yearly = stMode === 'month';
  const inPeriod = t => { const d = dOnly(t.date); return d.getFullYear() === Y && (yearly || d.getMonth() === M); };
  const inc = txs.filter(t => t.type !== 'expense' && inPeriod(t)).reduce((a, t) => a + t.amount, 0);
  const out = txs.filter(t => t.type === 'expense' && inPeriod(t)).reduce((a, t) => a + t.amount, 0);
  document.getElementById('st-period').textContent = 'Ringkasan ' + (yearly ? 'tahun ' + Y : BULAN[M] + ' ' + Y);
  document.getElementById('st-in').textContent = formatRp(inc);
  document.getElementById('st-out').textContent = formatRp(out);
  document.getElementById('st-net').textContent = (inc - out < 0 ? '-' : '+') + formatRp(inc - out);

  const dim = (y, m) => new Date(y, m + 1, 0).getDate();
  const refs = [2, 1, 0].map(k => yearly ? new Date(Y - k, 0, 1) : new Date(Y, M - k, 1));
  const size = stMode === 'day' ? Math.max(...refs.map(r => dim(r.getFullYear(), r.getMonth()))) : stMode === 'week' ? 5 : 12;
  const labels = stMode === 'day' ? Array.from({ length: size }, (_, i) => i + 1) : stMode === 'week' ? ['Mg 1','Mg 2','Mg 3','Mg 4','Mg 5'] : BLN3;
  const colors = ['#2563eb', '#16a34a', '#7c3aed'], sets = []; let maxV = 0;
  refs.forEach((ref, n) => {
    const data = Array(size).fill(0);
    if (stMode === 'day') for (let i = dim(ref.getFullYear(), ref.getMonth()); i < size; i++) data[i] = null;
    txs.forEach(t => {
      if ((t.type === 'expense') !== (stMetric === 'expense')) return;
      const d = dOnly(t.date);
      if (d.getFullYear() !== ref.getFullYear() || (!yearly && d.getMonth() !== ref.getMonth())) return;
      const idx = stMode === 'day' ? d.getDate() - 1 : stMode === 'week' ? Math.floor((d.getDate() - 1) / 7) : d.getMonth();
      data[idx] += t.amount;
    });
    data.forEach(v => { if (v > maxV) maxV = v; });
    sets.push({ label: yearly ? String(ref.getFullYear()) : BLN3[ref.getMonth()] + ' ' + ref.getFullYear(), data, borderColor: colors[n], backgroundColor: colors[n], tension: 0.35, pointRadius: 3, borderWidth: 2 });
  });
  // skala sumbu Y dihitung sendiri agar label kiri (HTML sticky) selalu pas dengan grafik yang bisa digeser
  const step = niceStep(maxV), yMax = maxV <= 0 ? step * 5 : Math.ceil(maxV / step) * step;
  // lebar per titik: hari ~40px agar 1–31 mudah digeser, minggu/bulan lebih lebar
  const per = stMode === 'day' ? 40 : stMode === 'week' ? 90 : 64;
  const scroll = document.getElementById('st-scroll');
  const wrap = document.getElementById('st-chartwrap');
  const inner = document.getElementById('st-chart-inner');
  const prevLeft = stLastMode === stMode ? scroll.scrollLeft : null;
  const chartW = Math.max(scroll.clientWidth || 300, size * per);
  wrap.style.width = chartW + 'px';
  if (inner) inner.style.minWidth = (48 + chartW) + 'px'; // y-axis ~48px + chart
  document.getElementById('st-legend').innerHTML = sets.map(x => `<span class="inline-flex items-center gap-1.5"><span class="w-3 h-3 rounded" style="background:${x.borderColor}"></span>${x.label}</span>`).join('');
  if (stChart) stChart.destroy();
  stChart = new Chart(document.getElementById('st-chart').getContext('2d'), {
    type: 'line', data: { labels, datasets: sets },
    options: { responsive: true, maintainAspectRatio: false, layout: { padding: { top: 8, right: 12, left: 4 } },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.dataset.label + ': ' + formatRp(c.parsed.y) } } },
      scales: { y: { min: 0, max: yMax, border: { display: false }, grid: { color: '#eef2f7' }, ticks: { stepSize: step, display: false }, afterFit: a => { a.width = 0; } },
                x: { grid: { display: false }, title: { display: true, text: stMode === 'day' ? 'Tanggal' : stMode === 'week' ? 'Pekan' : 'Bulan' } } } },
    plugins: [{ id: 'ylabels', afterLayout(chart) {
      const ca = chart.chartArea; let h = '';
      for (let v = 0; v <= yMax + 1e-9; v += step) {
        const top = ca.bottom - (v / yMax) * (ca.bottom - ca.top);
        h += `<span class="absolute right-1.5 text-[10px] text-slate-500 whitespace-nowrap font-medium" style="top:${top}px;transform:translateY(-50%)">${fmtShort(v)}</span>`;
      }
      document.getElementById('st-yaxis').innerHTML = h;
    } }]
  });
  // posisi awal: tengah di tanggal hari ini (mode harian), atau kiri
  scroll.scrollLeft = prevLeft !== null ? prevLeft : (stMode === 'day' ? Math.max(0, (now.getDate() - 0.5) * per - (scroll.clientWidth - 48) / 2) : 0);
  stLastMode = stMode;
}

