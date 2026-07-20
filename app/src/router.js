import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  // Halaman Guest / Belum Login
  { path: '/onboarding', name: 'Onboarding', component: () => import('./views/Onboarding.vue'), meta: { requiresGuest: true } },
  { path: '/login', name: 'Login', component: () => import('./views/Login.vue'), meta: { requiresGuest: true } },
  { path: '/register', name: 'Register', component: () => import('./views/Register.vue'), meta: { requiresGuest: true } },
  
  // Halaman Utama (Wajib Login & Punya Data)
  { path: '/', name: 'Dashboard', component: () => import('./views/Dashboard.vue'), meta: { requiresAuth: true } },
  
  // Halaman Standar Terapis (Wajib Login)
  { path: '/input', component: () => import('./views/InputLog.vue'), meta: { requiresAuth: true } },
  { path: '/notifikasi', component: () => import('./views/Notifikasi.vue'), meta: { requiresAuth: true } },
  { path: '/history', component: () => import('./views/History.vue'), meta: { requiresAuth: true } },
  { path: '/settings', component: () => import('./views/Settings.vue'), meta: { requiresAuth: true } },
  { path: '/laporan', component: () => import('./views/Laporan.vue'), meta: { requiresAuth: true } },
  { path: '/komisi', component: () => import('./views/Komisi.vue'), meta: { requiresAuth: true } },
  { path: '/peringkat', component: () => import('./views/Peringkat.vue'), meta: { requiresAuth: true } },
  { path: '/sync', component: () => import('./views/Sync.vue'), meta: { requiresAuth: true } },
  { path: '/backup', component: () => import('./views/Backup.vue'), meta: { requiresAuth: true } },
  { path: '/tutorial', component: () => import('./views/Tutorial.vue'), meta: { requiresAuth: true } },
  { path: '/feedback', component: () => import('./views/Feedback.vue'), meta: { requiresAuth: true } },
  { path: '/bantuan', component: () => import('./views/Bantuan.vue'), meta: { requiresAuth: true } },
  { path: '/edit-profil', component: () => import('./views/EditProfile.vue'), meta: { requiresAuth: true } },
  { path: '/ubah-pin', component: () => import('./views/ChangePin.vue'), meta: { requiresAuth: true } },
  { path: '/dashboard', redirect: '/' },

  // Halaman Khusus Admin (Wajib Login)
  { path: '/admin/cabang', component: () => import('./views/admin/AdminCabang.vue'), meta: { requiresAuth: true } },
  { path: '/admin/area', component: () => import('./views/admin/AdminArea.vue'), meta: { requiresAuth: true } },
  { path: '/admin/layanan', component: () => import('./views/admin/AdminLayanan.vue'), meta: { requiresAuth: true } },
  { path: '/admin/terapis', component: () => import('./views/admin/AdminTerapis.vue'), meta: { requiresAuth: true } },
  { path: '/admin/laporan', component: () => import('./views/admin/AdminRekapLaporan.vue'), meta: { requiresAuth: true } },
  { path: '/admin/broadcast', component: () => import('./views/admin/AdminBroadcast.vue'), meta: { requiresAuth: true } },
]

export const router = createRouter({
  history: createWebHashHistory(), // Wajib Hash untuk Cordova (Bagus, ini sudah benar)
  routes,
})

// === LOGIKA PENENDANG (NAVIGATION GUARD) ===
// === LOGIKA PENENDANG (NAVIGATION GUARD) ===
router.beforeEach((to, from, next) => {
  
  // last_logged_in_id = Penanda bahwa terapis sudah pernah setup/onboarding
  const hasUserData = localStorage.getItem('last_logged_in_id') !== null
  
  // logged_in_id = Penanda bahwa sesi saat ini aktif (sudah masukin PIN)
  const isLoggedIn = localStorage.getItem('logged_in_id') !== null

  // 1. Jika halaman butuh Auth (Dashboard, Input, dll)
  if (to.meta.requiresAuth) {
    if (!hasUserData) {
      // Gak punya riwayat ID sama sekali -> Lempar ke Onboarding
      next({ name: 'Onboarding' })
    } else if (hasUserData && !isLoggedIn) {
      // Punya riwayat ID tapi statusnya lagi logout -> Lempar ke Login (minta PIN)
      next({ name: 'Login' })
    } else {
      // Punya ID & sedang Login -> Silakan masuk
      next()
    }
  } 
  // 2. Jika halaman khusus Guest (Onboarding, Login, Register)
  else if (to.meta.requiresGuest) {
    if (hasUserData && isLoggedIn) {
      // Udah login kok buka Login/Onboarding -> Tendang balik ke Dashboard (/)
      next({ name: 'Dashboard' })
    } else if (to.name === 'Onboarding' && hasUserData) {
      // Udah pernah setup tapi iseng buka Onboarding lagi -> Tendang ke Login minta PIN
      next({ name: 'Login' })
    } else {
      next()
    }
  } 
  // 3. Untuk rute lain
  else {
    next()
  }
})
