<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Header -->
    <div class="bg-orange-500 text-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
      <button @click="$router.back()" class="mr-3 active:scale-90 transition-transform">
        <ArrowLeftIcon :size="20" />
      </button>
      <h2 class="text-base font-bold flex-1">Sinkronisasi Data</h2>
    </div>

    <div class="p-4 flex-1 flex flex-col items-center justify-center text-center">
      
      <!-- ============================================== -->
      <!-- STATE 1: EMPTY STATE (Tidak ada data kotor)    -->
      <!-- ============================================== -->
      <div v-if="unsyncedCount === 0" class="flex flex-col items-center mb-8">
        <div class="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-5 text-slate-300 shadow-inner">
          <CloudSyncIcon :size="64" :class="{'animate-spin text-teal-400': isSyncing}" />
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-2">Data Up-to-date</h3>
        <p class="text-xs text-slate-500 px-6 leading-relaxed">
          Tidak ada data lokal yang tertunda. Semua log sesi Anda sudah tersinkronisasi dengan server klinik.
        </p>
      </div>

      <!-- ============================================== -->
      <!-- STATE 2: ADA DATA YANG PERLU DI-SYNC           -->
      <!-- ============================================== -->
      <div v-else class="flex flex-col items-center mb-8">
        <div class="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner relative bg-orange-100 text-orange-500">
          <CloudSyncIcon :size="48" :class="{'animate-pulse': isSyncing}" />
          <!-- Badge Notifikasi -->
          <div class="absolute top-0 right-0 w-7 h-7 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[11px] font-bold shadow-md">
            {{ unsyncedCount }}
          </div>
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-1">Ada {{ unsyncedCount }} Data Lokal</h3>
        <p class="text-xs text-slate-500 px-4">
          Terdapat sesi atau perubahan profil yang belum terkirim ke server utama.
        </p>
      </div>

      <!-- Tombol Sync -->
      <button @click="mulaiSync" :disabled="isSyncing"
              class="w-full max-w-xs text-white font-bold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
              :class="unsyncedCount > 0 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-teal-500 hover:bg-teal-600'">
        <LoaderIcon v-if="isSyncing" :size="20" class="animate-spin" />
        <UploadCloudIcon v-else :size="20" />
        {{ isSyncing ? 'Menyinkronkan...' : (unsyncedCount > 0 ? 'Mulai Sinkronisasi' : 'Sinkronkan Ulang') }}
      </button>

      <p class="text-[10px] font-medium text-slate-400 mt-4">Terakhir sync: {{ lastSyncLabel }}</p>

      <!-- Custom Checkbox (Sekarang tersedia untuk Terapis & Admin) -->
      <div class="w-full max-w-xs mt-6">
        <hr class="border-slate-200 mb-6">
        <label class="flex items-center gap-3 cursor-pointer group w-full bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-orange-200 hover:shadow-md">
          <div class="relative flex items-center justify-center w-6 h-6 rounded-lg border-2 bg-slate-50 transition-colors shrink-0"
               :class="autoSync ? 'border-orange-500' : 'border-slate-200 group-hover:border-orange-300'">
            <input type="checkbox" v-model="autoSync" @change="toggleAutoSync" class="peer sr-only">
            <div class="absolute inset-0 bg-orange-500 rounded-[6px] scale-0 peer-checked:scale-100 transition-transform duration-200 origin-center"></div>
            <CheckIcon class="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 z-10" stroke-width="3" />
          </div>
          <div class="text-left flex-1">
            <p class="text-xs font-bold text-slate-700 leading-tight mb-0.5">Sinkronisasi Otomatis</p>
            <p class="text-[9px] text-slate-400 leading-snug">Kirim data ke server otomatis setiap 24 jam di latar belakang.</p>
          </div>
        </label>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../db';
import { showToast } from '../composables/useToast';
import { 
  ArrowLeft as ArrowLeftIcon, CloudSync as CloudSyncIcon, 
  UploadCloud as UploadCloudIcon, Check as CheckIcon, Loader as LoaderIcon 
} from 'lucide-vue-next';

