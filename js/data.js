// =================== SERARAH FINANCE - DATA & STORAGE ===================
// Mengelola data transaksi, notifikasi, dan localStorage.

var SF = window.SF || {};

// Definisi divisi
SF.DIVISIONS = [
  { id: 'master', name: 'Master', desc: 'Kontrol & Pengawasan Keuangan' },
  { id: 'sewa',   name: 'Persewaan',   desc: 'Divisi Persewaan' },
  { id: 'bangun', name: 'Pembangunan', desc: 'Divisi Pembangunan' },
  { id: 'jual',   name: 'Penjualan',   desc: 'Divisi Penjualan' }
];

// Akun login (4 akun)
SF.USERS = [
  { username: 'master', password: 'serarahfinance', role: 'master' },
  { username: 'sewa',   password: 'serarahfinance', role: 'sewa' },
  { username: 'bangun', password: 'serarahfinance', role: 'bangun' },
  { username: 'jual',   password: 'serarahfinance', role: 'jual' }
];

SF.roleName = function(role) {
  const d = SF.DIVISIONS.find(x => x.id === role);
  return d ? d.name : role;
};

// Status transaksi
SF.STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// ---------- Helpers ----------
SF.storage = {
  get(key, def) {
    try {
      const v = localStorage.getItem('serarah_' + key);
      return v ? JSON.parse(v) : def;
    } catch (e) { return def; }
  },
  set(key, val) {
    localStorage.setItem('serarah_' + key, JSON.stringify(val));
  }
};

SF.uid = function() {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
};

SF.API_SERVER = window.location.protocol.startsWith('http')
  ? `${window.location.protocol}//${window.location.host}`
  : 'http://localhost:3000';

SF.getApiServerCandidates = function() {
  const candidates = [];
  const push = (value) => {
    const normalized = String(value || '').trim().replace(/\/$/, '');
    if (normalized && !candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };

  try {
    push(window.SF_API_SERVER);
  } catch (e) {}

  try {
    push(localStorage.getItem('serarah_api_server'));
  } catch (e) {}

  try {
    const meta = document.querySelector('meta[name="serarah-api-server"]');
    push(meta && meta.content);
  } catch (e) {}

  push(SF.API_SERVER);
  push('http://localhost:3000');
  push('http://127.0.0.1:3000');

  return candidates;
};

SF.requestJson = async function(path, options = {}, label = 'API request') {
  const headers = options.headers || {};
  const opts = Object.assign({ method: 'GET', headers }, options);
  const candidates = SF.getApiServerCandidates();
  let lastError = null;

  for (const baseUrl of candidates) {
    let res;
    try {
      res = await fetch(`${baseUrl}${path}`, opts);
    } catch (err) {
      lastError = err;
      continue;
    }

    const text = await res.text();
    const trimmed = text.trim();

    if (!trimmed) {
      lastError = new Error(`${label} returned an empty response (${res.status}) from ${baseUrl}${path}.`);
      if (res.status === 404 || res.status === 405 || res.status === 500 || res.status === 502 || res.status === 503) {
        continue;
      }
      throw lastError;
    }

    let json;
    try {
      json = JSON.parse(trimmed);
    } catch (err) {
      lastError = new Error(`${label} returned non-JSON response (${res.status}) from ${baseUrl}${path}: ${trimmed.slice(0, 200)}`);
      if (res.status === 404 || res.status === 405 || res.status === 500 || res.status === 502 || res.status === 503) {
        continue;
      }
      throw lastError;
    }

    if (!res.ok) {
      throw new Error(json.message || `${label} failed (${res.status}).`);
    }

    return json;
  }

  throw lastError || new Error(`${label} failed.`);
};

SF.apiRequest = async function(path, options = {}) {
  try {
    return await SF.requestJson(path, options, `API ${path}`);
  } catch (err) {
    console.warn('[API]', path, err.message);
    return { ok: false, error: err };
  }
};

SF.readJsonResponse = async function(res, label = 'Response') {
  const text = await res.text();
  if (!text || !text.trim()) {
    throw new Error(`${label} returned an empty response (${res.status}).`);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`${label} returned non-JSON response (${res.status}): ${text.slice(0, 200)}`);
  }
};

