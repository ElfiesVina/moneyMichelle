// ==================== CHANGELOG / NOTIFIKASI ====================
// Developer: tambah entri baru di paling atas, dan naikkan APP_VERSION agar titik notifikasi muncul lagi.
const APP_VERSION = '1.7';
const CHANGELOG = [
  { v: '1.7', tgl: '5 Okt 2026', items: ['Grafik statistik bisa digeser dari tanggal 1 sampai akhir bulan, sumbu angka di kiri tetap terlihat', 'Dropdown bawaan diganti dropdown bergaya baru', 'Form Tambah Dompet, Kategori, dan Transaksi manual bergaya bottom sheet'] },
  { v: '1.6', tgl: '5 Okt 2026', items: ['Aplikasi kini bernama Money Michelle', 'Kartu profil berisi foto dan sapaan "Halo" di bawah judul'] },
  { v: '1.5', tgl: '5 Okt 2026', items: ['Halaman Menu (pengaturan dan kategori) dipisah dari halaman Akun', 'Halaman Akun baru: foto profil, nama, dan ringkasan akun', 'Tombol Masuk dan Daftar', 'Changelog dan pilihan periode kini berbentuk dropdown'] },
  { v: '1.4', tgl: '5 Okt 2026', items: ['Statistik baru: pilih dompet, tab Harian/Mingguan/Bulanan, dan perbandingan 3 periode', 'Ringkasan Masuk, Keluar, Selisih bertumpuk agar nominal tidak turun', 'Pengaturan AI menyatu dalam satu kartu'] },
  { v: '1.3', tgl: '5 Okt 2026', items: ['Ikon notifikasi dan changelog', 'Kalender baru yang lebih rapi untuk memilih tanggal', 'Folder/kategori bisa memakai logo (pilihan bawaan atau unggah gambar)', 'Pengaturan AI terbuka di bawah kartunya', 'Nominal transaksi di halaman dompet dipindah ke bawah teks', 'Ikon kini tampil tanpa bergantung CDN'] },
  { v: '1.2', tgl: '5 Okt 2026', items: ['Tampilan baru bergaya aplikasi: kartu saldo dan navigasi bawah', 'Tombol Ekspor, Impor, dan Hapus di Beranda', 'Nominal Transaksi Terbaru di bawah teks'] },
  { v: '1.1', tgl: '4 Okt 2026', items: ['Halaman detail dompet: riwayat Hari/Pekan/Bulan/Tahun/Rentang', 'Statistik perbandingan 3 bulan', 'Logo dompet (bawaan atau unggah gambar)', 'Saldo awal dompet kini tercatat sebagai transaksi'] },
  { v: '1.0', tgl: 'Awal', items: ['Asisten AI untuk mencatat lewat teks atau suara', 'Dompet, kategori, grafik, ekspor dan impor data'] }
];
const SEEN_KEY = 'ai_keuangan_seen_version';
function checkNotif() {
  let seen = null; try { seen = localStorage.getItem(SEEN_KEY); } catch (e) {}
  const dot = document.getElementById('notif-dot'); if (dot) dot.classList.toggle('hidden', seen === APP_VERSION);
}
function openChangelog() {
  document.getElementById('changelog-list').innerHTML = CHANGELOG.map((c, idx) => `
    <details ${idx === 0 ? 'open' : ''} class="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <summary class="flex items-center justify-between cursor-pointer list-none">
        <span class="text-sm font-semibold text-slate-800">Versi ${c.v} <span class="text-xs font-normal text-slate-400">· ${c.tgl}</span></span>
        <i class="fas fa-chevron-down chev text-xs text-slate-400"></i></summary>
      <ul class="mt-2 space-y-1 text-sm text-slate-600 list-disc pl-5">${c.items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
    </details>`).join('');
  const m = document.getElementById('modal-changelog'); m.classList.remove('hidden'); m.classList.add('flex');
  try { localStorage.setItem(SEEN_KEY, APP_VERSION); } catch (e) {}
  checkNotif();
}
checkNotif();

