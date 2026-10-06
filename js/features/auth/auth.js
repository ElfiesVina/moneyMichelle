// ==================== PROFIL & AKUN ====================
// Developer: isi AUTH_CONFIG.url dengan alamat backend login kamu (Vercel/Supabase/dll).
// Endpoint yang dipanggil: POST {url}/signin dan POST {url}/signup, body JSON {name?, email, password}.
// Balasan sukses yang diharapkan: { name, email }. Kata sandi TIDAK pernah disimpan di aplikasi.
// Backend auth + cloud sync (jalankan: cd backend && npm start)
const AUTH_CONFIG = { url: '' };
function getAuthBaseUrl() {
  // Same-origin Vercel Functions. Developer can override for a separate backend with localStorage.
  try { return (localStorage.getItem('money_michelle_auth_api_url') || AUTH_CONFIG.url || '/api').replace(/\/$/, ''); }
  catch { return (AUTH_CONFIG.url || '/api').replace(/\/$/, ''); }
}
const TOKEN_KEY = 'ai_keuangan_token_v1';
let authMode = 'signin', pfAvatar = '';
function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } }
function setToken(t) { try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch {} }

const avatarInner = (p, size) => p.avatar
  ? `<img src="${p.avatar}" alt="" class="w-full h-full object-cover" />`
  : (p.name ? `<span class="text-white font-bold" style="font-size:${Math.round(size * 0.42)}px">${escapeHtml(p.name.trim().charAt(0).toUpperCase())}</span>`
            : `<i class="far fa-user text-white" style="font-size:${Math.round(size * 0.42)}px"></i>`);

