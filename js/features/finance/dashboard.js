// ==================== RENDER ====================
function recalculateBalances() {
  // Reset all wallet balances to 0, then apply every transaction
  // This guarantees the displayed balance always matches the transaction history
  state.wallets.forEach(w => { w.balance = 0; });
  state.transactions.forEach(tx => {
    const wallet = state.wallets.find(w => w.id === tx.walletId);
    if (wallet) {
      if (tx.type === 'expense') {
        wallet.balance -= tx.amount;
      } else {
        wallet.balance += tx.amount;
      }
    }
  });
}


function renderSkinAndCharacterSystem() {
  const c = getCollabState();
  const skins = Array.isArray(c.ownedSkins) ? c.ownedSkins : [];
  const chars = Array.isArray(c.ownedCharacters) ? c.ownedCharacters : [];
  const summary = document.getElementById('acc-collection-summary');
  const equipped = document.getElementById('acc-equipped-summary');

  if (summary) summary.textContent = `${skins.length} skin · ${chars.length} karakter`;

  const skinName = c.equippedSkin && (c.equippedSkin.name || c.equippedSkin.title);
  const charName = c.equippedCharacter && (c.equippedCharacter.name || c.equippedCharacter.title);
  if (equipped) {
    equipped.textContent = skinName || charName || '';
    equipped.classList.toggle('hidden', !(skinName || charName));
  }

  // Skin = tema visual aplikasi. Karakter tidak mengubah tema.
  const root = document.documentElement;
  const skin = c.equippedSkin || {};
  root.dataset.activeSkin = skin.id || '';
  root.style.setProperty('--app-skin-primary', skin.primaryColor || '');
  root.style.setProperty('--app-skin-secondary', skin.secondaryColor || '');
  root.style.setProperty('--app-skin-accent', skin.accentColor || '');
  root.style.setProperty('--app-skin-background', skin.backgroundColor || '');
  root.style.setProperty('--app-skin-card', skin.cardColor || '');
  root.style.setProperty('--app-skin-text', skin.textColor || '');
  document.body.dataset.activeSkin = skin.id || '';
  if (typeof renderCollectionHeroCounts === 'function') renderCollectionHeroCounts();
}

function renderAll() {
  recalculateBalances();
  renderSkinAndCharacterSystem();
  renderWallets();
  renderCategories();
  renderTransactions();
  renderSummary();
  renderCharts();
  populateManualSelects();
  renderProfile();
  renderCollabHome();
  renderCollabPage();
  if (!document.getElementById('tab-stat').classList.contains('hidden')) renderStatPage();
  if (wpId && !document.getElementById('page-wallet').classList.contains('hidden')) renderWalletPage();
}

function formatRp(n) {
  return 'Rp ' + Math.abs(Math.round(n)).toLocaleString('id-ID');
}

function renderWallets() {
  const el = document.getElementById('wallets-list');
  el.innerHTML = state.wallets.map(w => `
    <div class="wallet-card flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 transition cursor-default gap-2">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <button onclick="openLogoPicker('${w.id}')" title="Ganti logo" class="shrink-0">${walletLogoHTML(w)}</button>
        <div class="min-w-0 flex-1 cursor-pointer" onclick="openWalletPage('${w.id}')">
          <p class="font-medium text-sm truncate">${w.name} <i class="fas fa-chevron-right text-[10px] text-slate-300"></i></p>
          <p class="text-xs text-slate-500 break-words">${formatRp(w.balance)}</p>
        </div>
      </div>
      <button onclick="deleteWallet('${w.id}')" class="text-slate-300 hover:text-red-500 text-xs p-2 shrink-0"><i class="fas fa-times"></i></button>
    </div>
  `).join('');
}

function renderCategories() {
  const el = document.getElementById('categories-list');
  el.innerHTML = state.categories.map(c => `
    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-sm border border-slate-200">
      <span>${catIcon(c)}</span> ${escapeHtml(c.name)}
      <button onclick="deleteCategory('${c.id}')" class="ml-1 p-1 text-slate-400 hover:text-red-500 text-xs"><i class="fas fa-times"></i></button>
    </span>
  `).join('');
}

