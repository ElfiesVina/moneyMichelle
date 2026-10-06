// Export / Import / Reset
const exportConfig = { kind: 'finance', period: 'month', from: '', to: '', blob: null, filename: '' };

function openExportPage() {
  switchTab('ekspor');
}

function initExportPage() {
  const now = new Date();
  const month = BULAN[now.getMonth()] || now.toLocaleString('id-ID', { month: 'long' });
  const name = document.getElementById('export-filename');
  if (name && !name.value.trim()) name.value = `Backup-Keuangan-${month}-${now.getFullYear()}`;
  if (name && exportConfig.kind === 'finance' && /^Backup-Keuangan$/.test(name.value.trim())) name.value = `Backup-Keuangan-${month}-${now.getFullYear()}`;
  const from = document.getElementById('export-from'), to = document.getElementById('export-to');
  if (from && !from.value) from.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
  if (to && !to.value) to.value = now.toISOString().slice(0,10);
  updateExportSummary();
}

function toggleExportKind(kind) {
  exportConfig.kind = kind;
  document.querySelectorAll('[data-export-kind]').forEach(btn => {
    const active = btn.dataset.exportKind === kind;
    btn.classList.toggle('selected', active);
    btn.classList.toggle('border-indigo-200', active);
    btn.classList.toggle('border-slate-100', !active);
    const check = btn.querySelector('.export-kind-check');
    if (check) check.classList.toggle('hidden', !active);
  });
  const input = document.getElementById('export-filename');
  if (input) input.value = kind === 'collab' ? 'Backup-Skin-Karakter' : kind === 'all' ? 'Backup-Semua-Data' : `Backup-Keuangan-${BULAN[new Date().getMonth()]}-${new Date().getFullYear()}`;
  updateExportSummary();
}

function setExportPeriod(period) {
  exportConfig.period = period;
  document.querySelectorAll('.export-period').forEach(btn => {
    const active = btn.dataset.period === period;
    btn.classList.toggle('selected', active);
    btn.classList.toggle('bg-indigo-50', active);
    btn.classList.toggle('border-indigo-200', active);
    btn.classList.toggle('bg-slate-50', !active);
    btn.classList.toggle('border-slate-100', !active);
  });
  document.getElementById('export-custom-range')?.classList.toggle('hidden', period !== 'custom');
  updateExportSummary();
}

function getExportRange() {
  const now = new Date();
  let from = new Date(now), to = new Date(now);
  if (exportConfig.period === 'day') from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  else if (exportConfig.period === 'week') { from.setDate(now.getDate() - 6); }
  else if (exportConfig.period === 'month') from = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (exportConfig.period === 'year') from = new Date(now.getFullYear(), 0, 1);
  else {
    const f = document.getElementById('export-from')?.value;
    const t = document.getElementById('export-to')?.value;
    from = f ? new Date(f + 'T00:00:00') : new Date(now.getFullYear(), now.getMonth(), 1);
    to = t ? new Date(t + 'T23:59:59') : now;
  }
  return { from, to };
}

function formatExportDate(d) { return d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }); }
function getFilteredExportTransactions() {
  const {from,to} = getExportRange();
  return (state.transactions || []).filter(tx => {
    if (!tx.date) return true;
    const d = new Date(tx.date + (String(tx.date).length <= 10 ? 'T12:00:00' : ''));
    return d >= from && d <= to;
  });
}

function updateExportSummary() {
  const input = document.getElementById('export-filename');
  const name = (input?.value.trim() || 'Backup-Data').replace(/\.zip$/i,'') + '.zip';
  const kindLabel = exportConfig.kind === 'collab' ? 'Skin & Karakter' : exportConfig.kind === 'all' ? 'Semua Data' : 'Keuangan';
  const {from,to} = getExportRange();
  const periodLabel = `${formatExportDate(from)} – ${formatExportDate(to)}`;
  const nameEl=document.getElementById('export-summary-name'), kindEl=document.getElementById('export-summary-kind'), periodEl=document.getElementById('export-summary-period');
  if(nameEl) nameEl.textContent=name; if(kindEl) kindEl.textContent=kindLabel; if(periodEl) periodEl.textContent=periodLabel;
  const list=document.getElementById('export-file-list'); if(!list) return;
  const files=[];
  if(exportConfig.kind !== 'collab') files.push(['fa-file-pdf','laporan-keuangan.pdf','bukti laporan']);
  if(exportConfig.kind !== 'collab') files.push(['fa-file-code','data-keuangan.json','data aplikasi']);
  if(exportConfig.kind !== 'collab') files.push(['fa-file-csv','transaksi.csv','rekap transaksi']);
  if(exportConfig.kind !== 'finance') files.push(['fa-star','collab.json','skin, karakter & progress event']);
  if(exportConfig.kind === 'all') files.push(['fa-calendar-days','event-catalog.json','konfigurasi event developer']);
  files.push(['fa-file-lines','manifest.json','info backup']);
  list.innerHTML=files.map(f=>`<div class="export-preview-file rounded-xl p-2.5 flex items-center gap-2"><span class="w-8 h-8 rounded-lg bg-white dark:bg-black flex items-center justify-center text-indigo-500"><i class="fas ${f[0]}"></i></span><span class="flex-1 min-w-0"><b class="block text-xs text-slate-700 dark:text-slate-200 truncate">${f[1]}</b><small class="text-[10px] text-slate-400">${f[2]}</small></span></div>`).join('');
}

