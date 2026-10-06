// ============================================================
// COLLAB / SKIN / CHARACTER
// User-owned progress lives in state.collab.
// Event definitions live separately in event-store.js.
// ============================================================
function getCollabState() {
  if (!state.collab || typeof state.collab !== 'object') state.collab = {};
  const c = state.collab;
  if (!c.eventProgress || typeof c.eventProgress !== 'object' || Array.isArray(c.eventProgress)) c.eventProgress = {};
  if (!Array.isArray(c.ownedCharacters)) c.ownedCharacters = [];
  if (!Array.isArray(c.ownedSkins)) c.ownedSkins = [];
  if (!c.starter || typeof c.starter !== 'object') c.starter = { introSeen:false, claimed:false, claimedAt:null };
  if (typeof c.starter.cardSeen !== 'boolean') c.starter.cardSeen = false;
  return c;
}

function getEventProgressState(eventId) {
  const c = getCollabState();
  if (!c.eventProgress[eventId]) c.eventProgress[eventId] = { missions:[], claimedRewards:[] };
  const p = c.eventProgress[eventId];
  if (!Array.isArray(p.missions)) p.missions = [];
  if (!Array.isArray(p.claimedRewards)) p.claimedRewards = [];
  return p;
}

function syncEventProgress(event) {
  if (!event?.id) return null;
  const p = getEventProgressState(event.id);
  const old = new Map(p.missions.map(m => [m.id, m]));
  p.missions = (event.missions || []).map(m => ({ ...m, ...(old.get(m.id) || {}), id:m.id }));
  return p;
}

function evaluateMission(mission, transactions) {
  const txs = Array.isArray(transactions) ? transactions : [];
  const match = mission.match || {};
  let filtered = txs;
  if (match.type) filtered = filtered.filter(t => t.type === match.type);
  if (match.walletId) filtered = filtered.filter(t => t.walletId === match.walletId);
  if (match.categoryId) filtered = filtered.filter(t => t.categoryId === match.categoryId);
  if (Array.isArray(match.categoryIds) && match.categoryIds.length) filtered = filtered.filter(t => match.categoryIds.includes(t.categoryId));
  if (match.minAmount) filtered = filtered.filter(t => Number(t.amount) >= Number(match.minAmount));
  const metric = mission.metric || 'count';
  const progress = metric === 'amount' ? filtered.reduce((sum,t) => sum + Number(t.amount || 0), 0) : filtered.length;
  const target = Number(mission.target || 1);
  return { progress, target, done: progress >= target, percent: target ? Math.min(100, Math.round(progress / target * 100)) : 0 };
}

function getCollabProgress(event) {
  if (!event?.id) return { total:0, done:0, percent:0, missions:[] };
  const p = syncEventProgress(event);
  const missions = p.missions.map(m => ({ ...m, ...evaluateMission(m, state.transactions) }));
  const done = missions.filter(m => m.done || m.completed === true).length;
  return { total:missions.length, done, percent:missions.length ? Math.round(done / missions.length * 100) : 0, missions };
}

function getRarityLabel(rarity) {
  const map = { normaly:'NORMALY', rare:'RARE', sr:'SR', ssr:'SSR', sss:'SSS', mythic:'MYTHIC' };
  return map[String(rarity || 'normaly').toLowerCase()] || 'NORMALY';
}
function getRarityClass(rarity) {
  const map = { normaly:'rarity-normaly', rare:'rarity-rare', sr:'rarity-sr', ssr:'rarity-ssr', sss:'rarity-sss', mythic:'rarity-mythic' };
  return map[String(rarity || 'normaly').toLowerCase()] || 'rarity-normaly';
}

