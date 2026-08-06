// =================== SERARAH FINANCE AI - SERVER PROXY ===================
// Server Node.js (Express) untuk:
//  1. Menerima upload dokumen (gambar / PDF) dari halaman divisi.
//  2. Mengirim dokumen langsung ke Gemini API (Google) untuk mendapatkan
//     struktur: { type, amount, description, date }.
//  3. Mengembalikan JSON ke frontend untuk mengisi form transaksi otomatis.
//
//  Gemini multimodal dapat membaca gambar & PDF secara langsung,
//  sehingga tidak lagi membutuhkan OCR (tesseract) atau pdf-parse.
//
//  API key / konfigurasi model disimpan di .env (tidak terekspos ke browser).

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const fsp = require('fs').promises;

const app = express();
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const server = HTTPS_KEY && HTTPS_CERT
    ? https.createServer({
      key: fs.readFileSync(HTTPS_KEY, 'utf-8'),
      cert: fs.readFileSync(HTTPS_CERT, 'utf-8')
    }, app).listen(PORT)
    : app.listen(PORT);

  const address = server.address();
  const port = address && typeof address === 'object' ? address.port : PORT;
  console.log(`SERARAH AI server running on port ${port}`);
  console.log('Gemini Model:', GEMINI_MODEL, '| configured:', !!GEMINI_API_KEY);
  console.log('OpenRouter Model:', OPENROUTER_MODEL, '| configured:', !!OPENROUTER_API_KEY, '| fallback aktif');
  return { server, port };
}
const SSE_CLIENTS = new Set();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DATA_DIR = path.join(__dirname, process.env.DATA_DIR || 'data');
const STORE_FILE = process.env.STORE_FILE ? path.join(DATA_DIR, process.env.STORE_FILE) : path.join(DATA_DIR, 'store.json');
const UPLOAD_DIR = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
const HTTPS_KEY = process.env.HTTPS_KEY || process.env.HTTPS_KEY_PATH || '';
const HTTPS_CERT = process.env.HTTPS_CERT || process.env.HTTPS_CERT_PATH || '';

function uid() {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

// ---------- Konfigurasi OpenRouter (fallback AI) ----------
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ---------- Middleware ----------
app.use(express.json());

// CORS sederhana agar frontend bisa memanggil API
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Sajikan file frontend statis dari direktori terbatas
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/uploads', express.static(UPLOAD_DIR));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Upload file disimpan di memori (ukuran maks 15MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

// ---------- Tipe dokumen yang didukung ----------
const SUPPORTED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'application/pdf'];

// ---------- Persistence lokal untuk demo backend ----------
async function ensureDataStore() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.mkdir(UPLOAD_DIR, { recursive: true });
  try {
    await fsp.access(STORE_FILE);
  } catch (e) {
    await fsp.writeFile(STORE_FILE, JSON.stringify({ transactions: [], notifications: {}, attachments: {} }, null, 2), 'utf-8');
  }
}

