// =================== SERARAH FINANCE - DASHBOARD RENDERING ===================
// Menampilkan home dashboard, login, dan halaman tiap divisi.

var SF = window.SF || {};

SF.app = document.getElementById('app');
SF.divSystem = {};

SF.icons = {
  user: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg sm" aria-hidden="true"><path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5Z" stroke="currentColor" stroke-width="1.8"/><path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6.5 10.5V20h11v-9.5" stroke="currentColor" stroke-width="1.8"/></svg>',
  rent: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg" aria-hidden="true"><path d="M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6 19v-8l6-5 6 5v8" stroke="currentColor" stroke-width="1.8"/><path d="M10 19v-4h4v4" stroke="currentColor" stroke-width="1.8"/></svg>',
  build: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg" aria-hidden="true"><path d="M3 20h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="m5 16 7-12 7 12" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  sales: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg" aria-hidden="true"><path d="M4 7h16" stroke="currentColor" stroke-width="1.8"/><path d="M6 7h12l-1 13H7L6 7Z" stroke="currentColor" stroke-width="1.8"/><path d="M9.5 10.5a2.5 2.5 0 0 0 5 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  master: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg" aria-hidden="true"><path d="M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 9h16L12 4 4 9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 9v10M12 9v10M17 9v10" stroke="currentColor" stroke-width="1.8"/></svg>',
  ai: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg sm" aria-hidden="true"><path d="M9 3v3M15 3v3M4.5 8.5h15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="4" y="7" width="16" height="12" rx="3" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/><path d="M9 16h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg sm" aria-hidden="true"><path d="M7 3h7l4 4v14H7z" stroke="currentColor" stroke-width="1.8"/><path d="M14 3v4h4" stroke="currentColor" stroke-width="1.8"/><path d="M10 12h5M10 16h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg sm" aria-hidden="true"><path d="M6 10a6 6 0 0 1 12 0v5l2 2H4l2-2v-5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg sm" aria-hidden="true"><path d="M4 20h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M7 16v-4M12 16V8M17 16v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  excel: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg sm" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 13h8M8 17h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg sm" aria-hidden="true"><path d="M7 3h7l4 4v14H7z" stroke="currentColor" stroke-width="1.8"/><path d="M14 3v4h4" stroke="currentColor" stroke-width="1.8"/><path d="M9 15h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg sm" aria-hidden="true"><path d="m5 13 4 4L19 7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg sm" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg sm" aria-hidden="true"><path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" class="icon-svg sm" aria-hidden="true"><path d="m14 6-6 6 6 6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 12H8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>'
};

SF.iconHtml = function(name, heading) {
  const ico = SF.icons[name] || SF.icons.spark;
  if (heading) return `<span class="heading-icon">${ico}</span>`;
  return ico;
};

// ---------- Layout helpers ----------
SF.topbar = function(user) {
  return `
    <div class="app-topbar">
      <div class="brand">SERARAH <span>FINANCE</span></div>
      <div class="topbar-right">
        <button class="btn btn-sm btn-ghost" onclick="SF.configureApiServer()">Set API</button>
        <span class="user-chip">${SF.iconHtml('user')} ${SF.roleName(user.role)} (${user.username})</span>
        <button class="btn btn-sm btn-ghost" onclick="SF.logout()">Keluar</button>
      </div>
    </div>`;
};

SF.breadcrumb = function(label) {
  return `
    <div class="flex" style="margin-bottom:16px;">
      <a class="btn btn-ghost btn-sm" href="#home">${SF.iconHtml('arrowLeft')} Home</a>
      <span style="font-weight:600;">${label}</span>
    </div>`;
};

