<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[70px]">
    
    <!-- Header -->
    <div class="bg-yellow-500 text-white px-4 py-3 shadow-sm sticky top-0 z-20 flex items-center">
      <button @click="$router.push('/dashboard')" class="mr-3 active:scale-90 transition-transform">
        <ArrowLeftIcon :size="20" />
      </button>
      <div class="flex-1">
        <h2 class="text-base font-bold leading-tight">Peringkat Terapis</h2>
        <p class="text-[10px] text-yellow-100 font-medium mt-0.5">Berdasarkan Periode Berjalan</p>
      </div>
    </div>

    <!-- Status Loading / Kosong -->
    <div v-if="isLoading" class="text-center py-10 text-slate-400 font-bold text-xs flex-1">
      Memuat peringkat...
    </div>
    <div v-else-if="peringkatList.length === 0" class="text-center py-10 text-slate-400 font-bold text-xs flex-1">
      Belum ada sesi di periode ini.
    </div>

    <!-- Konten Utama Peringkat -->
    <template v-else>
      <!-- Podium (Top 3) -->
      <div class="bg-yellow-500 px-4 pb-8 pt-4 rounded-b-[1.5rem] shadow-sm flex items-end justify-center gap-3 relative z-10">
        
        <!-- Juara 2 -->
        <div v-if="peringkatList[1]" class="flex flex-col items-center">
          <div class="w-10 h-10 bg-white/20 rounded-full mb-1 flex items-center justify-center text-white font-bold text-xs shadow-inner">2</div>
          <p class="text-[10px] text-white font-bold">{{ peringkatList[1].shortname }}</p>
          <p class="text-[9px] text-yellow-100 font-medium -mt-0.5">{{ peringkatList[1].total_sesi }} Sesi</p>
          <div class="w-16 h-12 bg-white/10 rounded-t-lg mt-1 relative overflow-hidden">
            <div v-if="peringkatList[1].therapist_id === loggedInId" class="absolute inset-0 bg-white/20"></div>
          </div>
          <!-- Label Kamu -->
          <span v-if="peringkatList[1].therapist_id === loggedInId" class="bg-white text-yellow-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full absolute -bottom-2">Kamu</span>
        </div>

        <!-- Juara 1 -->
        <div v-if="peringkatList[0]" class="flex flex-col items-center z-10 mx-1">
          <TrophyIcon :size="24" class="text-yellow-200 mb-1" />
          <div class="w-14 h-14 bg-white rounded-full border-4 border-yellow-300 mb-1 flex items-center justify-center shadow-lg overflow-hidden">
             <!-- Jika ada avatar, tampilkan avatar. Jika tidak, angka 1 -->
             <img v-if="peringkatList[0].avatarUrl" :src="peringkatList[0].avatarUrl" class="w-full h-full object-cover">
             <span v-else class="text-yellow-500 font-extrabold text-xl">1</span>
          </div>
          <p class="text-xs text-white font-extrabold">{{ peringkatList[0].shortname }}</p>
          <p class="text-[10px] text-yellow-100 font-bold -mt-0.5">{{ peringkatList[0].total_sesi }} Sesi</p>
          <div class="w-20 h-16 bg-white/20 rounded-t-lg mt-1 relative overflow-hidden">
            <div v-if="peringkatList[0].therapist_id === loggedInId" class="absolute inset-0 bg-white/30"></div>
          </div>
          <!-- Label Kamu -->
          <span v-if="peringkatList[0].therapist_id === loggedInId" class="bg-white text-yellow-600 text-[9px] font-bold px-2 py-0.5 rounded-full absolute -bottom-2">Kamu</span>
        </div>

        <!-- Juara 3 -->
        <div v-if="peringkatList[2]" class="flex flex-col items-center">
          <div class="w-10 h-10 bg-white/20 rounded-full mb-1 flex items-center justify-center text-white font-bold text-xs shadow-inner">3</div>
          <p class="text-[10px] text-white font-bold">{{ peringkatList[2].shortname }}</p>
          <p class="text-[9px] text-yellow-100 font-medium -mt-0.5">{{ peringkatList[2].total_sesi }} Sesi</p>
          <div class="w-16 h-8 bg-white/10 rounded-t-lg mt-1 relative overflow-hidden">
            <div v-if="peringkatList[2].therapist_id === loggedInId" class="absolute inset-0 bg-white/20"></div>
          </div>
          <!-- Label Kamu -->
          <span v-if="peringkatList[2].therapist_id === loggedInId" class="bg-white text-yellow-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full absolute -bottom-2">Kamu</span>
        </div>

      </div>

      <!-- List Peringkat Lanjutan (Ranking 4 ke atas) -->
      <div class="p-4 flex-1 -mt-4 relative z-0">
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          
          <div v-for="(p, index) in peringkatList.slice(3)" :key="p.therapist_id" 
               class="flex items-center justify-between p-3 border-b border-slate-50 last:border-b-0"
               :class="{'bg-yellow-50/50': p.therapist_id === loggedInId}">
            
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-slate-400 w-4 text-center">{{ index + 4 }}</span>
              <div class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold overflow-hidden text-[10px]">
                <img v-if="p.avatarUrl" :src="p.avatarUrl" class="w-full h-full object-cover">
                <span v-else>{{ p.shortname.charAt(0).toUpperCase() }}</span>
              </div>
              <p class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                {{ p.shortname }}
                <span v-if="p.therapist_id === loggedInId" class="text-[8px] bg-yellow-500 text-white px-1 py-0.5 rounded uppercase font-bold">Kamu</span>
              </p>
            </div>
            
            <span class="text-[10px] text-slate-500 font-bold">{{ p.total_sesi }} Sesi</span>
          </div>

        </div>
      </div>
    </template>
  <AppCredit />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ArrowLeft as ArrowLeftIcon, Trophy as TrophyIcon } from 'lucide-vue-next';
import AppCredit from '../components/AppCredit.vue';

// Ganti URL ini dengan domain API kamu jika perlu
const API_URL = 'https://terapio.cahayaelektrik.com/api'; 
const peringkatList = ref([]);
const isLoading = ref(false);
const loggedInId = localStorage.getItem('logged_in_id');

// Mendapatkan rentang tanggal periode gaji aktif (tgl 19 s/d 18)
const getPeriodeAktif = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  
  let start, end;
  if (date <= 18) {
    start = new Date(year, month - 1, 19);
    end = new Date(year, month, 18, 23, 59, 59);
  } else {
    start = new Date(year, month, 19);
    end = new Date(year, month + 1, 18, 23, 59, 59);
  }

  const formatTanggal = (d) => {
    const tzDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return tzDate.toISOString().split('T')[0];
  };

  return { start: formatTanggal(start), end: formatTanggal(end) };
};

// Mengambil data dari API berdasarkan rentang periode saja
const loadPeringkat = async () => {
  isLoading.value = true;
  
  const periode = getPeriodeAktif();
  const start_date = periode.start;
  const end_date = periode.end;

  try {
    const res = await fetch(`${API_URL}/get_peringkat.php?start_date=${start_date}&end_date=${end_date}`);
    const result = await res.json();
    if (result.status === 'success') {
      peringkatList.value = result.data;
    } else {
      peringkatList.value = [];
    }
  } catch (error) {
    console.error("Gagal load peringkat:", error);
    peringkatList.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadPeringkat();
});
</script>
