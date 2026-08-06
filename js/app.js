// =================== SERARAH FINANCE - APP / ROUTING ===================
// Inisialisasi aplikasi & routing tampilan berdasarkan hash + sesi.

var SF = window.SF || {};

SF.router = function() {
  const hash = location.hash || '#home';
  const user = SF.session.currentUser();

  // Login page
  if (hash === '#login') {
    SF.renderLogin();
    return;
  }

  // Semua halaman lain butuh login
  if (!user) {
    location.hash = '#login';
    return;
  }

  if (hash === '#home') {
    SF.renderHome(user);
  } else if (hash.startsWith('#divisi/')) {
    const role = hash.split('/')[1];
    if (role === user.role) {
      SF.renderDivision(role);
    } else {
      // Rule #1 & #3: hanya bisa akses divisi sendiri
      alert('Anda tidak memiliki akses ke divisi lain.');
      location.hash = '#home';
    }
  } else {
    location.hash = '#home';
  }
};

SF.refreshCurrentView = async function() {
  const user = SF.session.currentUser();
  if (!user) return;

  const hash = location.hash || '#home';
  if (hash === '#login') return;

  if (hash === '#home') {
    SF.renderHome(user);
    return;
  }

  if (hash.startsWith('#divisi/')) {
    const role = hash.split('/')[1];
    if (role === user.role) {
      await SF.loadTransactions();
      if (role === 'master') {
        SF.renderMasterDashboard();
      } else {
        await SF.loadNotifications(role);
        SF.renderDivision(role);
      }
    }
  }
};

window.addEventListener('load', () => {
  if (typeof SF.bootstrapApiServerConfig === 'function') {
    SF.bootstrapApiServerConfig();
  }
  SF.router();
  SF.connectRealtime();
});
window.addEventListener('hashchange', SF.router);

window.SF = SF;
