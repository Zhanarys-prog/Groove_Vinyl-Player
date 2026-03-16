const DEFAULT_TRACKS = [
  {
    title: "Babydoll",
    artist: "Dominic Fike",
    duration: "1:39",
    color: "#2a1a0a",
    cover: "assets/images/babydol.jpg",
    src: "assets/audio/Babydoll.mp3",
    theme: { bg: "#1a0f05", accent: "#e8a04a", orb1: "#e8a04a", orb2: "#c4622d" },
  },
  {
    title: "Borderline",
    artist: "Tame Impala",
    duration: "4:34",
    color: "#0a1020",
    cover: "assets/images/borderline.jpeg",
    src: "assets/audio/borderline.mp3",
    theme: { bg: "#05080f", accent: "#4a90d9", orb1: "#4a90d9", orb2: "#7b5ea7" },
  },
  {
    title: "Chamber of Reflection",
    artist: "Mac DeMarco",
    duration: "3:51",
    color: "#0a1a10",
    cover: "assets/images/pic.jpeg",
    src: "assets/audio/Chamber Of Reflection - Mac DeMarco.mp3",
    theme: { bg: "#050d08", accent: "#4abf7a", orb1: "#2d8c52", orb2: "#1a5c38" },
  },
  {
    title: "Fly-day Chinatown",
    artist: "Yasuha",
    duration: "3:30",
    color: "#1a0a0a",
    cover: "assets/images/flydaychinatown.jpeg",
    src: "assets/audio/chinatown.mp3",
    theme: { bg: "#0f0505", accent: "#e85555", orb1: "#e85555", orb2: "#c43a3a" },
  },
  {
    title: "Heart To Heart",
    artist: "Mac DeMarco",
    duration: "3:31",
    color: "#1a100a",
    cover: "assets/images/heart_to_heart.png",
    src: "assets/audio/hearttoheart.mp3",
    theme: { bg: "#100a05", accent: "#f0a050", orb1: "#f0a050", orb2: "#d4623a" },
  },
  {
    title: "Looking Out for You",
    artist: "Joy Again",
    duration: "3:01",
    color: "#0a0a1a",
    cover: "assets/images/looking_out_for_you.jpg",
    src: "assets/audio/LookingOutForYou.mp3",
    theme: { bg: "#05050f", accent: "#a078d4", orb1: "#7b50b4", orb2: "#4a3080" },
  },
  {
    title: "Messages from the Stars",
    artist: "The Rah Band",
    duration: "6:44",
    color: "#050a1a",
    cover: "assets/images/messages_from_the_stars.jpeg",
    src: "assets/audio/MessagesfromtheStars.mp3",
    theme: { bg: "#020510", accent: "#50c8f0", orb1: "#2090c8", orb2: "#7b5ea7" },
  },
  {
    title: "Shut up My Moms Calling",
    artist: "Hotel Ugly",
    duration: "2:44",
    color: "#1a1505",
    cover: "assets/images/Shut-up-My-Moms-Calling-English-2020-20200211203053-500x500.jpg",
    src: "assets/audio/Momscalling.mp3",
    theme: { bg: "#0f0c02", accent: "#d4c040", orb1: "#c0a830", orb2: "#8c6820" },
  },
  {
    title: "Notion",
    artist: "The Rare Occasions",
    duration: "3:15",
    color: "#0a0510",
    cover: "assets/images/notion.jpg",
    src: "assets/audio/notion.mp3",
    theme: { bg: "#060310", accent: "#c080e8", orb1: "#9050c8", orb2: "#5a2090" },
  },
  {
    title: "See You Again",
    artist: "Tyler, The Creator & Kali Uchis",
    duration: "3:00",
    color: "#0a1505",
    cover: "assets/images/see_you_again.jpg",
    src: "assets/audio/seeyouagain.mp3",
    theme: { bg: "#050c02", accent: "#78c840", orb1: "#50a020", orb2: "#2d6010" },
  },
];