// ---------- LOGIN ----------
SF.renderLogin = function() {
  SF.app.innerHTML = `
    <div class="login-page">
      <div class="login-hero">
        <div class="robot-visual robot-left">
          <div class="robot-smoke">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="robot-figure robot-figure-left">
            <svg viewBox="0 0 320 360" aria-hidden="true">
              <defs>
                <linearGradient id="metalShineA" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#1a4969" />
                  <stop offset="100%" stop-color="#4db9ff" />
                </linearGradient>
                <linearGradient id="visorGlowA" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#e9f8ff" />
                  <stop offset="100%" stop-color="#56b8ff" />
                </linearGradient>
                <radialGradient id="lensGlowA" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
                  <stop offset="100%" stop-color="#0a2e51" stop-opacity="0.1" />
                </radialGradient>
                <linearGradient id="metalEdgeA" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#b1d7ff" />
                  <stop offset="100%" stop-color="#1c4b72" />
                </linearGradient>
                <linearGradient id="corePulseA" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#c7f0ff" />
                  <stop offset="100%" stop-color="#3e9bff" />
                </linearGradient>
                <filter id="glowA" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g class="robot-head robot-head-left">
                <g class="robot-antenna">
                  <path d="M154 20 Q160 10 166 20" stroke="#3f74a3" stroke-width="4" fill="none" />
                  <circle cx="160" cy="16" r="4" fill="#e7f8ff" />
                  <path d="M160 24 V42" stroke="#3f74a3" stroke-width="3" stroke-linecap="round" />
                  <path class="robot-antenna-spark" d="M156 8 L162 12 L158 14 L164 18 L156 20" fill="none" stroke="#fff8a3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path class="robot-antenna-flash" d="M159 28 L161 32" stroke="#c8f4ff" stroke-width="2" stroke-linecap="round" />
                  <path class="robot-antenna-flash" d="M159 36 L161 40" stroke="#c8f4ff" stroke-width="2" stroke-linecap="round" opacity="0.55" />
                </g>
                <path d="M84 78 Q140 26 236 78 L246 160 Q236 210 196 224 H124 Q84 210 74 160 Z" fill="url(#metalShineA)" />
                <path d="M94 98 Q140 64 226 98 L226 144 Q214 170 190 180 H130 Q106 170 94 144 Z" fill="url(#visorGlowA)" opacity="0.97" filter="url(#glowA)" class="robot-visor-glow" />
                <path d="M96 118 C108 110 132 106 160 108 C188 110 212 118 224 138 L226 156 C210 148 186 142 160 142 C134 142 110 148 96 160 Z" fill="#e7f8ff" opacity="0.16" />
                <ellipse cx="118" cy="118" rx="18" ry="20" fill="url(#lensGlowA)" class="robot-eye robot-eye-left" />
                <ellipse cx="202" cy="118" rx="18" ry="20" fill="url(#lensGlowA)" class="robot-eye robot-eye-right" />
                <circle cx="118" cy="118" r="6" fill="#071f36" />
                <circle cx="202" cy="118" r="6" fill="#071f36" />
                <g class="robot-headset">
                  <path d="M64 116 a16 18 0 0 1 16 -18 h8 v36 h-8 a16 18 0 0 1 -16 -18z" fill="#17314f" />
                  <path d="M246 116 a16 18 0 0 0 -16 -18 h-8 v36 h8 a16 18 0 0 0 16 -18z" fill="#17314f" />
                  <path d="M82 88 C110 72 178 72 206 88" stroke="#3f74a3" stroke-width="10" fill="none" stroke-linecap="round" />
                </g>
                <g class="robot-music-notes" fill="#e7f8ff" opacity="0.88">
                  <path d="M48 68 v-16 h6 v16z" />
                  <circle cx="54" cy="68" r="3" />
                  <path d="M62 62 v-12 h6 v12z" />
                  <circle cx="68" cy="62" r="2.5" />
                  <path d="M76 60 c4 -3 10 -3 10 1 v14" stroke="#e7f8ff" stroke-width="3" fill="none" stroke-linecap="round" />
                </g>
                <g class="robot-mouth">
                  <path d="M128 150 C137 146 183 146 192 150 C183 157 137 157 128 150 Z" fill="rgba(7,31,54,0.95)" />
                </g>
              </g>
              <g class="robot-neck">
                <rect x="132" y="218" width="56" height="14" rx="7" fill="#17314f" />
                <rect x="128" y="236" width="64" height="10" rx="5" fill="#74c8ff" opacity="0.42" />
              </g>
              <path d="M68 228 C62 262 74 300 96 312 H224 C246 300 258 262 252 228 Z" fill="#0b2f51" />
              <path d="M92 254 H228" stroke="#88d3ff" stroke-width="5" opacity="0.52" />
              <rect x="102" y="268" width="116" height="72" rx="30" fill="rgba(255,255,255,0.08)" />
              <circle cx="160" cy="302" r="26" fill="url(#corePulseA)" opacity="0.98" class="robot-core" />
              <circle cx="160" cy="302" r="12" fill="#ffffff" opacity="0.9" />
              <path d="M112 286 L116 282 L144 299 L176 274 L184 282 L148 311 Z" fill="#b4e8ff" opacity="0.78" />
              <g class="robot-scan-left">
                <rect x="80" y="252" width="42" height="6" rx="3" fill="#75d3ff" opacity="0.88" />
                <rect x="198" y="252" width="42" height="6" rx="3" fill="#75d3ff" opacity="0.88" />
              </g>
              <path d="M70 282 C96 316 224 316 250 282" stroke="rgba(255,255,255,0.14)" stroke-width="4" fill="none" />
              <path d="M104 88 C118 72 146 64 170 72" stroke="#ffffff" stroke-width="2" opacity="0.35" />
              <path d="M212 98 C198 88 170 80 148 88" stroke="#ffffff" stroke-width="2" opacity="0.25" />
            </svg>
          </div>
          <div class="robot-particles">
            <span style="--x:18%; --y:12%; --size:6px; --delay:-0.3s;"></span>
            <span style="--x:34%; --y:6%; --size:4px; --delay:0.5s;"></span>
            <span style="--x:72%; --y:18%; --size:5px; --delay:0.9s;"></span>
            <span style="--x:88%; --y:40%; --size:3px; --delay:-0.6s;"></span>
            <span style="--x:44%; --y:82%; --size:4px; --delay:0.2s;"></span>
            <span style="--x:14%; --y:76%; --size:5px; --delay:-0.8s;"></span>
          </div>
        </div>

        <div class="login-card login-card--wide">
          <div class="login-logo">
            <div class="brand">SERARAH <span>FINANCE</span></div>
            <p>Silakan masuk ke dashboard divisi Anda</p>
          </div>
          <div id="loginAlert"></div>
          <form onsubmit="SF.handleLogin(event)">
            <div class="form-group">
              <label>Username</label>
              <input type="text" id="loginUser" placeholder="Username" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="loginPass" placeholder="Password" required>
            </div>
            <button type="submit" class="btn btn-primary">Masuk</button>
          </form>
        </div>

        <div class="robot-visual robot-right">
          <div class="robot-smoke">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="robot-figure robot-figure-right">
            <svg viewBox="0 0 320 360" aria-hidden="true">
              <defs>
                <linearGradient id="metalShineB" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#c38f2c" />
                  <stop offset="100%" stop-color="#ffd96a" />
                </linearGradient>
                <linearGradient id="visorGlowB" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#fff6d8" />
                  <stop offset="100%" stop-color="#ffd560" />
                </linearGradient>
                <radialGradient id="lensGlowB" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
                  <stop offset="100%" stop-color="#b78615" stop-opacity="0.18" />
                </radialGradient>
                <linearGradient id="screenGlowB" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#fff7b5" />
                  <stop offset="100%" stop-color="#ffd56b" />
                </linearGradient>
                <filter id="glowB" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g class="robot-head robot-head-right">
                <g class="robot-antenna">
                  <path d="M140 14 Q146 8 152 14" stroke="#d4a748" stroke-width="4" fill="none" />
                  <circle cx="146" cy="10" r="4" fill="#fff7b5" />
                  <path d="M146 22 V38" stroke="#d4a748" stroke-width="3" stroke-linecap="round" />
                  <path class="robot-antenna-spark" d="M142 6 L148 10 L144 12 L150 16 L142 18" fill="none" stroke="#fff7a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path class="robot-antenna-flash" d="M147 26 L149 30" stroke="#fffacd" stroke-width="2" stroke-linecap="round" />
                  <path class="robot-antenna-flash" d="M147 34 L149 38" stroke="#fffacd" stroke-width="2" stroke-linecap="round" opacity="0.55" />
                </g>
                <path d="M78 76 Q140 14 242 76 L248 150 Q242 202 194 220 H126 Q78 202 72 150 Z" fill="url(#metalShineB)" />
                <path d="M88 94 Q140 56 232 94 L232 134 Q220 160 192 168 H128 Q106 160 88 134 Z" fill="url(#visorGlowB)" opacity="0.95" filter="url(#glowB)" class="robot-visor-glow" />
                <ellipse cx="114" cy="116" rx="18" ry="20" fill="url(#lensGlowB)" class="robot-eye robot-eye-left" />
                <ellipse cx="206" cy="116" rx="18" ry="20" fill="url(#lensGlowB)" class="robot-eye robot-eye-right" />
                <circle cx="114" cy="116" r="6" fill="#624008" />
                <circle cx="206" cy="116" r="6" fill="#624008" />
                <g class="robot-mouth">
                  <path d="M118 140 C128 136 172 136 182 140 C172 147 128 147 118 140 Z" fill="rgba(54,36,4,0.95)" />
                </g>
                <path d="M96 120 C110 108 116 96 132 96 C148 96 154 108 168 120" stroke="#fff9d8" stroke-width="2" opacity="0.35" fill="none" />
                <path d="M84 166 H236" stroke="#fff7c8" stroke-width="4" opacity="0.4" />
                <g class="robot-coffee">
                  <path d="M206 190 h28 a8 8 0 0 1 8 8 v16 a8 8 0 0 1 -8 8 h-28 a8 8 0 0 1 -8 -8 v-16 a8 8 0 0 1 8 -8 z" fill="#fff7df" stroke="#c49d5d" stroke-width="2" />
                  <path d="M214 186 c0 -6 6 -10 12 -10 s12 4 12 10" fill="none" stroke="#fff3c8" stroke-width="2" stroke-linecap="round" />
                  <path d="M234 190 a6 6 0 0 1 0 12" fill="none" stroke="#c49d5d" stroke-width="2" />
                </g>
              </g>
              <rect x="70" y="200" width="180" height="132" rx="36" fill="#4c3b10" />
              <path d="M94 236 H226" stroke="#fff3b2" stroke-width="4" opacity="0.55" />
              <rect x="102" y="258" width="116" height="72" rx="30" fill="rgba(255,255,255,0.08)" />
              <rect x="116" y="270" width="88" height="36" rx="16" fill="url(#screenGlowB)" opacity="0.96" class="robot-screen-right" />
              <path d="M124 284 H196" stroke="#fff8d2" stroke-width="3" opacity="0.88" />
              <path d="M124 292 H178" stroke="#ffe7a8" stroke-width="3" opacity="0.78" />
              <path d="M116 282 C122 264 176 264 184 282" stroke="#fff3cc" stroke-width="3" opacity="0.45" fill="none" />
              <g class="robot-screen-right">
                <rect x="122" y="308" width="76" height="10" rx="5" fill="#fff5c6" opacity="0.9" />
                <rect x="122" y="322" width="48" height="6" rx="3" fill="#fff5c6" opacity="0.9" />
              </g>
              <path d="M68 282 C92 318 228 318 252 282" stroke="rgba(255,255,255,0.16)" stroke-width="4" fill="none" />
              <path d="M100 80 C118 52 202 52 220 80" stroke="#fff5c8" stroke-width="3" opacity="0.2" fill="none" />
            </svg>
          </div>
          <div class="robot-particles">
            <span style="--x:18%; --y:12%; --size:6px; --delay:-0.3s;"></span>
            <span style="--x:34%; --y:6%; --size:4px; --delay:0.5s;"></span>
            <span style="--x:72%; --y:18%; --size:5px; --delay:0.9s;"></span>
            <span style="--x:88%; --y:40%; --size:3px; --delay:-0.6s;"></span>
            <span style="--x:44%; --y:82%; --size:4px; --delay:0.2s;"></span>
            <span style="--x:14%; --y:76%; --size:5px; --delay:-0.8s;"></span>
          </div>
        </div>
      </div>
    </div>`;
};
SF.handleLogin = function(e) {
  e.preventDefault();
  const u = document.getElementById('loginUser').value;
  const p = document.getElementById('loginPass').value;
  const res = SF.login(u, p);
  if (res.ok) {
    location.hash = '#home';
  } else {
    document.getElementById('loginAlert').innerHTML =
      `<div class="alert alert-error">${res.message}</div>`;
  }
};

