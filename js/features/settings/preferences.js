// ==================== TEMA & BAHASA ====================
const PREFS_KEY = 'ai_keuangan_prefs_v1';
let prefs = { theme: 'light', lang: 'id' };

const I18N = {
  id: {
    theme_title: 'Tampilan', theme_light: 'Mode terang', theme_dark: 'Mode gelap',
    lang_title: 'Bahasa', lang_sub: 'Pilih bahasa aplikasi',
    btn_login: 'Masuk', btn_register: 'Daftar', btn_cancel: 'Batal', btn_save: 'Simpan', btn_close: 'Tutup',
    forgot_need_email: 'Masukkan email dulu, lalu ketuk Lupa kata sandi.',
    forgot_sent: 'Jika email terdaftar, tautan reset akan dikirim.',
    forgot: 'Lupa kata sandi?',
    menu: 'Menu', home: 'Beranda', stat: 'Statistik', wallet: 'Dompet', account: 'Akun',
    ai_settings: 'Pengaturan AI', ai_settings_sub: 'Kunci API, model, dan suara',
    greet_default: 'Halo! Kelola uangmu jadi lebih mudah',
    balance_main: 'Saldo Utama',
    month_in: 'masuk', month_out: 'keluar bulan ini',
    export: 'Ekspor', import: 'Impor', delete: 'Hapus',
    ai_assistant: 'Asisten AI Keuangan',
    ai_hint: 'Ketik atau bicara. Contoh: "pengeluaran di wallet dana folder jajan 15k"',
    send: 'Kirim',
    recent_tx: 'Transaksi Terbaru',
    filter_all: 'Semua', filter_expense: 'Pengeluaran', filter_income: 'Pemasukan',
    manual: '+ Manual',
    total_in: 'Total Masuk', total_out: 'Total Keluar', net: 'Selisih',
    comparison: 'Perbandingan', out_btn: 'Keluar', in_btn: 'Masuk',
    chart_hint: 'Geser grafik ke kiri atau kanan untuk melihat tanggal 1 s/d akhir bulan',
    exp_by_cat: 'Pengeluaran per Kategori (Bulan Ini)',
    exp_by_wallet: 'Pengeluaran per Dompet (Bulan Ini)',
    wallets_title: 'Dompet / Wallet', add: '+ Tambah',
    folders_title: 'Folder / Kategori',
    account_title: 'Akun', edit_profile: 'Ubah profil',
    menu_settings: 'Menu & Pengaturan', whats_new: 'Apa yang baru', app_version: 'Versi aplikasi',
    wallets_count: 'Dompet', tx_count: 'Transaksi', cat_count: 'Kategori',
    available: 'Tersedia', current_balance: 'Saldo Saat Ini',
    period: 'Periode', from: 'Dari', to: 'Sampai',
    in_label: 'Masuk', out_label: 'Keluar',
    no_tx_period: 'Tidak ada transaksi di periode ini.',
    add_wallet: 'Tambah Dompet', pick_logo: 'Pilih logo', logo_hint: 'Bawaan atau unggah gambar',
    wallet_name_ph: 'Nama (contoh: Dana, OVO, Cash)', balance_ph: 'Saldo awal (opsional)',
    add_folder: 'Tambah Folder / Kategori', folder_name_ph: 'Nama (contoh: Jajan, Transport)',
    pick_logo_label: 'Pilih logo', upload_own: 'Unggah gambar sendiri',
    name_ph: 'Nama', email_ph: 'Email', pass_ph: 'Kata sandi (min. 6 karakter)',
    edit_profile_title: 'Ubah Profil', change_photo: 'Ganti foto',
    already_in: 'Sudah masuk', login_prompt: 'Masuk untuk menikmati fitur lengkap',
    no_account: 'Belum punya akun? Daftar sekarang.', not_logged: 'Belum masuk',
    sign_out: 'Keluar',
    placeholder_nl: 'Contoh: pengeluaran wallet dana folder jajan 15rb...',
    settings_btn: 'Pengaturan',
    skin_character: 'Skin & Karakter',
    collection_title: 'Skin & Karakter',
    collection_subtitle: 'Kelola tampilan aplikasi dan karakter Beranda',
    collection_skins: 'Skin',
    collection_characters: 'Karakter',
    collection_empty_skin: 'Belum ada skin yang dimiliki',
    collection_empty_character: 'Belum ada karakter yang dimiliki',
    collection_equip: 'Pakai',
    collection_equipped: 'Sedang dipakai',
    collection_default: 'Default',
    collection_equipped_skin: 'Skin aktif',
    collection_equipped_character: 'Karakter aktif',
  mascot_label: 'Maskot collab', see_all: 'Lihat semua', see_summary: 'Lihat Ringkasan', profile_hint: 'Ketuk untuk buka akun',
    mascot_hint: 'Selesaikan misi untuk membuka karakter & skin', mascot_cta: 'Event Collab', collab_title: 'Event Collab', collab_subtitle: 'Misi, syarat, dan koleksi hadiah', collab_event_label: 'Event klaim', collab_event_hint: 'Selesaikan semua misi untuk membuka hadiah.', collab_progress: 'Progres misi', collab_open: 'Buka Event', collab_missions: 'Misi & Syarat', collab_condition: 'Syarat partisipasi', collab_mission: 'Misi', collab_done: 'Selesai', collab_locked: 'Belum selesai', collab_rewards: 'Hadiah', collab_claim_condition: 'Syarat klaim', collab_reward: 'Hadiah', collab_claim: 'Klaim', collab_claimed: 'Sudah diklaim', collab_no_missions: 'Belum ada misi untuk event ini.', collab_no_rewards: 'Belum ada hadiah untuk event ini.', collab_empty_title: 'Belum ada event collab', collab_empty_hint: 'Saat event klaim aktif, misi dan hadiah akan muncul di halaman ini.',
    tx_title: 'Transaksi', tx_nav: 'Transaksi',
    budget: 'Anggaran', budget_sub: 'Batas pengeluaran per kategori untuk bulan ini',
    budget_empty: 'Belum ada anggaran. Ketuk + Tambah untuk membuat.',
    budget_add: 'Tambah Anggaran', budget_limit: 'Batas (Rp)',
    budget_used: 'terpakai', budget_over: 'Melebihi batas',
    all_wallets: 'Semua dompet',
    add_manual: 'Tambah Transaksi Manual',
    day: 'Harian', week: 'Mingguan', month: 'Bulanan',
    amount: 'Jumlah', note: 'Catatan', date: 'Tanggal',
    type_expense: 'Pengeluaran', type_income: 'Pemasukan',
    guest: 'Tamu', no_tx: 'Belum ada transaksi',
    summary: 'Ringkasan', period_label: 'Periode',
    choose_logo: 'Pilih logo', use_initial: 'Pakai inisial',
    remove_photo: 'Hapus foto', your_name: 'Nama kamu'
  },
  en: {
    theme_title: 'Appearance', theme_light: 'Light mode', theme_dark: 'Dark mode',
    lang_title: 'Language', lang_sub: 'Choose app language',
    btn_login: 'Sign in', btn_register: 'Sign up', btn_cancel: 'Cancel', btn_save: 'Save', btn_close: 'Close',
    forgot_need_email: 'Enter your email first, then tap Forgot password.',
    forgot_sent: 'If the email is registered, a reset link will be sent.',
    forgot: 'Forgot password?',
    menu: 'Menu', home: 'Home', stat: 'Stats', wallet: 'Wallets', account: 'Account',
    ai_settings: 'AI Settings', ai_settings_sub: 'API key, model, and voice',
    greet_default: 'Hi! Manage your money more easily',
    balance_main: 'Main Balance',
    month_in: 'in', month_out: 'out this month',
    export: 'Export', import: 'Import', delete: 'Delete',
    ai_assistant: 'Finance AI Assistant',
    ai_hint: 'Type or speak. Example: "expense in dana wallet snacks folder 15k"',
    send: 'Send',
    recent_tx: 'Recent Transactions',
    filter_all: 'All', filter_expense: 'Expense', filter_income: 'Income',
    manual: '+ Manual',
    total_in: 'Total In', total_out: 'Total Out', net: 'Net',
    comparison: 'Comparison', out_btn: 'Out', in_btn: 'In',
    chart_hint: 'Swipe the chart left or right to see day 1 through end of month',
    exp_by_cat: 'Spending by Category (This Month)',
    exp_by_wallet: 'Spending by Wallet (This Month)',
    wallets_title: 'Wallets', add: '+ Add',
    folders_title: 'Folders / Categories',
    account_title: 'Account', edit_profile: 'Edit profile',
    menu_settings: 'Menu & Settings', whats_new: 'What\'s new', app_version: 'App version',
    wallets_count: 'Wallets', tx_count: 'Transactions', cat_count: 'Categories',
    available: 'Available', current_balance: 'Current Balance',
    period: 'Period', from: 'From', to: 'To',
    in_label: 'In', out_label: 'Out',
    no_tx_period: 'No transactions in this period.',
    add_wallet: 'Add Wallet', pick_logo: 'Choose logo', logo_hint: 'Preset or upload image',
    wallet_name_ph: 'Name (e.g. Dana, OVO, Cash)', balance_ph: 'Opening balance (optional)',
    add_folder: 'Add Folder / Category', folder_name_ph: 'Name (e.g. Snacks, Transport)',
    pick_logo_label: 'Choose logo', upload_own: 'Upload your own image',
    name_ph: 'Name', email_ph: 'Email', pass_ph: 'Password (min. 6 characters)',
    edit_profile_title: 'Edit Profile', change_photo: 'Change photo',
    already_in: 'Signed in', login_prompt: 'Sign in for full features',
    no_account: 'No account yet? Sign up now.', not_logged: 'Not signed in',
    sign_out: 'Sign out',
    placeholder_nl: 'Example: expense dana snacks 15k...',
    settings_btn: 'Settings',
    skin_character: 'Skin & Character',
    collection_title: 'Skin & Character',
    collection_subtitle: 'Manage the app theme and home character',
    collection_skins: 'Skins',
    collection_characters: 'Characters',
    collection_empty_skin: 'No owned skins yet',
    collection_empty_character: 'No owned characters yet',
    collection_equip: 'Equip',
    collection_equipped: 'Equipped',
    collection_default: 'Default',
    collection_equipped_skin: 'Active skin',
    collection_equipped_character: 'Active character',
  mascot_label: 'Collab mascot', see_all: 'See all', see_summary: 'View summary', profile_hint: 'Tap to open account',
    mascot_hint: 'Complete missions to unlock characters & skins', mascot_cta: 'Collab Event', collab_title: 'Collab Event', collab_subtitle: 'Missions, conditions, and rewards', collab_event_label: 'Claim event', collab_event_hint: 'Complete all missions to unlock rewards.', collab_progress: 'Mission progress', collab_open: 'Open Event', collab_missions: 'Missions & Conditions', collab_condition: 'Participation condition', collab_mission: 'Mission', collab_done: 'Completed', collab_locked: 'Incomplete', collab_rewards: 'Rewards', collab_claim_condition: 'Claim condition', collab_reward: 'Reward', collab_claim: 'Claim', collab_claimed: 'Claimed', collab_no_missions: 'No missions for this event yet.', collab_no_rewards: 'No rewards for this event yet.', collab_empty_title: 'No active collab event', collab_empty_hint: 'When a claim event is active, its missions and rewards will appear here.',
    tx_title: 'Transactions', tx_nav: 'Transactions',
    budget: 'Budget', budget_sub: 'Spending limits per category this month',
    budget_empty: 'No budgets yet. Tap + Add to create one.',
    budget_add: 'Add Budget', budget_limit: 'Limit (Rp)',
    budget_used: 'used', budget_over: 'Over budget',
    all_wallets: 'All wallets',
    add_manual: 'Add Manual Transaction',
    day: 'Daily', week: 'Weekly', month: 'Monthly',
    amount: 'Amount', note: 'Note', date: 'Date',
    type_expense: 'Expense', type_income: 'Income',
    guest: 'Guest', no_tx: 'No transactions yet',
    summary: 'Summary', period_label: 'Period',
    choose_logo: 'Choose logo', use_initial: 'Use initial',
    remove_photo: 'Remove photo', your_name: 'Your name'
  },
  ar: {
    theme_title: 'المظهر', theme_light: 'الوضع الفاتح', theme_dark: 'الوضع الداكن',
    lang_title: 'اللغة', lang_sub: 'اختر لغة التطبيق',
    btn_login: 'تسجيل الدخول', btn_register: 'إنشاء حساب', btn_cancel: 'إلغاء', btn_save: 'حفظ', btn_close: 'إغلاق',
    forgot_need_email: 'أدخل البريد أولاً ثم اضغط نسيت كلمة المرور.',
    forgot_sent: 'إذا كان البريد مسجلاً، سيتم إرسال رابط إعادة التعيين.',
    forgot: 'نسيت كلمة المرور؟',
    menu: 'القائمة', home: 'الرئيسية', stat: 'إحصائيات', wallet: 'المحافظ', account: 'الحساب',
    ai_settings: 'إعدادات الذكاء', ai_settings_sub: 'مفتاح API والنموذج والصوت',
    greet_default: 'مرحباً! أدِر أموالك بسهولة أكبر',
    balance_main: 'الرصيد الرئيسي',
    month_in: 'دخل', month_out: 'خرج هذا الشهر',
    export: 'تصدير', import: 'استيراد', delete: 'حذف',
    ai_assistant: 'مساعد المالية الذكي',
    ai_hint: 'اكتب أو تكلم. مثال: "مصروف محفظة دانا مجلد وجبات 15 ألف"',
    send: 'إرسال',
    recent_tx: 'أحدث المعاملات',
    filter_all: 'الكل', filter_expense: 'مصروف', filter_income: 'دخل',
    manual: '+ يدوي',
    total_in: 'إجمالي الدخل', total_out: 'إجمالي المصروف', net: 'الصافي',
    comparison: 'مقارنة', out_btn: 'مصروف', in_btn: 'دخل',
    chart_hint: 'اسحب الرسم يميناً أو يساراً لرؤية الأيام',
    exp_by_cat: 'المصروف حسب الفئة (هذا الشهر)',
    exp_by_wallet: 'المصروف حسب المحفظة (هذا الشهر)',
    wallets_title: 'المحافظ', add: '+ إضافة',
    folders_title: 'المجلدات / الفئات',
    account_title: 'الحساب', edit_profile: 'تعديل الملف',
    menu_settings: 'القائمة والإعدادات', whats_new: 'ما الجديد', app_version: 'إصدار التطبيق',
    wallets_count: 'محافظ', tx_count: 'معاملات', cat_count: 'فئات',
    available: 'متاح', current_balance: 'الرصيد الحالي',
    period: 'الفترة', from: 'من', to: 'إلى',
    in_label: 'دخل', out_label: 'مصروف',
    no_tx_period: 'لا معاملات في هذه الفترة.',
    add_wallet: 'إضافة محفظة', pick_logo: 'اختر شعاراً', logo_hint: 'جاهز أو ارفع صورة',
    wallet_name_ph: 'الاسم (مثال: Dana)', balance_ph: 'رصيد ابتدائي (اختياري)',
    add_folder: 'إضافة مجلد / فئة', folder_name_ph: 'الاسم (مثال: وجبات)',
    pick_logo_label: 'اختر شعاراً', upload_own: 'ارفع صورتك',
    name_ph: 'الاسم', email_ph: 'البريد', pass_ph: 'كلمة المرور (6 أحرف على الأقل)',
    edit_profile_title: 'تعديل الملف', change_photo: 'تغيير الصورة',
    already_in: 'مسجّل الدخول', login_prompt: 'سجّل الدخول للميزات الكاملة',
    no_account: 'ليس لديك حساب؟ أنشئ حساباً.', not_logged: 'غير مسجّل',
    sign_out: 'تسجيل الخروج',
    placeholder_nl: 'مثال: مصروف دانا وجبات 15 ألف...',
    settings_btn: 'إعدادات',
    mascot_label: 'تميمة التعاون', see_all: 'عرض الكل', see_summary: 'عرض الملخص', profile_hint: 'اضغط لفتح الحساب',
    mascot_hint: 'أكمل المهام لفتح الشخصيات والأزياء', mascot_cta: 'فعالية التعاون', collab_title: 'فعالية التعاون', collab_subtitle: 'المهام والشروط والمكافآت', collab_event_label: 'فعالية المطالبة', collab_event_hint: 'أكمل جميع المهام لفتح المكافآت.', collab_progress: 'تقدم المهام', collab_open: 'فتح الفعالية', collab_missions: 'المهام والشروط', collab_condition: 'شروط المشاركة', collab_mission: 'مهمة', collab_done: 'مكتملة', collab_locked: 'غير مكتملة', collab_rewards: 'المكافآت', collab_claim_condition: 'شرط المطالبة', collab_reward: 'مكافأة', collab_claim: 'مطالبة', collab_claimed: 'تمت المطالبة', collab_no_missions: 'لا توجد مهام لهذه الفعالية بعد.', collab_no_rewards: 'لا توجد مكافآت لهذه الفعالية بعد.', collab_empty_title: 'لا توجد فعالية تعاون نشطة', collab_empty_hint: 'عند تفعيل فعالية للمطالبة، ستظهر المهام والمكافآت هنا.',
    tx_title: 'المعاملات', tx_nav: 'المعاملات',
    budget: 'الميزانية', budget_sub: 'حدود الإنفاق لكل فئة هذا الشهر',
    budget_empty: 'لا ميزانيات بعد. اضغط + إضافة.',
    budget_add: 'إضافة ميزانية', budget_limit: 'الحد (ر.إ)',
    budget_used: 'مستخدم', budget_over: 'تجاوز الحد',
    all_wallets: 'كل المحافظ',
    add_manual: 'إضافة معاملة يدوية',
    day: 'يومي', week: 'أسبوعي', month: 'شهري',
    amount: 'المبلغ', note: 'ملاحظة', date: 'التاريخ',
    type_expense: 'مصروف', type_income: 'دخل',
    guest: 'زائر', no_tx: 'لا معاملات بعد',
    summary: 'ملخص', period_label: 'الفترة',
    choose_logo: 'اختر شعاراً', use_initial: 'استخدم الحرف',
    remove_photo: 'حذف الصورة', your_name: 'اسمك'
  }
};
function t(key) {
  const pack = I18N[prefs.lang] || I18N.id;
  return pack[key] || (I18N.id[key] || key);
}
function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) prefs = { ...prefs, ...JSON.parse(raw) };
  } catch (e) {}
  // migrate legacy
  if (!prefs.theme) prefs.theme = 'light';
  if (!prefs.lang) prefs.lang = 'id';
}
function savePrefs() {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {}
}
function applyTheme() {
  const dark = prefs.theme === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  document.body.classList.toggle('dark', dark);
  const sw = document.getElementById('theme-switch');
  if (sw) { sw.classList.toggle('on', dark); sw.classList.toggle('off', !dark); }
  const icon = document.getElementById('theme-icon');
  if (icon) icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
  const label = document.getElementById('theme-label');
  if (label) label.textContent = dark ? t('theme_dark') : t('theme_light');
}
function toggleTheme() {
  prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
  savePrefs(); applyTheme();
}
function applyLang() {
  const lang = prefs.lang || 'id';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (k && t(k)) el.textContent = t(k);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const k = el.getAttribute('data-i18n-placeholder');
    if (k && t(k)) el.setAttribute('placeholder', t(k));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const k = el.getAttribute('data-i18n-title');
    if (k && t(k)) el.setAttribute('title', t(k));
  });
  // dynamic bits
  const greet = document.getElementById('greet');
  if (greet && (!greet.dataset.custom || greet.dataset.custom === '0')) greet.textContent = t('greet_default');
  const nl = document.getElementById('nl-input');
  if (nl) nl.placeholder = t('placeholder_nl');
  // lang dropdown UI
  const labels = { id: 'Indonesia', en: 'English', ar: 'العربية' };
  const langLabel = document.getElementById('lang-dropdown-label');
  if (langLabel) langLabel.textContent = labels[lang] || labels.id;
  document.querySelectorAll('.lang-opt').forEach(b => {
    const active = b.dataset.lang === lang;
    b.className = 'lang-opt w-full text-left px-3 py-2.5 rounded-xl text-sm ' + (active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-700');
  });
  const menu = document.getElementById('lang-dropdown-menu');
  if (menu) menu.classList.add('hidden');
  const forgot = document.getElementById('auth-forgot');
  if (forgot) forgot.textContent = t('forgot');
  // nav labels — ONLY update text span, never add/remove icons
  const navMap = { home: 'home', transaksi: 'tx_nav', dompet: 'wallet', akun: 'account' };
  document.querySelectorAll('.navbtn').forEach(btn => {
    const key = navMap[btn.dataset.tab];
    if (!key) return;
    const label = btn.querySelector('[data-nav-label]');
    if (label) label.textContent = t(key);
  });
  applyTheme(); // refresh theme label language
}
function toggleLangMenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('lang-dropdown-menu');
  const chev = document.getElementById('lang-dropdown-chev');
  if (!menu) return;
  const open = menu.classList.contains('hidden');
  document.querySelectorAll('.cs-menu').forEach(m => m.classList.add('hidden'));
  menu.classList.toggle('hidden', !open);
  if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
}
document.addEventListener('click', () => {
  const menu = document.getElementById('lang-dropdown-menu');
  const chev = document.getElementById('lang-dropdown-chev');
  if (menu) menu.classList.add('hidden');
  if (chev) chev.style.transform = '';
});
function setLang(lang) {
  prefs.lang = lang;
  savePrefs();
  applyLang();
  try { renderProfile(); } catch (e) {}
  try { renderAll(); } catch (e) {}
}
function initPrefs() {
  loadPrefs();
  applyTheme();
  applyLang();
}