function authCardHTML() {
  if (state.user) return `<div class="flex items-center gap-3"><span class="w-11 h-11 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><i class="fas fa-check"></i></span>
    <div class="min-w-0 flex-1"><p class="text-sm font-semibold">${t('already_in')}</p><p class="text-xs text-slate-500 truncate">${escapeHtml(state.user.email || '')}</p></div>
    <button onclick="signOut()" class="px-3 py-1.5 rounded-lg bg-slate-100 text-sm">${t('sign_out')}</button></div>`;
  return `<p class="text-sm font-semibold">${t('login_prompt')}</p><p class="text-xs text-slate-500 mt-0.5">${t('no_account')}</p>
    <div class="grid grid-cols-2 gap-2 mt-3"><button onclick="openAuth('signin')" class="py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium">${t('btn_login')}</button>
    <button onclick="openAuth('signup')" class="py-2.5 rounded-xl border border-blue-200 text-blue-600 text-sm font-medium">${t('btn_register')}</button></div>`;
}
function renderProfile() {
  const p = state.profile || { name: '', avatar: '' };
  const name = p.name || (state.user && state.user.name) || '';
  const greetEl = document.getElementById('greet');
  const mascotTitle = document.getElementById('mascot-title');
  const first = name ? name.split(' ')[0] : '';
  if (mascotTitle) {
    mascotTitle.textContent = first
      ? ((prefs.lang === 'en' ? 'Hi, ' : prefs.lang === 'ar' ? 'مرحباً، ' : 'Halo, ') + first + '!')
      : (prefs.lang === 'en' ? 'Hi!' : prefs.lang === 'ar' ? 'مرحباً!' : 'Halo!');
  }
  if (greetEl) {
    greetEl.textContent = t('greet_default');
    greetEl.dataset.custom = '0';
  }
  document.getElementById('acc-avatar').innerHTML = avatarInner({ name, avatar: p.avatar }, 96);
  const ha = document.getElementById('home-avatar'); if (ha) ha.innerHTML = avatarInner({ name, avatar: p.avatar }, 56);
  /* nama di sapaan mascot-title */
  document.getElementById('acc-name').textContent = name || t('guest');
  document.getElementById('acc-sub').textContent = state.user ? state.user.email : t('not_logged');
  document.getElementById('acc-wallets').textContent = state.wallets.length;
  document.getElementById('acc-tx').textContent = state.transactions.length;
  document.getElementById('acc-cats').textContent = state.categories.length;
  document.getElementById('acc-version').textContent = APP_VERSION;
  document.getElementById('menu-auth').innerHTML = authCardHTML();
  document.getElementById('acc-auth').innerHTML = authCardHTML();
}
function openProfileEdit() {
  pfAvatar = (state.profile && state.profile.avatar) || '';
  document.getElementById('pf-name').value = (state.profile && state.profile.name) || '';
  renderProfileEdit();
  const m = document.getElementById('modal-profile'); m.classList.remove('hidden'); m.classList.add('flex');
}
function renderProfileEdit() {
  document.getElementById('pf-avatar').innerHTML = avatarInner({ name: document.getElementById('pf-name').value, avatar: pfAvatar }, 80);
}
function handleAvatarUpload(e) {
  const file = e.target.files && e.target.files[0]; e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) return alert('File harus berupa gambar');
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = 160;
      const side = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 160, 160);
      pfAvatar = c.toDataURL('image/jpeg', 0.85); renderProfileEdit();
    };
    img.onerror = () => alert('Gambar tidak bisa dibaca');
    img.src = r.result;
  };
  r.readAsDataURL(file);
}
function saveProfile() {
  state.profile = { name: document.getElementById('pf-name').value.trim(), avatar: pfAvatar };
  saveState(); renderProfile(); hideModal('modal-profile');
}
function openAuth(mode) {
  authMode = mode;
  const up = mode === 'signup';
  const nameWrap = document.getElementById('auth-name-wrap');
  if (nameWrap) nameWrap.classList.toggle('hidden', !up);
  document.getElementById('auth-name').classList.toggle('hidden', !up);
  document.getElementById('auth-pass').autocomplete = up ? 'new-password' : 'current-password';
  document.getElementById('auth-submit').textContent = up ? (t('btn_register') || 'Daftar') : (t('btn_login') || 'Masuk');
  document.getElementById('auth-msg').textContent = '';
  const forgot = document.getElementById('auth-forgot');
  if (forgot) forgot.classList.toggle('hidden', up);
  // reset pass visibility
  const pass = document.getElementById('auth-pass');
  pass.type = 'password';
  const icon = document.getElementById('auth-pass-icon');
  if (icon) icon.className = 'fas fa-eye';
  ['signin', 'signup'].forEach(k => { document.getElementById('auth-tab-' + k).className = 'py-2 rounded-xl text-sm font-medium ' + (k === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'); });
  const m = document.getElementById('modal-auth'); m.classList.remove('hidden'); m.classList.add('flex');
}
function toggleAuthPass() {
  const pass = document.getElementById('auth-pass');
  const icon = document.getElementById('auth-pass-icon');
  if (!pass) return;
  const show = pass.type === 'password';
  pass.type = show ? 'text' : 'password';
  if (icon) icon.className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
}
async function forgotPassword() {
  const email = document.getElementById('auth-email').value.trim();
  const msg = document.getElementById('auth-msg');
  msg.className = 'text-xs min-h-[1rem] mb-2 text-slate-500';
  if (!email) {
    msg.className = 'text-xs min-h-[1rem] mb-2 text-rose-600';
    msg.textContent = t('forgot_need_email') || 'Masukkan email dulu, lalu ketuk Lupa kata sandi.';
    return;
  }
  if (!getAuthBaseUrl()) {
    msg.textContent = t('forgot_sent') || 'Jika email terdaftar, tautan reset akan dikirim (fitur server).';
    return;
  }
  try {
    msg.textContent = 'Mengirim...';
    const r = await fetch(getAuthBaseUrl() + '/forgot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const j = await r.json().catch(() => ({}));
    msg.textContent = j.message || (t('forgot_sent') || 'Jika email terdaftar, tautan reset akan dikirim.');
  } catch {
    msg.className = 'text-xs min-h-[1rem] mb-2 text-rose-600';
    msg.textContent = 'Gagal menghubungi server.';
  }
}
async function authRequest(mode, payload) {
  try {
    const r = await fetch(getAuthBaseUrl() + '/' + mode, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || 'Gagal, coba lagi.');
    return j;
  } catch (e) {
    if (e instanceof TypeError) throw new Error('Tidak dapat menghubungi server akun. Pastikan deployment Vercel sudah terbaru dan folder api ikut ter-push ke GitHub.');
    throw e;
  }
}
async function cloudFetch(path, options = {}) {
  const token = getToken();
  if (!token) throw new Error('Belum login.');
  const r = await fetch(getAuthBaseUrl() + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      ...(options.headers || {})
    }
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.message || 'Gagal sinkronisasi.');
  return j;
}
async function pullCloudData() {
  if (!getToken()) return;
  try {
    const data = await cloudFetch('/data');
    const hasCloud = (data.wallets && data.wallets.length) || (data.transactions && data.transactions.length);
    const hasLocal = (state.wallets && state.wallets.length) || (state.transactions && state.transactions.length);
    if (hasCloud) {
      // Cloud wins if it has data
      if (Array.isArray(data.wallets) && data.wallets.length) state.wallets = data.wallets;
      if (Array.isArray(data.categories) && data.categories.length) state.categories = data.categories;
      if (Array.isArray(data.transactions)) state.transactions = data.transactions;
      if (Array.isArray(data.chatHistory)) state.chatHistory = data.chatHistory;
      if (data.profile) state.profile = { ...state.profile, ...data.profile };
      if (data.collab && typeof data.collab === 'object') state.collab = { ...state.collab, ...data.collab };
    } else if (hasLocal) {
      // First login from this device: upload local snapshot
      await pushCloudData();
    }
    saveStateLocalOnly();
    renderAll();
    if (window.__pendingStarterClaim) { window.__pendingStarterClaim = false; if (typeof claimStarterBundle === 'function') claimStarterBundle(); }
    if (window.__pendingCollectionOpen) { window.__pendingCollectionOpen = false; switchTab('koleksi'); }
  } catch (e) {
    console.warn('pullCloudData', e);
  }
}
let _syncTimer = null;
function pushCloudDataDebounced() {
  if (!getToken()) return;
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => { pushCloudData().catch(e => console.warn(e)); }, 800);
}
async function pushCloudData() {
  if (!getToken()) return;
  const payload = {
    wallets: state.wallets,
    categories: state.categories,
    transactions: state.transactions,
    chatHistory: state.chatHistory || [],
    profile: state.profile || { name: '', avatar: '' },
    collab: state.collab || {}
  };
  await cloudFetch('/data', { method: 'PUT', body: JSON.stringify(payload) });
}
async function submitAuth() {
  const msg = document.getElementById('auth-msg'), up = authMode === 'signup';
  const name = document.getElementById('auth-name').value.trim(), email = document.getElementById('auth-email').value.trim(), password = document.getElementById('auth-pass').value;
  msg.className = 'text-xs min-h-[1rem] mb-2 text-rose-600';
  if (up && !name) return (msg.textContent = 'Nama wajib diisi.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return (msg.textContent = 'Email tidak valid.');
  if (password.length < 6) return (msg.textContent = 'Kata sandi minimal 6 karakter.');
  const btn = document.getElementById('auth-submit'); btn.disabled = true; msg.className = 'text-xs min-h-[1rem] mb-2 text-slate-500'; msg.textContent = 'Memproses...';
  try {
    const res = await authRequest(authMode, up ? { name, email, password } : { email, password });
    state.user = { name: res.name || name || '', email: res.email || email, id: res.id || null };
    if (res.token) setToken(res.token);
    if (!state.profile.name && state.user.name) state.profile.name = state.user.name;
    document.getElementById('auth-pass').value = '';
    saveStateLocalOnly();
    hideModal('modal-auth');
    renderProfile();
    // Setelah login: ambil data cloud (atau upload lokal jika cloud kosong)
    await pullCloudData();
    renderAll();
    if (window.__pendingStarterClaim) { window.__pendingStarterClaim = false; if (typeof claimStarterBundle === 'function') claimStarterBundle(); }
    if (window.__pendingCollectionOpen) { window.__pendingCollectionOpen = false; switchTab('koleksi'); }
  } catch (e) {
    msg.className = 'text-xs min-h-[1rem] mb-2 text-rose-600'; msg.textContent = e.message || 'Gagal, coba lagi.';
  } finally { btn.disabled = false; }
}
function signOut() {
  if (!confirm('Keluar dari akun? Data keuangan di perangkat ini tetap aman.')) return;
  // Push last snapshot before leaving (best effort)
  if (getToken()) pushCloudData().catch(() => {});
  state.user = null;
  setToken('');
  saveStateLocalOnly();
  renderProfile();
}