// ---------- HOME DASHBOARD ----------
SF.renderHome = function(user) {
  // Master melihat semua ringkasan di home
  let summary = null;
  if (user.role === 'master') {
    summary = SF.computeSummaryAll();
  }
  const cards = SF.DIVISIONS.filter(d => d.id !== 'master').map(d => {
    const isMine = d.id === user.role;
    return `
      <a class="role-card ${d.id === 'bangun' ? '' : ''}" href="#divisi/${d.id}">
        <div class="icon">${SF.iconFor(d.id)}</div>
        <h3>${d.name}</h3>
        <p>${isMine ? d.desc + ' (Dashboard Anda)' : d.desc}</p>
      </a>`;
  }).join('');

let masterCards = '';
  if (user.role === 'master') {
    masterCards = `
      <div class="cards-section">
        <h2>Ringkasan Keuangan Perusahaan</h2>
        <div class="stat-grid">
          <div class="stat-card income"><div class="label">Total Pemasukan Disetujui</div><div class="value">${SF.formatMoney(summary.totalIn)}</div></div>
          <div class="stat-card expense"><div class="label">Total Pengeluaran Disetujui</div><div class="value">${SF.formatMoney(summary.totalOut)}</div></div>
          <div class="stat-card net"><div class="label">Total Uang Bersih Perusahaan</div><div class="value">${SF.formatMoney(summary.net)}</div></div>
        </div>
      </div>
      <a class="role-card master-home-card" href="#divisi/master">
        <div class="icon">${SF.iconFor('master')}</div>
        <h3>Dashboard Master</h3>
        <p>Kelola & persetujuan seluruh proposal transaksi (Approve / Reject)</p>
      </a>`;
  }

  SF.app.innerHTML = `
    ${SF.topbar(user)}
    <div class="container">
      <div class="home-hero">
        <h1>Selamat datang di SERARAH FINANCE</h1>
        <p>Pilih divisi untuk mengakses dashboard Anda. ${user.role === 'master' ? 'Anda login sebagai Master dengan akses penuh.' : 'Anda hanya dapat mengakses divisi Anda sendiri.'}</p>
        <p style="margin-top:10px;font-size:13px;opacity:.8;">Backend API aktif: ${SF.getStoredApiServer() || SF.API_SERVER || 'otomatis'}</p>
      </div>
      ${masterCards}
      <div class="cards-section">
        <h2>Divisi Keuangan</h2>
        <div class="grid-cards">${cards}</div>
      </div>
    </div>`;
};