const ACCENT_COLORS = [
  "#1a0a2e", "#0a1a2e", "#1a2a0a", "#2a1a0a", "#2a0a0a",
  "#0a2a2a", "#2a2a0a", "#1a1a0a", "#0a0a2a", "#2a0a2a",
];

const CRACKLE_SRC = "";

const state = {
  current: null,
  playing: false,
  crackleOn: false,
  volume: 0.8,
  demoTimer: null,
  demoTime: 0,
  demoDuration: 0,
  needleDown: false,
};

let TRACKS = [];
window.TRACKS = TRACKS;

const recordList = document.getElementById('recordList');
const audioEl = document.getElementById('audioPlayer');
const crackleEl = document.getElementById('crackleAudio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const crackleBtn = document.getElementById('crackleBtn');
const volumeSlider = document.getElementById('volumeSlider');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressThumb = document.getElementById('progressThumb');
const timeCur = document.getElementById('timeCur');
const timeTot = document.getElementById('timeTot');
const npTrack = document.getElementById('npTrack');
const npArtist = document.getElementById('npArtist');
const eqBars = document.getElementById('eqBars');
const vinylDisc = document.getElementById('vinylDisc');
const vinylLabel = document.getElementById('vinylLabel');
const labelArt = document.getElementById('labelArt');
const vinylLabelInput = document.getElementById('vinylLabelInput');
const tonearmWrap = document.getElementById('tonearmWrap');
const needleWrap = document.getElementById('needleWrap');
const needleTip = document.getElementById('needleTip');
const needleBtn = document.getElementById('needleBtn');
const flyingVinyl = document.getElementById('flyingVinyl');
const searchInput = document.getElementById('searchInput');

for (let i = 0; i < 7; i++) {
  eqBars.appendChild(document.createElement('span'));
}

// IndexedDB

let db = null;

function getUserId() {
  let id = localStorage.getItem('groove_uid');
  if (!id) {
    id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    localStorage.setItem('groove_uid', id);
  }
  return id;
}

const USER_ID = getUserId();

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('groove', 2);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('tracks')) {
        db.createObjectStore('tracks', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = e => { db = e.target.result; resolve(); };
    req.onerror = () => reject(req.error);
  });
}

function dbGetAll() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tracks', 'readonly');
    const req = tx.objectStore('tracks').getAll();
    req.onsuccess = () => {
      const all = req.result;
      resolve(all.filter(t => t.userId === USER_ID));
    };
    req.onerror = () => reject(req.error);
  });
}

function dbAdd(track) {
  track.userId = USER_ID;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tracks', 'readwrite');
    const req = tx.objectStore('tracks').add(track);
    req.onsuccess = () => { track.id = req.result; resolve(track); };
    req.onerror = () => reject(req.error);
  });
}

function dbUpdate(track) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tracks', 'readwrite');
    const req = tx.objectStore('tracks').put(track);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// List

function buildList(filter = '') {
  recordList.innerHTML = '';
  const query = filter.toLowerCase();
  TRACKS
    .filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query)
    )
    .forEach(track => recordList.appendChild(makeItem(track)));
}

