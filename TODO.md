# SERARAH FINANCE — Deployment ke Render

Kode sudah siap dan ter-deploy di GitHub (`cintalaura14/serarah-finance`).

Berikut yang sudah dilakukan:
- [x] `package.json` sudah benar (script `start` → `node server.js`, engine Node >=18)
- [x] `server.js` memakai `process.env.PORT || 3000` (sesuai kebutuhan Render)
- [x] Frontend memakai API same-origin (`window.location.origin`) — cocok untuk Render
- [x] Tambah `render.yaml` (blueprint konfigurasi Render)
- [x] `.gitignore` diperbarui (jangan commit kunci API, node_modules, log, data)
- [x] Semua perubahan di-commit dan di-push ke GitHub

# Langkah Manual di Dashboard Render (perlu browser)

1. Buka https://dashboard.render.com dan login (Google/GitHub).
2. Klik **New** → **Web Service**.
3. Hubungkan akun GitHub dan pilih repo `serarah-finance`.
4. Render mendeteksi blueprint (`render.yaml`) → klik **Apply Blueprint**.
5. Saat diminta, isi **Environment Variables / Secret Files**:
   - `GEMINI_API_KEY`  ← **WAJIB** (kunci Google Gemini Anda).
   - `OPENROUTER_API_KEY`  ← opsional (fallback bila kuota Gemini habis).
   - `OPENROUTER_MODEL`, `GEMINI_MODEL`  ← sudah punya nilai bawaan.
6. Klik **Deploy**. Tunggu build selesai.
7. Setelah "Live", salin URL seperti:
   - `https://serarah-finance.onrender.com`
8. Untuk mengunggah ulang setelah update:
   - Hubungkan ulang repo **atau** pastikan fitur **Auto-Deploy** aktif,
   - Lalu push perubahan ke GitHub → Render build otomatis.

# Cek hasil

- Buka endpoint cek kesehatan:
  `https://<url-render>/health`
  Harus mengembalikan JSON `{"ok":true,...}`.
- Buka root `/` → aplikasi dashboard tampil.

