// Вставь свой client_id от developer.jamendo.com
// Регистрация бесплатная: https://devportal.jamendo.com
const JAMENDO_CLIENT_ID = 'dd216ce1';

const JAMENDO_API = 'https://api.jamendo.com/v3.0';

let searchTimer = null;

async function jamendoGet(endpoint) {
  try {
    const res  = await fetch(JAMENDO_API + endpoint);
    const data = await res.json();
    if (data.headers?.status === 'error') {
      console.error('[Jamendo] API error:', data.headers.error_message);
      return null;
    }
    return data;
  } catch (e) {
    console.error('[Jamendo] fetch error:', e);
    return null;
  }
}

async function jamendoSearch(query) {
  const data = await jamendoGet(
    `/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&search=${encodeURIComponent(query)}&audioformat=mp32&include=musicinfo`
  );
  return data?.results || [];
}

async function jamendoPopular() {
  const data = await jamendoGet(
    `/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&order=popularity_total&audioformat=mp32&include=musicinfo`
  );
  return data?.results || [];
}

function jamendoToTrack(item) {
  const mins = Math.floor(item.duration / 60);
  const secs = String(item.duration % 60).padStart(2, '0');
  return {
    title:       item.name,
    artist:      item.artist_name,
    duration:    `${mins}:${secs}`,
    color:       '#0a1a2e',
    cover:       item.album_image || item.image || '',
    src:         item.audio || '',
    jamendoId:   item.id,
    fromJamendo: true,
  };
}

function setJamendoStatus(msg) {
  const el = document.getElementById('jamendoResults');
  if (el) el.innerHTML = msg ? `<div class="sp-empty">${msg}</div>` : '';
}

function renderJamendoList(items) {
  const list = document.getElementById('jamendoResults');
  if (!list) return;
  list.innerHTML = '';

  if (!items.length) {
    list.innerHTML = '<div class="sp-empty">Ничего не найдено</div>';
    return;
  }

  items.forEach(item => {
    const track = jamendoToTrack(item);

    const div = document.createElement('div');
    div.className = 'sp-item';

    const img = document.createElement('img');
    img.className = 'sp-item-img';
    img.alt = track.title;
    if (track.cover) img.src = track.cover;
    img.onerror = () => img.removeAttribute('src');

    const info = document.createElement('div');
    info.className = 'sp-item-info';
    info.innerHTML = `
      <div class="sp-item-title">${track.title}</div>
      <div class="sp-item-artist">${track.artist}</div>
    `;

    const badge = document.createElement('span');
    badge.className   = 'sp-item-badge sp-item-badge-full';
    badge.textContent = 'FULL';

    div.appendChild(img);
    div.appendChild(info);
    div.appendChild(badge);

    div.addEventListener('click', () => addJamendoTrack(track, div));

    list.appendChild(div);
  });
}

function addJamendoTrack(track, div) {
  const exists = window.TRACKS?.find(t => t.jamendoId === track.jamendoId);
  if (!exists) window.TRACKS?.push(track);
  const target = exists || track;

  // Switch to library tab so animation is visible
  document.getElementById('libTab')?.classList.add('active');
  document.getElementById('jamendoTab')?.classList.remove('active');
  document.getElementById('libraryPanel').style.display = 'flex';
  document.getElementById('jamendoPanel').style.display = 'none';

  if (typeof buildList === 'function') buildList('');

  // Use double rAF to ensure DOM is fully rendered before picking
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const idx = window.TRACKS?.indexOf(target) ?? -1;
      if (idx < 0) return;
      const el = document.getElementById('recordList')?.children[idx];
      if (el && typeof pickTrack === 'function') {
        pickTrack(target, el);
      } else if (typeof pickTrack === 'function') {
        // fallback — play directly without element
        pickTrack(target, null);
      }
    });
  });

  div.classList.add('sp-item-added');
  setTimeout(() => div.classList.remove('sp-item-added'), 1000);
}

async function loadJamendoDefault() {
  if (!JAMENDO_CLIENT_ID || JAMENDO_CLIENT_ID.includes('ВСТАВЬ')) {
    setJamendoStatus('Вставь client_id в файл jamendo.js');
    return;
  }
  setJamendoStatus('Загружаем популярные треки…');
  const items = await jamendoPopular();
  if (!items.length) {
    setJamendoStatus('Введи название трека в поиск');
    return;
  }
  renderJamendoList(items);
}

function initJamendo() {
  const input    = document.getElementById('jamendoSearch');
  const libTab   = document.getElementById('libTab');
  const jTab     = document.getElementById('jamendoTab');

  input?.addEventListener('input', e => {
    clearTimeout(searchTimer);
    const q = e.target.value.trim();
    if (!q) { loadJamendoDefault(); return; }
    if (q.length < 2) return;
    setJamendoStatus('Ищем…');
    searchTimer = setTimeout(async () => {
      if (!JAMENDO_CLIENT_ID || JAMENDO_CLIENT_ID.includes('ВСТАВЬ')) {
        setJamendoStatus('Вставь client_id в файл jamendo.js');
        return;
      }
      const items = await jamendoSearch(q);
      renderJamendoList(items);
    }, 500);
  });

  libTab?.addEventListener('click', () => {
    libTab.classList.add('active');
    jTab?.classList.remove('active');
    document.getElementById('libraryPanel').style.display  = 'flex';
    document.getElementById('jamendoPanel').style.display  = 'none';
  });

  jTab?.addEventListener('click', () => {
    jTab.classList.add('active');
    libTab?.classList.remove('active');
    document.getElementById('libraryPanel').style.display  = 'none';
    document.getElementById('jamendoPanel').style.display  = 'flex';
    loadJamendoDefault();
  });
}

document.addEventListener('DOMContentLoaded', initJamendo);