function dbDelete(trackId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tracks', 'readwrite');
    const req = tx.objectStore('tracks').delete(trackId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function makeItem(track) {
  const div = document.createElement('div');
  div.className = 'record-item';
  if (state.current === track) div.classList.add('active');

  const art = document.createElement('div');
  art.className = 'ri-art';
  art.style.setProperty('--track-color', track.color);
  setArtImage(art, track);

  const overlay = document.createElement('div');
  overlay.className = 'ri-art-upload';
  overlay.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';

  overlay.addEventListener('click', e => {
    e.stopPropagation();
    fileInput.click();
  });

  fileInput.addEventListener('change', e => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (file) uploadCover(track, file, art);
  });

  art.appendChild(overlay);
  art.appendChild(fileInput);

  const info = document.createElement('div');
  info.className = 'ri-info';
  info.innerHTML = `<div class="ri-title">${track.title}</div><div class="ri-artist">${track.artist}</div>`;

  const dur = document.createElement('span');
  dur.className = 'ri-duration';
  dur.textContent = track.duration;

  const indicator = document.createElement('div');
  indicator.className = 'ri-indicator';
  for (let i = 0; i < 3; i++) indicator.appendChild(document.createElement('span'));

  div.appendChild(art);
  div.appendChild(info);
  div.appendChild(dur);
  div.appendChild(indicator);

  if (track.userId === USER_ID) {
    const del = document.createElement('button');
    del.className = 'ri-delete';
    del.title = 'Remove track';
    del.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
    del.addEventListener('click', async e => {
      e.stopPropagation();
      if (state.current === track) {
        stopProgress();
        liftNeedle();
        tonearmWrap.className = 'tonearm-wrap at-rest';
        needleWrap.classList.add('hidden-needle');
        setPlaying(false);
        state.current = null;
        npTrack.textContent = 'Select a record to play';
        npArtist.textContent = '—';
        labelArt.innerHTML = '';
        labelArt.style.background = '';
      }
      await dbDelete(track.id);
      if (window.fbDeleteTrack) window.fbDeleteTrack(track.id);
      TRACKS = TRACKS.filter(t => t !== track);
      buildList(searchInput.value);
    });
    div.appendChild(del);
  }

  div.addEventListener('click', () => pickTrack(track, div));
  return div;
}

function setArtImage(artEl, track) {
  const old = artEl.querySelector('img, .ri-art-bg');
  if (old) old.remove();

  const ref = artEl.querySelector('.ri-art-upload') || null;

  if (track.cover) {
    const img = document.createElement('img');
    img.src = track.cover;
    img.alt = track.title;
    artEl.insertBefore(img, ref);
  } else {
    const bg = document.createElement('div');
    bg.className = 'ri-art-bg';
    artEl.insertBefore(bg, ref);
  }
}

function uploadCover(track, file, artEl) {
  const reader = new FileReader();
  reader.onload = e => {
    track.cover = e.target.result;
    setArtImage(artEl, track);
    artEl.classList.add('flash');
    setTimeout(() => artEl.classList.remove('flash'), 800);
    if (state.current === track) renderLabel(track);
    if (track.id != null) dbUpdate(track);
    if (track.id != null && window.fbUpdateCover) window.fbUpdateCover(track);
  };
  reader.readAsDataURL(file);
}

// Player

// ── Dynamic theme ─────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return { r, g, b };
}

function lighten(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const l = v => Math.min(255, Math.round(v + (255 - v) * amount));
  return `#${[l(r),l(g),l(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
}

function darken(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const d = v => Math.max(0, Math.round(v * (1 - amount)));
  return `#${[d(r),d(g),d(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
}

function applyTheme(track) {
  if (!track.theme) return;
  const { bg, accent, orb1, orb2 } = track.theme;
  const root = document.documentElement;

  root.style.setProperty('--bg',           bg);
  root.style.setProperty('--bg2',          lighten(bg, 0.06));
  root.style.setProperty('--surface',      lighten(bg, 0.12));
  root.style.setProperty('--surface2',     lighten(bg, 0.18));
  root.style.setProperty('--accent',       accent);
  root.style.setProperty('--accent2',      darken(accent, 0.15));
  root.style.setProperty('--accent-glow',  hexToRgb(accent) ? `rgba(${hexToRgb(accent).r},${hexToRgb(accent).g},${hexToRgb(accent).b},0.25)` : '');

  const orb1El = document.querySelector('.bg-orb-1');
  const orb2El = document.querySelector('.bg-orb-2');
  if (orb1El) orb1El.style.background = `radial-gradient(circle, ${orb1} 0%, transparent 70%)`;
  if (orb2El) orb2El.style.background = `radial-gradient(circle, ${orb2} 0%, transparent 70%)`;
}