function setExportStep(step) {
  if (step === 3) updateExportSummary();
  document.querySelectorAll('.export-step').forEach(el => el.classList.add('hidden'));
  document.getElementById('export-step-'+step)?.classList.remove('hidden');
  document.querySelectorAll('[data-export-step-dot]').forEach(dot => dot.classList.toggle('active', Number(dot.dataset.exportStepDot) === step));
  window.scrollTo({top:0, behavior:'smooth'});
}

function buildFinanceCsv(txs) {
  const rows=[['Tanggal','Tipe','Jumlah','Dompet','Kategori','Catatan']];
  txs.forEach(tx=>{ const w=(state.wallets||[]).find(x=>x.id===tx.walletId); const c=(state.categories||[]).find(x=>x.id===tx.categoryId); rows.push([tx.date||'',tx.type||'',tx.amount||0,w?.name||'',c?.name||'',tx.note||'']); });
  return rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
}

function buildReportPdf(txs, range) {
  if (!window.jspdf?.jsPDF) return null;
  const doc = new window.jspdf.jsPDF();
  const income=txs.filter(x=>x.type==='income').reduce((s,x)=>s+Number(x.amount||0),0);
  const expense=txs.filter(x=>x.type==='expense').reduce((s,x)=>s+Number(x.amount||0),0);
  doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text('Laporan Keuangan',20,24);
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.text(`${formatExportDate(range.from)} - ${formatExportDate(range.to)}`,20,32);
  doc.setFontSize(12); doc.text('Ringkasan',20,48); doc.setFontSize(10);
  doc.text(`Total pemasukan: Rp ${income.toLocaleString('id-ID')}`,20,58); doc.text(`Total pengeluaran: Rp ${expense.toLocaleString('id-ID')}`,20,66); doc.text(`Selisih: Rp ${(income-expense).toLocaleString('id-ID')}`,20,74);
  doc.setFontSize(12); doc.text('Transaksi',20,92); doc.setFontSize(8);
  let y=102; txs.slice(0,28).forEach((tx,i)=>{ const c=(state.categories||[]).find(x=>x.id===tx.categoryId); const sign=tx.type==='expense'?'−':'+'; doc.text(`${tx.date||'-'}  ${sign} Rp ${Number(tx.amount||0).toLocaleString('id-ID')}  ${String(c?.name||'Lainnya').slice(0,18)}`,20,y); y+=7; });
  if(txs.length>28) doc.text(`... dan ${txs.length-28} transaksi lainnya.`,20,y+4);
  return doc.output('blob');
}

async function buildExportPackage() {
  if (!window.JSZip) { alert('Library ZIP belum tersedia.'); return; }
  setExportStep(4);
  document.getElementById('export-ready-card')?.classList.add('hidden');
  const circle=document.getElementById('export-progress-circle'), pct=document.getElementById('export-progress-text'), title=document.getElementById('export-progress-title'), hint=document.getElementById('export-progress-hint'), list=document.getElementById('export-progress-list');
  const setP=(n,t,h)=>{ pct.textContent=n+'%'; circle.style.strokeDashoffset=314-(314*n/100); if(t) title.textContent=t; if(h) hint.textContent=h; };
  const txs=getFilteredExportTransactions(), range=getExportRange(), zip=new JSZip();
  const input=document.getElementById('export-filename'); exportConfig.filename=((input?.value.trim()||'Backup-Data').replace(/[^a-zA-Z0-9À-ÿ _-]/g,'').replace(/\.zip$/i,'')||'Backup-Data')+'.zip';
  const isFinance=exportConfig.kind!=='collab', isCollab=exportConfig.kind!=='finance';
  const manifest={formatVersion:1,backupType:exportConfig.kind,createdAt:new Date().toISOString(),period:{type:exportConfig.period,from:range.from.toISOString(),to:range.to.toISOString()},app:'Money Michelle'};
  list.innerHTML=''; setP(15,'Mengumpulkan data...','Menyiapkan isi backup.');
  await new Promise(r=>setTimeout(r,180));
  if(isFinance){ zip.file('data/data-keuangan.json', JSON.stringify({...state,transactions:txs},null,2)); zip.file('data/transaksi.csv',buildFinanceCsv(txs)); const pdf=buildReportPdf(txs,range); if(pdf) zip.file('laporan/laporan-keuangan.pdf',pdf); }
  setP(48,'Menyusun paket...','Memasukkan data dan laporan.'); await new Promise(r=>setTimeout(r,180));
  if(isCollab) zip.file('data/collab.json',JSON.stringify(state.collab||{},null,2));
  if(exportConfig.kind === 'all') zip.file('data/event-catalog.json',JSON.stringify({version:eventStore.version,activeEventId:eventStore.activeEventId,events:eventStore.events},null,2));
  zip.file('info/manifest.json',JSON.stringify(manifest,null,2));
  const readme=`Backup Money Michelle\n\nJenis: ${exportConfig.kind}\nPeriode: ${formatExportDate(range.from)} - ${formatExportDate(range.to)}\nDibuat: ${new Date().toLocaleString('id-ID')}\n`;
  zip.file('info/README.txt',readme);
  setP(72,'Mengompres file...','Menyatukan semua data menjadi ZIP.');
  exportConfig.blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}},meta=>setP(72+Math.round(meta.percent*.2),'Mengompres file...',`${Math.round(meta.percent)}%`));
  setP(100,'File backup siap','ZIP berhasil dibuat.');
  document.getElementById('export-ready-name').textContent=exportConfig.filename;
  document.getElementById('export-summary-size').textContent=`${(exportConfig.blob.size/1024/1024).toFixed(2)} MB`;
  document.getElementById('export-ready-card')?.classList.remove('hidden');
}

