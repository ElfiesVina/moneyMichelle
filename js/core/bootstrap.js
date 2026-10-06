// ============================================================
// APP BOOTSTRAP — satu-satunya tempat startup dipanggil.
// ============================================================
async function initApp() {
  loadState();
  normalizeState();
  await loadEventStore();
  initSettings();
  initPrefs();
  renderAll();
  let resizeTimer = null;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(renderCharts, 250); });
  const chat = document.getElementById('chat-messages');
  if (chat && !chat.children.length) addChatMessage('ai', 'Halo! Aku asisten keuanganmu. Cukup bilang saja, misalnya:<br><em>"pengeluaran di wallet dana pada folder jajan adalah 15k"</em><br>atau<br><em>"terima gaji 5 juta di bank"</em>');
  const manualDate = document.getElementById('manual-date');
  if (manualDate) manualDate.valueAsDate = new Date();
  document.querySelectorAll('select').forEach(s => { if (s.id !== 'lang-select') enhanceSelect(s); });
  switchTab('home');
  setTimeout(() => { if (typeof maybeShowStarterIntro === 'function') maybeShowStarterIntro(); }, 450);
}

document.addEventListener('DOMContentLoaded', initApp, { once:true });
