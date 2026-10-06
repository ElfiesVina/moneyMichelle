// ==================== NATURAL LANGUAGE PARSER ====================
function parseAmount(text) {
  // Support: 15k, 15rb, 15 ribu, 15.000, 15000, 1.5jt, 1,5 juta, Rp15.000, 300k, dll
  let t = text.toLowerCase().replace(/rp\.?\s*/gi, '');
  
  // juta / jt (1.5jt, 1,5 juta, 2jt)
  let m = t.match(/(\d+(?:[.,]\d+)?)\s*(jt|juta)/i);
  if (m) {
    const num = parseFloat(m[1].replace(',', '.'));
    return Math.round(num * 1000000);
  }
  
  // ribu / rb / k (15k, 15rb, 15 ribu, 300k)
  m = t.match(/(\d+(?:[.,]\d+)?)\s*(rb|ribu|k)\b/i);
  if (m) {
    const num = parseFloat(m[1].replace(',', '.'));
    return Math.round(num * 1000);
  }
  
  // plain number with thousand separators (15.000 or 15,000)
  m = t.match(/(\d{1,3}(?:[.,]\d{3})+)/);
  if (m) {
    return parseInt(m[1].replace(/[.,]/g, ''), 10);
  }
  
  // plain number
  m = t.match(/(\d+(?:[.,]\d+)?)/);
  if (m) {
    return Math.round(parseFloat(m[1].replace(',', '.')));
  }
  
  return null;
}

function findWallet(text) {
  const t = text.toLowerCase();
  // Priority: explicit mentions
  for (const w of state.wallets) {
    const name = w.name.toLowerCase();
    if (t.includes('wallet ' + name) || t.includes('dompet ' + name) ||
        t.includes('di ' + name) || t.includes('dari ' + name) ||
        t.includes('pakai ' + name) || t.includes('dengan ' + name) ||
        t.includes('ke ' + name) || t.includes(name + ' ')) {
      return w;
    }
  }
  // fallback: any occurrence of the wallet name
  for (const w of state.wallets) {
    if (t.includes(w.name.toLowerCase())) return w;
  }
  // tidak disebut: kembalikan null, pemanggil akan bertanya (jangan menebak)
  return null;
}

function findCategory(text) {
  const t = text.toLowerCase();
  for (const c of state.categories) {
    const name = c.name.toLowerCase();
    if (t.includes('folder ' + name) || t.includes('kategori ' + name) ||
        t.includes('untuk ' + name) || t.includes('ke ' + name) ||
        t.includes(name)) {
      return c;
    }
  }
  // keyword mapping
  if (/makan|nasi|resto|warung|kopi|cafe/.test(t)) return state.categories.find(c => c.id === 'makanan') || state.categories[0];
  if (/jajan|snack|cemilan/.test(t)) return state.categories.find(c => c.id === 'jajan') || state.categories[0];
  if (/ojek|gojek|grab|bensin|parkir|transport/.test(t)) return state.categories.find(c => c.id === 'transport') || state.categories[0];
  if (/listrik|air|internet|pulsa|tagihan|bayar/.test(t)) return state.categories.find(c => c.id === 'tagihan') || state.categories[0];
  if (/gaji|salary|upah/.test(t)) return state.categories.find(c => c.id === 'gaji') || state.categories[0];
  return state.categories.find(c => c.id === 'lainnya') || state.categories[0];
}

function detectType(text) {
  const t = text.toLowerCase();
  // Income keywords (including common typos like pemasukkan)
  if (/pemasukan|pemasukkan|masuk|terima|gaji|bonus|transfer masuk|dapat|terima uang|punya uang|saldo awal|isi saldo|tambah saldo/.test(t)) return 'income';
  // Expense keywords
  if (/pengeluaran|keluar|beli|bayar|belanja|spending|keluarin|habis|jajan|makan/.test(t)) return 'expense';
  // default to expense
  return 'expense';
}

function parseNL(input) {
  const original = input.trim();
  if (!original) return null;

  const amount = parseAmount(original);
  if (!amount || amount <= 0) {
    return { error: 'Jumlah tidak ditemukan. Contoh: 15k, 15rb, 15000, 1.5jt' };
  }

  const type = detectType(original);
  const wallet = findWallet(original);
  if (!wallet) return { askWallet: true };
  const category = findCategory(original);

  // extract simple note (remove known parts)
  let note = original
    .replace(/pengeluaran|pemasukan|keluar|masuk|beli|bayar|terima/gi, '')
    .replace(new RegExp(wallet.name, 'gi'), '')
    .replace(new RegExp(category.name, 'gi'), '')
    .replace(/wallet|dompet|folder|kategori|di|pada|adalah|sebesar|rp\.?|\d+[.,]?\d*\s*(k|rb|ribu|jt|juta)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    type,
    amount,
    walletId: wallet.id,
    categoryId: category.id,
    note: note || null,
    date: new Date().toISOString().slice(0, 10),
    parsed: { wallet: wallet.name, category: category.name }
  };
}