function downloadExportPackage() { if(!exportConfig.blob) return; const url=URL.createObjectURL(exportConfig.blob), a=document.createElement('a'); a.href=url; a.download=exportConfig.filename||'backup.zip'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
async function shareExportPackage() {
  if(!exportConfig.blob) return;
  const file=new File([exportConfig.blob],exportConfig.filename||'backup.zip',{type:'application/zip'});
  if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))) { try { await navigator.share({title:'Backup Money Michelle',text:'Backup data Money Michelle',files:[file]}); return; } catch(e){ if(e?.name==='AbortError') return; } }
  downloadExportPackage(); alert('Menu Share tidak tersedia di browser ini. File sudah disimpan agar bisa dibagikan lewat aplikasi pilihanmu.');
}

async function importData(e) {
  const file=e.target.files[0]; if(!file) return;
  try {
    if(file.name.toLowerCase().endsWith('.zip')) {
      if(!window.JSZip) throw new Error('Library ZIP belum tersedia.');
      const zip=await JSZip.loadAsync(file); const entry=zip.file('data/data-keuangan.json'); const collabEntry=zip.file('data/collab.json'); const eventCatalogEntry=zip.file('data/event-catalog.json');
      let data=null;
      if(entry) data=JSON.parse(await entry.async('text'));
      if(data && data.wallets && data.transactions) { if(confirm('Import ZIP akan menimpa data keuangan saat ini. Lanjutkan?')) { state={...state,...data,collab:data.collab||state.collab}; saveState(); renderAll(); addChatMessage('ai','✅ Backup keuangan berhasil dipulihkan!'); } }
      else if(collabEntry) { const c=JSON.parse(await collabEntry.async('text')); if(confirm('Pulihkan koleksi Skin & Karakter dari backup ini?')) { state.collab={...state.collab,...c}; if(eventCatalogEntry){const ec=JSON.parse(await eventCatalogEntry.async('text')); if(Array.isArray(ec.events)){eventStore={...eventStore,...ec,events:ec.events};saveEventStore();}} saveState(); renderAll(); addChatMessage('ai','✅ Koleksi Skin & Karakter berhasil dipulihkan!'); } }
      else if(eventCatalogEntry) { const ec=JSON.parse(await eventCatalogEntry.async('text')); if(Array.isArray(ec.events)){eventStore={...eventStore,...ec,events:ec.events};saveEventStore();renderAll();addChatMessage('ai','✅ Katalog event developer berhasil dipulihkan!');} }
      else alert('ZIP tidak berisi data backup yang dikenali.');
    } else {
      const data=JSON.parse(await file.text());
      if(data.wallets && data.transactions) { if(confirm('Import akan menimpa data saat ini. Lanjutkan?')) { state=data; saveState(); renderAll(); addChatMessage('ai','✅ Data berhasil diimpor!'); } }
      else alert('File tidak valid');
    }
  } catch(err) { console.error(err); alert('Gagal membaca file backup.'); }
  e.target.value='';
}
function resetAll() {
  if (!confirm('Yakin hapus SEMUA data? Tindakan ini tidak bisa dibatalkan.')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}



function openBackupFromAccount(){
  switchTab('ekspor');
  setTimeout(() => {
    if (typeof toggleExportKind === 'function') toggleExportKind('all');
    if (typeof setExportStep === 'function') setExportStep(1);
  }, 60);
}
