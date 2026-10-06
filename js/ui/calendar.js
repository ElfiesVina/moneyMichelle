// ==================== KALENDER ====================
let calCb = null, calSel = new Date(), calView = new Date();
const pad2 = n => String(n).padStart(2, '0');
const toISO = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
function openCalendar(iso, cb) {
  calCb = cb;
  calSel = iso ? new Date(iso + 'T00:00:00') : new Date();
  if (isNaN(calSel)) calSel = new Date();
  calView = new Date(calSel.getFullYear(), calSel.getMonth(), 1);
  renderCalendar();
  const m = document.getElementById('modal-cal'); m.classList.remove('hidden'); m.classList.add('flex');
}
function calNav(m, y) { calView = new Date(calView.getFullYear() + (y || 0), calView.getMonth() + (m || 0), 1); renderCalendar(); }
function calPick(iso) { hideModal('modal-cal'); if (calCb) calCb(iso); }
function renderCalendar() {
  document.getElementById('cal-title').textContent = BULAN[calView.getMonth()] + ' ' + calView.getFullYear();
  const has = new Set(state.transactions.map(t => toISO(dOnly(t.date))));
  const selISO = toISO(calSel), todayISO = toISO(new Date());
  const start = new Date(calView.getFullYear(), calView.getMonth(), 1 - ((calView.getDay() + 6) % 7));
  let html = '';
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), iso = toISO(d);
    const other = d.getMonth() !== calView.getMonth(), sel = iso === selISO;
    const cls = sel ? 'bg-blue-600 text-white font-semibold' : iso === todayISO ? 'ring-2 ring-blue-300 text-blue-600 font-semibold' : other ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-100';
    html += `<button onclick="calPick('${iso}')" class="relative w-10 h-10 mx-auto rounded-full text-sm ${cls}">${d.getDate()}${has.has(iso) ? `<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${sel ? 'bg-white' : 'bg-emerald-500'}"></span>` : ''}</button>`;
  }
  document.getElementById('cal-grid').innerHTML = html;
}

