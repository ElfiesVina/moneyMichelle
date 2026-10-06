// ============================================================
// EVENT STORE — konfigurasi event global untuk mode lokal.
// Saat backend/Supabase dipakai, modul ini dapat diganti API.
// ============================================================
const EVENT_STORE_KEY = 'money_michelle_event_store_v1';
let eventStore = { version:1, activeEventId:null, events:[] };

const HUJAN_METEOR_EVENT_ID = 'hujan-meteor-2026';
const AURA_SASA_YURA_CHARACTER_ID = 'aura-sasa-yura-normaly';
const AURA_SASA_YURA_SKIN_ID = 'aura-sasa-yura-normaly-skin';
const AURA_SASA_YURA_ART = 'assets/collab/hujan-meteor/aura-sasa-yura/normaly-card.png';

function getDefaultHujanMeteorEvent() {
  return {
    id: HUJAN_METEOR_EVENT_ID,
    label: 'Hujan Meteor × Money Michelle',
    title: 'Hujan Meteor — School Romance',
    description: 'Event collab pertama Money Michelle. Dapatkan Aura Sasa Yura sebagai Character dan Skin Normaly gratis.',
    startAt: '2026-10-01T00:00:00.000Z',
    endAt: '2027-12-31T23:59:59.000Z',
    status: 'active',
    starterReward: true,
    missions: [
      { id:'hm-mission-1', title:'Catat 3 transaksi', description:'Tambahkan tiga transaksi valid untuk progres event.', metric:'count', target:3, match:{} },
      { id:'hm-mission-2', title:'Transaksi minimal Rp10.000', description:'Tambahkan satu transaksi dengan nominal minimal Rp10.000.', metric:'count', target:1, match:{minAmount:10000} }
    ],
    rewards: [
      {
        id:'reward-aura-sasa-yura-normaly-character', name:'Aura Sasa Yura — Normaly', description:'Character gratis untuk card utama Beranda.', type:'character', icon:'✨', rarity:'normaly', starter:true,
        item:{ id:AURA_SASA_YURA_CHARACTER_ID, name:'Aura Sasa Yura', description:'Character Normaly dari Hujan Meteor × Money Michelle.', icon:'✨', image:AURA_SASA_YURA_ART, rarity:'normaly', event:HUJAN_METEOR_EVENT_ID }
      },
      {
        id:'reward-aura-sasa-yura-normaly-skin', name:'Aura Sasa Yura — Normaly Skin', description:'Skin gratis dengan tema Silver Lavender × Dusty Blue × Warm White.', type:'skin', icon:'🎨', rarity:'normaly', starter:true,
        item:{ id:AURA_SASA_YURA_SKIN_ID, name:'Aura Sasa Yura', description:'Skin Normaly: Silver Lavender × Dusty Blue × Warm White.', icon:'🎨', image:AURA_SASA_YURA_ART, rarity:'normaly', event:HUJAN_METEOR_EVENT_ID, primaryColor:'#77758A', secondaryColor:'#9A9AAF', accentColor:'#B8AFC8', backgroundColor:'#E9E8ED', cardColor:'#F5F3F5', textColor:'#34343D' }
      }
    ]
  };
}

function ensureDefaultEventCatalog() {
  const exists = eventStore.events.some(e => String(e.id) === HUJAN_METEOR_EVENT_ID);
  if (!exists) eventStore.events.push(getDefaultHujanMeteorEvent());
  const starter = eventStore.events.find(e => String(e.id) === HUJAN_METEOR_EVENT_ID);
  if (starter) {
    starter.status = starter.status === 'ended' ? 'ended' : 'active';
    if (!eventStore.activeEventId || eventStore.activeEventId === HUJAN_METEOR_EVENT_ID) eventStore.activeEventId = HUJAN_METEOR_EVENT_ID;
  }
}


function loadEventStore() {
  try {
    const raw = localStorage.getItem(EVENT_STORE_KEY);
    if (raw) eventStore = { ...eventStore, ...JSON.parse(raw) };
  } catch (e) { console.warn('Gagal memuat event store', e); }

  if (!Array.isArray(eventStore.events)) eventStore.events = [];
  ensureDefaultEventCatalog();
  saveEventStore();

  // Migrasi satu kali dari versi lama yang menyimpan katalog event di state user.
  const legacy = state?.collab?.eventCatalog;
  if (eventStore.events.length === 0 && Array.isArray(legacy) && legacy.length) {
    eventStore.events = legacy;
    eventStore.activeEventId = state.collab.activeEventId || legacy.find(e => e.status === 'active')?.id || null;
    delete state.collab.eventCatalog;
    delete state.collab.activeEventId;
    saveEventStore();
    saveStateLocalOnly();
  }
}

function saveEventStore() {
  try { localStorage.setItem(EVENT_STORE_KEY, JSON.stringify(eventStore)); }
  catch (e) { console.warn('Gagal menyimpan event store', e); }
}

function getEventCatalog() { return eventStore.events; }
function getEventById(id) { return eventStore.events.find(e => String(e.id) === String(id)) || null; }
function getActiveEventId() { return eventStore.activeEventId || null; }

function getActiveCollabEvent() {
  const event = getEventById(eventStore.activeEventId);
  if (!event || event.status !== 'active') return null;
  const now = Date.now();
  if (event.startAt && now < new Date(event.startAt).getTime()) return null;
  if (event.endAt && now > new Date(event.endAt).getTime()) {
    event.status = 'ended';
    eventStore.activeEventId = null;
    saveEventStore();
    return null;
  }
  return event;
}

function activateEvent(id) {
  const event = getEventById(id);
  if (!event) return false;
  eventStore.events.forEach(e => { if (e.id !== id && e.status === 'active') e.status = 'published'; });
  event.status = 'active';
  eventStore.activeEventId = id;
  saveEventStore();
  return true;
}

function deactivateEvent() {
  const event = getActiveCollabEvent();
  if (event) event.status = 'published';
  eventStore.activeEventId = null;
  saveEventStore();
}
