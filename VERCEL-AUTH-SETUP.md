# Money Michelle — Auth Vercel + Supabase

Project ini sekarang memakai endpoint same-origin `/api/*` untuk login/daftar.

## 1. Buat tabel
Buka Supabase → SQL Editor, lalu jalankan `backend/supabase-schema.sql`.

## 2. Isi Environment Variables di Vercel
Tambahkan:

- `SUPABASE_URL` = URL project Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = Service Role Key Supabase (JANGAN ditaruh di frontend)
- `MONEY_MICHELLE_AUTH_SECRET` = string rahasia panjang/random

## 3. Redeploy
Setelah env disimpan, lakukan redeploy di Vercel.

Frontend otomatis memanggil:
- `/api/signup`
- `/api/signin`
- `/api/data`

Jangan memasukkan `SUPABASE_SERVICE_ROLE_KEY` ke file JS, HTML, GitHub, atau browser.

## 4. Local development
Karena `/api` adalah Vercel Functions, pengujian penuh sebaiknya memakai Vercel CLI:

```powershell
npm i -g vercel
vercel dev
```

Buka URL lokal yang diberikan Vercel.
