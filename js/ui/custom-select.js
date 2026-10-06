// ==================== DROPDOWN KUSTOM (pengganti <select> bawaan) ====================
(function () {
  const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  Object.defineProperty(HTMLSelectElement.prototype, 'value', { get() { return d.get.call(this); }, set(v) { d.set.call(this, v); if (this._csync) this._csync(); } });
})();
function enhanceSelect(sel) {
  if (sel._cs) return; sel._cs = true;
  const wrap = document.createElement('div');
  wrap.className = 'cs relative ' + (sel.classList.contains('w-full') ? 'w-full' : 'inline-block');
  const btn = document.createElement('button'); btn.type = 'button';
  btn.className = sel.className.replace(/\bhidden\b/g, '') + ' flex items-center justify-between gap-2 bg-white text-left cursor-pointer transition ring-offset-0';
  if (sel.classList.contains('filter-chip-fixed')) { btn.style.minWidth = '7.5rem'; btn.style.width = '7.5rem'; }
  btn.innerHTML = '<span class="cs-label truncate"></span><i class="fas fa-chevron-down text-[10px] text-slate-400 transition-transform"></i>';
  const menu = document.createElement('div');
  menu.className = 'cs-menu hidden absolute z-[80] left-0 min-w-full w-max max-w-[80vw] mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 max-h-60 overflow-y-auto';
  wrap.append(btn, menu); sel.after(wrap); sel.classList.add('hidden');
  const setOpen = (open) => {
    menu.classList.toggle('hidden', !open);
    btn.classList.toggle('ring-2', open);
    btn.classList.toggle('ring-indigo-400', open);
    btn.classList.toggle('border-indigo-400', open);
    const chev = btn.querySelector('.fa-chevron-down');
    if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
  };
  const sync = () => {
    const o = sel.options[sel.selectedIndex];
    btn.querySelector('.cs-label').textContent = o ? o.textContent : '';
    menu.innerHTML = [...sel.options].map((op, i) => `<button type="button" data-i="${i}" class="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm text-left ${i === sel.selectedIndex ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'}"><span>${escapeHtml(op.textContent)}</span>${i === sel.selectedIndex ? '<i class="fas fa-check text-xs text-indigo-500"></i>' : ''}</button>`).join('');
  };
  sel._csync = sync; sync();
  btn.onclick = e => {
    e.stopPropagation();
    const willOpen = menu.classList.contains('hidden');
    document.querySelectorAll('.cs-menu').forEach(m => {
      m.classList.add('hidden');
      const b = m.previousElementSibling;
      if (b) { b.classList.remove('ring-2', 'ring-indigo-400', 'border-indigo-400'); const c = b.querySelector('.fa-chevron-down'); if (c) c.style.transform = ''; }
    });
    if (willOpen) { sync(); setOpen(true); }
  };
  menu.onclick = e => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    sel.selectedIndex = +b.dataset.i;
    sync(); setOpen(false);
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  };
  new MutationObserver(sync).observe(sel, { childList: true });
}
document.addEventListener('click', () => {
  document.querySelectorAll('.cs-menu').forEach(m => {
    m.classList.add('hidden');
    const b = m.previousElementSibling;
    if (b) { b.classList.remove('ring-2', 'ring-indigo-400', 'border-indigo-400'); const c = b.querySelector('.fa-chevron-down'); if (c) c.style.transform = ''; }
  });
});

