<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[90px]">
    <!-- Header Admin -->
    <div class="bg-teal-600 px-4 py-5 shadow-sm text-white sticky top-0 z-20 flex items-center gap-3">
      <button @click="$router.push('/dashboard')" class="p-2 -ml-2 bg-teal-700/50 rounded-full active:scale-95 transition-transform">
        <ArrowLeftIcon :size="20" />
      </button>
      <div>
        <h1 class="text-lg font-bold leading-tight">Rekap Laporan</h1>
        <p class="text-[10px] text-teal-100 font-medium">Laporan Kinerja Harian</p>
      </div>
    </div>

    <div class="p-4 space-y-4">
      <!-- Filter -->
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <select v-model="filter.branch" class="bg-slate-50 p-3 rounded-xl text-xs font-bold w-full outline-none focus:border-teal-500 border border-transparent">
            <option value="ALL">Semua Cabang</option>
            <option v-for="b in branchList" :key="b.id" :value="b.name">{{ b.name }}</option>
          </select>
          <input v-model="filter.date" type="date" class="bg-slate-50 p-3 rounded-xl text-xs font-bold w-full outline-none focus:border-teal-500 border border-transparent">
        </div>
        <button @click="loadLaporan" class="w-full bg-teal-600 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-all shadow-md">
          Tampilkan Laporan
        </button>
      </div>

      <!-- Hasil -->
      <div v-if="laporanList.length > 0" class="space-y-3">
        <div v-for="l in laporanList" :key="l.shortname" class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
          
          <div class="flex-1 overflow-hidden">
            <p class="font-bold text-slate-800 text-sm truncate">{{ l.shortname }}</p>
            <p class="text-[10px] text-slate-500 mb-2 truncate">{{ l.area }} • {{ l.branch }}</p>
            
            <!-- Detail Kategori (R, U, PN) -->
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold border border-blue-100">
                R: {{ l.total_req }}
              </span>
              <span class="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-bold border border-purple-100">
                U: {{ l.total_urt }}
              </span>
              <span class="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded font-bold border border-orange-100">
                PN: {{ l.total_pn }}
              </span>
            </div>
          </div>

          <div class="text-right shrink-0 ml-4">
            <p class="text-xs font-bold text-slate-500">{{ l.total_sesi }} Sesi</p>
            <p class="text-sm font-extrabold text-teal-600 mt-1">Rp {{ (l.total_komisi || 0).toLocaleString('id-ID') }}</p>
          </div>
          
        </div>
      </div>
      
      <div v-else-if="!isLoading" class="text-center py-10 text-slate-400 text-xs font-medium">
        Data tidak ditemukan untuk tanggal tersebut.
      </div>
      <div v-else class="text-center py-10 text-slate-400 text-xs font-medium">
        Memuat data...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-vue-next';

const API_URL = 'https://terapio.cahayaelektrik.com/api';
const branchList = ref([]);
const laporanList = ref([]);
const isLoading = ref(false);

const filter = ref({ 
  branch: 'ALL', 
  date: new Date().toLocaleDateString('en-CA') 
});

const loadMaster = async () => {
  try {
    const res = await fetch(`${API_URL}/get_master.php`);
    const result = await res.json();
    if (result.status === 'success') {
      branchList.value = result.data.branches;
    }
  } catch (error) {
    console.error("Gagal load master:", error);
  }
};

const loadLaporan = async () => {
  isLoading.value = true;
  try {
    const res = await fetch(`${API_URL}/get_laporan.php?branch=${filter.value.branch}&date=${filter.value.date}`);
    const result = await res.json();
    if (result.status === 'success') {
      laporanList.value = result.data;
    } else {
      laporanList.value = [];
    }
  } catch (e) { 
    alert("Gagal memuat laporan dari server."); 
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => { 
  await loadMaster(); 
  await loadLaporan(); 
});
</script>