function renderCollabHome() {
  const card = document.getElementById('mascot-card');
  if (!card) return;
  const event = getActiveCollabEvent();
  card.className = 'collab-home-card bg-white border border-transparent p-4 min-h-[9rem]';
  if (!event) { card.innerHTML = ''; return; }
  card.classList.add('is-event');
  const c = getCollabState();
  const visual = c.equippedCharacter;
  const visualHtml = visual ? (visual.image
    ? `<img src="${escapeHtml(visual.image)}" alt="${escapeHtml(visual.name || 'Character')}" class="w-full h-full object-cover">`
    : `<span class="text-4xl">${escapeHtml(visual.icon || '✨')}</span>`) : `<img src="${AURA_SASA_YURA_ART}" alt="Aura Sasa Yura" class="w-full h-full object-cover">`;
  const progress = getCollabProgress(event);
  card.innerHTML = `
    <div class="flex items-stretch gap-3 min-h-[8rem]">
      <div class="w-28 shrink-0 flex items-end justify-center overflow-hidden bg-white border border-slate-100/60 collab-character-art" style="border-radius:1.25rem">${visualHtml}</div>
      <div class="min-w-0 flex-1 flex flex-col justify-center py-1">
        <p class="text-[11px] font-medium text-indigo-500">${escapeHtml(event.label || t('collab_event_label'))}</p>
        <p class="text-sm font-semibold text-slate-800 mt-1 leading-snug">${escapeHtml(event.title || t('collab_title'))}</p>
        <p class="text-xs text-slate-500 mt-1 leading-snug">${escapeHtml(event.description || t('collab_event_hint'))}</p>
        <div class="mt-2.5"><div class="flex items-center justify-between text-[10px] text-slate-500 mb-1"><span>${escapeHtml(t('collab_progress'))}</span><span>${progress.done}/${progress.total}</span></div><div class="collab-progress-track"><div class="collab-progress-fill" style="width:${progress.percent}%"></div></div></div>
        <button type="button" onclick="openQuizOrGallery()" class="mt-3 self-start inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-medium" style="border-radius:9999px"><i class="fas fa-sparkles text-[10px]"></i> <span>${escapeHtml(t('collab_open'))}</span></button>
      </div>
    </div>`;
}

let collectionTab = 'skins';
let collectionFilter = 'all';
function setCollectionTab(tab) { collectionTab = tab === 'characters' ? 'characters' : 'skins'; collectionFilter='all'; renderCollectionPage(); }
function setCollectionFilter(filter) { collectionFilter=['all','owned','locked'].includes(filter) ? filter : 'all'; renderCollectionPage(); }

function getCollectionDisplayItems(isCharacters) {
  const c=getCollabState();
  const owned=isCharacters?c.ownedCharacters:c.ownedSkins;
  const ownedIds=new Set(owned.map(x=>String(x.id||'')));
  const event=getActiveCollabEvent(); const locked=[];
  (event?.rewards||[]).forEach(r=>{
    const wanted=isCharacters?'character':'skin'; if(r.type!==wanted) return;
    const item=r.item||{id:r.id,name:r.name,description:r.description,icon:r.icon,image:r.image,primaryColor:r.primaryColor,secondaryColor:r.secondaryColor,accentColor:r.accentColor,backgroundColor:r.backgroundColor,cardColor:r.cardColor,textColor:r.textColor,rarity:r.rarity};
    if(item?.id&&!ownedIds.has(String(item.id))) locked.push({...item,_locked:true,_rewardId:r.id,_starter:!!r.starter});
  });
  const items=[...owned.map(x=>({...x,_owned:true})),...locked];
  items.sort((a,b) => (['normaly','rare','sr','ssr','sss','mythic'].indexOf(String(a.rarity||'normaly').toLowerCase()) - ['normaly','rare','sr','ssr','sss','mythic'].indexOf(String(b.rarity||'normaly').toLowerCase())) || String(a.name||'').localeCompare(String(b.name||'')));
  if(collectionFilter==='owned') return items.filter(x=>x._owned);
  if(collectionFilter==='locked') return items.filter(x=>x._locked);
  return items;
}

function getCollectionAllItems(isCharacters) { return getCollectionDisplayItems(isCharacters); }

function equipCollectionItem(type,index) {
  const c=getCollabState(); const list=type==='characters'?c.ownedCharacters:c.ownedSkins; const item=list[index]; if(!item)return;
  if(type==='characters') c.equippedCharacter=item; else c.equippedSkin=item;
  saveState(); renderAll(); renderCollectionPage();
}

