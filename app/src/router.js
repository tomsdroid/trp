import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  // Halaman Utama
  { path: '/', component: () => import('./views/Onboarding.vue') },
  { path: '/login', component: () => import('./views/Login.vue') },
  { path: '/register', component: () => import('./views/Register.vue') },
  { path: '/dashboard', component: () => import('./views/Dashboard.vue') },
  
  // Halaman Standar Terapis
  { path: '/input', component: () => import('./views/InputLog.vue') },
  { path: '/notifikasi', component: () => import('./views/Notifikasi.vue') },
  { path: '/history', component: () => import('./views/History.vue') },
  { path: '/settings', component: () => import('./views/Settings.vue') },
  { path: '/laporan', component: () => import('./views/Laporan.vue') },
  { path: '/komisi', component: () => import('./views/Komisi.vue') },
  { path: '/peringkat', component: () => import('./views/Peringkat.vue') },
  { path: '/sync', component: () => import('./views/Sync.vue') },
  { path: '/backup', component: () => import('./views/Backup.vue') },
  { path: '/tutorial', component: () => import('./views/Tutorial.vue') },
  { path: '/feedback', component: () => import('./views/Feedback.vue') },
  { path: '/bantuan', component: () => import('./views/Bantuan.vue') },
  { path: '/edit-profil', component: () => import('./views/EditProfile.vue') },
  { path: '/ubah-pin', component: () => import('./views/ChangePin.vue') },

  // Halaman Khusus Admin
  { path: '/admin/cabang', component: () => import('./views/admin/AdminCabang.vue') },
  { path: '/admin/area', component: () => import('./views/admin/AdminArea.vue') },
  { path: '/admin/layanan', component: () => import('./views/admin/AdminLayanan.vue') },
  { path: '/admin/terapis', component: () => import('./views/admin/AdminTerapis.vue') },
  { path: '/admin/laporan', component: () => import('./views/admin/AdminRekapLaporan.vue') },
  { path: '/admin/broadcast', component: () => import('./views/admin/AdminBroadcast.vue') },
]

export const router = createRouter({
  history: createWebHashHistory(), // Wajib Hash untuk Cordova
  routes,
})
