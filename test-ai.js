// Test cepat integrasi AI tanpa upload file OCR
// Mengirim teks langsung ke Gemini API.

require('dotenv').config();
const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

async function main() {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY belum diatur. Isi file .env terlebih dahulu.');
  }

  console.log('=== Test Gemini API ===');
  console.log('Model:', MODEL);

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text:
              'Kamu adalah asisten keuangan. Ekstrak informasi dari dokumen transaksi dan kembalikan HANYA JSON valid tanpa teks tambahan, dengan format: {"type":"income atau expense","amount":0,"description":"...","date":"YYYY-MM-DD"}. type income jika pemasukan, expense jika pengeluaran. amount angka tanpa simbol. date format YYYY-MM-DD.\n\n' +
              'Dokumen transaksi:\nKuitansi pembelian material bangunan sebesar Rp 1.500.000 tanggal 12 Maret 2024 untuk renovasi gudang.'
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 300
    }
  };

  console.log('\nMengirim prompt ke Gemini...');
  const timeoutMs = 5 * 60 * 1000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('Timeout setelah ' + (timeoutMs / 1000) + ' detik');
    throw e;
  }
  clearTimeout(timer);

  console.log('HTTP Status:', res.status);
  const body = await res.text();
  console.log('Respons mentah:\n', body.slice(0, 800));
}

main().catch(e => console.error('ERROR:', e.message));
