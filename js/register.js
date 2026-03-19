const FB_VERSION = "10.8.0";
const FB_BASE = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;

// ── Tabs ──────────────────────────────────────────────────────────────────────

document.getElementById("tabLogin")?.addEventListener("click", () => {
  document.getElementById("tabLogin").classList.add("active");
  document.getElementById("tabRegister").classList.remove("active");
  document.getElementById("loginForm").style.display = "";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("authSuccess").style.display = "none";
});

document.getElementById("tabRegister")?.addEventListener("click", () => {
  document.getElementById("tabRegister").classList.add("active");
  document.getElementById("tabLogin").classList.remove("active");
  document.getElementById("registerForm").style.display = "";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("authSuccess").style.display = "none";
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.display = msg ? "block" : "none";
  }
}

function showSuccess(msg) {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("authSuccess").style.display = "block";
  document.getElementById("authSuccessMsg").textContent = msg;
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading
    ? btnId === "loginBtn"
      ? "Входим…"
      : "Создаём аккаунт…"
    : btnId === "loginBtn"
      ? "Войти"
      : "Создать аккаунт";
}

function firebaseError(code) {
  const map = {
    "auth/user-not-found": "Пользователь не найден",
    "auth/wrong-password": "Неверный пароль",
    "auth/email-already-in-use": "Email уже используется",
    "auth/weak-password": "Пароль слишком простой",
    "auth/invalid-email": "Неверный формат email",
    "auth/too-many-requests": "Слишком много попыток, подожди немного",
    "auth/network-request-failed": "Ошибка сети",
    "auth/invalid-credential": "Неверный email или пароль",
  };
  return map[code] || "Произошла ошибка, попробуй снова";
}

// ── Login ─────────────────────────────────────────────────────────────────────

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError("loginError", "");

  const email = document.getElementById("loginEmail").value.trim();
  const pw = document.getElementById("loginPassword").value;

  if (!email || !pw) {
    showError("loginError", "Заполни все поля");
    return;
  }

  setLoading("loginBtn", true);
  try {
    const { getAuth, signInWithEmailAndPassword } = await import(
      `${FB_BASE}/firebase-auth.js`
    );
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, pw);
    showSuccess(`Добро пожаловать! Переходим в плеер…`);
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  } catch (err) {
    showError("loginError", firebaseError(err.code));
    setLoading("loginBtn", false);
  }
});

// ── Register ──────────────────────────────────────────────────────────────────

document
  .getElementById("registerForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("registerError", "");

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const pw = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regConfirm").value;

    if (!name || !email || !pw) {
      showError("registerError", "Заполни все поля");
      return;
    }
    if (pw.length < 8) {
      showError("registerError", "Пароль минимум 8 символов");
      return;
    }
    if (pw !== confirm) {
      showError("registerError", "Пароли не совпадают");
      return;
    }

    setLoading("registerBtn", true);
    try {
      const {
        getAuth,
        createUserWithEmailAndPassword,
        updateProfile,
        sendEmailVerification,
      } = await import(`${FB_BASE}/firebase-auth.js`);
      const auth = getAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      await updateProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);
      showSuccess(
        `Аккаунт создан! Письмо с подтверждением отправлено на ${email}`,
      );
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2500);
    } catch (err) {
      showError("registerError", firebaseError(err.code));
      setLoading("registerBtn", false);
    }
  });

// ── Forgot password ───────────────────────────────────────────────────────────

document.getElementById("forgotBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  if (!email) {
    showError("loginError", "Введи email для сброса пароля");
    return;
  }
  try {
    const { getAuth, sendPasswordResetEmail } = await import(
      `${FB_BASE}/firebase-auth.js`
    );
    await sendPasswordResetEmail(getAuth(), email);
    showError("loginError", "");
    showSuccess(`Письмо для сброса пароля отправлено на ${email}`);
  } catch (err) {
    showError("loginError", firebaseError(err.code));
  }
});

// ── Check if already logged in ────────────────────────────────────────────────

async function checkAuth() {
  try {
    const { getAuth, onAuthStateChanged } = await import(
      `${FB_BASE}/firebase-auth.js`
    );
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        showSuccess(`Ты уже вошёл как ${user.displayName || user.email}`);
      }
    });
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", checkAuth);