SF.iconFor = function(role) {
  const map = {
    master: SF.iconHtml('master'),
    sewa: SF.iconHtml('rent'),
    bangun: SF.iconHtml('build'),
    jual: SF.iconHtml('sales')
  };
  return map[role] || SF.iconHtml('chart');
};

SF.computeSummaryAll = function() {
  const txs = SF.getTransactions();
  return SF.computeSummary(txs);
};

// ---------- DIVISION PAGES ----------
SF.renderDivision = function(role) {
  const user = SF.session.currentUser();
  const divId = role;
  const div = SF.DIVISIONS.find(d => d.id === divId);

  if (!div) {
    location.hash = '#home';
    return;
  }

  if (divId === 'master') {
    SF.renderMasterDashboard();
    return;
  }

  // Divisi non-master: form + transaksi + notifikasi
  const txs = SF.getTransactions().filter(t => t.division === divId);
  const summary = SF.computeSummary(txs);
  const notifs = SF.getNotifications(divId);

  SF.app.innerHTML = `
    ${SF.topbar(user)}
    <div class="container">
      ${SF.breadcrumb('Divisi ' + div.name)}
      <div class="stat-grid">
        <div class="stat-card income"><div class="label">Pemasukan (Disetujui)</div><div class="value">${SF.formatMoney(summary.totalIn)}</div></div>
        <div class="stat-card expense"><div class="label">Pengeluaran (Disetujui)</div><div class="value">${SF.formatMoney(summary.totalOut)}</div></div>
        <div class="stat-card net"><div class="label">Bersih</div><div class="value">${SF.formatMoney(summary.net)}</div></div>
      </div>

<div class="panel">
        <h3>${SF.iconHtml('ai', true)}Isi Otomatis dengan AI</h3>
        <p class="text-muted" style="font-size:13px;margin-bottom:12px;">
          Upload dokumen (gambar atau PDF) dari kuitansi/invoice/bukti transaksi. AI akan membaca dan mengisi kolom form di bawah secara otomatis.
        </p>
        <div class="filter-bar">
          <div class="form-group" style="flex:1;min-width:220px;">
            <label>${SF.iconHtml('doc')} Dokumen (Gambar / PDF)</label>
            <input type="file" id="aiFile" accept="image/*,application/pdf">
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <button type="button" id="aiBtn" class="btn btn-accent" onclick="SF.handleAIUpload('${divId}')">${SF.iconHtml('spark')} Analisis dengan AI</button>
          </div>
        </div>
        <div id="aiStatus"></div>
      </div>

      <div class="panel">
        <h3>${SF.iconHtml('doc', true)}Buat Proposal ${div.name}</h3>
        <form onsubmit="SF.submitProposal(event, '${divId}')">
          <div class="filter-bar">
            <div class="form-group">
              <label>Tipe Transaksi</label>
              <select id="txType">
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
            <div class="form-group">
              <label>Jumlah (Rp)</label>
              <input type="number" id="txAmount" min="0" step="1000" placeholder="0" required>
            </div>
            <div class="form-group">
              <label>Tanggal</label>
              <input type="date" id="txDate" required>
            </div>
            <div class="form-group" style="flex:1;min-width:200px;">
              <label>Deskripsi</label>
              <input type="text" id="txDesc" placeholder="Keterangan transaksi" required>
            </div>
            <div class="form-group">
              <label>Lampiran</label>
              <input type="file" id="txAttachment" accept="image/*,application/pdf">
            </div>
            <div class="form-group">
              <label>&nbsp;</label>
              <button type="submit" class="btn btn-primary">Kirim Proposal</button>
            </div>
          </div>
        </form>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>${SF.iconHtml('chart', true)}Riwayat & Proposal Saya</h3>
        </div>
        ${SF.renderTxTable(txs)}
      </div>

      ${SF.renderNotifPanel(divId, notifs)}
    </div>`;

  // set default date
  const d = document.getElementById('txDate');
  if (d) d.value = new Date().toISOString().slice(0, 10);
};

