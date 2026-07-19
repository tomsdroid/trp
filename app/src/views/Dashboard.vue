<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[70px]">
    
    <div class="bg-teal-600 px-4 pt-6 pb-12 rounded-b-[2rem] shadow-sm text-white relative z-0">
      <div class="flex justify-between items-center mb-2">
        <div class="flex-1 overflow-hidden">
          <p class="text-[10px] text-teal-100 uppercase tracking-widest font-bold mb-0.5">
            Selamat Bekerja, 
            <span v-if="activeRole === 'admin'" class="bg-orange-500 text-white px-2 py-0.5 rounded-full ml-1 text-[8px]">Mode Admin</span>
          </p>
          <h2 class="text-xl font-extrabold truncate pr-4">{{ terapisName }}</h2>
        </div>
        
        <div @click="$router.push('/settings')" class="w-12 h-12 rounded-full border-2 border-white/30 shadow-md shrink-0 overflow-hidden bg-teal-500 cursor-pointer active:scale-95 transition-transform">
          <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover" alt="Profile">
          <div v-else class="w-full h-full flex items-center justify-center">
            <UserIcon :size="24" class="text-white" />
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 -mt-8 relative z-10 mb-6">
      <div class="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 grid grid-cols-2 divide-x divide-slate-100">
        <div class="pr-3 flex flex-col justify-center">
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sesi Hari Ini</p>
          <div class="flex items-center gap-2">
            <p class="text-3xl font-extrabold text-teal-600 leading-none">{{ sesiHariIni }}</p>
            <span class="text-[10px] text-slate-400 font-medium leading-tight">Klien<br>Selesai</span>
          </div>
        </div>
        <div class="pl-4 flex flex-col justify-center">
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Komisi Periode Ini</p>
          <p class="text-sm font-extrabold text-green-600 truncate mt-1">
            Rp {{ totalKomisi.toLocaleString('id-ID') }}
          </p>
          <p class="text-[8px] text-slate-400 mt-0.5">{{ labelPeriode }}</p>
        </div>
      </div>
    </div>

    <div class="p-4 bg-white mx-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <div class="grid grid-cols-4 gap-y-5 gap-x-2">
        
        <template v-if="activeRole === 'admin'">
          <button @click="$router.push('/admin/broadcast')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm border border-purple-100"><MegaphoneIcon :size="24" /></div>
            <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Buat<br>Pengumuman</span>
          </button>
          <button @click="$router.push('/admin/laporan')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100"><FileTextIcon :size="24" /></div>
            <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Rekap<br>Laporan</span>
          </button>
          <button @click="$router.push('/admin/layanan')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shadow-sm border border-orange-100"><ClipboardListIcon :size="24" /></div>
            <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Kelola<br>Layanan</span>
          </button>
          <button @click="$router.push('/admin/cabang')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-sm border border-teal-100"><StoreIcon :size="24" /></div>
            <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Kelola<br>Cabang</span>
          </button>
          <button @click="$router.push('/admin/area')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-100"><MapPinIcon :size="24" /></div>
            <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Kelola<br>Area</span>
          </button>
          <button @click="$router.push('/admin/terapis')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center shadow-sm border border-pink-100"><UsersIcon :size="24" /></div>
            <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Data<br>Terapis</span>
          </button>
        </template>

        <template v-else>
          <button @click="$router.push('/input')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-sm border border-teal-100"><FilePlusIcon :size="24" /></div>
            <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Input<br>Sesi</span>
          </button>
          <button @click="$router.push('/history')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-sm border border-teal-100"><HistoryIcon :size="24" /></div>
            <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Riwayat<br>Log</span>
          </button>
          <button @click="$router.push('/peringkat')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center shadow-sm border border-yellow-100"><TrophyIcon :size="24" /></div>
            <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Peringkat<br>Terapis</span>
          </button>
          <button @click="$router.push('/komisi')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm border border-green-100"><WalletIcon :size="24" /></div>
            <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Estimasi<br>Komisi</span>
          </button>
          <button @click="$router.push('/laporan')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100"><PieChartIcon :size="24" /></div>
            <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Laporan<br>Kerja</span>
          </button>
          
          <button @click="$router.push('/feedback')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm border border-amber-100"><MessageSquareIcon :size="24" /></div>
            <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Kritik &<br>Saran</span>
          </button>
        </template>

        <button @click="$router.push('/settings')" class="flex flex-col items-center justify-start gap-1.5 active:scale-95 transition-transform">
          <div class="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200"><SettingsIcon :size="24" /></div>
          <span class="text-[9px] font-bold text-slate-700 text-center leading-tight">Setting</span>
        </button>
      </div>
    </div>

    <div class="mx-4 mb-6 bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-4 flex items-center justify-between shadow-md relative overflow-hidden">
      <div class="relative z-10 text-white">
        <h3 class="text-sm font-bold mb-1">Butuh Bantuan?</h3>
        <p class="text-[10px] text-sky-100 max-w-[160px] leading-snug">Tim support kami siap membantu.</p>
      </div>
      <button @click="$router.push('/bantuan')" class="relative z-10 bg-white text-sky-700 text-[11px] font-bold px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-transform">Hubungi</button>
    </div>

    <!-- App Info / Credit -->
    <div class="text-center mt-8 mb-2">
        <p class="text-[10px] font-bold text-slate-400 tracking-wider">TERAPIO v1.3.8</p>
        <p class="text-[9px] text-slate-400 mt-1">© 2026 Terapio. Dibuat dengan <span class="text-red-400">❤</span> untuk Terapis</p>
      </div>

    <BottomNav activeTab="home" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../db';
