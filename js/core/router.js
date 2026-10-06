// ==================== NAVIGASI TAB ====================
function switchTab(t) {
  if (t === 'koleksi' && !state.user) {
    window.__pendingCollectionOpen = true;
    if (typeof openCollectionLoginGate === 'function') openCollectionLoginGate();
    else if (typeof openAuth === 'function') openAuth('signin');
    return;
  }
  document.querySelectorAll('.tab').forEach(el => el.classList.toggle('hidden', el.id !== 'tab-' + t));
  document.querySelectorAll('.navbtn').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  window.scrollTo({ top: 0 });
  if (t === 'stat') setTimeout(() => { renderStatPage(); renderCharts(); }, 60);
  if (t === 'transaksi') setTimeout(renderTxPage, 40);
  if (t === 'anggaran') setTimeout(renderBudgetPage, 40);
  if (t === 'collab') setTimeout(renderCollabPage, 40);
  if (t === 'koleksi') setTimeout(renderCollectionPage, 40);
  if (t === 'dev-events') setTimeout(renderDevEventManager, 40);
  if (t === 'ekspor') setTimeout(initExportPage, 30);
}

