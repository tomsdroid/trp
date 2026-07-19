<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[70px]">
    <div class="bg-teal-600 text-white px-4 py-3 shadow-sm sticky top-0 z-10 text-center">
      <h2 class="text-base font-bold">Akun Saya</h2>
    </div>

    <div class="px-4 py-6 flex-1">
      
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

        <button @click="$router.push('/sync')" class="w-full flex items-center gap-3 p-4 border-b border-slate-50 active:bg-slate-50 transition-colors">
          <div class="bg-orange-50 p-2 rounded-lg text-orange-500"><CloudSyncIcon :size="18" /></div>
          <div class="text-left flex-1">
            <p class="text-sm font-bold text-slate-700">Cadangkan Data</p>
            <p class="text-[10px] text-slate-400">Kirim log offline ke server</p>
          </div>
          <ChevronRightIcon :size="16" class="text-slate-300" />
        </button>

        <button @click="$router.push('/backup')" class="w-full flex items-center gap-3 p-4 active:bg-slate-50 transition-colors">
          <div class="bg-pink-50 p-2 rounded-lg text-pink-500"><DatabaseBackupIcon :size="18" /></div>
          <div class="text-left flex-1">
            <p class="text-sm font-bold text-slate-700">Backup & Restore</p>
            <p class="text-[10px] text-slate-400">Amankan data ke memori perangkat</p>
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
  CloudSync as CloudSyncIcon, LogOut as LogOutIcon, Trash2 as Trash2Icon,
  UserCog as UserCogIcon, Fingerprint as FingerprintIcon,
  DatabaseBackup as DatabaseBackupIcon
} from 'lucide-vue-next';

const router = useRouter();
const profil = ref({ fullname: 'Memuat...', therapist_id: '', branch: '', area: '', position: '' });
const avatarUrl = ref(null);
const useBiometrics = ref(false);

onMounted(async () => {
  const currentId = localStorage.getItem('logged_in_id');
  if (currentId) {
    const data = await db.therapists.get(currentId);
    if (data) {
      profil.value = data;
      avatarUrl.value = data.avatar_url || data.avatarUrl || null;
    }
  }
  const bioPref = localStorage.getItem('use_biometrics');
  if (bioPref === 'true') useBiometrics.value = true;
});

const logout = () => {
  showConfirm(
    'Keluar Sesi',
    'Apakah Anda yakin ingin keluar dari akun ini?',
    () => {
      localStorage.removeItem('logged_in_id');
      router.replace('/login');
      showToast('Berhasil logout!', 'success');
    }
  );
};

const resetAplikasi = async () => {
  showConfirm(
    'Reset Aplikasi',
    'PERHATIAN! Semua data akan dihapus permanen. Lanjutkan?',
    async () => {
      try {
        await db.delete();
        localStorage.clear();
        showToast('Aplikasi telah di-reset', 'success');
        setTimeout(() => window.location.href = '/', 1000);
      } catch (error) {
        showToast('Gagal mereset data', 'error');
      }
    }
  );
};
</script>