// ── Player ────────────────────────────────────────────────────────────────────

function pickTrack(track, el) {
  if (state.current === track) {
    togglePlay();
    return;
  }

  state.current = track;
  liftNeedle();
  tonearmWrap.className = 'tonearm-wrap at-rest';

  document.querySelectorAll('.record-item').forEach(r => r.classList.remove('active'));
  if (el) el.classList.add('active');

  applyTheme(track);

  flyTo(el, track, () => {
    renderLabel(track);
    startPlay(track);
  });

  fadeNowPlaying(track);
}

function flyTo(sourceEl, track, done) {
  if (!sourceEl) { done?.(); return; }

  const art = sourceEl.querySelector('.ri-art');
  const from = art.getBoundingClientRect();
  const platter = document.querySelector('.vinyl-on-platter');
  const to = platter.getBoundingClientRect();
  const cx = to.left + to.width / 2;
  const cy = to.top + to.height / 2;

  flyingVinyl.classList.remove('animating');
  flyingVinyl.style.cssText = `
    left: ${from.left}px;
    top: ${from.top}px;
    width: ${from.width}px;
    height: ${from.height}px;
    opacity: 1;
    transform: rotate(0deg);
    background: ${track.color};
  `;

  art.style.opacity = '0';
  vinylDisc.style.opacity = '0.3';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flyingVinyl.classList.add('animating');
      flyingVinyl.style.left = (cx - to.width / 2) + 'px';
      flyingVinyl.style.top = (cy - to.height / 2) + 'px';
      flyingVinyl.style.width = to.width + 'px';
      flyingVinyl.style.height = to.height + 'px';
      flyingVinyl.style.transform = 'rotate(360deg)';
      flyingVinyl.style.opacity = '0';
    });
  });

  setTimeout(() => {
    flyingVinyl.classList.remove('animating');
    art.style.opacity = '1';
    vinylDisc.style.opacity = '1';
    done?.();
  }, 680);
}

function renderLabel(track) {
  labelArt.innerHTML = '';
  labelArt.style.backgroundImage = '';
  labelArt.style.background = '';

  if (track.cover) {
    const img = document.createElement('img');
    img.src = track.cover;
    img.alt = track.title;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;';
    labelArt.appendChild(img);
  } else {
    labelArt.style.background = `radial-gradient(circle at 38% 38%, ${track.color}99, ${track.color})`;
    labelArt.textContent = '♪';
  }

  vinylLabel.onclick = e => {
    e.stopPropagation();
    vinylLabelInput.click();
  };
}

function fadeNowPlaying(track) {
  npTrack.classList.add('fading');
  setTimeout(() => {
    npTrack.textContent = track.title;
    npArtist.textContent = track.artist;
    npTrack.classList.remove('fading');
  }, 200);
}

function startPlay(track) {
  stopProgress();

  if (track.src) {
    audioEl.src = track.src;
    audioEl.volume = state.volume;
    audioEl.play().catch(() => startDemo(track));
  } else {
    startDemo(track);
  }

  setPlaying(true);
  tonearmWrap.className = 'tonearm-wrap on-record';
  needleWrap.classList.remove('hidden-needle');
  setTimeout(dropNeedle, 700);
}

function startDemo(track) {
  const parts = track.duration.split(':');
  state.demoDuration = parseInt(parts[0]) * 60 + parseInt(parts[1]);
  state.demoTime = 0;
  timeTot.textContent = track.duration;
  timeCur.textContent = '0:00';

  state.demoTimer = setInterval(() => {
    if (!state.playing) return;
    state.demoTime++;
    if (state.demoTime >= state.demoDuration) {
      state.demoTime = 0;
      nextTrack();
      return;
    }
    updateDemoProgress();
  }, 1000);
}

function updateDemoProgress() {
  const pct = state.demoTime / state.demoDuration * 100;
  progressFill.style.width = pct + '%';
  progressThumb.style.right = `calc(${100 - pct}% - 6px)`;
  timeCur.textContent = formatTime(state.demoTime);
}

