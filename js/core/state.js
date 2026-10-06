// ==================== DATA ====================
const STORAGE_KEY = 'ai_keuangan_v1';
let state = {
  wallets: [
    { id: 'dana', name: 'Dana', balance: 0, color: '#108ee9' },
    { id: 'ovo', name: 'OVO', balance: 0, color: '#4c3494' },
    { id: 'gopay', name: 'GoPay', balance: 0, color: '#00aad4' },
    { id: 'cash', name: 'Cash', balance: 0, color: '#10b981' },
    { id: 'bank', name: 'Bank', balance: 0, color: '#6366f1' }
  ],
  categories: [
    { id: 'jajan', name: 'Jajan', icon: '🍪' },
    { id: 'makanan', name: 'Makanan', icon: '🍜' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'tagihan', name: 'Tagihan', icon: '📄' },
    { id: 'belanja', name: 'Belanja', icon: '🛒' },
    { id: 'hiburan', name: 'Hiburan', icon: '🎬' },
    { id: 'kesehatan', name: 'Kesehatan', icon: '💊' },
    { id: 'gaji', name: 'Gaji', icon: '💰' },
    { id: 'lainnya', name: 'Lainnya', icon: '📌' }
  ],
  transactions: [],
  budgets: [],
  chatHistory: [],
  profile: { name: '', avatar: '' },
  user: null,
  collab: {
    eventProgress: {},
    equippedCharacter: null,
    equippedSkin: null,
    ownedCharacters: [],
    ownedSkins: [],
    missions: [],
    claimedRewards: [],
    starter: { introSeen: false, claimed: false, claimedAt: null }
  }
};

let chartCategory = null;
let chartWallet = null;
let manualType = 'expense';
let recognition = null;
let isRecording = false;


// State persistence
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed }; if (!Array.isArray(state.budgets)) state.budgets = [];
    }
  } catch (e) { console.warn(e); }
}

function saveStateLocalOnly() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveState() {
  // Balance adalah nilai turunan dari transaksi; hitung sekali sebelum persist.
  if (typeof recalculateBalances === 'function') recalculateBalances();
  saveStateLocalOnly();
  // Sinkron ke akun jika sudah login (debounce)
  if (typeof pushCloudDataDebounced === 'function') pushCloudDataDebounced();
}


function normalizeState() {
  if (!state || typeof state !== 'object') state = {};
  if (!Array.isArray(state.wallets) || !state.wallets.length) state.wallets = [
    { id:'dana', name:'Dana', balance:0, color:'#108ee9' },
    { id:'ovo', name:'OVO', balance:0, color:'#4c3494' },
    { id:'gopay', name:'GoPay', balance:0, color:'#00aad4' },
    { id:'cash', name:'Cash', balance:0, color:'#10b981' },
    { id:'bank', name:'Bank', balance:0, color:'#6366f1' }
  ];
  if (!Array.isArray(state.categories) || !state.categories.length) state.categories = [{id:'lainnya',name:'Lainnya',icon:'📌'}];
  if (!Array.isArray(state.transactions)) state.transactions = [];
  if (!Array.isArray(state.budgets)) state.budgets = [];
  if (!Array.isArray(state.chatHistory)) state.chatHistory = [];
  if (!state.profile || typeof state.profile !== 'object') state.profile = {name:'',avatar:''};
  if (!state.collab || typeof state.collab !== 'object') state.collab = {};
  if (!state.collab.eventProgress || typeof state.collab.eventProgress !== 'object' || Array.isArray(state.collab.eventProgress)) state.collab.eventProgress = {};
  if (!Array.isArray(state.collab.ownedCharacters)) state.collab.ownedCharacters = [];
  if (!Array.isArray(state.collab.ownedSkins)) state.collab.ownedSkins = [];
  if (!Array.isArray(state.collab.missions)) state.collab.missions = [];
  if (!Array.isArray(state.collab.claimedRewards)) state.collab.claimedRewards = [];
  if (!state.collab.starter || typeof state.collab.starter !== 'object') state.collab.starter = {};
  if (typeof state.collab.starter.introSeen !== 'boolean') state.collab.starter.introSeen = false;
  if (typeof state.collab.starter.claimed !== 'boolean') state.collab.starter.claimed = false;
  if (!('claimedAt' in state.collab.starter)) state.collab.starter.claimedAt = null;
  if (typeof state.collab.starter.cardSeen !== 'boolean') state.collab.starter.cardSeen = false;
}
