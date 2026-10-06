// ==================== LOGO DOMPET ====================
// Developer: tambah logo baru cukup dengan menambah satu baris di sini
// lalu taruh filenya di folder logos/ (SVG/PNG persegi disarankan).
const WALLET_LOGOS = [
  { id: 'dana',      nama: 'Dana',      src: 'logos/dana.svg',      warna: '#108ee9' },
  { id: 'shopeepay', nama: 'ShopeePay', src: 'logos/shopeepay.svg', warna: '#ee4d2d' },
  { id: 'bsi',       nama: 'BSI',       src: 'logos/bsi.svg',       warna: '#00a79d' },
  { id: 'krom',      nama: 'Krom',      src: 'logos/krom.svg',      warna: '#6b3fa0' },
  { id: 'ovo',       nama: 'OVO',       src: 'logos/ovo.svg',       warna: '#4c3494' },
  { id: 'gopay',     nama: 'GoPay',     src: 'logos/gopay.svg',     warna: '#00aad4' },
  { id: 'linkaja',   nama: 'LinkAja',   src: 'logos/linkaja.svg',   warna: '#e11f26' },
  { id: 'bca',       nama: 'BCA',       src: 'logos/bca.svg',       warna: '#0060af' },
  { id: 'bri',       nama: 'BRI',       src: 'logos/bri.svg',       warna: '#00529c' },
  { id: 'bni',       nama: 'BNI',       src: 'logos/bni.svg',       warna: '#f37021' },
  { id: 'mandiri',   nama: 'Mandiri',   src: 'logos/mandiri.svg',   warna: '#003d79' },
  { id: 'jago',      nama: 'Jago',      src: 'logos/jago.svg',      warna: '#f9b000' },
  { id: 'seabank',   nama: 'SeaBank',   src: 'logos/seabank.svg',   warna: '#ff6a00' },
  { id: 'cash',      nama: 'Cash',      src: 'logos/cash.svg',      warna: '#10b981' }
];
let logoTarget = null;      // 'new' atau id dompet
let newWalletLogo = null;   // logo sementara untuk dompet baru

// Kembalikan HTML logo (gambar) atau inisial jika gambar tidak ada
function walletLogoHTML(w, sizeClass) {
  const sz = sizeClass || 'w-9 h-9';
  const preset = WALLET_LOGOS.find(l => l.id === w.logo);
  const src = preset ? preset.src : (w.logo && w.logo.startsWith('data:') ? w.logo : null);
  const initial = escapeHtml((w.name || '?').charAt(0));
  // Inisial selalu ada di bawah; gambar menutupinya. Jika file gambar tidak ada, gambar dihapus & inisial tampil.
  const img = src ? `<img src="${src}" alt="" class="absolute inset-0 w-full h-full object-contain bg-white" onerror="this.remove()" />` : '';
  return `<div class="${sz} relative shrink-0 rounded-lg flex items-center justify-center overflow-hidden text-white text-sm font-bold" style="background:${w.color}">${initial}${img}</div>`;
}

function openLogoPicker(target) {
  logoTarget = target;
  document.getElementById('logo-search').value = '';
  renderLogoGrid();
  const m = document.getElementById('modal-logo');
  m.classList.remove('hidden'); m.classList.add('flex');
}

function renderLogoGrid() {
  const q = document.getElementById('logo-search').value.trim().toLowerCase();
  const list = WALLET_LOGOS.filter(l => l.nama.toLowerCase().includes(q));
  document.getElementById('logo-grid').innerHTML = list.length ? list.map(l => `
    <button onclick="pickLogo('${l.id}')" class="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-indigo-50">
      <span class="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 text-white font-bold" style="background:${l.warna}">
        <img src="${l.src}" alt="" class="w-full h-full object-contain bg-white" onerror="this.replaceWith(document.createTextNode('${l.nama.charAt(0)}'))" />
      </span>
      <span class="text-[11px] text-slate-600 truncate w-full text-center">${l.nama}</span>
    </button>`).join('') : '<p class="col-span-4 text-center text-sm text-slate-400 py-4">Tidak ditemukan. Coba unggah gambar sendiri.</p>';
}

function pickLogo(logo) {
  if (logoTarget === 'new') {
    newWalletLogo = logo;
    renderNewWalletLogoPreview();
  } else {
    const w = state.wallets.find(x => x.id === logoTarget);
    if (w) {
      if (logo) w.logo = logo; else delete w.logo;
      // warna dompet ikut warna merek bila logo bawaan dipilih
      const preset = WALLET_LOGOS.find(l => l.id === logo);
      if (preset) w.color = preset.warna;
      saveState(); renderAll();
    }
  }
  hideModal('modal-logo');
}

function renderNewWalletLogoPreview() {
  const box = document.getElementById('new-wallet-logo-preview');
  const preset = WALLET_LOGOS.find(l => l.id === newWalletLogo);
  const src = preset ? preset.src : (newWalletLogo && newWalletLogo.startsWith('data:') ? newWalletLogo : null);
  box.innerHTML = src ? `<img src="${src}" alt="" class="w-full h-full object-contain" onerror="this.remove()" />` : '<i class="fas fa-image"></i>';
}

// Unggah gambar: dipotong persegi & dikecilkan 128x128 agar hemat penyimpanan
function handleLogoUpload(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) return alert('File harus berupa gambar');
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const size = 128, c = document.createElement('canvas');
      c.width = c.height = size;
      const side = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      pickLogo(c.toDataURL('image/png'));
    };
    img.onerror = () => alert('Gambar tidak bisa dibaca');
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