function stopProgress() {
  clearInterval(state.demoTimer);
  audioEl.pause();
  audioEl.src = '';
  progressFill.style.width = '0%';
  timeCur.textContent = '0:00';
  timeTot.textContent = '0:00';
}

function togglePlay() {
  if (!state.current) return;
  state.playing ? pause() : resume();
}

function pause() {
  audioEl.pause();
  setPlaying(false);
}

function resume() {
  if (state.current?.src) audioEl.play().catch(() => {});
  setPlaying(true);
}

function setPlaying(on) {
  state.playing = on;
  playBtn.classList.toggle('playing', on);
  vinylDisc.classList.toggle('playing', on);
  eqBars.classList.toggle('active', on);
  needleTip.classList.toggle('pulsing', state.needleDown && on);
  if (state.crackleOn && CRACKLE_SRC) {
    on ? crackleEl.play() : crackleEl.pause();
  }
}

function nextTrack() {
  const idx = TRACKS.indexOf(state.current);
  const next = TRACKS[(idx + 1) % TRACKS.length];
  pickTrack(next, recordList.children[TRACKS.indexOf(next)]);
}

function prevTrack() {
  const idx = TRACKS.indexOf(state.current);
  const prev = TRACKS[(idx - 1 + TRACKS.length) % TRACKS.length];
  pickTrack(prev, recordList.children[TRACKS.indexOf(prev)]);
}

function dropNeedle() {
  state.needleDown = true;
  needleWrap.classList.add('dropped');
  needleBtn.classList.add('needle-down');
  if (state.playing) needleTip.classList.add('pulsing');
}

function liftNeedle() {
  state.needleDown = false;
  needleWrap.classList.remove('dropped');
  needleBtn.classList.remove('needle-down');
  needleTip.classList.remove('pulsing');
}

function formatTime(secs) {
  if (!isFinite(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = String(Math.floor(secs % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

audioEl.addEventListener('timeupdate', () => {
  if (!audioEl.duration) return;
  const pct = audioEl.currentTime / audioEl.duration * 100;
  progressFill.style.width = pct + '%';
  progressThumb.style.right = `calc(${100 - pct}% - 6px)`;
  timeCur.textContent = formatTime(audioEl.currentTime);
  timeTot.textContent = formatTime(audioEl.duration);
});

audioEl.addEventListener('ended', nextTrack);

audioEl.addEventListener('loadedmetadata', () => {
  timeTot.textContent = formatTime(audioEl.duration);
});

progressBar.addEventListener('click', e => {
  const pct = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
  if (state.current?.src && audioEl.duration) {
    audioEl.currentTime = pct * audioEl.duration;
  } else if (state.demoDuration) {
    state.demoTime = Math.floor(pct * state.demoDuration);
    updateDemoProgress();
  }
});

volumeSlider.addEventListener('input', e => {
  state.volume = parseFloat(e.target.value);
  audioEl.volume = state.volume;
  if (crackleEl) crackleEl.volume = state.volume * 0.3;
});

crackleBtn.addEventListener('click', () => {
  state.crackleOn = !state.crackleOn;
  crackleBtn.classList.toggle('active', state.crackleOn);
  if (state.crackleOn && CRACKLE_SRC) {
    crackleEl.src = CRACKLE_SRC;
    crackleEl.volume = state.volume * 0.3;
    if (state.playing) crackleEl.play();
  } else {
    crackleEl.pause();
    crackleEl.src = '';
  }
});

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

needleBtn.addEventListener('click', () => {
  if (!state.current) return;
  state.needleDown ? liftNeedle() : dropNeedle();
});

vinylLabelInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file || !state.current) return;
  const idx = TRACKS.indexOf(state.current);
  const artEl = recordList.children[idx]?.querySelector('.ri-art');
  if (artEl) uploadCover(state.current, file, artEl);
  e.target.value = '';
});

searchInput.addEventListener('input', e => buildList(e.target.value));

document.addEventListener('keydown', e => {
  if (e.target === searchInput) return;
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
  if (e.code === 'ArrowRight') nextTrack();
  if (e.code === 'ArrowLeft') prevTrack();
});

// Modal

const modalOverlay = document.getElementById('modalOverlay');
const addBtn = document.getElementById('addBtn');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const modalSubmit = document.getElementById('modalSubmit');
const modalTitleInput = document.getElementById('modalTitle');
const modalArtistInput = document.getElementById('modalArtist');
const modalCoverPick = document.getElementById('modalCoverPick');
const modalCoverPreview = document.getElementById('modalCoverPreview');
const modalCoverInput = document.getElementById('modalCoverInput');
const modalAudioBtn = document.getElementById('modalAudioBtn');
const modalAudioLabel = document.getElementById('modalAudioLabel');
const modalAudioInput = document.getElementById('modalAudioInput');

let pendingCover = null;
let pendingAudio = null;

function openModal() {
  modalOverlay.classList.add('open');
  modalTitleInput.focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  resetModal();
}

function resetModal() {
  modalTitleInput.value = '';
  modalArtistInput.value = '';
  modalCoverPreview.classList.remove('has-image');
  const img = modalCoverPreview.querySelector('img');
  if (img) img.remove();
  modalAudioLabel.textContent = 'Choose audio…';
  modalAudioBtn.classList.remove('has-file');
  pendingCover = null;
  pendingAudio = null;
  updateSubmitBtn();
}

function updateSubmitBtn() {
  modalSubmit.disabled = modalTitleInput.value.trim().length === 0;
}

addBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
});