function claimStarterBundle() {
  const c=getCollabState();
  if (!state.user) { window.__pendingStarterClaim = true; openCollectionLoginGate(); return false; }
  const event = getEventById(HUJAN_METEOR_EVENT_ID) || getActiveCollabEvent();
  if (!event) return false;
  const rewards=(event.rewards||[]).filter(r=>r.starter);
  rewards.forEach(reward=>{
    const item=reward.item || {id:reward.id,name:reward.name,description:reward.description,icon:reward.icon,image:reward.image,rarity:reward.rarity};
    if(reward.type==='character' && !c.ownedCharacters.some(x=>String(x.id)===String(item.id))) c.ownedCharacters.push({...item});
    if(reward.type==='skin' && !c.ownedSkins.some(x=>String(x.id)===String(item.id))) c.ownedSkins.push({...item});
  });
  c.starter.claimed = true; c.starter.claimedAt = new Date().toISOString();
  c.claimedRewards = Array.isArray(c.claimedRewards) ? c.claimedRewards : [];
  rewards.forEach(r=>{ if(!c.claimedRewards.includes(r.id)) c.claimedRewards.push(r.id); });
  saveState(); renderAll(); return true;
}

function openStarterIntro() {
  const modal=document.getElementById('modal-starter-intro'); if(!modal)return;
  modal.classList.remove('hidden'); modal.classList.add('flex');
}
function closeStarterIntro(){ hideModal('modal-starter-intro'); }
function maybeShowStarterIntro(){
  const c=getCollabState();
  if(c.starter?.introSeen || c.starter?.claimed) return;
  openStarterIntro();
}
function handleStarterIntroCTA(){
  const c=getCollabState(); c.starter.introSeen=true; saveStateLocalOnly(); closeStarterIntro();
  if(!state.user){ window.__pendingCollectionOpen=true; openCollectionLoginGate(); return; }
  switchTab('koleksi');
}
function openCollectionLoginGate(){
  const modal=document.getElementById('modal-collection-login'); if(!modal){ openAuth('signin'); return; }
  modal.classList.remove('hidden'); modal.classList.add('flex');
}
function continueCollectionAfterLogin(){ hideModal('modal-collection-login'); window.__pendingCollectionOpen=true; openAuth('signin'); }
function cancelCollectionLogin(){ hideModal('modal-collection-login'); window.__pendingCollectionOpen=false; }

function claimStarterFromCollection(){
  if(!state.user){ window.__pendingStarterClaim=true; openCollectionLoginGate(); return; }
  if(claimStarterBundle()) { alert('🎉 Aura Sasa Yura Normaly berhasil didapatkan gratis!'); renderCollectionPage(); }
}

function openCollectionItem(type,index) {
  const isCharacter=type==='characters'; const items=getCollectionDisplayItems(isCharacter); const item=items[index]; if(!item)return;
  const c=getCollabState();
  if(item._locked && item._starter){ if(!state.user){ window.__pendingStarterClaim=true; openCollectionLoginGate(); return; } claimStarterFromCollection(); return; }
  if(item._locked){ switchTab('collab'); return; }
  const equipped=isCharacter?c.equippedCharacter:c.equippedSkin; const active=equipped?.id===item.id;
  const modal=document.getElementById('modal-collection-detail'), body=document.getElementById('collection-detail-body'); if(!modal||!body)return;
  const rarity=getRarityLabel(item.rarity);
  body.innerHTML=`<div class="relative overflow-hidden rounded-[1.5rem] bg-slate-950 text-white"><button onclick="hideModal('modal-collection-detail')" class="absolute z-10 right-3 top-3 w-9 h-9 rounded-full bg-black/35 flex items-center justify-center"><i class="fas fa-xmark"></i></button><div class="collection-detail-art"><img src="${escapeHtml(item.image||'')}" class="w-full h-auto block" alt="${escapeHtml(item.name||'')} — ${rarity}"></div><div class="p-5 bg-gradient-to-b from-slate-950/95 to-slate-900"><p class="text-[10px] uppercase tracking-[.18em] text-white/60">${isCharacter?'Character':'Skin'} · ${rarity}</p><h3 class="text-2xl font-bold mt-1">${escapeHtml(item.name||'')}</h3><p class="text-sm text-white/70 mt-1">${escapeHtml(item.description||'')}</p></div></div><div class="p-4 space-y-3"><div class="rounded-2xl bg-slate-50 p-3"><p class="text-xs font-semibold text-slate-800">${isCharacter?'Fungsi Karakter':'Fungsi Skin'}</p><p class="text-xs text-slate-500 mt-1 leading-relaxed">${isCharacter?'Karakter ini tampil pada card utama Beranda.':'Skin mengubah tema visual aplikasi tanpa mengganti karakter Beranda.'}</p></div><button type="button" ${active?'disabled':''} onclick="equipCollectionItem('${type}',${index});hideModal('modal-collection-detail')" class="w-full py-3.5 rounded-2xl text-sm font-bold ${active?'bg-emerald-50 text-emerald-600':'bg-indigo-600 text-white'}">${active?'✓ Sedang Digunakan':(isCharacter?'Tampilkan di Beranda':'Gunakan Skin')}</button></div>`;
  modal.classList.remove('hidden'); modal.classList.add('flex');
}