SF.loadTransactions = async function() {
  const result = await SF.apiRequest('/api/transactions');
  if (result.ok && Array.isArray(result.transactions)) {
    SF.saveTransactions(result.transactions);
    return result.transactions;
  }
  return SF.getTransactions();
};

SF.loadNotifications = async function(division) {
  const result = await SF.apiRequest(`/api/notifications/${division}`);
  if (result.ok && Array.isArray(result.notifications)) {
    SF.saveNotifications(division, result.notifications);
    return result.notifications;
  }
  return SF.storage.get('notifications', {})[division] || [];
};

SF.realtime = {
  eventSource: null,
  reconnectTimer: null,
  reconnectDelay: 1000
};

SF.handleRealtimeEvent = async function(payload) {
  const user = SF.session.currentUser();
  if (!user) return;
  if (!payload) return;
  if (payload.type === 'transaction') {
    await SF.loadTransactions();
  }
  if (payload.type === 'notification' && payload.division) {
    await SF.loadNotifications(payload.division);
  }
  if (typeof SF.refreshCurrentView === 'function') {
    await SF.refreshCurrentView();
  }
};

SF.connectRealtime = function() {
  if (typeof window.EventSource === 'undefined' || SF.realtime.eventSource) return;
  const url = `${SF.API_SERVER}/api/events`;
  try {
    const es = new EventSource(url);
    SF.realtime.eventSource = es;

    es.addEventListener('connected', () => {
      if (SF.realtime.reconnectTimer) {
        clearTimeout(SF.realtime.reconnectTimer);
        SF.realtime.reconnectTimer = null;
      }
    });

    es.addEventListener('update', async (event) => {
      try {
        const payload = JSON.parse(event.data);
        await SF.handleRealtimeEvent(payload);
      } catch (err) {
        console.warn('[realtime]', err.message);
      }
    });

    es.onerror = function() {
      if (SF.realtime.reconnectTimer) return;
      SF.realtime.reconnectTimer = setTimeout(() => {
        SF.realtime.reconnectTimer = null;
        SF.realtime.eventSource = null;
        SF.connectRealtime();
      }, SF.realtime.reconnectDelay);
    };
  } catch (err) {
    console.warn('[realtime]', err.message);
  }
};

SF.uploadAttachment = async function(file) {
  if (!file) return { ok: false, message: 'Tidak ada file.' };
  try {
    const form = new FormData();
    form.append('file', file);
    const json = await SF.requestJson('/api/upload', {
      method: 'POST',
      body: form
    }, 'Upload attachment');
    return json;
  } catch (err) {
    console.warn('[API upload]', err.message);
    return { ok: false, error: err };
  }
};

SF.saveNotifications = function(division, list) {
  const all = SF.storage.get('notifications', {});
  all[division] = list;
  SF.storage.set('notifications', all);
};

SF.markNotificationLocal = function(division, notifId) {
  const all = SF.storage.get('notifications', {});
  if (all[division]) {
    all[division] = all[division].map(n => n.id === notifId ? { ...n, read: true } : n);
    SF.storage.set('notifications', all);
  }
};

SF.markAllNotificationsLocal = function(division) {
  const all = SF.storage.get('notifications', {});
  if (all[division]) {
    all[division] = all[division].map(n => ({ ...n, read: true }));
    SF.storage.set('notifications', all);
  }
};

SF.saveOrUpdateTransaction = function(tx) {
  const list = SF.getTransactions();
  const idx = list.findIndex(item => item.id === tx.id);
  if (idx >= 0) {
    list[idx] = tx;
  } else {
    list.push(tx);
  }
  SF.saveTransactions(list);
};

SF.saveTransactionRemote = async function(tx) {
  const result = await SF.apiRequest('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx)
  });
  if (result.ok && result.transaction) {
    SF.saveOrUpdateTransaction(result.transaction);
    return result.transaction;
  }
  return null;
};