modalCoverPick.addEventListener('click', () => modalCoverInput.click());

modalCoverInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    pendingCover = ev.target.result;
    let img = modalCoverPreview.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      modalCoverPreview.appendChild(img);
    }
    img.src = pendingCover;
    modalCoverPreview.classList.add('has-image');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

modalAudioBtn.addEventListener('click', () => modalAudioInput.click());

modalAudioInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    pendingAudio = ev.target.result;
    modalAudioLabel.textContent = file.name;
    modalAudioBtn.classList.add('has-file');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

modalTitleInput.addEventListener('input', updateSubmitBtn);

modalSubmit.addEventListener('click', async () => {
  const title = modalTitleInput.value.trim();
  if (!title) return;

  const track = {
    title,
    artist: modalArtistInput.value.trim() || 'Unknown Artist',
    duration: '0:00',
    color: ACCENT_COLORS[TRACKS.length % ACCENT_COLORS.length],
    cover: pendingCover || '',
    src: pendingAudio || '',
  };

  await dbAdd(track);
  TRACKS.push(track);

  // Save to Firebase Storage + Firestore
  if (window.fbSaveTrack) window.fbSaveTrack(track);

  closeModal();
  buildList(searchInput.value);

  const newEl = recordList.children[TRACKS.indexOf(track)];
  if (newEl) {
    newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => pickTrack(track, newEl), 300);
  }
});

// Init

async function init() {
  tonearmWrap.className = 'tonearm-wrap at-rest';
  needleWrap.classList.add('hidden-needle');
  audioEl.volume = state.volume;

  await openDB();
  const saved = await dbGetAll();
  TRACKS = [...DEFAULT_TRACKS, ...saved];
  window.TRACKS = TRACKS;
  buildList();

  const turntable = document.getElementById('turntable');

  if (window.matchMedia('(hover: hover)').matches) {
    turntable.addEventListener('mousemove', e => {
      const r = turntable.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      turntable.style.transform = `perspective(800px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg)`;
    });
    turntable.addEventListener('mouseleave', () => {
      turntable.style.transition = 'transform 0.5s ease';
      turntable.style.transform = '';
      setTimeout(() => turntable.style.transition = '', 500);
    });
  }
}

init();
