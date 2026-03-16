fetch('header.html')
  .then(r => r.text())
  .then(html => {
    const mount = document.getElementById('header-mount');
    if (!mount) return;
    mount.innerHTML = html;
    const page = window.location.pathname.split('/').pop() || 'index.html';
    mount.querySelectorAll('a[href]').forEach(a => {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });
  })
  .catch(() => {});

function initBurger() {
  const burger = document.getElementById('navBurger');
  const nav    = document.getElementById('siteNav');
  if (!burger || !nav) return;
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    burger.classList.toggle('burger-open', open);
  });
  document.addEventListener('click', e => {
    if (!burger.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('nav-open');
      burger.classList.remove('burger-open');
    }
  });
}

// Wait for header HTML to load
const headerObserver = new MutationObserver(() => {
  if (document.getElementById('navBurger')) {
    initBurger();
    headerObserver.disconnect();
  }
});
headerObserver.observe(document.body, { childList: true, subtree: true });

// Auth UI — fires when firebase.js updates window.fbCurrentUser
function applyAuthToHeader(user) {
  const authBtn   = document.getElementById('headerAuthBtn');
  const userMenu  = document.getElementById('headerUserMenu');
  const userName  = document.getElementById('headerUserName');
  const userEmail = document.getElementById('headerUserEmail');
  const avatar    = document.getElementById('headerAvatar');
  if (!authBtn) return;

  if (user) {
    authBtn.style.display  = 'none';
    userMenu.style.display = 'flex';
    if (userName)  userName.textContent  = user.displayName || 'Пользователь';
    if (userEmail) userEmail.textContent = user.email;
    if (avatar)    avatar.textContent    = (user.displayName || user.email || '?')[0].toUpperCase();
  } else {
    authBtn.style.display  = 'flex';
    userMenu.style.display = 'none';
  }
}

// Poll until firebase.js exposes fbAuth, then listen
function waitForFirebaseAuth() {
  if (window.fbAuth) {
    // Re-use already-initialised auth — firebase.js already calls onAuthStateChanged
    // but header loads after, so we read current user from window
    if (window.fbCurrentUser !== undefined) {
      applyAuthToHeader(window.fbCurrentUser);
    }

    document.getElementById('headerLogoutBtn')?.addEventListener('click', async () => {
      if (window.fbLogout) await window.fbLogout();
      window.location.href = 'register.html';
    });
    return;
  }
  setTimeout(waitForFirebaseAuth, 200);
}

// Also re-apply when header HTML finishes loading
const authHeaderObserver = new MutationObserver(() => {
  if (document.getElementById('headerAuthBtn')) {
    authHeaderObserver.disconnect();
    waitForFirebaseAuth();
  }
});
authHeaderObserver.observe(document.body, { childList: true, subtree: true });