import BottomNav from '../components/BottomNav.vue';

import { 
  User as UserIcon, FilePlus as FilePlusIcon, History as HistoryIcon, PieChart as PieChartIcon,
  Wallet as WalletIcon, Settings as SettingsIcon,
  Store as StoreIcon, ClipboardList as ClipboardListIcon, Users as UsersIcon, FileText as FileTextIcon, 
  MapPin as MapPinIcon, Trophy as TrophyIcon, MessageSquare as MessageSquareIcon, Megaphone as MegaphoneIcon
} from 'lucide-vue-next';

const router = useRouter();
const terapisName = ref('Memuat...');
const avatarUrl = ref(null);
const sesiHariIni = ref(0);
const totalKomisi = ref(0);
const labelPeriode = ref('');
const activeRole = ref(localStorage.getItem('active_role') || 'terapis');

const getPeriodeAktif = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const date = dateObj.getDate();
  let start, end;
  if (date <= 18) { start = new Date(year, month - 1, 19); end = new Date(year, month, 18, 23, 59, 59); }
  else { start = new Date(year, month, 19); end = new Date(year, month + 1, 18, 23, 59, 59); }
  return { startText: start.toISOString().split('T')[0], endText: end.toISOString().split('T')[0], label: `${start.toLocaleDateString('id-ID', {day:'numeric', month:'short'})} - ${end.toLocaleDateString('id-ID', {day:'numeric', month:'short'})}` };
};

onMounted(async () => {
  const currentId = localStorage.getItem('logged_in_id');
  if (!currentId) { router.replace('/login'); return; }
  
  const data = await db.therapists.get(currentId);
  if (data) {
    terapisName.value = data.fullname || data.shortname || 'Terapis';
    avatarUrl.value = data.avatar_url || data.avatarUrl || null;
  }
  
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const allSessions = await db.sessions.where('therapist_id').equals(currentId).toArray();
  sesiHariIni.value = allSessions.filter(s => s.date === dateStr).length;
  
  const periode = getPeriodeAktif(now);
  labelPeriode.value = periode.label;
  const sesiPeriode = allSessions.filter(s => s.date >= periode.startText && s.date <= periode.endText);
  totalKomisi.value = sesiPeriode.reduce((acc, s) => acc + (s.komisi || 0), 0);
});
</script>