function renderTransactions() {
  const filter = document.getElementById('filter-type').value;
  let txs = [...state.transactions].sort((a,b) => new Date(b.date) - new Date(a.date));
  if (filter !== 'all') txs = txs.filter(t => t.type === filter);

  const el = document.getElementById('transactions-list');
  if (txs.length === 0) {
    el.innerHTML = `<div class="p-8 text-center text-slate-400 text-sm">Belum ada transaksi. Coba bilang ke AI di sebelah kiri!</div>`;
    return;
  }
  el.innerHTML = txs.slice(0, 50).map(t => {
    const wallet = state.wallets.find(w => w.id === t.walletId);
    const cat = state.categories.find(c => c.id === t.categoryId);
    const isExp = t.type === 'expense';
    return `
      <div class="px-4 sm:px-5 py-3 flex items-start gap-3 hover:bg-slate-50 transition">
        <div class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${isExp ? 'bg-rose-50' : 'bg-emerald-50'}">
          ${cat ? catIcon(cat) : (isExp ? '📤' : '📥')}
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-sm break-words">${escapeHtml(cat ? cat.name : 'Lainnya')}${t.note ? ' · ' + escapeHtml(t.note) : ''}</p>
          <p class="text-xs text-slate-500 break-words">${escapeHtml(wallet ? wallet.name : '-')} · ${formatDate(t.date)}</p>
          <p class="font-semibold text-sm mt-0.5 ${isExp ? 'text-rose-600' : 'text-emerald-600'}">${isExp ? '−' : '+'} ${formatRp(t.amount)}</p>
        </div>
        <button onclick="deleteTransaction('${t.id}')" class="text-xs text-slate-300 hover:text-red-500 p-2 -mr-2 shrink-0"><i class="fas fa-trash"></i></button>
      </div>
    `;
  }).join('');
}

function formatDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderSummary() {
  const totalBal = state.wallets.reduce((s, w) => s + w.balance, 0);
  const tb = document.getElementById('total-balance');
  if (tb) { tb.dataset.real = formatRp(totalBal); }
  const now = new Date();
  const thisMonth = state.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const income = thisMonth.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const expense = thisMonth.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const mi = document.getElementById('month-income');
  const me = document.getElementById('month-expense');
  if (mi) mi.dataset.real = formatRp(income);
  if (me) me.dataset.real = formatRp(expense);
  applyHideAmt();
}

let amtHidden = false;
function toggleHideAmt() {
  amtHidden = !amtHidden;
  applyHideAmt();
}
function applyHideAmt() {
  const dots = '••••••';
  document.querySelectorAll('#balance-card .amt, #month-income, #month-expense').forEach(el => {
    const real = el.dataset.real || el.textContent;
    if (!el.dataset.real) el.dataset.real = real;
    el.textContent = amtHidden ? dots : (el.dataset.real || real);
  });
  const icon = document.getElementById('eye-icon');
  if (icon) icon.className = amtHidden ? 'far fa-eye-slash' : 'far fa-eye';
  const card = document.getElementById('balance-card');
  if (card) card.classList.toggle('hide-amt', amtHidden);
}

function renderCharts() {
  if (typeof Chart === 'undefined') return; // Chart.js gagal dimuat (CDN diblok/offline)
  const legendPos = (typeof window !== 'undefined' && window.innerWidth < 480) ? 'bottom' : 'right';
  const now = new Date();
  const thisMonth = state.transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Category chart
  const catMap = {};
  thisMonth.forEach(t => {
    const cat = state.categories.find(c => c.id === t.categoryId);
    const name = cat ? cat.name : 'Lainnya';
    catMap[name] = (catMap[name] || 0) + t.amount;
  });
  const catLabels = Object.keys(catMap);
  const catData = Object.values(catMap);
  const colors = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6','#f97316'];

  if (chartCategory) chartCategory.destroy();
  const ctx1 = document.getElementById('chart-category').getContext('2d');
  chartCategory = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: catLabels.length ? catLabels : ['Belum ada data'],
      datasets: [{ data: catData.length ? catData : [1], backgroundColor: colors, borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: legendPos, labels: { boxWidth: 12, font: { size: 11 } } } }
    }
  });

  // Wallet chart
  const walMap = {};
  thisMonth.forEach(t => {
    const w = state.wallets.find(x => x.id === t.walletId);
    const name = w ? w.name : 'Lainnya';
    walMap[name] = (walMap[name] || 0) + t.amount;
  });
  const walLabels = Object.keys(walMap);
  const walData = Object.values(walMap);

  if (chartWallet) chartWallet.destroy();
  const ctx2 = document.getElementById('chart-wallet').getContext('2d');
  chartWallet = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: walLabels.length ? walLabels : ['Belum ada data'],
      datasets: [{ data: walData.length ? walData : [1], backgroundColor: colors.slice().reverse(), borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: legendPos, labels: { boxWidth: 12, font: { size: 11 } } } }
    }
  });
}

