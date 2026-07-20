<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[70px]">
    <div class="bg-teal-600 text-white px-4 py-3 shadow-sm sticky top-0 z-10 text-center">
      <h2 class="text-base font-bold">Akun Saya</h2>
    </div>

    <div class="px-4 py-6 flex-1">
      
      <!-- HEADER PROFIL -->
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4 flex items-center gap-4">
        <div class="w-14 h-14 bg-teal-100 rounded-full border-2 border-teal-500 flex items-center justify-center shrink-0 overflow-hidden">
          <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover" alt="Avatar">
          <UserIcon v-else :size="28" class="text-teal-600" />
        </div>
        
        <div class="flex-1 overflow-hidden">
          <h2 class="text-sm font-bold text-slate-800 truncate">
            {{ profil.fullname }}
          </h2>
          <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{{ profil.therapist_id }}</p>
          <div class="mt-1 flex gap-2">
            <span class="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full">{{ profil.position }} {{ profil.branch }} {{ profil.area }}</span>
          </div>
        </div>
      </div>

      <!-- DAFTAR MENU -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        
        <button @click="$router.push('/edit-profil')" class="w-full flex items-center gap-3 p-4 border-b border-slate-50 active:bg-slate-50 transition-colors">
          <div class="bg-blue-50 p-2 rounded-lg text-blue-600"><UserCogIcon :size="18" /></div>
          <div class="text-left flex-1">
            <p class="text-sm font-bold text-slate-700">Edit Profil</p>
            <p class="text-[10px] text-slate-400">Ubah data diri dan kontak</p>
          </div>
          <ChevronRightIcon :size="16" class="text-slate-300" />
        </button>

        <button @click="$router.push('/ubah-pin')" class="w-full flex items-center gap-3 p-4 border-b border-slate-50 active:bg-slate-50 transition-colors">
          <div class="bg-teal-50 p-2 rounded-lg text-teal-600"><LockIcon :size="18" /></div>
          <div class="text-left flex-1">
            <p class="text-sm font-bold text-slate-700">Ubah PIN Keamanan</p>
            <p class="text-[10px] text-slate-400">Perbarui PIN login aplikasi Anda</p>
          </div>
          <ChevronRightIcon :size="16" class="text-slate-300" />
        </button>

        <!-- MENU TENTANG APLIKASI -->
        <button @click="showAboutModal = true" class="w-full flex items-center gap-3 p-4 active:bg-slate-50 transition-colors">
          <div class="bg-indigo-50 p-2 rounded-lg text-indigo-500"><InfoIcon :size="18" /></div>
          <div class="text-left flex-1">
            <p class="text-sm font-bold text-slate-700">Tentang Aplikasi</p>
            <p class="text-[10px] text-slate-400">Versi aplikasi dan informasi sistem</p>
          </div>
          <ChevronRightIcon :size="16" class="text-slate-300" />
        </button>

      </div>

      <button @click="logout" class="w-full bg-white border border-red-200 text-red-500 hover:bg-red-50 active:scale-95 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 mb-3 shadow-sm">
        <LogOutIcon :size="18" /> Keluar Sesi (Logout)
      </button>

      <button @click="resetAplikasi" class="w-full bg-red-50 text-red-600 active:scale-95 font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-red-100 border-dashed">
        <Trash2Icon :size="16" /> Hapus Data Lokal & Reset
      </button>

      <AppCredit />
      
    </div>

    <!-- POPUP TENTANG APLIKASI -->
    <div v-if="showAboutModal" class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden">
        <div class="p-6 text-center">
          <div class="w-20 h-20 bg-gradient-to-tr from-teal-500 to-teal-400 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 border-4 border-teal-50">
            <span class="text-4xl font-extrabold tracking-tighter">T</span>
          </div>
          
          <h3 class="text-xl font-black text-slate-800">Theralog</h3>
          <p class="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full inline-block mt-1 mb-4">
            {{ appVersion }}
          </p>
          
          <p class="text-[11px] text-slate-500 leading-relaxed">
            Sistem Informasi Manajemen Terapis terintegrasi. Dirancang khusus untuk mempermudah pencatatan sesi dan perhitungan performa secara real-time.
          </p>
        </div>
        
        <div class="bg-slate-50 p-4 border-t border-slate-100">
          <button @click="showAboutModal = false" class="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm">
            Tutup
          </button>
        </div>
      </div>
    </div>

    <BottomNav activeTab="settings" />
  </div>
</template>

<script setup>
import { showConfirm } from '../composables/useConfirm';
import { showToast } from '../composables/useToast';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../db';
import BottomNav from '../components/BottomNav.vue';
import AppCredit from '../components/AppCredit.vue';

import { 
  User as UserIcon, Lock as LockIcon, ChevronRight as ChevronRightIcon,
  LogOut as LogOutIcon, Trash2 as Trash2Icon, UserCog as UserCogIcon, 
  Info as InfoIcon
} from 'lucide-vue-next';

const router = useRouter();
const profil = ref({ fullname: 'Memuat...', therapist_id: '', branch: '', area: '', position: '' });
const avatarUrl = ref(null);
const showAboutModal = ref(false);
const appVersion = ref('Memuat versi...');

onMounted(async () => {
  const currentId = localStorage.getItem('logged_in_id');
  if (currentId) {
    const semuaTerapis = await db.therapists.toArray();
    const data = semuaTerapis.find(t => t.therapist_id == currentId);
    if (data) {
      profil.value = data;
      avatarUrl.value = data.avatar_url || data.avatarUrl || null;
    }
  }

  // Fetch versi dari GitHub
  try {
    const response = await fetch('https://api.github.com/repos/tomsdroid/trp/releases/latest');
    const data = await response.json();
    if (data.tag_name) {
      appVersion.value = 'Versi ' + data.tag_name;
    } else {
      appVersion.value = 'Versi 1.0.0';
    }
  } catch (e) {
    appVersion.value = 'Versi 1.0.0';
  }
});

const logout = () => {
  showConfirm('Keluar Sesi', 'Apakah Anda yakin ingin keluar?', () => {
    localStorage.removeItem('logged_in_id');
    router.replace('/login');
    showToast('Berhasil logout!', 'success');
  });
};

const resetAplikasi = async () => {
  showConfirm('Reset Aplikasi', 'Semua data akan dihapus permanen. Lanjutkan?', async () => {
    try {
      await db.delete();
      localStorage.clear();
      showToast('Aplikasi telah di-reset', 'success');
      setTimeout(() => window.location.href = '/', 1000);
    } catch (error) {
      showToast('Gagal mereset data', 'error');
    }
  });
};
</script>