async function readStore() {
  await ensureDataStore();
  try {
    const raw = await fsp.readFile(STORE_FILE, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.warn('Store file unreadable or invalid JSON, resetting store.', err.message);
    const initial = { transactions: [], notifications: {}, attachments: {} };
    await fsp.writeFile(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

async function writeStore(data) {
  await ensureDataStore();
  await fsp.writeFile(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function addTransactionToStore(tx) {
  const store = await readStore();
  store.transactions.push(tx);
  await writeStore(store);
}

async function updateTransactionInStore(txId, update) {
  const store = await readStore();
  const tx = store.transactions.find(t => t.id === txId);
  if (!tx) return null;
  Object.assign(tx, update);
  await writeStore(store);
  return tx;
}

async function getTransactionsFromStore() {
  const store = await readStore();
  return store.transactions || [];
}

async function getNotificationsFromStore() {
  const store = await readStore();
  return store.notifications || {};
}

async function saveNotificationsToStore(notifications) {
  const store = await readStore();
  store.notifications = notifications;
  await writeStore(store);
}

async function addNotificationToStore(division, notif) {
  const store = await readStore();
  if (!store.notifications) store.notifications = {};
  if (!store.notifications[division]) store.notifications[division] = [];
  store.notifications[division].unshift(notif);
  await writeStore(store);
}

function saveUploadFile(file) {
  const filename = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const targetPath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(targetPath, file.buffer);
  return filename;
}

function broadcastSseEvent(eventName, payload) {
  const message = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of Array.from(SSE_CLIENTS)) {
    try {
      client.res.write(message);
    } catch (err) {
      client.res.end();
      SSE_CLIENTS.delete(client);
    }
  }
}

// Delay kecil untuk menunggu antar percobaan
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Coba ambil retryDelay (dalam detik) dari respons error Gemini (429)
function extractRetryDelay(txt) {
  try {
    const obj = JSON.parse(txt);
    const details = obj && obj.error && obj.error.details;
    if (Array.isArray(details)) {
      for (const d of details) {
        if (d && d['@type'] && d['@type'].includes('RetryInfo') && d.retryDelay) {
          const secs = parseFloat(d.retryDelay.replace('s', ''));
          if (!isNaN(secs)) return secs;
        }
      }
    }
  } catch (e) {}
  return null;
}

// ---------- Helper: minta Gemini (dengan retry untuk rate limit 429) ----------
async function askGemini(prompt, buffer, mimetype) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY belum diatur. Tambahkan di file .env.');
  }

  const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const parts = [
    {
      text:
        'Periksa dokumen transaksi yang dilampirkan. ' +
        'Kembalikan HANYA JSON valid tanpa teks tambahan, dengan format: ' +
        '{"type":"income atau expense","amount":0,"description":"...","date":"YYYY-MM-DD"}. ' +
        'type income jika pemasukan, expense jika pengeluaran. amount angka tanpa simbol. ' +
        'date dalam format YYYY-MM-DD. Jika suatu field tidak ditemukan, isi dengan null atau 0.\n\n' +
        (prompt ? 'Konteks tambahan:\n' + prompt : '')
    }
  ];

  // Lampirkan file langsung ke Gemini (multimodal)
  if (buffer && mimetype) {
    parts.push({
      inline_data: {
        mime_type: mimetype,
        data: buffer.toString('base64')
      }
    });
  } else {
    parts.push({ text: 'Dokumen transaksi:\n' + prompt });
  }

  const payload = {
    contents: [{ role: 'user', parts: parts }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2000
    }
  };

// Gemini API bisa lambat untuk response pertama. Beri timeout panjang (5 menit).
  const timeoutMs = 5 * 60 * 1000;
  const MAX_RETRIES = 5; // jumlah maksimal percobaan ulang saat rate limit

  let lastErr = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (e) {
      clearTimeout(timer);
      if (e.name === 'AbortError') {
        throw new Error('Gemini timeout setelah ' + (timeoutMs / 1000) + ' detik.');
      }
      throw e;
    }
    clearTimeout(timer);

    // Jika berhasil
    if (res.ok) {
      const data = await res.json();
      const content =
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text
          ? data.candidates[0].content.parts[0].text
          : '';
      return content;
    }

// Jika gagal: baca body error
    const txt = await res.text();
    lastErr = new Error('Gemini API error ' + res.status + ': ' + txt);

// Deteksi kuota HARIAN habis (tidak akan pulih dengan retry, jangan buang waktu)
    // Contoh metrik: GenerateRequestsPerDayPerProjectPerModel-FreeTier
    if (res.status === 429 && /PerDay|daily|Daily/i.test(txt)) {
      throw new Error('kuota anda sudah habis. coba lagi besok.');
    }

    // Hanya retry untuk rate limit sementara (429) dan error sementara (5xx)
    if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
      if (attempt < MAX_RETRIES) {
        // Gunakan retryDelay dari server jika tersedia, jika tidak pakai backoff eksponensial
        const serverDelay = extractRetryDelay(txt);
        const waitMs = serverDelay
          ? serverDelay * 1000
          : Math.min(15000, 2000 * Math.pow(2, attempt));
        console.log(`[Retry ${attempt + 1}/${MAX_RETRIES}] Rate limit/error ${res.status}. Menunggu ${waitMs / 1000}s...`);
        await sleep(waitMs);
        continue;
      }
    }

    // Jika bukan error yang bisa di-retry, langsung lempar
    throw lastErr;
  }

  throw lastErr;
}

// ---------- Helper: minta OpenRouter (fallback AI, format OpenAI-compatible) ----------
async function askOpenRouter(prompt, buffer, mimetype) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY belum diatur. Tambahkan di file .env.');
  }

  const systemPrompt =
    'Periksa dokumen transaksi yang dilampirkan. ' +
    'Kembalikan HANYA JSON valid tanpa teks tambahan, dengan format: ' +
    '{"type":"income atau expense","amount":0,"description":"...","date":"YYYY-MM-DD"}. ' +
    'type income jika pemasukan, expense jika pengeluaran. amount angka tanpa simbol. ' +
    'date dalam format YYYY-MM-DD. Jika suatu field tidak ditemukan, isi dengan null atau 0.';

  // Bangun pesan konten (support gambar via data URL)
  const userContent = [];
  if (buffer && mimetype) {
    const ext = mimetype === 'image/png' ? 'png'
      : mimetype === 'image/jpeg' ? 'jpeg'
      : mimetype === 'image/webp' ? 'webp'
      : mimetype === 'image/bmp' ? 'bmp'
      : mimetype === 'application/pdf' ? 'pdf' : 'png';
    const dataUrl = `data:${mimetype};base64,${buffer.toString('base64')}`;
    userContent.push({
      type: 'image_url',
      image_url: { url: dataUrl }
    });
  }
  userContent.push({
    type: 'text',
    text: prompt || 'Dokumen transaksi.'
  });

  const payload = {
    model: OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ],
    temperature: 0.1,
    max_tokens: 2000
  };

  const timeoutMs = 5 * 60 * 1000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
        'HTTP-Referer': process.env.PUBLIC_APP_URL || 'https://serarah-finance.pages.dev',
        'X-Title': 'SERARAH Finance AI'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      throw new Error('OpenRouter timeout setelah ' + (timeoutMs / 1000) + ' detik.');
    }
    throw e;
  }
  clearTimeout(timer);

  if (!res.ok) {
    const txt = await res.text();
    // Jika kuota OpenRouter habis (429), beri pesan jelas
    if (res.status === 429) {
      throw new Error('kuota OpenRouter anda sudah habis. coba lagi besok.');
    }
    throw new Error('OpenRouter API error ' + res.status + ': ' + txt);
  }

  const data = await res.json();
  const content =
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content
      ? data.choices[0].message.content
      : '';
  return content;
}

