# TODO - SERARAH FINANCE

## Fitur Selesai
- [x] Rencana disetujui user
- [x] Buat index.html (login + home dashboard)
- [x] Buat css/style.css
- [x] Buat js/data.js (data & localStorage)
- [x] Buat js/auth.js (login/logout/session)
- [x] Buat js/exports.js (export PDF & Excel)
- [x] Buat js/app.js (inisialisasi & routing)
- [x] Dashboard Master dapat diakses & bisa Approve/Reject
- [x] Ringkasan per Divisi dapat difilter berdasarkan tanggal / keseluruhan
- [x] Tombol "Tandai semua dibaca" / "Tandai dibaca" berfungsi (re-render)

## Fitur AI (Gemini API) - Divisi Sewa, Jual, Bangun
- [x] Hapus semua referensi AI lama dari server.js
- [x] Implementasikan integrasi Gemini API di server.js
- [x] Update .env dengan GEMINI_API_KEY & GEMINI_MODEL
- [x] Update .env.example menjadi template konfigurasi Gemini
- [x] Update deskripsi package.json ke Gemini
- [x] Rewrite test-ai.js menjadi test Gemini API
- [x] Hapus referensi AI lama dari TODO.md
- [x] Hapus OCR (tesseract.js) & pdf-parse - kirim dokumen langsung ke Gemini (multimodal)
- [x] Jalankan server + verifikasi endpoint /api/ai/extract

## Fitur AI - OpenRouter (Fallback AI)
- [x] Tambah konfigurasi OpenRouter di .env & .env.example (OPENROUTER_API_KEY & OPENROUTER_MODEL)
- [x] Implementasikan fungsi askOpenRouter (format OpenAI-compatible, kirim gambar/PDF sebagai base64)
- [x] Implementasikan logika failover: coba Gemini -> jika kuota habis -> otomatis pakai OpenRouter
- [x] Update endpoint /health menampilkan status kedua penyedia AI
- [x] Update log server menampilkan konfigurasi Gemini + OpenRouter
