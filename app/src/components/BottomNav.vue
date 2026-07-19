<template>
  <div class="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-around px-2 py-2.5 z-50">
    
    <button @click="$router.push('/dashboard')" 
            :class="activeTab === 'home' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'" 
            class="flex flex-col items-center justify-center w-16 active:scale-90 transition-transform">
      <HomeIcon :size="22" :stroke-width="activeTab === 'home' ? 2.5 : 2" />
      <span class="text-[9px] mt-1" :class="activeTab === 'home' ? 'font-bold' : 'font-medium'">Beranda</span>
    </button>
    
    <button @click="$router.push('/notifikasi')" 
            :class="activeTab === 'notifikasi' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'" 
            class="flex flex-col items-center justify-center w-16 active:scale-90 transition-transform relative">
      <BellIcon :size="22" :stroke-width="activeTab === 'notifikasi' ? 2.5 : 2" />
      
      <!-- Badge Angka Notifikasi -->
      <span v-if="unreadCount > 0" 
            class="absolute top-0 right-2 w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center text-white text-[8px] font-bold shadow-sm">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
      
      <span class="text-[9px] mt-1" :class="activeTab === 'notifikasi' ? 'font-bold' : 'font-medium'">Notifikasi</span>
    </button>
    
    <button @click="$router.push('/settings')" 
            :class="activeTab === 'settings' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'" 
            class="flex flex-col items-center justify-center w-16 active:scale-90 transition-transform">
      <UserCircleIcon :size="22" :stroke-width="activeTab === 'settings' ? 2.5 : 2" />
      <span class="text-[9px] mt-1" :class="activeTab === 'settings' ? 'font-bold' : 'font-medium'">Akun</span>
    </button>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Home as HomeIcon, Bell as BellIcon, UserCircle as UserCircleIcon } from 'lucide-vue-next';

defineProps({
  activeTab: { type: String, default: 'home' }
});

const API_URL = 'https://terapio.cahayaelektrik.com/api';
const unreadCount = ref(0);

const getUnreadCount = async () => {
  const currentId = localStorage.getItem('logged_in_id');
  if (!currentId) return;

  try {
    const res = await fetch(`${API_URL}/get_notifikasi.php?therapist_id=${currentId}`);
    const result = await res.json();
    
    if (result.status === 'success') {
      const readNotifs = JSON.parse(localStorage.getItem('read_notif_ids') || '[]');
      const unread = result.data.filter(notif => !readNotifs.includes(notif.id));
      unreadCount.value = unread.length;
    }
  } catch (error) {
    console.error("Gagal get notif count:", error);
  }
};

onMounted(() => {
  getUnreadCount();
  
  // Dengarkan sinyal OneSignal dan event dari halaman notifikasi
  window.addEventListener('refresh-notif', getUnreadCount);
  window.addEventListener('notif-read', getUnreadCount);
});

onUnmounted(() => {
  window.removeEventListener('refresh-notif', getUnreadCount);
  window.removeEventListener('notif-read', getUnreadCount);
});
</script>
