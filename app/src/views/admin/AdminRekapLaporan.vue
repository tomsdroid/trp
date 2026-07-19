<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-10">
    
    <!-- Header Admin (Tema Biru) -->
    <div class="bg-blue-600 px-4 py-5 shadow-sm text-white sticky top-0 z-20 flex items-center gap-3">
      <button @click="$router.push('/dashboard')" class="p-2 -ml-2 bg-blue-700/50 rounded-full shrink-0 active:scale-95 transition-transform">
        <ArrowLeftIcon :size="20" />
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-lg font-bold leading-tight truncate">Rekap Laporan</h1>
        <p class="text-[10px] text-blue-100 font-medium truncate">Pantau Kinerja & Komisi</p>
      </div>
      <button @click="downloadCSV" class="p-2 bg-blue-700/50 rounded-full shrink-0 active:scale-95 transition-transform" title="Export CSV">
        <DownloadIcon :size="18" />
      </button>
    </div>

    <div class="p-4 flex-1">
      
      <!-- ===================================== -->
      <!-- KOTAK FILTER PENCARIAN -->
      <!-- ===================================== -->
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-5">
        <div class="flex items-center gap-2 mb-4 text-blue-600">
          <FilterIcon :size="16" stroke-width="3" />
          <h3 class="text-xs font-bold uppercase tracking-wider">Filter Data</h3>
        </div>
        
        <form @submit.prevent="ambilDataLaporan" class="space-y-3">
          <!-- Rentang Tanggal -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-bold text-slate-500 mb-1 block">Dari Tanggal</label>
              <input v-model="filter.startDate" type="date" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-500 mb-1 block">Sampai Tanggal</label>
              <input v-model="filter.endDate" type="date" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500">
            </div>
          </div>

          <!-- Pilihan Terapis & Cabang -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-bold text-slate-500 mb-1 block">Terapis</label>
              <select v-model="filter.therapist_id" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500">
                <option value="ALL">Semua Terapis</option>
                <option v-for="t in listTerapis" :key="t.therapist_id" :value="t.therapist_id">{{ t.shortname }}</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-500 mb-1 block">Cabang</label>
              <select v-model="filter.branch" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500">
                <option value="ALL">Semua Cabang</option>
                <option value="STANDARD">Amarta / Refleksi</option>
                <option value="RUMAH_SPA">Rumah Spa</option>
              </select>
            </div>
          </div>

          <button type="submit" :disabled="isLoading" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-all shadow-md mt-2 flex items-center justify-center gap-2">
            <SearchIcon v-if="!isLoading" :size="16" />
            <LoaderIcon v-else :size="16" class="animate-spin" />
            {{ isLoading ? 'Memuat Data...' : 'Tampilkan Laporan' }}
          </button>
        </form>
      </div>

      <!-- ===================================== -->
      <!-- KARTU RINGKASAN (SUMMARY KPI) -->
      <!-- ===================================== -->
      <div v-if="laporanList.length > 0" class="grid grid-cols-2 gap-3 mb-5">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl text-white shadow-md shadow-blue-500/30">
          <div class="w-8 h-8 bg-blue-400/30 rounded-full flex items-center justify-center mb-2">
            <ActivityIcon :size="16" />
          </div>
          <p class="text-[10px] font-medium text-blue-100 uppercase tracking-wider">Total Sesi</p>
          <h3 class="text-xl font-extrabold">{{ ringkasan.totalSesi }}</h3>
        </div>
        
        <div class="bg-gradient-to-br from-teal-500 to-teal-600 p-4 rounded-2xl text-white shadow-md shadow-teal-500/30">
          <div class="w-8 h-8 bg-teal-400/30 rounded-full flex items-center justify-center mb-2">
            <DollarSignIcon :size="16" />
          </div>
          <p class="text-[10px] font-medium text-teal-100 uppercase tracking-wider">Total Komisi</p>
          <h3 class="text-lg font-extrabold">Rp {{ ringkasan.totalKomisi.toLocaleString('id-ID') }}</h3>
        </div>
      </div>

      <!-- ===================================== -->
      <!-- HASIL DATA LAPORAN -->
      <!-- ===================================== -->
      <div v-if="isLoading" class="text-center py-10">
        <div class="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-xs font-bold text-slate-500">Mengambil data dari server...</p>
      </div>

      <div v-else-if="laporanList.length === 0 && pencarianAktif" class="text-center py-10 bg-white rounded-2xl border border-slate-100">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
          <FileXIcon :size="32" />
        </div>
        <p class="text-sm font-bold text-slate-600">Data Tidak Ditemukan</p>
        <p class="text-xs text-slate-400 mt-1">Ubah filter pencarian Anda.</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="(item, index) in laporanList" :key="index" class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex gap-3 items-center">
          
          <div class="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
            {{ index + 1 }}
          </div>
          
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-slate-800 text-sm truncate flex justify-between items-center">
              <span>{{ item.service_name || 'Layanan Kustom' }}</span>
              <span class="text-xs font-extrabold text-teal-600 shrink-0 ml-2">Rp {{ Number(item.komisi).toLocaleString('id-ID') }}</span>
            </h4>
            
            <div class="flex flex-wrap items-center gap-1.5 mt-1">
              <span class="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded truncate">
                <UserIcon :size="10" class="inline mb-0.5" /> {{ namaTerapis(item.therapist_id) }}
              </span>
              <span class="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">
                <CalendarIcon :size="10" class="inline mb-0.5" /> {{ item.date }}
              </span>
              <span v-if="item.branch" class="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded shrink-0">
                Cab: {{ item.branch }}
              </span>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { db } from '../../db';
