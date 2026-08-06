const SUPPORTED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'application/pdf'];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function stripTrailingSlash(value) {
  return String(value || '').trim().replace(/\/$/, '');
}

function toBase64(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function extractRetryDelay(txt) {
  try {
    const obj = JSON.parse(txt);
    const details = obj && obj.error && obj.error.details;
    if (Array.isArray(details)) {
      for (const d of details) {
        if (d && d['@type'] && String(d['@type']).includes('RetryInfo') && d.retryDelay) {
          const secs = parseFloat(String(d.retryDelay).replace('s', ''));
          if (!Number.isNaN(secs)) return secs;
        }
      }
    }
  } catch (e) {}
  return null;
}

async function askGemini(env, prompt, base64, mimetype) {
  const apiKey = env.GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY belum diatur di Cloudflare Pages environment variables.');

  const model = env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

  if (base64 && mimetype) {
    parts.push({
      inline_data: {
        mime_type: mimetype,
        data: base64
      }
    });
  } else {
    parts.push({ text: 'Dokumen transaksi:\n' + (prompt || '') });
  }

  const payload = {
    contents: [{ role: 'user', parts }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 2000 }
  };

  const timeoutMs = 5 * 60 * 1000;
  const maxRetries = 5;

  let lastErr = null;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (e) {
      clearTimeout(timer);
      if (e && e.name === 'AbortError') {
        throw new Error('Gemini timeout setelah ' + timeoutMs / 1000 + ' detik.');
      }
      throw e;
    }
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    const txt = await res.text();
    lastErr = new Error('Gemini API error ' + res.status + ': ' + txt);

    if (res.status === 429 && /PerDay|daily|Daily/i.test(txt)) {
      throw new Error('kuota anda sudah habis. coba lagi besok.');
    }

    if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
      if (attempt < maxRetries) {
        const serverDelay = extractRetryDelay(txt);
        const waitMs = serverDelay ? serverDelay * 1000 : Math.min(15000, 2000 * Math.pow(2, attempt));
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
    }

    throw lastErr;
  }

  throw lastErr || new Error('Gemini API request gagal.');
}

async function askOpenRouter(env, prompt, base64, mimetype) {
  const apiKey = env.OPENROUTER_API_KEY || '';
  if (!apiKey) throw new Error('OPENROUTER_API_KEY belum diatur di Cloudflare Pages environment variables.');

  const model = env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const userContent = [];

  if (base64 && mimetype) {
    const dataUrl = `data:${mimetype};base64,${base64}`;
    userContent.push({ type: 'image_url', image_url: { url: dataUrl } });
  }
  userContent.push({ type: 'text', text: prompt || 'Dokumen transaksi.' });

  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'Periksa dokumen transaksi yang dilampirkan. ' +
          'Kembalikan HANYA JSON valid tanpa teks tambahan, dengan format: ' +
          '{"type":"income atau expense","amount":0,"description":"...","date":"YYYY-MM-DD"}. ' +
          'type income jika pemasukan, expense jika pengeluaran. amount angka tanpa simbol. ' +
          'date dalam format YYYY-MM-DD. Jika suatu field tidak ditemukan, isi dengan null atau 0.'
      },
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
    res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + apiKey,
        'http-referer': stripTrailingSlash(env.PUBLIC_APP_URL || 'https://serarah-finance.pages.dev'),
        'x-title': 'SERARAH Finance AI'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (e) {
    clearTimeout(timer);
    if (e && e.name === 'AbortError') {
      throw new Error('OpenRouter timeout setelah ' + timeoutMs / 1000 + ' detik.');
    }
    throw e;
  }
  clearTimeout(timer);

  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 429) throw new Error('kuota OpenRouter anda sudah habis. coba lagi besok.');
    throw new Error('OpenRouter API error ' + res.status + ': ' + txt);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

function parseAIResponse(content) {
  try {
    return JSON.parse(content);
  } catch (e) {
    const match = String(content || '').match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {}
    }
  }
  return null;
}

function isGeminiQuotaError(err) {
  const msg = String(err && err.message ? err.message : err || '');
  return /kuota anda sudah habis|quota breached|quota/i.test(msg);
}

export async function onRequestPost(context) {
  const env = context.env || {};

  try {
    const form = await context.request.formData();
    const file = form.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return json({ ok: false, message: 'Tidak ada file yang di-upload.' }, 400);
    }

    const mimetype = file.type || 'application/octet-stream';
    if (!SUPPORTED_MIME.includes(mimetype)) {
      return json({
        ok: false,
        message: 'Format dokumen tidak didukung. Gunakan gambar (png/jpg/jpeg/webp/bmp) atau PDF.'
      }, 400);
    }

    const buffer = await file.arrayBuffer();
    const base64 = toBase64(buffer);

    let provider = 'gemini';
    let content;
    if (env.GEMINI_API_KEY) {
      try {
        content = await askGemini(env, '', base64, mimetype);
      } catch (geminiErr) {
        if (isGeminiQuotaError(geminiErr) && env.OPENROUTER_API_KEY) {
          provider = 'openrouter';
          content = await askOpenRouter(env, '', base64, mimetype);
        } else {
          throw geminiErr;
        }
      }
    } else if (env.OPENROUTER_API_KEY) {
      provider = 'openrouter';
      content = await askOpenRouter(env, '', base64, mimetype);
    } else {
      return json({ ok: false, message: 'GEMINI_API_KEY atau OPENROUTER_API_KEY belum diatur di Cloudflare Pages environment variables.' }, 503);
    }

    const parsed = parseAIResponse(content);
    if (!parsed) {
      return json({ ok: false, message: 'AI tidak dapat memproses dokumen. Berikan dokumen yang lebih jelas.', raw: content }, 422);
    }

    const type = String(parsed.type || '').toLowerCase().includes('expense') || String(parsed.type || '').toLowerCase().includes('pengeluaran')
      ? 'expense'
      : 'income';
    const amount = Number(parsed.amount) || 0;
    const description = String(parsed.description || '');
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(parsed.date || '')) ? String(parsed.date) : null;

    return json({ ok: true, provider, data: { type, amount, description, date } });
  } catch (err) {
    const message = String(err && err.message ? err.message : err || 'Terjadi kesalahan pada server AI.');
    const isRateLimit = /429|quota|kuota|RESOURCE_EXHAUSTED/i.test(message);
    if (isRateLimit) {
      return json({ ok: false, message, detail: message }, 429);
    }
    return json({ ok: false, message: 'Terjadi kesalahan pada server AI: ' + message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type'
    }
  });
}
