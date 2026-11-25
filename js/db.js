// ===== Database Layer (Firebase + localStorage fallback) =====

let db = null;
let firebaseReady = false;
let firebaseInitPromise = null;

function isFirebaseEnabled() {
  return typeof USE_FIREBASE !== 'undefined' && USE_FIREBASE === true
    && typeof FIREBASE_CONFIG !== 'undefined'
    && FIREBASE_CONFIG.apiKey
    && FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY';
}

async function initFirebase() {
  if (firebaseInitPromise) return firebaseInitPromise;
  if (!isFirebaseEnabled()) {
    firebaseReady = false;
    return false;
  }

  firebaseInitPromise = (async () => {
    try {
      // ใช้ Firebase v9+ modular ผ่าน CDN compat สำหรับง่าย
      if (!window.firebase) {
        await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js');
      }
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      db = firebase.firestore();
      firebaseReady = true;
      console.log('[DB] Firebase connected');
      return true;
    } catch (err) {
      console.error('[DB] Firebase init failed:', err);
      firebaseReady = false;
      return false;
    }
  })();

  return firebaseInitPromise;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ---------- Load ----------
async function loadDataAsync() {
  await initFirebase();

  if (firebaseReady && db) {
    try {
      const settingsSnap = await db.collection(COLLECTION_SETTINGS).doc(DOC_SETTINGS_ID).get();
      const membersSnap = await db.collection(COLLECTION_MEMBERS).get();

      let settings = { ...defaultData.settings };
      if (settingsSnap.exists) {
        settings = { ...settings, ...settingsSnap.data() };
      }

      let members = [];
      membersSnap.forEach(doc => {
        members.push({ id: doc.id, ...doc.data() });
      });

      // ถ้ายังไม่มีสมาชิกใน DB ใช้ค่าเริ่มต้นครั้งแรก
      if (members.length === 0 && defaultData.members.length) {
        members = defaultData.members;
        // seed ครั้งแรก
        for (const m of members) {
          await db.collection(COLLECTION_MEMBERS).doc(m.id).set({
            name: m.name,
            rank: m.rank,
            avatar: m.avatar || '',
            facebook: m.facebook || '',
            otherLink: m.otherLink || ''
          });
        }
      }

      return { settings, members, activity: [] };
    } catch (err) {
      console.error('[DB] Load from Firebase failed, fallback localStorage', err);
    }
  }

  // Fallback localStorage
  return loadDataLocal();
}

function loadDataLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const settings = { ...defaultData.settings, ...data.settings };
      if (!settings.musicUrl) {
        settings.musicUrl = defaultData.settings.musicUrl;
        settings.autoPlay = true;
      }
      return {
        settings,
        members: data.members || defaultData.members,
        activity: data.activity || []
      };
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(defaultData));
}

// เก็บ sync version ไว้ให้โค้ดเก่าเรียกได้ (จะได้ข้อมูลจาก cache/local)
function loadData() {
  return loadDataLocal();
}

// ---------- Save Settings ----------
async function saveSettingsAsync(settings) {
  await initFirebase();

  if (firebaseReady && db) {
    try {
      await db.collection(COLLECTION_SETTINGS).doc(DOC_SETTINGS_ID).set(settings, { merge: true });
      // sync local ด้วย
      const local = loadDataLocal();
      local.settings = settings;
      saveDataLocal(local);
      return true;
    } catch (err) {
      console.error('[DB] Save settings failed', err);
    }
  }

  const local = loadDataLocal();
  local.settings = settings;
  saveDataLocal(local);
  return true;
}

// ---------- Save / Delete Members ----------
async function saveMemberAsync(member) {
  await initFirebase();

  if (firebaseReady && db) {
    try {
      const id = member.id || String(Date.now());
      const payload = {
        name: member.name,
        rank: member.rank,
        avatar: member.avatar || '',
        facebook: member.facebook || '',
        otherLink: member.otherLink || ''
      };
      await db.collection(COLLECTION_MEMBERS).doc(id).set(payload, { merge: true });
      member.id = id;

      // sync local
      const local = loadDataLocal();
      const idx = local.members.findIndex(m => m.id === id);
      if (idx >= 0) local.members[idx] = { id, ...payload };
      else local.members.push({ id, ...payload });
      saveDataLocal(local);
      return member;
    } catch (err) {
      console.error('[DB] Save member failed', err);
    }
  }

  // local only
  const local = loadDataLocal();
  const id = member.id || String(Date.now());
  member.id = id;
  const idx = local.members.findIndex(m => m.id === id);
  if (idx >= 0) local.members[idx] = member;
  else local.members.push(member);
  saveDataLocal(local);
  return member;
}

async function deleteMemberAsync(id) {
  await initFirebase();

  if (firebaseReady && db) {
    try {
      await db.collection(COLLECTION_MEMBERS).doc(id).delete();
    } catch (err) {
      console.error('[DB] Delete member failed', err);
    }
  }

  const local = loadDataLocal();
  local.members = local.members.filter(m => m.id !== id);
  saveDataLocal(local);
}

function saveDataLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// แทนที่ saveData เดิม
function saveData(data) {
  saveDataLocal(data);
}

function addActivity(text) {
  const data = loadDataLocal();
  data.activity = data.activity || [];
  data.activity.unshift({ text, time: new Date().toLocaleString('th-TH') });
  if (data.activity.length > 20) data.activity = data.activity.slice(0, 20);
  saveDataLocal(data);
}

function getRankLabel(rank) {
  const map = { founder: 'FOUNDER', leader: 'LEADER', member: 'MEMBER' };
  return map[rank] || 'MEMBER';
}

function getDefaultAvatar(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a25&color=c9a227&size=128&bold=true`;
}

// แสดงสถานะ DB บนหน้า Admin
async function updateDbStatusUI() {
  const el = document.getElementById('dbStatus');
  if (!el) return;
  const ok = await initFirebase();
  if (ok) {
    el.innerHTML = '<span style="color:#22c55e">● เชื่อม Database แล้ว (Firebase)</span>';
  } else if (isFirebaseEnabled()) {
    el.innerHTML = '<span style="color:#eab308">● Config มี แต่เชื่อมไม่สำเร็จ</span>';
  } else {
    el.innerHTML = '<span style="color:#8b8ba0">● ใช้ localStorage (ยังไม่เชื่อม Database)</span>';
  }
}