// ---------- Parse JSON dari respons model ----------
function parseAIResponse(content) {
  try {
    // Coba parse murni
    return JSON.parse(content);
  } catch (e) {
    // Coba ambil blok JSON dari teks
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (e2) {}
    }
  }
  return null;
}

// ---------- Helper: deteksi error kuota Gemini ----------
function isGeminiQuotaError(err) {
  return /kuota anda sudah habis/i.test(err.message) || /quota breached|quota/i.test(err.message);
}

// ---------- Route: health ----------
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'serarah-ai',
    gemini: { model: GEMINI_MODEL, configured: !!GEMINI_API_KEY },
    openrouter: { model: OPENROUTER_MODEL, configured: !!OPENROUTER_API_KEY }
  });
});

// ---------- Route: real-time events (SSE) ----------
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const client = { id: uid(), res };
  SSE_CLIENTS.add(client);
  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true, service: 'serarah-events', ts: new Date().toISOString() })}\n\n`);

  if (req.headers.accept?.includes('text/event-stream') && req.headers['sec-fetch-mode'] !== 'cors') {
    req.on('close', () => {
      SSE_CLIENTS.delete(client);
    });
    return;
  }

  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch (err) {
      clearInterval(heartbeat);
      SSE_CLIENTS.delete(client);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    SSE_CLIENTS.delete(client);
  });
  req.on('end', () => {
    clearInterval(heartbeat);
    SSE_CLIENTS.delete(client);
  });
});

// ---------- Route: ambil transaksi ----------
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await getTransactionsFromStore();
    res.json({ ok: true, transactions });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Gagal membaca data transaksi.' });
  }
});

// ---------- Route: tambah transaksi ----------
app.post('/api/transactions', async (req, res) => {
  try {
    const { division, type, amount, description, date, attachmentId, attachmentUrl, attachmentName } = req.body;
    const parsedAmount = Number(amount);
    if (!division || !type || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !description) {
      return res.status(400).json({ ok: false, message: 'Data transaksi tidak lengkap atau tidak valid.' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ ok: false, message: 'Tipe transaksi tidak valid.' });
    }
    const tx = {
      id: uid(),
      division,
      type,
      amount: parsedAmount,
      description,
      date: date || new Date().toISOString().slice(0, 10),
      status: 'pending',
      createdAt: new Date().toISOString(),
      attachmentId: attachmentId || null,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
      history: [
        { status: 'pending', at: new Date().toISOString(), note: 'Dibuat.' }
      ]
    };
    await addTransactionToStore(tx);
    broadcastSseEvent('update', { type: 'transaction', transaction: tx, division: tx.division });
    res.json({ ok: true, transaction: tx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Gagal menyimpan transaksi.' });
  }
});

app.get('/api/transactions/:id', async (req, res) => {
  try {
    const txs = await getTransactionsFromStore();
    const tx = txs.find(t => t.id === req.params.id);
    if (!tx) return res.status(404).json({ ok: false, message: 'Transaksi tidak ditemukan.' });
    res.json({ ok: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Gagal membaca transaksi.' });
  }
});

app.post('/api/transactions/:id/decision', express.json(), async (req, res) => {
  try {
    const txId = req.params.id;
    const { status, note } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ ok: false, message: 'Status tidak valid.' });
    }

    const txs = await getTransactionsFromStore();
    const existingTx = txs.find(t => t.id === txId);
    if (!existingTx) {
      return res.status(404).json({ ok: false, message: 'Transaksi tidak ditemukan.' });
    }

    const updatedHistory = (existingTx.history || []).concat([
      {
        status,
        at: new Date().toISOString(),
        note: note || (status === 'approved' ? 'Disetujui Master.' : 'Ditolak Master.')
      }
    ]);

    const tx = await updateTransactionInStore(txId, {
      status,
      decidedAt: new Date().toISOString(),
      history: updatedHistory
    });
    if (!tx) return res.status(404).json({ ok: false, message: 'Transaksi tidak ditemukan.' });
    const notification = {
      id: uid(),
      read: false,
      type: 'decision',
      status,
      txId: tx.id,
      amount: tx.amount,
      description: tx.description,
      decidedAt: tx.decidedAt
    };
    await addNotificationToStore(tx.division, notification);
    broadcastSseEvent('update', { type: 'notification', division: tx.division, notification });
    res.json({ ok: true, transaction: tx });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Gagal memperbarui status transaksi.' });
  }
});

app.get('/api/notifications/:division', async (req, res) => {
  try {
    const notifications = await getNotificationsFromStore();
    res.json({ ok: true, notifications: notifications[req.params.division] || [] });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Gagal membaca notifikasi.' });
  }
});

app.post('/api/notifications/:division/read', express.json(), async (req, res) => {
  try {
    const division = req.params.division;
    const { notifId } = req.body;
    const notifications = await getNotificationsFromStore();
    if (!notifications[division]) notifications[division] = [];
    notifications[division] = notifications[division].map(n => n.id === notifId ? { ...n, read: true } : n);
    await saveNotificationsToStore(notifications);
    broadcastSseEvent('update', { type: 'notification', division, notification: { id: notifId, read: true } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Gagal menandai notifikasi.' });
  }
});

app.post('/api/notifications/:division/read-all', express.json(), async (req, res) => {
  try {
    const division = req.params.division;
    const notifications = await getNotificationsFromStore();
    if (!notifications[division]) notifications[division] = [];
    notifications[division] = notifications[division].map(n => ({ ...n, read: true }));
    await saveNotificationsToStore(notifications);
    broadcastSseEvent('update', { type: 'notification', division, notification: { read: true } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Gagal menandai semua notifikasi.' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: 'Tidak ada file yang diupload.' });
    const filename = saveUploadFile(req.file);
    res.json({ ok: true, filename, url: `/uploads/${filename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Gagal menyimpan lampiran.' });
  }
});