function renderCollectionHeroCounts(){
  const c=getCollabState();
  const a=document.getElementById('collection-hero-skin-count'), b=document.getElementById('collection-hero-character-count');
  if(a)a.textContent=(c.ownedSkins||[]).length;
  if(b)b.textContent=(c.ownedCharacters||[]).length;
}

function renderRarityGroups(items, isCharacters){
  const order=['normaly','rare','sr','ssr','sss','mythic'];
  const grouped={}; order.forEach(r=>grouped[r]=[]);
  items.forEach(x=>{const r=String(x.rarity||'normaly').toLowerCase(); (grouped[r] ||= []).push(x);});
  const owned=isCharacters?getCollabState().ownedCharacters:getCollabState().ownedSkins;
  const equipped=isCharacters?getCollabState().equippedCharacter:getCollabState().equippedSkin;
  return order.map(r=>{
    const arr=grouped[r];
    if(!arr.length) return `<section class="rarity-section"><div class="rarity-heading"><span class="rarity-pill ${getRarityClass(r)}">${getRarityLabel(r)}</span><span class="text-[10px] text-slate-400">Belum ada koleksi</span></div><div class="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-4 text-xs text-slate-400">Belum ada ${isCharacters?'karakter':'skin'} ${getRarityLabel(r)}.</div></section>`;
    return `<section class="rarity-section"><div class="rarity-heading"><span class="rarity-pill ${getRarityClass(r)}">${getRarityLabel(r)}</span><span class="text-[10px] text-slate-400">${arr.length} item</span></div><div class="grid grid-cols-1 gap-3">${arr.map(item=>{
      const active=equipped?.id&&item.id===equipped.id;
      const ownedIndex=owned.findIndex(x=>String(x.id||'')===String(item.id||''));
      const starterBadge=(!getCollabState().starter?.cardSeen && item._starter && !item._owned)?`<span class="free-badge">FREE</span>`:'';
      const status=item._locked?(item._starter?'Gratis untuk akun yang sudah Sign In':'Belum Dimiliki'):'Dimiliki';
      const action=item._locked?(item._starter?(state.user?'Ambil Gratis':'Sign In'):'Buka Event'):(active?'✓ Digunakan':(isCharacters?'Tampilkan':'Gunakan'));
      const globalIndex=items.indexOf(item); const onclick=item._locked?(item._starter?'claimStarterFromCollection()':'switchTab(\'collab\')'):`openCollectionItem('${isCharacters?'characters':'skins'}',${globalIndex})`;
      return `<article class="collection-item-card bg-white rounded-[1.4rem] overflow-hidden border ${active?'collection-active':'border-white'} shadow-[0_8px_30px_rgba(37,99,235,0.06)]"><button type="button" onclick="${onclick}" class="w-full text-left"><div class="collection-art relative aspect-[3/4] overflow-hidden"><img src="${escapeHtml(item.image||'')}" alt="${escapeHtml(item.name||'')}" class="w-full h-full object-cover">${starterBadge}<span class="rarity-corner ${getRarityClass(r)}">${getRarityLabel(item.rarity)}</span></div><div class="p-3.5"><div class="flex items-start gap-2"><div class="min-w-0 flex-1"><p class="font-bold text-sm text-slate-900 truncate">${escapeHtml(item.name||'Item')}</p><p class="text-[11px] text-slate-500 mt-0.5 line-clamp-2">${escapeHtml(item.description||'')}</p></div><span class="shrink-0 text-[10px] px-2 py-1 rounded-full ${item._locked?'collection-locked':'collection-owned'}">${status}</span></div></div></button><div class="px-3.5 pb-3.5"><button type="button" onclick="${item._locked?onclick:`equipCollectionItem('${isCharacters?'characters':'skins'}',${ownedIndex})`}" ${active?'disabled':''} class="w-full py-2.5 rounded-xl text-xs font-semibold ${active?'bg-emerald-50 text-emerald-600':item._locked?'bg-indigo-600 text-white':'bg-indigo-600 text-white'}">${action}</button></div></article>`;
    }).join('')}</div></section>`;
  }).join('');
}

