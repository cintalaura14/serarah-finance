// =================== SERARAH FINANCE - AUTH ===================
// Login, logout, dan pengelolaan sesi.

var SF = window.SF || {};

SF.session = {
  get() {
    return SF.storage.get('session', null);
  },
  set(user) {
    SF.storage.set('session', user);
  },
  clear() {
    localStorage.removeItem('serarah_session');
  },
  currentUser() {
    return SF.session.get();
  },
  isLoggedIn() {
    return !!SF.session.get();
  }
};

SF.login = function(username, password) {
  const user = SF.USERS.find(u =>
    u.username.toLowerCase() === username.trim().toLowerCase() &&
    u.password === password
  );
  if (user) {
    SF.session.set({ username: user.username, role: user.role });
    return { ok: true, user };
  }
  return { ok: false, message: 'Username atau password salah.' };
};

SF.logout = function() {
  SF.session.clear();
  location.hash = '#login';
};

window.SF = SF;
