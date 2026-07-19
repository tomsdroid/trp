import Dexie from 'dexie';

export const db = new Dexie('TerapioDB_v2');

// Naikkan ke versi 4 karena ada perubahan skema tabel sessions & services
db.version(4).stores({
  // Tabel Akun Pengguna (Therapists)
  therapists: 'therapist_id, fullname, shortname, phone, email, branch, area, position, pin, is_admin, avatar_url', 
  
  // Tabel Sessions (Samakan dengan struktur SQL terbaru)
  sessions: 'session_id, therapist_id, service_code, service_name, durasi, komisi, date, timestamp, kategori, branch, area, is_synced, _isDirty',
  
  // Tabel Master Data (Sesuai dengan struktur SQL yang baru)
  branches: '++id, name, is_active',
  areas: '++id, name, is_active',
  services: '++id, code, name, branch_type',
  categories: '++id, name, is_active',
  
  // Tabel Notifikasi
  notifications: '++id, title, message, type, target_therapist_id, created_at'
});