function renderCollectionPage() {
  const listEl=document.getElementById('collection-list'), equippedEl=document.getElementById('collection-equipped'); if(!listEl||!equippedEl)return;
  const c=getCollabState(), isCharacters=collectionTab==='characters', owned=isCharacters?c.ownedCharacters:c.ownedSkins, equipped=isCharacters?c.equippedCharacter:c.equippedSkin, items=getCollectionDisplayItems(isCharacters);
  renderCollectionHeroCounts();
  document.querySelectorAll('.collection-switch').forEach((btn,i)=>{const active=(i===0&&!isCharacters)||(i===1&&isCharacters);btn.classList.toggle('bg-indigo-600',active);btn.classList.toggle('text-white',active);btn.classList.toggle('text-slate-500',!active);});
  document.querySelectorAll('[data-collection-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.collectionFilter===collectionFilter));
  document.getElementById('collection-section-title').textContent=isCharacters?'Daftar Karakter':'Daftar Skin';
  document.getElementById('collection-section-subtitle').textContent=isCharacters?'Koleksi karakter berdasarkan rarity.':'Koleksi skin berdasarkan rarity.';
  document.getElementById('collection-section-count').textContent=`${items.length} item`;
  equippedEl.innerHTML=`<section class="bg-white rounded-3xl border border-white shadow-[0_8px_30px_rgba(37,99,235,0.08)] p-4"><div class="flex items-center gap-3"><div class="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center overflow-hidden shrink-0">${equipped?.image?`<img src="${escapeHtml(equipped.image)}" alt="" class="w-full h-full object-cover">`:`<span class="text-2xl">${escapeHtml(equipped?.icon||(isCharacters?'👤':'🎨'))}</span>`}</div><div class="min-w-0 flex-1"><p class="text-[11px] uppercase tracking-wide font-semibold text-indigo-500">${escapeHtml(t(isCharacters?'collection_equipped_character':'collection_equipped_skin'))}</p><p class="font-semibold text-slate-900 truncate mt-0.5">${escapeHtml(equipped?.name||t('collection_default'))}</p><p class="text-xs text-slate-500 mt-0.5">${escapeHtml(isCharacters?'Tampil di card Beranda':'Mengubah tema visual aplikasi')}</p></div></div></section>`;
  listEl.innerHTML=renderRarityGroups(items,isCharacters);
  if (!c.starter.cardSeen && !c.starter.claimed) {
    setTimeout(() => { const cc=getCollabState(); if (!cc.starter.cardSeen) { cc.starter.cardSeen=true; saveStateLocalOnly(); renderCollectionPage(); } }, 1400);
  }
}

function renderCollabPage() {
  const root=document.getElementById('collab-page-content'); if(!root)return; const event=getActiveCollabEvent();
  if(!event){root.innerHTML=`<div class="bg-white rounded-3xl border border-white shadow-[0_8px_30px_rgba(37,99,235,0.08)] p-6 text-center"><div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3"><i class="fas fa-calendar-xmark text-xl"></i></div><h3 class="font-semibold text-slate-900">Event belum tersedia</h3><p class="text-sm text-slate-500 mt-1 leading-relaxed">Belum ada event collab aktif saat ini.</p></div>`;return;}
  const progress=getCollabProgress(event), p=getEventProgressState(event.id), allDone=progress.total>0&&progress.done===progress.total;
  root.innerHTML=`<section class="bg-white rounded-3xl border border-white shadow-[0_8px_30px_rgba(37,99,235,0.08)] overflow-hidden"><div class="p-5 bg-gradient-to-br from-indigo-50 via-white to-blue-50"><div class="flex items-start gap-3"><div class="w-16 h-20 rounded-xl overflow-hidden shadow-sm shrink-0"><img src="${AURA_SASA_YURA_ART}" class="w-full h-full object-cover" alt="Aura Sasa Yura"></div><div class="min-w-0"><p class="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">${escapeHtml(event.label||'Hujan Meteor')}</p><h3 class="text-xl font-bold text-slate-900 mt-1">${escapeHtml(event.title||'Event Collab')}</h3><p class="text-sm text-slate-500 mt-1.5 leading-relaxed">${escapeHtml(event.description||'')}</p></div></div><div class="mt-4 flex items-center justify-between text-xs"><span class="text-slate-500">${escapeHtml(t('collab_progress'))}</span><strong class="text-indigo-600">${progress.done}/${progress.total}</strong></div><div class="collab-progress-track mt-1.5"><div class="collab-progress-fill" style="width:${progress.percent}%"></div></div></div></section><section class="space-y-2"><div class="flex items-center justify-between px-1"><h3 class="font-semibold text-slate-900">${escapeHtml(t('collab_rewards'))}</h3><span class="text-xs text-slate-400">6 rarity tersedia</span></div>${(event.rewards||[]).map((r,i)=>{const claimed=p.claimedRewards.includes(r.id)||getCollabState().starter.claimed&&r.starter;const starter=r.starter;return `<div class="collab-reward-card rounded-2xl p-4 flex items-center gap-3"><div class="w-12 h-16 rounded-xl overflow-hidden shrink-0"><img src="${escapeHtml(r.item?.image||r.image||AURA_SASA_YURA_ART)}" class="w-full h-full object-cover" alt=""></div><div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="text-sm font-semibold text-slate-800">${escapeHtml(r.name||('Reward '+(i+1)))}</p><span class="rarity-pill ${getRarityClass(r.rarity)}">${getRarityLabel(r.rarity)}</span></div><p class="text-xs text-slate-500 mt-0.5">${escapeHtml(r.description||'')}</p></div><button type="button" onclick="${starter?'claimStarterFromCollection()':`claimCollabReward('${escapeHtml(String(r.id||i))}')`}" ${(starter ? (claimed ? 'disabled' : '') : ((!allDone || claimed) ? 'disabled' : ''))} class="px-3 py-2 rounded-xl text-xs font-medium ${claimed?'bg-emerald-50 text-emerald-600':'bg-indigo-600 text-white'}">${claimed?'✓ Didapat':starter?(state.user?'Gratis':'Sign In'):t('collab_claim')}</button></div>`;}).join('')}</section><section class="space-y-2 pb-6"><div class="flex items-center justify-between px-1"><h3 class="font-semibold text-slate-900">${escapeHtml(t('collab_missions'))}</h3></div>${progress.missions.map((m,i)=>`<div class="${m.done?'collab-mission-done ':''}bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3"><span class="w-9 h-9 rounded-xl ${m.done?'bg-emerald-50 text-emerald-600':'bg-indigo-50 text-indigo-600'} flex items-center justify-center shrink-0"><i class="fas ${m.done?'fa-check':'fa-list-check'} text-sm"></i></span><div class="min-w-0 flex-1"><p class="text-sm font-medium text-slate-800">${escapeHtml(m.title||('Misi '+(i+1)))}</p><p class="text-xs text-slate-500 mt-0.5">${escapeHtml(m.description||'')}</p><div class="collab-progress-track mt-2"><div class="collab-progress-fill" style="width:${m.percent}%"></div></div></div><span class="text-[11px] font-medium ${m.done?'text-emerald-600':'text-slate-400'}">${m.progress}/${m.target}</span></div>`).join('')}</section>`;
}

function claimCollabReward(id) {
  const event=getActiveCollabEvent(); if(!event)return; const p=getEventProgressState(event.id), progress=getCollabProgress(event); if(!progress.total||progress.done!==progress.total||p.claimedRewards.includes(id))return;
  const reward=(event.rewards||[]).find(r=>String(r.id)===String(id)); if(!reward)return;
  p.claimedRewards.push(id); const c=getCollabState(); const item=reward.item||{id:reward.id,name:reward.name||'Reward',description:reward.description||'',icon:reward.icon||'🎁',image:reward.image||'',rarity:reward.rarity||'normaly'};
  if(reward.type==='character' && !c.ownedCharacters.some(x=>String(x.id)===String(item.id))) c.ownedCharacters.push({...item});
  if(reward.type==='skin' && !c.ownedSkins.some(x=>String(x.id)===String(item.id))) c.ownedSkins.push({...item});
  saveState(); renderAll();
}

function openQuizOrGallery(){ switchTab('collab'); }
function openDeveloperEventManager(){switchTab('dev-events');setTimeout(renderDevEventManager,40);}

function openCollectionFromAccount(){
  if(!state.user){ window.__pendingCollectionOpen=true; openCollectionLoginGate(); return; }
  switchTab('koleksi');
}
