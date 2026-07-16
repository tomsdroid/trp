const DB_NAME = "TheraLogDB";
const DB_VERSION = 9;
const STORE_THERAPIST = "therapists";
const STORE_SESSION = "sessions";
const STORE_SERVICES = "services";

const DEFAULT_SERVICES = [
    { id: "JM60", name: "Javanese Massage 60", price: 200000 },
    { id: "JM61", name: "Javanese Massage 61", price: 200000 }
];

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_THERAPIST)) {
                db.createObjectStore(STORE_THERAPIST, { keyPath: "therapist_id" });
            }
            if (!db.objectStoreNames.contains(STORE_SESSION)) {
                const sessionStore = db.createObjectStore(STORE_SESSION, { keyPath: "id" });
                sessionStore.createIndex("therapistID", "therapistID", { unique: false });
                sessionStore.createIndex("timestamp", "timestamp", { unique: false });
                // Index is_synced opsional, tapi filter manual sudah cukup untuk skala kecil
            }
            if (!db.objectStoreNames.contains(STORE_SERVICES)) {
                db.createObjectStore(STORE_SERVICES, { keyPath: "id" });
            }
        };
    });
}

async function initDB() { 
    await openDB(); 
    await loadServices();
    console.log("DB Siap");
}

// ===== LOAD SERVICES =====
async function loadServices() {
    const db = await openDB();
    const count = await db.transaction(STORE_SERVICES, "readonly").objectStore(STORE_SERVICES).count();
    if(count > 0) { db.close(); return; }
    db.close();

    try {
        const res = await fetch('services.json');
        const services = await res.json();
        const db2 = await openDB();
        const tx2 = db2.transaction(STORE_SERVICES, "readwrite");
        services.forEach(s => {
            s.id = s.id || `SVC_${Math.random().toString(36).substr(2,9)}`;
            tx2.objectStore(STORE_SERVICES).put(s);
        });
        await tx2.done;
        db2.close();
        console.log("Services loaded:", services.length);
    } catch(err) {
        console.log("Gagal load services.json, pake default");
        const db3 = await openDB();
        const tx3 = db3.transaction(STORE_SERVICES, "readwrite");
        DEFAULT_SERVICES.forEach(s => tx3.objectStore(STORE_SERVICES).put(s));
        await tx3.done;
        db3.close();
    }
}

async function getAllServices() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SERVICES, "readonly");
        const req = tx.objectStore(STORE_SERVICES).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
    });
}

// ===== THERAPIST =====
async function saveTherapist(data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_THERAPIST, "readwrite");
        tx.objectStore(STORE_THERAPIST).put(data);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = (e) => { db.close(); reject(e.target.error); };
    });
}
async function getTherapist(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_THERAPIST, "readonly");
        const req = tx.objectStore(STORE_THERAPIST).get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
    });
}

// ===== SESSIONS =====
async function saveSession(session) { 
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SESSION, "readwrite");
        // Beri flag belum sinkron (0) jika belum ada statusnya
        session.is_synced = session.is_synced !== undefined ? session.is_synced : 0;
        tx.objectStore(STORE_SESSION).put(session);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = (e) => { db.close(); reject(e.target.error); };
    });
}

async function saveSessions(sessionsArray) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SESSION, "readwrite");
        const store = tx.objectStore(STORE_SESSION);
        sessionsArray.forEach(s => {
            const newS = {
                id: s.id,
                therapistID: s.therapistID,
                therapistName: s.therapistPanggilan || s.therapistName,
                kode: s.kode,
                produk: s.produk,
                kategori: s.kategori,
                lokasi: s.lokasi,
                durasi: s.durasi,
                waktu: s.waktu,
                timestamp: s.timestamp,
                // Penanda data belum sinkron (0 = Belum, 1 = Sudah)
                is_synced: s.is_synced !== undefined ? s.is_synced : 0
            };
            store.put(newS);
        });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = (e) => { db.close(); reject(e.target.error); };
    });
}

async function getSessionsByTherapist(therapistID) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SESSION, "readonly");
        const req = tx.objectStore(STORE_SESSION).index("therapistID").getAll(therapistID);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
    });
}

async function getLastSessions(therapistID, limit = 5) {
    const all = await getSessionsByTherapist(therapistID);
    return all.sort((a,b) => b.timestamp - a.timestamp).slice(0, limit);
}


// ==========================================
// FITUR BARU: MANAJEMEN SINKRONISASI
// ==========================================

// Mengambil log yang belum disinkronisasi
async function getUnsyncedSessions(therapistID) {
    const allSessions = await getSessionsByTherapist(therapistID);
    // Kembalikan hanya yang is_synced nya 0 atau undefined
    return allSessions.filter(session => !session.is_synced);
}

// Menandai log sebagai sudah tersinkronisasi
async function markSessionsAsSynced(sessionsArray) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SESSION, "readwrite");
        const store = tx.objectStore(STORE_SESSION);
        
        sessionsArray.forEach(session => {
            session.is_synced = 1; // 1 = Sudah disinkronkan ke Google Sheet
            store.put(session);
        });
        
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = (e) => { db.close(); reject(e.target.error); };
    });
}


// ===== AVATAR =====
const saveAvatar = (id, base64) => localStorage.setItem(`avatar_${id}`, base64);
const getAvatar = (id) => localStorage.getItem(`avatar_${id}`);
