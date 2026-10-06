# Money Michelle — Modular v2

## Struktur
- `index.html` — UI/markup saja.
- `css/app.css` — CSS global + feature styles.
- `js/core/` — state, router, bootstrap.
- `js/features/finance/` — dompet, transaksi, statistik, anggaran.
- `js/features/collab/event-store.js` — katalog event global (mode lokal).
- `js/features/collab/collab.js` — progress user, reward, collection, equip.
- `js/features/backup/backup.js` — export/import ZIP.
- `js/features/auth/` — auth/cloud sync.
- `js/features/ai/` — parser lokal + AI settings.

## Menambah event
Gunakan Event Manager di aplikasi, atau isi `eventStore.events` melalui `event-store.js` saat development. Event catalog sengaja dipisahkan dari `state.collab`, sehingga katalog developer tidak ikut tersimpan sebagai data user/cloud.

Contoh mission:
```json
{
  "id": "mission-1",
  "title": "Catat 3 transaksi",
  "description": "Selesaikan 3 transaksi.",
  "metric": "count",
  "target": 3,
  "match": {}
}
```

Contoh mission nominal:
```json
{
  "id": "mission-2",
  "title": "Transaksi minimal Rp10.000",
  "metric": "count",
  "target": 1,
  "match": {"minAmount":10000}
}
```

Contoh reward:
```json
{
  "id": "reward-pikachu",
  "name": "Pikachu",
  "type": "character",
  "icon": "⚡",
  "item": {"id":"pikachu","name":"Pikachu","description":"Karakter event.","icon":"⚡"}
}
```

### Aturan data
**Uang:** transaksi adalah source of truth. `wallet.balance` hanya cache hasil `recalculateBalances()`, tidak boleh diubah manual saat menambah/menghapus transaksi.

**Character:** reward masuk `ownedCharacters`, lalu dapat di-equip untuk card Beranda.

**Skin:** reward masuk `ownedSkins`, lalu dapat di-equip untuk tema aplikasi.

**Event:** katalog event global berada di `EVENT_STORE_KEY`; progress milik user berada di `state.collab.eventProgress[eventId]`.

## Roadmap backend
`event-store.js` adalah batas (boundary) yang nantinya dapat diganti Supabase/API tanpa mengubah UI collection/mission.

## Prinsip arsitektur
```text
UI (index.html)
   ↓
Feature modules
   ├─ finance → transactions → wallet balance
   ├─ collab → missions → rewards → collection
   └─ backup/auth/AI
   ↓
Core state + storage
```

`transaction-service.js` adalah satu-satunya jalur pembuatan/penghapusan transaksi. Jangan mengubah `wallet.balance` langsung dari feature lain.

## Mengatur event tanpa mengubah JavaScript

Untuk event yang akan ikut deploy ke semua pengguna, edit file:

`data/events.json`

Di sana developer dapat mengatur:
- `activeEventId`
- `id`, `label`, `title`, `description`
- `startAt`, `endAt`, `status`
- `missions[]` (target, metric, match)
- `rewards[]` (character/skin, rarity, image, starter)

Asset gambar event berada di:
`assets/collab/<nama-event>/<nama-item>/...`

Setelah mengubah `data/events.json`, commit ke GitHub dan Vercel akan membuat deployment baru. Tidak perlu meminta AI mengubah kode untuk perubahan data event biasa.

Developer Console di dalam aplikasi tetap berguna untuk membuat draft/test event secara lokal. Perubahan dari console disimpan di localStorage perangkat tersebut; perubahan global/deployed tetap dilakukan melalui `data/events.json` dan Git.

## Auth Vercel

Frontend memakai same-origin `/api/signup`, `/api/signin`, dan `/api/data`. Lihat `VERCEL-AUTH-SETUP.md` untuk konfigurasi Supabase dan Environment Variables.
