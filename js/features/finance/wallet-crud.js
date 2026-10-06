// Wallet CRUD
function showAddWallet() {
  document.getElementById('new-wallet-name').value = '';
  document.getElementById('new-wallet-balance').value = '';
  newWalletLogo = null; renderNewWalletLogoPreview();
  document.getElementById('modal-wallet').classList.remove('hidden');
  document.getElementById('modal-wallet').classList.add('flex');
}
function addWallet() {
  const name = document.getElementById('new-wallet-name').value.trim();
  if (!name) return alert('Nama wajib diisi');
  const balance = parseFloat(document.getElementById('new-wallet-balance').value) || 0;
  const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36).slice(-4);
  const colors = ['#108ee9','#4c3494','#00aad4','#10b981','#6366f1','#f59e0b','#ec4899','#8b5cf6'];
  const w = { id, name, balance, color: colors[state.wallets.length % colors.length] };
  if (newWalletLogo) {
    w.logo = newWalletLogo;
    const preset = WALLET_LOGOS.find(l => l.id === newWalletLogo);
    if (preset) w.color = preset.warna;
  }
  w.balance = 0;
  state.wallets.push(w);
  if (balance !== 0) {
    appendTransaction({
      type: balance > 0 ? 'income' : 'expense',
      amount: Math.abs(balance), walletId: id, categoryId: 'lainnya',
      note: 'Saldo awal', date: new Date().toISOString().slice(0,10)
    }, { persist:false, render:false });
  }
  saveState();
  renderAll();
  hideModal('modal-wallet');
}
function deleteWallet(id) {
  if (state.wallets.length <= 1) return alert('Minimal harus ada 1 dompet');
  if (!confirm('Hapus dompet ini? Transaksi terkait tetap ada.')) return;
  state.wallets = state.wallets.filter(w => w.id !== id);
  saveState();
  renderAll();
}

