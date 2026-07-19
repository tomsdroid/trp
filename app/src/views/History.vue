<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[70px]">
    <div class="bg-teal-600 text-white px-4 py-3 shadow-sm sticky top-0 z-10 text-center">
      <h2 class="text-base font-bold">Riwayat Sesi</h2>
    </div>

    <div class="p-4 flex-1 overflow-y-auto">
      <div v-if="sessions.length === 0" class="flex flex-col items-center justify-center h-40 text-slate-400">
        <DatabaseIcon :size="32" class="mb-2 opacity-50" />
        <p class="text-xs">Belum ada riwayat sesi.</p>
      </div>

      <div class="space-y-3">
        <div v-for="sesi in sessions" :key="sesi.session_id" class="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
          
          <!-- Ikon Bulat -->
          <div class="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center shrink-0">
            <UserCheckIcon :size="20" />
          </div>
          
          <div class="flex-1 overflow-hidden">
            <!-- BARIS 1: Nama Layanan -->
            <h3 class="text-sm font-bold text-slate-800 truncate">
              {{ sesi.nama_layanan_asli }}
            </h3>
            
            <!-- BARIS 2: Kategori Lengkap • Area Tugas -->
            <p class="text-[11px] text-slate-500 truncate font-medium mt-0.5">
              {{ sesi.nama_kategori }} &bull; {{ sesi.area_tugas }}
            </p>
            
            <!-- BARIS 3: Tanggal & Jam -->
            <p class="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
              {{ formatTanggal(sesi.timestamp) }}
            </p>
          </div>

          <!-- BADGE SYNC / LOKAL -->
          <div class="shrink-0 flex flex-col items-end">
            <!-- Jika is_synced bernilai 1 (sudah masuk server) -->
            <span v-if="sesi.is_synced == 1" class="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircleIcon :size="10" /> Sync
            </span>
            <!-- Jika is_synced bernilai 0, null, atau belum ada (masih di HP) -->
            <span v-else class="bg-orange-100 text-orange-600 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ClockIcon :size="10" /> Lokal
            </span>
          </div>
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
  Database as DatabaseIcon, UserCheck as UserCheckIcon, 
  CheckCircle as CheckCircleIcon, Clock as ClockIcon
} from 'lucide-vue-next';

const sessions = ref([]);

// Format waktu
const formatTanggal = (timestampString) => {
  try {
    if (!timestampString) return 'Waktu tidak tercatat';
    const safeString = timestampString.replace(' ', 'T');
    const date = new Date(safeString);
    
    if (isNaN(date.getTime())) return timestampString; 

    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    }) + ' • ' + date.toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
  } catch (e) {
    return 'Error Date';
  }
};

onMounted(async () => {
  const currentId = localStorage.getItem('logged_in_id');
  if (currentId) {
    try {
      // 1. Tarik semua tabel yang dibutuhkan untuk mencocokkan data
      const allSessions = await db.sessions.toArray();
      const allServices = await db.services.toArray();
      const allCategories = await db.categories.toArray(); 
      
      // 2. Filter milik terapis yang login & urutkan dari terbaru
      let dataSesi = allSessions.filter(s => s.therapist_id == currentId).reverse();
        
      // 3. Mapping data biar rapi
      for (let sesi of dataSesi) {
        
        // --- NAMA LAYANAN ---
        // Prioritaskan service_name yang sudah tersimpan di database lokal log sesi
        if (sesi.service_name) {
          sesi.nama_layanan_asli = sesi.service_name;
        } else if (sesi.service_code) {
          const layananInfo = allServices.find(srv => srv.code === sesi.service_code);
          sesi.nama_layanan_asli = layananInfo ? layananInfo.name : `Layanan (${sesi.service_code})`;
        } else {
          sesi.nama_layanan_asli = 'Layanan Tidak Diketahui';
        }

        // --- KATEGORI LENGKAP ---
        // Mapping manual (fallback) jika database lokal categories kosong
        const categoryMap = {
          'U': 'Urutan',
          'R': 'Request',
          'PN': 'Permintaan Nama'
        };

        if (sesi.kategori) {
          const catInfo = allCategories.find(c => c.code === sesi.kategori);
          if (catInfo) {
            sesi.nama_kategori = catInfo.name;
          } else {
            // Gunakan fallback mapping, jika tetap tidak ketemu, tampilkan kodenya
            sesi.nama_kategori = categoryMap[sesi.kategori] || sesi.kategori;
          }
        } else {
          sesi.nama_kategori = 'Tanpa Kategori';
        }

        // --- AREA TUGAS ---
        const branchName = sesi.branch || '';
        const areaName = sesi.area || '';
        sesi.area_tugas = `${branchName} ${areaName}`.trim() || 'Area Tidak Diketahui';
      }
      
      sessions.value = dataSesi;
      
    } catch (error) {
      console.error("Gagal memuat riwayat:", error);
    }
  }
});
</script>
