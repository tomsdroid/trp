const DB_NAME = "TheraLogDB";
const DB_VERSION = 9;
const STORE_THERAPIST = "therapists";
const STORE_SESSION = "sessions";
const STORE_SERVICES = "services";

const DEFAULT_SERVICES = [ // INI YANG KURANG
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
            s.id = s.id || `SVC_${Math.random().toString(36).substr(2,9)}`; // jaga2 kalau ga ada id
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

// ===== SESSIONS - UDAH BISA TERIMA ARRAY =====
async function saveSession(session) { // save 1
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SESSION, "readwrite");
        tx.objectStore(STORE_SESSION).put(session);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = (e) => { db.close(); reject(e.target.error); };
    });
}

async function saveSessions(sessionsArray) { // save banyak - INI YANG DIPAKE IMPORT
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SESSION, "readwrite");
        const store = tx.objectStore(STORE_SESSION);
        sessionsArray.forEach(s => {
            // MAPPING BIAR COCOK SAMA DB BARU
            const newS = {
                id: s.id,
                therapistID: s.therapistID,
                therapistName: s.therapistPanggilan,
                kode: s.kode,
                produk: s.produk,
                kategori: s.kategori,
                lokasi: s.lokasi,
                durasi: s.durasi,
                waktu: s.waktu,
                timestamp: s.timestamp
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

async function getLastSessions(therapistID, limit = 5) { // INI YANG KURANG
    const all = await getSessionsByTherapist(therapistID);
    return all.sort((a,b) => b.timestamp - a.timestamp).slice(0, limit);
}

// ===== AVATAR =====
const saveAvatar = (id, base64) => localStorage.setItem(`avatar_${id}`, base64);
const getAvatar = (id) => localStorage.getItem(`avatar_${id}`);