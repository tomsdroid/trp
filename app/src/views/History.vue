<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[70px]">
    <div class="bg-teal-600 text-white px-4 py-3 shadow-sm sticky top-0 z-10 text-center">
      <h2 class="text-base font-bold">Riwayat Sesi</h2>
    </div>

    <!-- BANNER SINKRONISASI -->
    <div v-if="isSyncing" class="bg-teal-50 text-teal-600 px-4 py-2 text-[10px] font-bold flex items-center justify-center gap-2 border-b border-teal-100">
      <RefreshCwIcon class="animate-spin" :size="14" /> Mensinkronkan data server...
    </div>

    <div class="p-4 flex-1 overflow-y-auto">
      <div v-if="sessions.length === 0" class="flex flex-col items-center justify-center h-40 text-slate-400">
        <DatabaseIcon :size="32" class="mb-2 opacity-50" />
        <p class="text-xs">Belum ada riwayat sesi.</p>
      </div>

      <div class="space-y-3">
        <div v-for="sesi in sessions" :key="sesi.session_id" class="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
          
          <div class="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center shrink-0">
            <UserCheckIcon :size="20" />
          </div>
          
          <div class="flex-1 overflow-hidden">
            <h3 class="text-sm font-bold text-slate-800 truncate">
              {{ sesi.nama_layanan_asli }}
            </h3>
            <p class="text-[11px] text-slate-500 truncate font-medium mt-0.5">
              {{ sesi.nama_kategori }} &bull; {{ sesi.area_tugas }}
            </p>
            <p class="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
              {{ formatTanggal(sesi.timestamp) }}
            </p>
          </div>
          <!-- Badge Lokal Dihapus Sesuai Permintaan -->
        </div>
      </div>
    </div>

    <BottomNav activeTab="history" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../db';
import BottomNav from '../components/BottomNav.vue';
import { 
  Database as DatabaseIcon, 
  UserCheck as UserCheckIcon, 
  RefreshCw as RefreshCwIcon 
} from 'lucide-vue-next';

const sessions = ref([]);
const isSyncing = ref(false);

const formatTanggal = (timestampString) => {
  try {
    if (!timestampString) return 'Waktu tidak tercatat';
    const safeString = timestampString.replace(' ', 'T');
    const date = new Date(safeString);
    if (isNaN(date.getTime())) return timestampString; 
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' • ' + date.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}) + ' WIB';
  } catch (e) {
    return 'Error Date';
  }
};

onMounted(async () => {
  const currentId = localStorage.getItem('logged_in_id');
  if (!currentId) return;

  // Fungsi untuk memuat data dari lokal (Dexie)
  const loadDataLokal = async () => {
    const allSessions = await db.sessions.toArray();
    const allServices = await db.services.toArray();
    const allCategories = await db.categories.toArray(); 
    
    let dataSesi = allSessions.filter(s => s.therapist_id == currentId).reverse();
      
    for (let sesi of dataSesi) {
      if (sesi.service_name) {
        sesi.nama_layanan_asli = sesi.service_name;
      } else if (sesi.service_code) {
        const layananInfo = allServices.find(srv => srv.code === sesi.service_code);
        sesi.nama_layanan_asli = layananInfo ? layananInfo.name : `Layanan (${sesi.service_code})`;
      } else {
        sesi.nama_layanan_asli = 'Layanan Tidak Diketahui';
      }

      const categoryMap = { 'U': 'Urutan', 'R': 'Request', 'PN': 'Permintaan Nama' };
      if (sesi.kategori) {
        const catInfo = allCategories.find(c => c.code === sesi.kategori);
        sesi.nama_kategori = catInfo ? catInfo.name : (categoryMap[sesi.kategori] || sesi.kategori);
      } else {
        sesi.nama_kategori = 'Tanpa Kategori';
      }

      const branchName = sesi.branch || '';
      const areaName = sesi.area || '';
      sesi.area_tugas = `${branchName} ${areaName}`.trim() || 'Area Tidak Diketahui';
    }
    sessions.value = dataSesi;
  };

  // 1. Tampil cepat dari lokal
  await loadDataLokal();

  // 2. Sinkron diam-diam dari server (Menimpa DB Lokal)
  isSyncing.value = true;
  try {
    const response = await fetch(`https://terapio.cahayaelektrik.com/api/get_sessions.php?therapist_id=${currentId}`);
    if(response.ok) {
      const result = await response.json();
      if(result.status === 'success' && result.data) {
        // Bersihkan riwayat lama terapis ini, masukkan yang terbaru dari server
        const allIds = await db.sessions.where('therapist_id').equals(currentId).primaryKeys();
        await db.sessions.bulkDelete(allIds);
        await db.sessions.bulkAdd(result.data);
        
        // Refresh tampilan
        await loadDataLokal();
      }
    }
  } catch (error) {
    console.log("Koneksi gagal, menggunakan mode offline murni.");
  } finally {
    isSyncing.value = false;
  }
});
</script>
