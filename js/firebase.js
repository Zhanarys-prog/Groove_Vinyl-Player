import { initializeApp }                                  from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut,
         createUserWithEmailAndPassword, signInWithEmailAndPassword,
         updateProfile, sendEmailVerification,
         sendPasswordResetEmail }                         from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, doc,
         setDoc, getDocs, deleteDoc, updateDoc }          from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes,
         getDownloadURL, deleteObject }                   from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// ── Config ────────────────────────────────────────────────────────────────────

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDef06vo2xZsDC4wnAlXZaNIVBrjhLD-dk",
  authDomain:        "groove-20403.firebaseapp.com",
  projectId:         "groove-20403",
  storageBucket:     "groove-20403.firebasestorage.app",
  messagingSenderId: "403502880666",
  appId:             "1:403502880666:web:8a2b432f861350da110c23",
};

// ── Init ──────────────────────────────────────────────────────────────────────

const app     = initializeApp(FIREBASE_CONFIG);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

window.fbAuth        = auth;
window.fbDb          = db;
window.fbStorage     = storage;
window.fbCurrentUser = null;

// ── Auth state ────────────────────────────────────────────────────────────────

onAuthStateChanged(auth, async user => {
  window.fbCurrentUser = user;
  updateHeaderUI(user);
  if (user) {
    // Wait for script.js TRACKS to be ready
    const wait = () => new Promise(r => setTimeout(r, 100));
    let attempts = 0;
    while (typeof buildList !== 'function' && attempts++ < 30) await wait();
    if (typeof buildList === 'function') await loadCloudTracks(user.uid);
  }
});

// ── Header UI ─────────────────────────────────────────────────────────────────

function updateHeaderUI(user) {
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

document.getElementById('headerLogoutBtn')?.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'register.html';
});

// ── Storage helpers ───────────────────────────────────────────────────────────

// Convert base64 data URL → Blob
function dataURLtoBlob(dataURL) {
  const [header, data] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// Upload file to Storage, return download URL
async function uploadFile(path, dataURL) {
  if (!dataURL || !dataURL.startsWith('data:')) return dataURL; // already a URL
  const blob    = dataURLtoBlob(dataURL);
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, blob);
  return getDownloadURL(fileRef);
}

// Delete file from Storage (ignore errors if not found)
async function deleteFile(path) {
  try {
    await deleteObject(ref(storage, path));
  } catch(e) {}
}

// ── Firestore: load tracks ────────────────────────────────────────────────────

async function loadCloudTracks(uid) {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'tracks'));
    if (snap.empty) return;

    snap.forEach(d => {
      const t = { ...d.data(), id: d.id, fromCloud: true };
      if (window.TRACKS && !window.TRACKS.find(x => String(x.id) === String(t.id))) {
        window.TRACKS.push(t);
      }
    });

    if (typeof buildList === 'function') buildList('');
  } catch(e) {
    console.error('[Firebase] loadCloudTracks:', e);
  }
}

// ── Firestore + Storage: save track ──────────────────────────────────────────

window.fbSaveTrack = async function(track) {
  const user = window.fbCurrentUser;
  if (!user || !track.id) return;

  const uid = user.uid;
  const tid = String(track.id);

  try {
    // Upload cover to Storage if it's a base64 data URL
    let coverUrl = track.cover || '';
    if (coverUrl.startsWith('data:image')) {
      coverUrl = await uploadFile(`users/${uid}/covers/${tid}`, coverUrl);
    }

    // Upload audio to Storage if it's a base64 data URL
    let srcUrl = track.src || '';
    if (srcUrl.startsWith('data:audio')) {
      srcUrl = await uploadFile(`users/${uid}/audio/${tid}`, srcUrl);
    }

    // Save metadata to Firestore (URLs only, no base64)
    await setDoc(doc(collection(db, 'users', uid, 'tracks'), tid), {
      title:    track.title    || '',
      artist:   track.artist   || '',
      duration: track.duration || '0:00',
      color:    track.color    || '#0a0a0a',
      cover:    coverUrl,
      src:      srcUrl,
      addedAt:  Date.now(),
    });

    // Update in-memory track with storage URLs
    track.cover = coverUrl;
    track.src   = srcUrl;

  } catch(e) {
    console.error('[Firebase] fbSaveTrack:', e);
  }
};

// ── Firestore + Storage: delete track ────────────────────────────────────────

window.fbDeleteTrack = async function(trackId) {
  const user = window.fbCurrentUser;
  if (!user) return;
  const uid = user.uid;
  const tid = String(trackId);
  try {
    await deleteDoc(doc(collection(db, 'users', uid, 'tracks'), tid));
    await deleteFile(`users/${uid}/covers/${tid}`);
    await deleteFile(`users/${uid}/audio/${tid}`);
  } catch(e) {
    console.error('[Firebase] fbDeleteTrack:', e);
  }
};

// ── Firestore + Storage: update cover ────────────────────────────────────────

window.fbUpdateCover = async function(track) {
  const user = window.fbCurrentUser;
  if (!user || !track.id) return;
  const uid = user.uid;
  const tid = String(track.id);
  try {
    let coverUrl = track.cover || '';
    if (coverUrl.startsWith('data:image')) {
      coverUrl = await uploadFile(`users/${uid}/covers/${tid}`, coverUrl);
      track.cover = coverUrl;
    }
    await updateDoc(doc(collection(db, 'users', uid, 'tracks'), tid), { cover: coverUrl });
  } catch(e) {
    console.error('[Firebase] fbUpdateCover:', e);
  }
};

// ── Auth functions ────────────────────────────────────────────────────────────

window.fbRegister = async function(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await sendEmailVerification(cred.user);
  return cred.user;
};

window.fbLogin = async function(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

window.fbLogout = async function() {
  await signOut(auth);
};

window.fbResetPassword = async function(email) {
  await sendPasswordResetEmail(auth, email);
};