SF.submitProposal = async function(e, division) {
  e.preventDefault();
  const type = document.getElementById('txType').value;
  const amount = document.getElementById('txAmount').value;
  const date = document.getElementById('txDate').value;
  const desc = document.getElementById('txDesc').value;
  const attachmentInput = document.getElementById('txAttachment');
  const file = attachmentInput && attachmentInput.files && attachmentInput.files[0] ? attachmentInput.files[0] : null;

  if (!amount || Number(amount) <= 0) { alert('Jumlah harus lebih dari 0.'); return; }

  let attachmentName = null;
  let attachmentUrl = null;
  if (file) {
    const upload = await SF.uploadAttachment(file);
    if (upload.ok) {
      attachmentName = file.name;
      attachmentUrl = upload.url;
    } else {
      alert('Gagal mengunggah lampiran. Silakan coba lagi atau kirim tanpa lampiran.');
      return; // hentikan pengiriman proposal jika upload file gagal
    }
  }

  const localTx = {
    division,
    type,
    amount,
    description: desc,
    date,
    attachmentName,
    attachmentUrl
  };

  const remoteTx = await SF.saveTransactionRemote(localTx);
  if (!remoteTx) {
    SF.addTransaction(localTx);
  }
  alert('Proposal berhasil dikirim dan menunggu persetujuan Master.');
  SF.renderDivision(division);
};

