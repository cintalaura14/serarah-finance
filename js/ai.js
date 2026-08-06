// =================== SERARAH FINANCE AI - FRONTEND ===================
// Modul AI untuk divisi sewa, bangun, dan jual.
// Mengirim dokumen (gambar/PDF) ke server proxy /api/ai/extract,
// lalu hasilnya otomatis mengisi form transaksi.

var SF = window.SF || {};

SF.AI_SERVER = SF.API_SERVER || (
  window.location.protocol.startsWith('http')
    ? `${window.location.protocol}//${window.location.host}`
    : 'http://localhost:3000'
);

SF.ai = {
  active: true,

  // Coba deteksi apakah server AI aktif
  async checkHealth() {
    try {
      const res = await fetch(SF.AI_SERVER + '/health', { method: 'GET' });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // Kirim file ke server dan dapatkan data terstruktur
  async extract(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(SF.AI_SERVER + '/api/ai/extract', {
      method: 'POST',
      body: fd
    });
    const json = await res.json();
    if (!json.ok) {
      throw new Error(json.message || 'Gagal memproses dokumen.');
    }
    return json.data;
  },

// Isi form transaksi dengan hasil AI
  fillForm(data) {
    // Kolom form yang benar-benar tampil di halaman divisi (lihat js/dashboard.js)
    const typeSel = document.getElementById('txType');
    const amountInp = document.getElementById('txAmount');
    const dateInp = document.getElementById('txDate');
    const descInp = document.getElementById('txDesc');

    if (!typeSel || !amountInp || !descInp) return;

    if (typeSel) typeSel.value = data.type && data.type === 'expense' ? 'expense' : 'income';
    if (amountInp && data.amount) amountInp.value = data.amount;
    if (descInp && data.description) descInp.value = data.description;
    if (dateInp && data.date) dateInp.value = data.date;

    // Beri tanda visual bahwa form terisi oleh AI
    if (amountInp) amountInp.style.borderColor = '#0f9d58';
    if (descInp) descInp.style.borderColor = '#0f9d58';
  }
};

// Handler untuk tombol "Analisis dengan AI"
SF.handleAIUpload = async function(divId) {
  const fileInp = document.getElementById('aiFile');
  const statusEl = document.getElementById('aiStatus');
  const btn = document.getElementById('aiBtn');

  if (!fileInp || !fileInp.files || fileInp.files.length === 0) {
    if (statusEl) statusEl.innerHTML = '<div class="alert alert-error">Pilih dokumen terlebih dahulu.</div>';
    return;
  }

  const file = fileInp.files[0];
  if (statusEl) statusEl.innerHTML = `<div class="alert">${SF.iconHtml ? SF.iconHtml('spark') : ''} Menganalisis dokumen dengan AI...</div>`;
  if (btn) btn.disabled = true;

  try {
    const data = await SF.ai.extract(file);
    SF.ai.fillForm(data);
    if (statusEl) {
      statusEl.innerHTML = `<div class="alert" style="background:#e6f6ec;color:#0f9d58;border:1px solid #b7e4c7;">
        ${SF.iconHtml ? SF.iconHtml('check') : ''} Berhasil! Form telah terisi otomatis. Periksa kembali sebelum mengirim.
      </div>`;
    }
  } catch (err) {
    if (statusEl) {
      statusEl.innerHTML = `<div class="alert alert-error">${SF.iconHtml ? SF.iconHtml('close') : ''} ${err.message}</div>`;
    }
  } finally {
    if (btn) btn.disabled = false;
  }
};

window.SF = SF;
