// ── Tabs ──────────────────────────────────────────────────────────────────────

document.getElementById('tabLogin')?.addEventListener('click', () => {
  document.getElementById('tabLogin').classList.add('active');
  document.getElementById('tabRegister').classList.remove('active');
  document.getElementById('loginForm').style.display    = '';
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('authSuccess').style.display  = 'none';
});

document.getElementById('tabRegister')?.addEventListener('click', () => {
  document.getElementById('tabRegister').classList.add('active');
  document.getElementById('tabLogin').classList.remove('active');
  document.getElementById('registerForm').style.display = '';
  document.getElementById('loginForm').style.display    = 'none';
  document.getElementById('authSuccess').style.display  = 'none';
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
}

function showSuccess(msg) {
  document.getElementById('loginForm').style.display    = 'none';
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('authSuccess').style.display  = 'block';
  document.getElementById('authSuccessMsg').textContent = msg;
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled    = loading;
  btn.textContent = loading
    ? (btnId === 'loginBtn' ? 'Входим…' : 'Создаём аккаунт…')
    : (btnId === 'loginBtn' ? 'Войти'   : 'Создать аккаунт');
}

function fbError(code) {
  const map = {
    'auth/user-not-found':         'Пользователь не найден',
    'auth/wrong-password':         'Неверный пароль',
    'auth/invalid-credential':     'Неверный email или пароль',
    'auth/email-already-in-use':   'Email уже используется',
    'auth/weak-password':          'Пароль слишком простой',
    'auth/invalid-email':          'Неверный формат email',
    'auth/too-many-requests':      'Слишком много попыток, подожди немного',
    'auth/network-request-failed': 'Ошибка сети',
  };
  return map[code] || 'Произошла ошибка, попробуй снова';
}

// ── Login ─────────────────────────────────────────────────────────────────────

document.getElementById('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  showError('loginError', '');

  const email = document.getElementById('loginEmail').value.trim();
  const pw    = document.getElementById('loginPassword').value;

  if (!email || !pw) { showError('loginError', 'Заполни все поля'); return; }
  if (!window.fbLogin) { showError('loginError', 'Firebase загружается, подожди секунду'); return; }

  setLoading('loginBtn', true);
  try {
    const user = await window.fbLogin(email, pw);
    showSuccess(`Добро пожаловать, ${user.displayName || user.email}!`);
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
  } catch(err) {
    showError('loginError', fbError(err.code));
    setLoading('loginBtn', false);
  }
});

// ── Register ──────────────────────────────────────────────────────────────────

document.getElementById('registerForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  showError('registerError', '');

  const name    = document.getElementById('regName').value.trim();
  const email   = document.getElementById('regEmail').value.trim();
  const pw      = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;

  if (!name || !email || !pw)  { showError('registerError', 'Заполни все поля'); return; }
  if (pw.length < 8)            { showError('registerError', 'Пароль минимум 8 символов'); return; }
  if (pw !== confirm)           { showError('registerError', 'Пароли не совпадают'); return; }
  if (!window.fbRegister)       { showError('registerError', 'Firebase загружается, подожди секунду'); return; }

  setLoading('registerBtn', true);
  try {
    await window.fbRegister(name, email, pw);
    showSuccess(`Аккаунт создан! Письмо с подтверждением отправлено на ${email}`);
    setTimeout(() => { window.location.href = 'index.html'; }, 2000);
  } catch(err) {
    showError('registerError', fbError(err.code));
    setLoading('registerBtn', false);
  }
});

// ── Forgot password ───────────────────────────────────────────────────────────

document.getElementById('forgotBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  if (!email) { showError('loginError', 'Введи email выше'); return; }
  if (!window.fbResetPassword) return;
  try {
    await window.fbResetPassword(email);
    showSuccess(`Письмо для сброса пароля отправлено на ${email}`);
  } catch(err) {
    showError('loginError', fbError(err.code));
  }
});

// ── Check if already logged in ────────────────────────────────────────────────

function checkAlreadyLoggedIn() {
  const checkInterval = setInterval(() => {
    if (window.fbCurrentUser !== undefined) {
      clearInterval(checkInterval);
      if (window.fbCurrentUser) {
        showSuccess(`Ты уже вошёл как ${window.fbCurrentUser.displayName || window.fbCurrentUser.email}`);
      }
    }
  }, 200);
}

checkAlreadyLoggedIn();