SF.renderTxTable = function(txs) {
  if (txs.length === 0) {
    return `<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Tipe</th><th>Jumlah</th><th>Deskripsi</th><th>Status</th><th>Lampiran</th></tr></thead>
      <tbody><tr><td class="empty" colspan="6">Belum ada transaksi.</td></tr></tbody></table></div>`;
  }
  const rows = txs.slice().sort((a, b) => b.date.localeCompare(a.date)).map(t => {
    const attach = t.attachmentUrl ? `<a href="${t.attachmentUrl}" target="_blank">${t.attachmentName || 'Lihat'}</a>` : '-';
    return `
    <tr>
      <td>${SF.formatDateShort(t.date)}</td>
      <td>${t.type === 'income' ? '<span class="text-income">Pemasukan</span>' : '<span class="text-expense">Pengeluaran</span>'}</td>
      <td class="${t.type === 'income' ? 'text-income' : 'text-expense'}">${SF.amountOf(t)}</td>
      <td>${t.description}</td>
      <td><span class="badge ${t.status}">${t.status === 'approved' ? 'Disetujui' : (t.status === 'rejected' ? 'Ditolak' : 'Menunggu')}</span></td>
      <td>${attach}</td>
      <td><button class="btn btn-sm btn-ghost" onclick="SF.showTxHistory('${t.id}')">Detail</button></td>
    </tr>`;
  }).join('');
  return `
    <div class="table-wrap"><table>
      <thead><tr><th>Tanggal</th><th>Tipe</th><th>Jumlah</th><th>Deskripsi</th><th>Status</th><th>Lampiran</th><th>Riwayat</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
};

SF.renderNotifPanel = function(divId, notifs) {
  if (notifs.length === 0) {
    return `<div class="panel"><h3>${SF.iconHtml('bell', true)}Notifikasi</h3><div class="text-muted">Belum ada notifikasi.</div></div>`;
  }
  const items = notifs.map(n => {
    const unread = n.read ? '' : 'unread';
    const statusTxt = n.status === 'approved' ? 'Disetujui' : 'Ditolak';
    const icon = n.status === 'approved' ? SF.iconHtml('check') : SF.iconHtml('close');
    return `
      <div class="notif-item ${unread}">
        <div class="notif-icon">${icon}</div>
        <div class="notif-body">
          <div class="notif-title">Proposal ${statusTxt}</div>
          <div class="notif-meta">${SF.formatMoney(n.amount)} — ${n.description}</div>
          <div class="notif-meta">${SF.formatDate(n.decidedAt)}</div>
        </div>
        ${n.read ? '' : `<button class="btn btn-sm btn-ghost" onclick="SF.markNotifRead(${JSON.stringify(divId)}, ${JSON.stringify(n.id)})">Tandai dibaca</button>`}
      </div>`;
  }).join('');
  return `
    <div class="panel">
      <div class="panel-header">
        <h3>${SF.iconHtml('bell', true)}Notifikasi</h3>
        <button class="btn btn-sm btn-ghost" onclick="SF.markAllRead(${JSON.stringify(divId)})">Tandai semua dibaca</button>
      </div>
      <div class="notif-list">${items}</div>
    </div>`;
};

// ---------- MASTER DASHBOARD ----------
SF.renderMasterDashboard = function() {
  const user = SF.session.currentUser();
const txs = SF.getTransactions();
  const summary = SF.computeSummary(txs);

  SF.app.innerHTML = `
    ${SF.topbar(user)}
    <div class="container">
      ${SF.breadcrumb('Dashboard Master')}
      <div class="stat-grid">
        <div class="stat-card income"><div class="label">Total Pemasukan</div><div class="value">${SF.formatMoney(summary.totalIn)}</div></div>
        <div class="stat-card expense"><div class="label">Total Pengeluaran</div><div class="value">${SF.formatMoney(summary.totalOut)}</div></div>
        <div class="stat-card net"><div class="label">Uang Bersih Perusahaan</div><div class="value">${SF.formatMoney(summary.net)}</div></div>
      </div>

<div class="panel">
        <div class="panel-header">
          <h3>Ringkasan per Divisi</h3>
        </div>
        <div class="filter-bar">
          <div class="form-group"><label>Dari</label><input type="date" id="pdFrom" onchange="SF.renderMasterPerDiv()"></div>
          <div class="form-group"><label>Sampai</label><input type="date" id="pdTo" onchange="SF.renderMasterPerDiv()"></div>
          <div class="form-group"><label>&nbsp;</label>
            <button class="btn btn-sm btn-ghost" onclick="SF.resetPerDivFilter()">Reset / Semua</button>
          </div>
        </div>
        <div id="perDivTable"></div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>${SF.iconHtml('chart', true)}Grafik Keseluruhan</h3>
        </div>
        <div class="filter-bar">
          <div class="form-group"><label>Dari</label><input type="date" id="chartFrom" onchange="SF.renderMasterChart()"></div>
          <div class="form-group"><label>Sampai</label><input type="date" id="chartTo" onchange="SF.renderMasterChart()"></div>
          <div class="form-group"><label>&nbsp;</label>
            <button class="btn btn-sm btn-ghost" onclick="SF.resetChartFilter()">Reset / Semua</button>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <div class="chart-label">Pergerakan Uang Disetujui</div>
              <div class="chart-value" id="chartTotalValue">${SF.formatMoney(summary.net)}</div>
            </div>
            <div>
              <div class="chart-delta" id="chartDelta"></div>
              <div class="chart-meta" id="chartRangeLabel"></div>
            </div>
          </div>
          <div class="chart-area">
            <canvas id="masterTrendChart"></canvas>
            <div id="masterChartTooltip" class="chart-tooltip"></div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>${SF.iconHtml('chart', true)}Semua Transaksi & Persetujuan</h3>
          <div class="export-actions">
            <button class="btn btn-sm btn-accent" onclick="SF.exportExcel('all', document.getElementById('mfFrom').value, document.getElementById('mfTo').value, document.getElementById('mfStatus').value)">${SF.iconHtml('excel')} Export Excel</button>
            <button class="btn btn-sm btn-danger" onclick="SF.exportPDF('all', document.getElementById('mfFrom').value, document.getElementById('mfTo').value, document.getElementById('mfStatus').value)">${SF.iconHtml('pdf')} Export PDF</button>
          </div>
        </div>
        <div class="filter-bar">
          <div class="form-group"><label>Dari</label><input type="date" id="mfFrom"></div>
          <div class="form-group"><label>Sampai</label><input type="date" id="mfTo"></div>
          <div class="form-group"><label>Divisi</label>
            <select id="mfDiv" onchange="SF.renderMasterTable()">
              <option value="all">Semua</option>
              <option value="sewa">Persewaan</option>
              <option value="bangun">Pembangunan</option>
              <option value="jual">Penjualan</option>
            </select>
          </div>
          <div class="form-group"><label>Status</label>
            <select id="mfStatus" onchange="SF.renderMasterTable()">
              <option value="all">Semua</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>
        <div id="masterTable"></div>
      </div>
    </div>`;

SF.renderMasterTable();
  SF.renderMasterPerDiv();
  SF.renderMasterChart();
};

SF.computeMasterTrendData = function(from, to) {
  const txs = SF.getTransactions().filter(t => t.status === SF.STATUS.APPROVED);
  const filtered = txs.filter(t => {
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    return true;
  });

  if (filtered.length === 0) {
    return { labels: [], values: [], startDate: from || '', endDate: to || '', startValue: 0, endValue: 0 };
  }

  const approved = filtered.slice().sort((a, b) => a.date.localeCompare(b.date));
  const start = from || approved[0].date;
  const end = to || approved[approved.length - 1].date;
  const current = new Date(start);
  const last = new Date(end);
  if (current > last) {
    return { labels: [], values: [], startDate: start, endDate: end, startValue: 0, endValue: 0 };
  }

  const rangeDays = [];
  while (current <= last) {
    rangeDays.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  const dailyDelta = {};
  approved.forEach(t => {
    const delta = t.type === 'income' ? t.amount : -t.amount;
    dailyDelta[t.date] = (dailyDelta[t.date] || 0) + delta;
  });

  let total = 0;
  const values = rangeDays.map(day => {
    total += dailyDelta[day] || 0;
    return total;
  });

  return {
    labels: rangeDays.map(day => day.slice(5)),
    values,
    startDate: start,
    endDate: end,
    startValue: values[0] || 0,
    endValue: values[values.length - 1] || 0
  };
};

SF.interpolateValues = function(from, to, progress) {
  const maxLen = Math.max(from.length, to.length);
  const result = [];
  for (let i = 0; i < maxLen; i += 1) {
    const a = from[i] || 0;
    const b = to[i] || 0;
    result[i] = a + (b - a) * progress;
  }
  return result;
};

SF.drawTrendChart = function(canvas, labels, values) {
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  const padding = 20;
  const w = rect.width - padding * 2;
  const h = rect.height - padding * 2;
  if (values.length === 0) {
    ctx.fillStyle = '#8f9bb3';
    ctx.font = '14px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText('Tidak ada data grafik untuk rentang ini.', rect.width / 2, rect.height / 2);
    return;
  }
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 0);
  const range = Math.max(1, maxVal - minVal);
  const pointCount = values.length;
  const stepX = w / Math.max(pointCount - 1, 1);
  const points = values.map((v, index) => {
    const x = padding + index * stepX;
    const y = padding + h - ((v - minVal) / range) * h;
    return { x, y, value: v };
  });

  const zeroY = padding + h - ((0 - minVal) / range) * h;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, zeroY);
  ctx.lineTo(padding + w, zeroY);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '11px Plus Jakarta Sans';
  ctx.textAlign = 'left';
  ctx.fillText('0', padding + 4, zeroY - 6);

  ctx.strokeStyle = 'rgba(92, 194, 255, 0.92)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((p, index) => {
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, padding, 0, padding + h);
  gradient.addColorStop(0, 'rgba(92, 194, 255, 0.24)');
  gradient.addColorStop(1, 'rgba(92, 194, 255, 0.00)');
  ctx.lineTo(points[points.length - 1].x, padding + h);
  ctx.lineTo(points[0].x, padding + h);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  points.forEach((p, index) => {
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = '#5cc2ff';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  points.forEach(p => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(92, 194, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '11px Plus Jakarta Sans';
  ctx.textAlign = 'center';
  points.forEach((p, index) => {
    if (index === 0 || index === points.length - 1 || index % Math.max(1, Math.floor(points.length / 5)) === 0) {
      ctx.fillText(labels[index], p.x, rect.height - 6);
    }
  });

  canvas.__trendPoints = points;
};

SF.animateTrendChart = function(canvas, fromValues, toValues, labels) {
  const start = performance.now();
  const duration = 520;
  const from = fromValues.slice();
  requestAnimationFrame(function step(timestamp) {
    const t = Math.min(1, (timestamp - start) / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    const currentValues = SF.interpolateValues(from, toValues, ease);
    SF.drawTrendChart(canvas, labels, currentValues);
    if (t < 1) requestAnimationFrame(step);
  });
};

SF.installChartTooltip = function(canvas) {
  if (!canvas || canvas.__trendTooltipInstalled) return;
  canvas.__trendTooltipInstalled = true;

  const tooltip = document.getElementById('masterChartTooltip');
  if (!tooltip) return;

  const showTooltip = (x, y, content) => {
    tooltip.style.display = 'block';
    tooltip.innerHTML = content;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  };

  const hideTooltip = () => {
    tooltip.style.display = 'none';
  };

  const findNearestPoint = (event) => {
    const rect = canvas.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const points = canvas.__trendPoints || [];
    let nearest = null;
    let minDist = Infinity;
    points.forEach((p, index) => {
      const dx = p.x - offsetX;
      const dy = p.y - offsetY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = { point: p, index };
      }
    });
    if (nearest && minDist <= 14) return nearest;
    return null;
  };

  canvas.addEventListener('mousemove', event => {
    const match = findNearestPoint(event);
    if (!match) {
      hideTooltip();
      return;
    }
    const labels = canvas.__trendLabels || [];
    const point = match.point;
    const label = labels[match.index] || '-';
    const value = SF.formatMoney(point.value);
    showTooltip(event.clientX - canvas.getBoundingClientRect().left, event.clientY - canvas.getBoundingClientRect().top, `<strong>${label}</strong><br>${value}`);
  });

  canvas.addEventListener('mouseleave', hideTooltip);
  canvas.addEventListener('mouseout', hideTooltip);
};

SF.renderMasterChart = function() {
  const from = document.getElementById('chartFrom') ? document.getElementById('chartFrom').value : '';
  const to = document.getElementById('chartTo') ? document.getElementById('chartTo').value : '';
  const data = SF.computeMasterTrendData(from, to);
  const canvas = document.getElementById('masterTrendChart');
  const totalEl = document.getElementById('chartTotalValue');
  const deltaEl = document.getElementById('chartDelta');

  const lastValue = data.values.length ? data.values[data.values.length - 1] : 0;
  const firstValue = data.values.length ? data.values[0] : 0;
  if (totalEl) totalEl.textContent = SF.formatMoney(lastValue);
  if (deltaEl) {
    const diff = lastValue - firstValue;
    const up = diff >= 0;
    deltaEl.className = `chart-delta ${up ? 'up' : 'down'}`;
    deltaEl.innerHTML = `${up ? '▲' : '▼'} ${SF.formatMoney(Math.abs(diff))} sejak awal rentang`;
  }
  if (!canvas) return;

  if (data.labels.length === 0) {
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = '#8f9bb3';
    ctx.font = '14px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText('Tidak ada data grafik untuk rentang ini.', rect.width / 2, rect.height / 2);
    if (deltaEl) deltaEl.textContent = '';
    if (totalEl) totalEl.textContent = SF.formatMoney(0);
    if (document.getElementById('chartRangeLabel')) {
      document.getElementById('chartRangeLabel').textContent = '';
    }
    return;
  }

  if (document.getElementById('chartRangeLabel')) {
    const rangeText = from || to ? `Rentang: ${from || data.startDate} — ${to || data.endDate}` : 'Seluruh data disetujui';
    document.getElementById('chartRangeLabel').textContent = rangeText;
  }

  canvas.__trendLabels = data.labels;
  const previous = SF.chartState && SF.chartState.values ? SF.chartState.values : data.values.map(() => 0);
  SF.chartState = { labels: data.labels, values: data.values };
  SF.animateTrendChart(canvas, previous, data.values, data.labels);
  SF.installChartTooltip(canvas);
};

SF.resetChartFilter = function() {
  const from = document.getElementById('chartFrom');
  const to = document.getElementById('chartTo');
  if (from) from.value = '';
  if (to) to.value = '';
  SF.renderMasterChart();
};

SF.renderMasterPerDiv = function() {
  const from = document.getElementById('pdFrom').value;
  const to = document.getElementById('pdTo').value;
  const txs = SF.getTransactions();

  const el = document.getElementById('perDivTable');
  const perDiv = SF.DIVISIONS.filter(d => d.id !== 'master').map(d => {
    let dt = txs.filter(t => t.division === d.id);
    if (from) dt = dt.filter(t => t.date >= from);
    if (to) dt = dt.filter(t => t.date <= to);
    const s = SF.computeSummary(dt);
    return { id: d.id, name: d.name, ...s };
  });

  el.innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>Divisi</th><th>Pemasukan</th><th>Pengeluaran</th><th>Bersih</th></tr></thead>
    <tbody>${perDiv.map(d => `
      <tr><td>${d.name}</td><td class="text-income">${SF.formatMoney(d.totalIn)}</td><td class="text-expense">${SF.formatMoney(d.totalOut)}</td><td>${SF.formatMoney(d.net)}</td></tr>`).join('')}
    </tbody></table></div>`;
};

