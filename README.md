# Paririmbon MBG — Setup Deploy

Aplikasi ini punya 2 bagian:
1. **Backend** = Google Sheet + Google Apps Script (jadi API penyimpan data)
2. **Frontend** = `index.html` (di-deploy ke Vercel)

Ikuti urutan di bawah, jangan dibalik — backend harus jadi dulu sebelum frontend bisa dites.

---

## Bagian 1 — Siapkan Google Sheet sebagai backend

**Langkah 1.** Buka [sheets.google.com](https://sheets.google.com) → buat spreadsheet baru.
Beri nama terserah, misalnya "Paririmbon MBG - Data".

**Langkah 2.** Di menu atas, klik **Extensions** → **Apps Script**.
Akan terbuka tab baru berisi editor kode kosong (`Code.gs`).

**Langkah 3.** Hapus semua isi default di editor itu. Buka file `apps-script/Code.gs` dari folder ini, salin semua isinya, tempel ke editor Apps Script.

**Langkah 4.** Di baris paling atas kode, cari:
```js
const SECRET = 'GANTI_DENGAN_KODE_RAHASIA';
```
Ganti `GANTI_DENGAN_KODE_RAHASIA` dengan kode rahasia bikinan sendiri, bebas, contoh: `mbg-kira-2026-xyz`. **Catat kode ini**, nanti dipakai lagi di frontend.

**Langkah 5.** Klik ikon **Save** (gambar disket) di toolbar editor.

**Langkah 6.** Klik tombol **Deploy** (kanan atas) → **New deployment**.
- Klik ikon gerigi di samping "Select type" → pilih **Web app**.
- Description: bebas, misal "Paririmbon API".
- Execute as: **Me**
- Who has access: **Anyone**
- Klik **Deploy**.

**Langkah 7.** Google akan minta izin akses (Authorize access). Ikuti saja, pilih akun Google kamu, klik **Advanced** → **Go to (nama project) (unsafe)** kalau muncul peringatan itu wajar untuk script buatan sendiri → **Allow**.

**Langkah 8.** Setelah deploy selesai, akan muncul **Web app URL** yang diakhiri `/exec`. Salin URL itu. Contoh bentuknya:
```
https://script.google.com/macros/s/AKfycb.../exec
```

✅ Sampai sini backend sudah jalan. Sheet akan otomatis membuat tab baru bernama `entries` saat data pertama kali disimpan.

---

## Bagian 2 — Sambungkan frontend ke backend

**Langkah 9.** Buka file `index.html` di folder ini pakai text editor.

**Langkah 10.** Cari bagian ini di dekat awal tag `<script>`:
```js
const CONFIG = {
  API_URL: 'GANTI_DENGAN_URL_WEB_APP_APPS_SCRIPT',
  API_KEY: 'GANTI_DENGAN_KODE_RAHASIA',
};
```
Ganti `API_URL` dengan URL dari Langkah 8, dan `API_KEY` dengan kode rahasia dari Langkah 4 (harus sama persis dengan `SECRET` di `Code.gs`).

**Langkah 11.** Simpan file. Coba buka `index.html` langsung di browser (double click) untuk tes lokal dulu — coba tambah satu catatan, refresh browser, catatan itu harus tetap ada dan juga muncul sebagai baris baru di tab `entries` pada Google Sheet kamu.

---

## Bagian 3 — Deploy ke Vercel

**Langkah 12.** Push folder ini (`index.html`, `apps-script/`, `README.md`) ke sebuah repo GitHub baru — sama seperti alur `caption-lab` kamu sebelumnya.

**Langkah 13.** Buka [vercel.com](https://vercel.com) → **Add New** → **Project** → pilih repo tadi → **Deploy**.
Tidak perlu setting Build Command atau Output Directory apa pun — ini situs statis murni, Vercel otomatis mengenali `index.html` di root.

**Langkah 14.** Setelah selesai deploy, buka URL Vercel yang diberikan, coba tambah catatan lagi — pastikan datanya juga masuk ke Google Sheet.

---

## Catatan penting

- **Jangan bagikan** URL Web App dan kode rahasia (`API_KEY`/`SECRET`) ke orang lain — siapa pun yang punya keduanya bisa menulis ke sheet kamu.
- Kalau nanti ingin ganti kode rahasia, ubah di **dua tempat**: `SECRET` di `Code.gs` (lalu **Deploy → Manage deployments → Edit → Deploy ulang**) dan `API_KEY` di `index.html`.
- Kolom di Google Sheet tab `entries`: `id, tanggal, pendapatan, pengeluaran, budgetBiasa, budgetWL, catatan`. Kolom `Spend Real` dan `Saldo Bersih` sengaja tidak disimpan — dihitung otomatis di aplikasi dari kolom-kolom itu, supaya sheet selalu jadi satu-satunya sumber data mentah.
- Kalau Apps Script diedit lagi setelah sudah pernah di-deploy, perubahan **tidak otomatis aktif** — harus buka **Deploy → Manage deployments → pensil (Edit)** → **Deploy** ulang.