import { 
  ArrowLeft as ArrowLeftIcon, Filter as FilterIcon, Search as SearchIcon, 
  Loader as LoaderIcon, FileX as FileXIcon, Activity as ActivityIcon, 
  DollarSign as DollarSignIcon, User as UserIcon, Calendar as CalendarIcon,
  Download as DownloadIcon 
} from 'lucide-vue-next';
import { showToast } from '../../composables/useToast';

const API_URL = 'https://terapio.cahayaelektrik.com/api';

// State Form Filter (Bawaan bulan ini)
const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

const filter = ref({
  startDate: firstDay,
  endDate: lastDay,
  therapist_id: 'ALL',
  branch: 'ALL'
});

const listTerapis = ref([]);
const laporanList = ref([]);
const isLoading = ref(false);
const pencarianAktif = ref(false);

const ringkasan = computed(() => {
  let totalSesi = laporanList.value.length;
  let totalKomisi = laporanList.value.reduce((sum, item) => sum + Number(item.komisi || 0), 0);
  return { totalSesi, totalKomisi };
});

onMounted(async () => {
  // Ambil list terapis dari Dexie DB lokal untuk dropdown
  listTerapis.value = await db.therapists.toArray();
});

const namaTerapis = (id) => {
  const terapis = listTerapis.value.find(t => t.therapist_id === id);
  return terapis ? terapis.shortname : id;
};

const ambilDataLaporan = async () => {
  isLoading.value = true;
  pencarianAktif.value = true;
  
  try {
    // Memanggil API server (Pastikan file get_laporan.php ini bisa menerima parameter POST)
    const response = await fetch(`${API_URL}/get_laporan.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filter.value)
    });

    const result = await response.json();
    if (result.status === 'success') {
      laporanList.value = result.data || [];
      showToast('Data berhasil dimuat', 'success');
    } else {
      throw new Error(result.message || 'Gagal memuat data');
    }
  } catch (error) {
    console.error(error);
    showToast('Koneksi ke server gagal. Pastikan internet aktif.', 'error');
  } finally {
    isLoading.value = false;
  }
};

// Fitur Download Laporan menjadi format CSV/Excel
const downloadCSV = () => {
  if (laporanList.value.length === 0) {
    showToast('Tidak ada data untuk didownload', 'error');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  // Header CSV
  csvContent += "Tanggal,ID Terapis,Nama Terapis,Kode Layanan,Nama Layanan,Cabang,Komisi\n";

  // Isi CSV
  laporanList.value.forEach(row => {
    let nama = namaTerapis(row.therapist_id).replace(/,/g, ""); // Hapus koma agar format CSV tidak rusak
    let rowData = [
      row.date, row.therapist_id, nama, row.service_code, row.service_name, row.branch, row.komisi
    ];
    csvContent += rowData.join(",") + "\n";
  });

  // Proses Download File
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Laporan_Terapio_${filter.value.startDate}_to_${filter.value.endDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