SF.resetPerDivFilter = function() {
  document.getElementById('pdFrom').value = '';
  document.getElementById('pdTo').value = '';
  SF.renderMasterPerDiv();
};

SF.renderMasterTable = function() {
  const div = document.getElementById('mfDiv') ? document.getElementById('mfDiv').value : 'all';
  const from = document.getElementById('mfFrom').value;
  const to = document.getElementById('mfTo').value;
  const status = document.getElementById('mfStatus') ? document.getElementById('mfStatus').value : 'all';
  const txs = SF.getFiltered(div, from, to, status);

  const el = document.getElementById('masterTable');
  if (txs.length === 0) {
    el.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Divisi</th><th>Tipe</th><th>Jumlah</th><th>Deskripsi</th><th>Status</th><th>Aksi</th></tr></thead>
      <tbody><tr><td class="empty" colspan="7">Tidak ada transaksi pada rentang ini.</td></tr></tbody></table></div>`;
    return;
  }
  const rows = txs.slice().sort((a, b) => b.date.localeCompare(a.date)).map(t => {
    const statusBadge = `<span class="badge ${t.status}">${t.status === 'approved' ? 'Disetujui' : (t.status === 'rejected' ? 'Ditolak' : 'Menunggu')}</span>`;
    let actions = '';
    if (t.status === 'pending') {
      actions = `<button class="btn btn-sm btn-accent" onclick="SF.decide('${t.id}','approved')">Approve</button>
                 <button class="btn btn-sm btn-danger" onclick="SF.decide('${t.id}','rejected')">Reject</button>`;
    } else {
      actions = `<span class="text-muted">—</span>`;
    }
    return `<tr>
      <td>${SF.formatDateShort(t.date)}</td>
      <td>${SF.roleName(t.division)}</td>
      <td>${t.type === 'income' ? '<span class="text-income">Pemasukan</span>' : '<span class="text-expense">Pengeluaran</span>'}</td>
      <td class="${t.type === 'income' ? 'text-income' : 'text-expense'}">${SF.amountOf(t)}</td>
      <td>${t.description}</td>
      <td>${statusBadge}</td>
      <td>${actions}</td>
    </tr>`;
  }).join('');
  el.innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>Tanggal</th><th>Divisi</th><th>Tipe</th><th>Jumlah</th><th>Deskripsi</th><th>Status</th><th>Aksi</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
};

SF.decide = function(txId, status) {
  const tx = SF.getTransactions().find(t => t.id === txId);
  if (!tx) return;
  const action = status === 'approved' ? 'menyetujui' : 'menolak';
  if (!confirm(`Yakin ${action} proposal ${SF.formatMoney(tx.amount)} dari ${SF.roleName(tx.division)}?`)) return;
  SF.setStatus(txId, status);
  alert('Keputusan tersimpan.');
  SF.renderMasterDashboard();
};

window.SF = SF;
