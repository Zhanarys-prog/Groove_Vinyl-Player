// ── MockAPI config ────────────────────────────────────────────────────────────
// Это твой MockAPI URL — треки хранятся внутри пользователя как поле tracks[]
const API_URL = "https://69b60ba5583f543fbd9cd75c.mockapi.io/user";

// ── Current user ──────────────────────────────────────────────────────────────

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('groove_user')); }
  catch { return null; }
}

window.getCurrentUser = getCurrentUser;

// ── Load user tracks from MockAPI ─────────────────────────────────────────────

async function loadUserTracksFromAPI() {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const res  = await fetch(`${API_URL}/${user.id}`);
    if (!res.ok) return;
    const data = await res.json();
    const cloudTracks = Array.isArray(data.tracks) ? data.tracks : [];

    if (!cloudTracks.length) return;

    // Wait for TRACKS to be ready
    let attempts = 0;
    while ((!window.TRACKS || !window.TRACKS.length === 0) && attempts++ < 30) {
      await new Promise(r => setTimeout(r, 100));
    }

    cloudTracks.forEach(t => {
      if (window.TRACKS && !window.TRACKS.find(x => String(x.id) === String(t.id))) {
        window.TRACKS.push({ ...t, fromCloud: true });
      }
    });

    if (typeof buildList === 'function') buildList('');
  } catch(e) {
    console.error('[Auth] loadUserTracks:', e);
  }
}

// ── Save all user tracks to MockAPI ──────────────────────────────────────────

async function saveUserTracksToAPI() {
  const user = getCurrentUser();
  if (!user || !window.TRACKS) return;

  // Only save tracks added by the user (not default tracks, not jamendo)
  const userTracks = window.TRACKS.filter(t =>
    t.userId === window.groove_uid ||
    t.fromCloud ||
    t.fromJamendo
  ).map(t => ({
    id:       t.id       || String(Date.now()),
    title:    t.title    || '',
    artist:   t.artist   || '',
    duration: t.duration || '0:00',
    color:    t.color    || '#0a0a0a',
    // Store cover and src only if small enough (< 200KB as base64)
    cover:    (t.cover && t.cover.length < 200000)  ? t.cover  : '',
    src:      (t.src   && t.src.length   < 200000)  ? t.src    : '',
    userId:   user.id,
  }));

  try {
    await fetch(`${API_URL}/${user.id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ tracks: userTracks }),
    });
  } catch(e) {
    console.error('[Auth] saveUserTracks:', e);
  }
}

// ── Save single track ─────────────────────────────────────────────────────────

window.cloudSaveTrack = async function(track) {
  await saveUserTracksToAPI();
};

// ── Delete single track ───────────────────────────────────────────────────────

window.cloudDeleteTrack = async function(trackId) {
  await saveUserTracksToAPI();
};

// ── Update header UI ──────────────────────────────────────────────────────────

function updateHeaderAuth() {
  const user    = getCurrentUser();
  const authBtn  = document.getElementById('headerAuthBtn');
  const userMenu = document.getElementById('headerUserMenu');
  const userName = document.getElementById('headerUserName');
  const userEmail= document.getElementById('headerUserEmail');
  const avatar   = document.getElementById('headerAvatar');
  if (!authBtn) return;

  if (user) {
    authBtn.style.display  = 'none';
    userMenu.style.display = 'flex';
    if (userName)  userName.textContent  = user.username || 'Пользователь';
    if (userEmail) userEmail.textContent = user.email    || '';
    if (avatar)    avatar.textContent    = (user.username || user.email || '?')[0].toUpperCase();
  } else {
    authBtn.style.display  = 'flex';
    userMenu.style.display = 'none';
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────

function logout() {
  localStorage.removeItem('groove_user');
  window.location.href = 'register.html';
}

window.grooveLogout = logout;

// ── Init ──────────────────────────────────────────────────────────────────────

// Update header when it loads
const headerAuthObserver = new MutationObserver(() => {
  if (document.getElementById('headerAuthBtn')) {
    headerAuthObserver.disconnect();
    updateHeaderAuth();

    document.getElementById('headerLogoutBtn')?.addEventListener('click', logout);
  }
});
headerAuthObserver.observe(document.body, { childList: true, subtree: true });

// Load cloud tracks after page is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadUserTracksFromAPI, 800);
});

// Auto-save tracks when page is closed
window.addEventListener('beforeunload', () => {
  saveUserTracksToAPI();
});