SF.updateTransactionRemote = async function(txId, status, note) {
  const result = await SF.apiRequest(`/api/transactions/${txId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note })
  });
  if (result.ok && result.transaction) {
    SF.saveOrUpdateTransaction(result.transaction);
    return result.transaction;
  }
  return null;
};

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// ---------- Transaksi ----------
SF.getTransactions = function() {
  return SF.storage.get('transactions', []);
};

SF.saveTransactions = function(list) {
  SF.storage.set('transactions', list);
};

SF.addTransaction = function({ division, type, amount, description, date, attachmentName, attachmentUrl }) {
  const list = SF.getTransactions();
  const tx = {
    id: SF.uid(),
    division: division,
    type: type,           // 'income' | 'expense'
    amount: Number(amount),
    description: description,
    date: date || todayISO(),
    status: SF.STATUS.PENDING,
    createdAt: new Date().toISOString(),
    attachmentName: attachmentName || null,
    attachmentUrl: attachmentUrl || null,
    history: [
      { status: 'pending', at: new Date().toISOString(), note: 'Proposal dibuat.' }
    ]
  };
  list.push(tx);
  SF.saveTransactions(list);
  return tx;
};

SF.setStatus = function(txId, status) {
  const list = SF.getTransactions();
  const tx = list.find(t => t.id === txId);
  if (tx) {
    tx.status = status;
    tx.decidedAt = new Date().toISOString();
    SF.saveTransactions(list);
    // Kirim notifikasi ke divisi pemilik
    SF.notify(tx.division, {
      type: 'decision',
      status: status,
      txId: tx.id,
      amount: tx.amount,
      description: tx.description,
      decidedAt: tx.decidedAt
    });
  }
  return tx;
};

// ---------- Notifikasi ----------
SF.getNotifications = function(division) {
  const all = SF.storage.get('notifications', {});
  return all[division] || [];
};

SF.notify = function(division, notif) {
  const all = SF.storage.get('notifications', {});
  if (!all[division]) all[division] = [];
  all[division].unshift({ id: SF.uid(), read: false, ...notif });
  SF.storage.set('notifications', all);
};

SF.markNotifRead = function(division, notifId) {
  const all = SF.storage.get('notifications', {});
  if (all[division]) {
    all[division] = all[division].map(n => n.id === notifId ? { ...n, read: true } : n);
    SF.storage.set('notifications', all);
  }
  // Perbarui tampilan agar status "dibaca" segera terlihat
  if (typeof SF.renderDivision === 'function') SF.renderDivision(division);
};

SF.markAllRead = function(division) {
  const all = SF.storage.get('notifications', {});
  if (all[division]) {
    all[division] = all[division].map(n => ({ ...n, read: true }));
    SF.storage.set('notifications', all);
  }
  // Perbarui tampilan agar status "dibaca" segera terlihat
  if (typeof SF.renderDivision === 'function') SF.renderDivision(division);
};

// ---------- Ringkasan keuangan ----------
SF.computeSummary = function(txs) {
  let totalIn = 0, totalOut = 0, pendingIn = 0, pendingOut = 0;
  const approvedIn = 0, approvedOut = 0;
  txs.forEach(t => {
    const amount = Number(t.amount) || 0;
    const isIn = t.type === 'income';
    if (t.status === SF.STATUS.PENDING) {
      if (isIn) pendingIn += amount; else pendingOut += amount;
    } else if (t.status === SF.STATUS.APPROVED) {
      if (isIn) totalIn += amount; else totalOut += amount;
    }
  });
  return {
    totalIn, totalOut,
    net: totalIn - totalOut,
    pendingIn, pendingOut,
    approvedIn, approvedOut
  };
};

SF.formatMoney = function(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
};

SF.formatDate = function(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

SF.formatDateShort = function(iso) {
  if (!iso) return '-';
  return String(iso).slice(0, 10);
};

SF.amountOf = function(tx) {
  return (tx.type === 'income' ? '+' : '-') + SF.formatMoney(Number(tx.amount) || 0);
};

window.SF = SF;