const currentId = localStorage.getItem('logged_in_id');
const API_URL = 'https://terapio.cahayaelektrik.com/api'; 

const unsyncedCount = ref(0);
const isSyncing = ref(false);
const autoSync = ref(false);
const lastSyncLabel = ref('Belum pernah');
let autoSyncTimer = null; // Timer untuk sinkronisasi otomatis

let dataToSync = {
  sessions: [],
  profile: null
};

onMounted(async () => {
  if (currentId) {
    autoSync.value = localStorage.getItem('auto_sync_24h') === 'true';
  }

  const lastSyncTime = localStorage.getItem('last_sync_time');
  if (lastSyncTime) {
    lastSyncLabel.value = new Date(parseInt(lastSyncTime)).toLocaleString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
  }

  await cekDataBelumSync();
  
  // Aktifkan Background Mode dan Jadwalkan Sync
  if (window.cordova && cordova.plugins && cordova.plugins.backgroundMode) {
    cordova.plugins.backgroundMode.enable();
  }
  
  jadwalkanSyncOtomatis();
});

// Penjadwal untuk jam 00:00
const jadwalkanSyncOtomatis = () => {
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0); // Set ke jam 00:00 hari berikutnya

  const delay = nextMidnight.getTime() - now.getTime();

  if (autoSyncTimer) clearTimeout(autoSyncTimer);
  
  autoSyncTimer = setTimeout(async () => {
    // Cek apakah fitur diaktifkan user
    if (localStorage.getItem('auto_sync_24h') === 'true') {
      console.log("Menjalankan sinkronisasi otomatis tengah malam...");
      await mulaiSync(true); // true = mode otomatis (tanpa alert)
    }
    // Jadwalkan untuk malam berikutnya
    jadwalkanSyncOtomatis();
  }, delay);
};

const cekDataBelumSync = async () => {
  if (!currentId) return;
  const allSessions = await db.sessions.where('therapist_id').equals(currentId).toArray();
  dataToSync.sessions = allSessions.filter(s => s._isDirty === true || s.is_synced === 0);
  
  const therapistData = await db.therapists.get(currentId);
  if (therapistData && therapistData._isDirty) {
    dataToSync.profile = therapistData;
  }
  unsyncedCount.value = dataToSync.sessions.length + (dataToSync.profile ? 1 : 0);
};

const toggleAutoSync = () => {
  localStorage.setItem('auto_sync_24h', autoSync.value);
  showToast(autoSync.value ? 'Sinkronisasi otomatis diaktifkan' : 'Sinkronisasi otomatis dimatikan', 'info');
};

const mulaiSync = async (isAuto = false) => {
  // Jika auto, jangan block UI dengan loader yang berlebihan
  if (!isAuto) isSyncing.value = true;
  
  try {
    // Refresh data terbaru sebelum dikirim
    await cekDataBelumSync();
    if (unsyncedCount.value === 0) return;

    const payload = {
      therapist_id: currentId,
      sessions: dataToSync.sessions,
      profile_update: dataToSync.profile ? { pin: dataToSync.profile.pin, avatar_url: dataToSync.profile.avatar_url } : null
    };

    const response = await fetch(`${API_URL}/sync_sessions.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === 'success') {
      for (const session of dataToSync.sessions) {
        await db.sessions.update(session.session_id, { _isDirty: false, is_synced: 1 });
      }
      if (dataToSync.profile) {
        await db.therapists.update(currentId, { _isDirty: false });
      }

      const now = Date.now();
      localStorage.setItem('last_sync_time', now.toString());
      lastSyncLabel.value = new Date(now).toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) + ' WIB';

      await cekDataBelumSync();
      if (!isAuto) showToast('Sinkronisasi berhasil!', 'success');
    } else {
      throw new Error(result.message || 'Server menolak data.');
    }
  } catch (error) {
    console.error("Sync Error:", error);
    if (!isAuto) showToast('Gagal sinkronisasi', 'error');
  } finally {
    if (!isAuto) isSyncing.value = false;
  }
};

onUnmounted(() => {
  if (autoSyncTimer) clearTimeout(autoSyncTimer);
});
</script>
