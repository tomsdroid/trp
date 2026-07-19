<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[70px]">
    <div class="bg-teal-600 text-white px-4 py-4 shadow-sm sticky top-0 z-20">
      <h1 class="text-lg font-bold text-center">Notifikasi Sistem</h1>
    </div>

    <div class="p-4 flex-1">
      <div v-if="notifikasiList.length > 0" class="space-y-3">
        <div v-for="(notif, index) in notifikasiList" :key="index" 
             @click="bukaDetail(notif)"
             class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-3 items-start transition-all cursor-pointer active:scale-[0.98]"
             :class="notif.isRead ? 'opacity-70 bg-slate-50/50' : 'opacity-100 hover:shadow-md'">
          
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
               :class="{
                 'bg-blue-50 text-blue-500': notif.type === 'info',
                 'bg-green-50 text-green-500': notif.type === 'success',
                 'bg-orange-50 text-orange-500': notif.type === 'warning'
               }">
            <BellIcon v-if="notif.type === 'info'" :size="18" />
            <CheckCircleIcon v-else-if="notif.type === 'success'" :size="18" />
            <AlertCircleIcon v-else :size="18" />
          </div>

          <div class="flex-1 overflow-hidden">
            <div class="flex justify-between items-start mb-1">
              <h3 class="text-sm font-bold text-slate-800 leading-tight truncate pr-2">{{ notif.title }}</h3>
              <span class="text-[9px] text-slate-400 font-medium whitespace-nowrap shrink-0">{{ notif.time }}</span>
            </div>
            <p class="text-[11px] text-slate-500 leading-snug line-clamp-2">{{ notif.message }}</p>
          </div>
          
          <div v-if="!notif.isRead" class="w-2 h-2 bg-red-500 rounded-full mt-1.5 shrink-0 shadow-sm shadow-red-500/50"></div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center pt-24 text-slate-400">
        <BellOffIcon :size="48" class="text-slate-200 mb-3" />
        <p class="text-sm font-bold text-slate-600">Belum Ada Notifikasi</p>
        <p class="text-[10px] text-slate-400 mt-1">Notifikasi dari admin akan muncul di sini.</p>
      </div>
    </div>

    <!-- MODAL DETAIL NOTIFIKASI -->
    <Transition name="fade">
      <div v-if="selectedNotif" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="tutupDetail"></div>
        <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-slide-up sm:animate-pop">
          <button @click="tutupDetail" class="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 rounded-full active:scale-90 transition-transform">
            <XIcon :size="18" />
          </button>

          <div class="flex items-center gap-3 mb-4 pr-10">
            <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                 :class="{
                   'bg-blue-50 text-blue-500': selectedNotif.type === 'info',
                   'bg-green-50 text-green-500': selectedNotif.type === 'success',
                   'bg-orange-50 text-orange-500': selectedNotif.type === 'warning'
                 }">
              <BellIcon v-if="selectedNotif.type === 'info'" :size="24" />
              <CheckCircleIcon v-else-if="selectedNotif.type === 'success'" :size="24" />
              <AlertCircleIcon v-else :size="24" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800 leading-tight">{{ selectedNotif.title }}</h3>
              <p class="text-[10px] text-slate-400 font-medium mt-0.5">{{ selectedNotif.time }}</p>
            </div>
          </div>
          
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-[50vh] overflow-y-auto">
            <p class="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{{ selectedNotif.message }}</p>
          </div>

          <button @click="tutupDetail" class="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl mt-6 text-sm active:scale-95 transition-transform shadow-sm">
            Tutup Pesan
          </button>
        </div>
      </div>
    </Transition>

    <BottomNav activeTab="notifikasi" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import BottomNav from '../components/BottomNav.vue';
import { 
  Bell as BellIcon, CheckCircle as CheckCircleIcon, 
  AlertCircle as AlertCircleIcon, BellOff as BellOffIcon, X as XIcon 
} from 'lucide-vue-next';

const API_URL = 'https://terapio.cahayaelektrik.com/api';
const loggedInId = localStorage.getItem('logged_in_id');

const selectedNotif = ref(null);
const notifikasiList = ref([]);
const isLoading = ref(true);

const fetchNotifikasi = async () => {
  try {
    const res = await fetch(`${API_URL}/get_notifikasi.php?therapist_id=${loggedInId}`);
    const result = await res.json();
    if (result.status === 'success') {
      const readNotifs = JSON.parse(localStorage.getItem('read_notif_ids') || '[]');
      
      // Petakan data API dengan status read dari local storage
      notifikasiList.value = result.data.map(notif => ({
        ...notif,
        isRead: readNotifs.includes(notif.id)
      }));
    }
  } catch (error) {
    console.error("Gagal mengambil notifikasi:", error);
  } finally {
    isLoading.value = false;
  }
};

const bukaDetail = (notif) => {
  notif.isRead = true; 
  selectedNotif.value = notif;
  
  const readNotifs = JSON.parse(localStorage.getItem('read_notif_ids') || '[]');
  if (!readNotifs.includes(notif.id)) {
    readNotifs.push(notif.id);
    localStorage.setItem('read_notif_ids', JSON.stringify(readNotifs));
    
    // Beritahu BottomNav agar mengurangi angka badge secara real-time
    window.dispatchEvent(new Event('notif-read'));
  }
};

const tutupDetail = () => {
  selectedNotif.value = null;
};

onMounted(() => {
  if (loggedInId) {
    fetchNotifikasi();
  } else {
    isLoading.value = false;
  }
  
  // Dengarkan sinyal OneSignal Foreground
  window.addEventListener('refresh-notif', fetchNotifikasi);
});

onUnmounted(() => {
  window.removeEventListener('refresh-notif', fetchNotifikasi);
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@media (min-width: 640px) {
  .sm\:animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
  @keyframes pop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
}
</style>