app.use('/uploads', express.static(UPLOAD_DIR));

// ---------- Route: ekstraksi AI ----------
app.post('/api/ai/extract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'Tidak ada file yang di-upload.' });
    }

    const mimetype = req.file.mimetype;
    if (!SUPPORTED_MIME.includes(mimetype)) {
      return res.status(400).json({
        ok: false,
        message: 'Format dokumen tidak didukung. Gunakan gambar (png/jpg/jpeg/webp/bmp) atau PDF.'
      });
    }

    let provider = 'gemini';
    let content;
    if (GEMINI_API_KEY) {
      try {
        content = await askGemini('', req.file.buffer, mimetype);
      } catch (geminiErr) {
        if (isGeminiQuotaError(geminiErr) && OPENROUTER_API_KEY) {
          console.log('[Failover] Kuota Gemini habis, menggunakan OpenRouter...');
          provider = 'openrouter';
          content = await askOpenRouter('', req.file.buffer, mimetype);
        } else {
          throw geminiErr;
        }
      }
    } else if (OPENROUTER_API_KEY) {
      provider = 'openrouter';
      content = await askOpenRouter('', req.file.buffer, mimetype);
    } else {
      return res.status(503).json({ ok: false, message: 'GEMINI_API_KEY atau OPENROUTER_API_KEY belum diatur. Tambahkan di file .env.' });
    }

    const parsed = parseAIResponse(content);
    if (!parsed) {
      return res.status(422).json({ ok: false, message: 'AI tidak dapat memproses dokumen. Berikan dokumen yang lebih jelas.', raw: content });
    }

    const type = String(parsed.type || '').toLowerCase().includes('expense') || String(parsed.type || '').toLowerCase().includes('pengeluaran')
      ? 'expense' : 'income';
    const amount = Number(parsed.amount) || 0;
    const description = String(parsed.description || '');
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(parsed.date || '')) ? String(parsed.date) : null;

    res.json({ ok: true, provider, data: { type, amount, description, date } });
  } catch (err) {
    console.error('AI extract error:', err);
    const isRateLimit = /429/i.test(err.message) || /quota/i.test(err.message) || /kuota/i.test(err.message) || /RESOURCE_EXHAUSTED/i.test(err.message);
    if (isRateLimit) {
      return res.status(429).json({ ok: false, message: err.message, detail: err.message });
    }
    res.status(500).json({ ok: false, message: 'Terjadi kesalahan pada server AI: ' + err.message });
  }
});

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Gagal menjalankan server:', err);
    process.exit(1);
  });
}

app.startServer = startServer;

module.exports = app;
module.exports.startServer = startServer;

