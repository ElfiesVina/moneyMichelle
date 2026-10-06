// ============================================================
// EVENT STORE — konfigurasi event global untuk mode lokal.
// Saat backend/Supabase dipakai, modul ini dapat diganti API.
// ============================================================
const EVENT_STORE_KEY = 'money_michelle_event_store_v1';
const EVENT_CONFIG_URL = 'data/events.json';
let eventStore = { version:2, activeEventId:null, events:[], localEvents:[] };

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


async function loadEventStore() {
  // data/events.json adalah source of truth developer untuk event yang ikut deploy.
  // localStorage hanya menyimpan event lokal yang dibuat dari Developer Console.
  let remoteCatalog = null;
  try {
    const response = await fetch(`${EVENT_CONFIG_URL}?v=${Date.now()}`, { cache: 'no-store' });
    if (response.ok) remoteCatalog = await response.json();
  } catch (e) {
    console.warn('Gagal memuat katalog event dari data/events.json; memakai fallback/local.', e);
  }

  try {
    const raw = localStorage.getItem(EVENT_STORE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      eventStore = { ...eventStore, ...saved };
    }
  } catch (e) { console.warn('Gagal memuat event store lokal', e); }

  if (!Array.isArray(eventStore.localEvents)) eventStore.localEvents = [];
  if (remoteCatalog && Array.isArray(remoteCatalog.events)) {
    eventStore.events = remoteCatalog.events.map(e => ({ ...e }));
    eventStore.activeEventId = remoteCatalog.activeEventId || null;
  } else if (!Array.isArray(eventStore.events)) {
    eventStore.events = [];
  }

  // Event dari Developer Console tetap tersedia sebagai event lokal tambahan.
  const localById = new Map(eventStore.localEvents.map(e => [String(e.id), e]));
  eventStore.events = eventStore.events.map(e => localById.has(String(e.id)) ? localById.get(String(e.id)) : e);
  const remoteIds = new Set(eventStore.events.map(e => String(e.id)));
  eventStore.localEvents.forEach(localEvent => {
    if (!remoteIds.has(String(localEvent.id))) eventStore.events.push(localEvent);
  });

  ensureDefaultEventCatalog();
  saveEventStore();
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
