// ==================== PENGATURAN AI ====================

const SETTINGS_KEY = 'ai_keuangan_settings_v1';
let settings = { mode: 'ai', apiUrl: '', model: '' };

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) settings = { ...settings, ...JSON.parse(raw) };
  } catch (e) { console.warn(e); }
}
function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { console.warn(e); }
}

function normalizeApiUrl(u) {
  let url = String(u || '').trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url.replace(/\/+$/, '').replace(/\/api\/parse$/i, '');
}

function initSettings() {
  loadSettings();
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('settings-wrap');
    const pn = document.getElementById('settings-panel');
    if (wrap && !wrap.contains(e.target) && !(pn && pn.contains(e.target))) closeSettings();
  });
  syncSettingsUI();
}

function syncSettingsUI() {
  document.querySelectorAll('input[name="ai-mode"]').forEach(r => { r.checked = (r.value === settings.mode); });
  document.getElementById('set-api-url').value = settings.apiUrl || '';
  const sel = document.getElementById('set-model');
  if (settings.model && ![...sel.options].some(o => o.value === settings.model)) {
    const opt = document.createElement('option');
    opt.value = settings.model;
    opt.textContent = settings.model;
    sel.appendChild(opt);
  }
  sel.value = settings.model || '';
}

function toggleSettings() {
  const panel = document.getElementById('settings-panel');
  if (panel.classList.contains('hidden')) syncSettingsUI();
  panel.classList.toggle('hidden');
}
function closeSettings() {
  const panel = document.getElementById('settings-panel');
  if (panel) panel.classList.add('hidden');
}

function setSettingsStatus(msg) {
  document.getElementById('settings-status').textContent = msg;
}

function onSettingsChange() {
  const checked = document.querySelector('input[name="ai-mode"]:checked');
  settings.mode = checked ? checked.value : 'ai';
  settings.apiUrl = normalizeApiUrl(document.getElementById('set-api-url').value);
  settings.model = document.getElementById('set-model').value || '';
  document.getElementById('set-api-url').value = settings.apiUrl;
  saveSettings();
  setSettingsStatus('✔ Tersimpan.');
}

async function fetchJson(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch(url, { ...options, signal: controller.signal });
    let data = null;
    try { data = await r.json(); } catch (e) { /* bukan JSON */ }
    return { ok: r.ok, status: r.status, data };
  } finally {
    clearTimeout(timer);
  }
}

function fillModelSelect(models, defaultModel) {
  const sel = document.getElementById('set-model');
  const current = settings.model;
  sel.innerHTML = '';
  const d = document.createElement('option');
  d.value = '';
  d.textContent = defaultModel ? 'Default server (' + defaultModel + ')' : 'Default server';
  sel.appendChild(d);
  models.forEach(m => {
    const o = document.createElement('option');
    o.value = m;
    o.textContent = m;
    sel.appendChild(o);
  });
  // jika pilihan lama sudah tidak diizinkan server, kembali ke default
  sel.value = models.includes(current) ? current : '';
  settings.model = sel.value;
  saveSettings();
}

async function testConnection() {
  onSettingsChange();
  if (!settings.apiUrl) { setSettingsStatus('Isi alamat server dulu.'); return; }
  setSettingsStatus('⏳ Menghubungi server...');
  try {
    const res = await fetchJson(settings.apiUrl + '/api/parse', { method: 'GET' }, 10000);
    if (!res.ok || !res.data || !res.data.ok) throw new Error('server membalas kode ' + res.status);
    const models = Array.isArray(res.data.models) ? res.data.models : [];
    fillModelSelect(models, res.data.default);
    if (res.data.configured) setSettingsStatus('✅ Terhubung. ' + models.length + ' model tersedia.');
    else setSettingsStatus('⚠️ Server hidup, tapi API key / model belum diatur di Vercel.');
  } catch (e) {
    setSettingsStatus('❌ ' + (e && e.name === 'AbortError' ? 'Server terlalu lama membalas.' : 'Gagal terhubung. Cek alamat & internet.'));
  }
}

async function parseWithAI(text) {
  if (!settings.apiUrl) throw new Error('alamat server belum diisi');
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new Error('sedang offline');
  const payload = {
    text,
    wallets: state.wallets.map(w => w.name),
    categories: state.categories.map(c => c.name)
  };
  if (settings.model) payload.model = settings.model;

  let res;
  try {
    res = await fetchJson(settings.apiUrl + '/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, 15000);
  } catch (e) {
    throw new Error(e && e.name === 'AbortError' ? 'server terlalu lama membalas' : 'tidak bisa menghubungi server');
  }
  if (!res.ok || !res.data || !res.data.ok) {
    throw new Error((res.data && res.data.error) || ('server membalas kode ' + res.status));
  }
  return res.data.data;
}

// Ubah hasil AI menjadi bentuk yang sama dengan parseNL; wallet harus ada di daftar
function aiToResult(data) {
  if (!data || (data.type !== 'expense' && data.type !== 'income')) throw new Error('jenis transaksi tidak jelas');
  const amount = Math.round(Number(data.amount));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('jumlah tidak jelas');

  const wallet = state.wallets.find(w => w.name.toLowerCase() === String(data.wallet || '').toLowerCase());
  if (!wallet) return { askWallet: true };

  let category = state.categories.find(c => c.name.toLowerCase() === String(data.category || '').toLowerCase());
  if (!category) category = state.categories.find(c => c.id === 'lainnya') || state.categories[0];

  return {
    type: data.type,
    amount,
    walletId: wallet.id,
    categoryId: category.id,
    note: data.note || null,
    date: new Date().toISOString().slice(0, 10),
    parsed: { wallet: wallet.name, category: category.name }
  };
}


