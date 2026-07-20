<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-32">
    <!-- Header Utama -->
    <div class="bg-teal-600 text-white px-4 py-3 shadow-sm sticky top-0 z-20 flex items-center">
      <button @click="$router.push('/dashboard')" class="mr-3 active:scale-90 transition-transform"><ArrowLeftIcon :size="20" /></button>
      <h2 class="text-base font-bold flex-1">Input Sesi Baru</h2>
    </div>

    <!-- CTA Lokasi Tugas -->
    <div class="bg-teal-50 border-b border-teal-100 p-3 flex items-center justify-between z-10 sticky top-[48px]">
      <div class="flex items-center gap-2 text-teal-800">
        <MapPinIcon :size="18" class="text-teal-600" />
        <div>
          <p class="text-[9px] font-bold uppercase tracking-wider text-teal-600">Lokasi Tugas Saat Ini</p>
          <p class="text-xs font-semibold leading-tight">Pilih Tempat Anda Bertugas</p>
        </div>
      </div>
      
      <button @click="bukaModalLokasi" class="bg-white border border-teal-200 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-1 max-w-[150px]">
        <span class="truncate">{{ lokasi.branch }} - {{ lokasi.area }}</span>
        <ChevronDownIcon :size="14" class="shrink-0" />
      </button>
    </div>

    <div class="px-4 pt-4">
      <!-- Pilihan Kategori -->
      <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Tipe Klien (Kategori)</p>
      <div class="flex bg-slate-200 p-1 rounded-xl mb-4">
        <button 
          v-for="(label, key) in kategoriMap" 
          :key="key"
          @click="kategoriTerpilih = key"
          :class="['flex-1 py-2 text-xs font-bold rounded-lg transition-all', kategoriTerpilih === key ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
        >
          {{ label }}
        </button>
      </div>

      <!-- Pencarian Layanan -->
      <div class="relative mb-4">
        <SearchIcon :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="searchQuery" type="text" placeholder="Cari kode atau nama layanan..." class="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-teal-500 shadow-sm">
      </div>

      <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Pilih Layanan</p>
      
      <div class="grid grid-cols-2 gap-3">
        <button 
          v-for="svc in filteredServices" 
          :key="svc.code"
          @click="pilihLayanan(svc)"
          :class="[
            'relative p-3 rounded-2xl border text-left flex flex-col justify-between min-h-[110px] transition-all active:scale-95',
            layananTerpilih?.code === svc.code 
              ? 'bg-teal-600 border-teal-600 shadow-md transform -translate-y-1' 
              : 'bg-white border-slate-100 shadow-sm hover:border-teal-200'
          ]"
        >
          <div v-if="layananTerpilih?.code === svc.code" class="absolute top-2 right-2 text-white">
            <CheckCircleIcon :size="16" />
          </div>

          <h1 :class="['text-3xl font-extrabold tracking-tighter mb-1', layananTerpilih?.code === svc.code ? 'text-white' : 'text-slate-800']">
            {{ svc.code }}
          </h1>
          
          <div>
            <p :class="['text-xs font-bold leading-tight mb-1 line-clamp-2', layananTerpilih?.code === svc.code ? 'text-teal-100' : 'text-slate-600']">
              {{ svc.produk }}
            </p>
            <span v-if="svc.durasi > 0" :class="['inline-block text-[9px] font-bold px-2 py-0.5 rounded-md', layananTerpilih?.code === svc.code ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500']">
              {{ svc.durasi }} Menit
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Floating Action Bar -->
    <Transition name="slide-up">
      <div v-if="layananTerpilih" class="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 pb-6 z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] rounded-t-2xl">
        <div class="flex justify-between items-end mb-4">
          <div>
            <p class="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Estimasi Komisi</p>
            <p class="text-2xl font-extrabold text-green-600">Rp {{ estimasiKomisi.toLocaleString('id-ID') }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold text-slate-800">{{ layananTerpilih.code }}</p>
            <p class="text-[10px] text-slate-500">{{ layananTerpilih.durasi }} Menit</p>
          </div>
        </div>
                <button @click="simpanLog" :disabled="isSubmitting" class="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 active:scale-95 text-white font-bold py-3.5 rounded-xl text-sm transition-transform shadow-md flex items-center justify-center gap-2">
          <span v-if="isSubmitting" class="animate-pulse flex items-center gap-2">
            Menyimpan ke Server...
          </span>
          <span v-else class="flex items-center gap-2">
            <SaveIcon :size="18" /> Simpan Log Sekarang
          </span>
        </button>
      </div>
    </Transition>

    <!-- Modal Lokasi -->
    <Transition name="fade">
      <div v-if="showModal" @click.self="showModal = false" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
        <div class="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
          <div class="bg-teal-50 px-4 py-3 border-b border-teal-100 flex justify-between items-center">
            <h3 class="font-bold text-teal-800 text-sm">Pilih Lokasi</h3>
            <button @click="showModal = false" class="text-slate-400 hover:text-slate-600"><XIcon :size="20" /></button>
          </div>
          <div class="p-4 space-y-4">
            
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Cabang (Branch)</p>
              <select v-model="tempLokasi.branch" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 transition-colors">
                <!-- Fallback || name || nama agar anti-blank -->
                <option v-for="(branch, index) in branchesList" :key="branch.id || index" :value="branch.name || branch.branch_name">
                  {{ branch.name || branch.branch_name }}
                </option>
              </select>
            </div>
            
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Area / Lokasi</p>
              <select v-model="tempLokasi.area" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500 transition-colors">
                <option v-for="(area, index) in areasList" :key="area.id || index" :value="area.name || area.area_name">
                  {{ area.name || area.area_name }}
                </option>
              </select>
            </div>

            <button @click="simpanLokasi" class="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold py-3 rounded-xl text-sm mt-2 transition-all">
              Terapkan Lokasi
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../db';
import { showToast } from '../composables/useToast';
import { layananMap, layananRumahSpa, kategoriMap } from '../utils/services';
import { 
  ArrowLeft as ArrowLeftIcon, MapPin as MapPinIcon, ChevronDown as ChevronDownIcon,
  CheckCircle as CheckCircleIcon, Search as SearchIcon, Save as SaveIcon,
  X as XIcon
} from 'lucide-vue-next';

const router = useRouter();

// State
const lokasi = reactive({ branch: 'Amarta / Refleksi', area: 'Merdeka' });
const tempLokasi = reactive({ branch: 'Amarta / Refleksi', area: 'Merdeka' });
const branchesList = ref([]);
const areasList = ref([]);

const showModal = ref(false);
const kategoriTerpilih = ref('U');
const searchQuery = ref('');
const layananTerpilih = ref(null);
const isSubmitting = ref(false);

// Fungsi untuk sinkronisasi master data dari server ke lokal
const syncMasterData = async () => {
  try {
    const response = await fetch('https://terapio.cahayaelektrik.com/api/get_master.php');
    const result = await response.json();
    
    if (result.status === 'success') {
      // Update tabel branches di IndexedDB
      if (result.data.branches && result.data.branches.length > 0) {
        await db.branches.clear();
        await db.branches.bulkAdd(result.data.branches);
        branchesList.value = result.data.branches;
      }
      
      // Update tabel areas di IndexedDB
      if (result.data.areas && result.data.areas.length > 0) {
        await db.areas.clear();
        await db.areas.bulkAdd(result.data.areas);
        areasList.value = result.data.areas;
      }
    }
  } catch (error) {
    console.error("Gagal update data master dari server:", error);
  }
};

onMounted(async () => {
  const currentId = localStorage.getItem('logged_in_id');
  
  // 1. Set default lokasi dari profil terapis
  if (currentId) {
    const profil = await db.therapists.get(currentId);
    if (profil) {
      lokasi.branch = profil.branch || 'Amarta / Refleksi';
      lokasi.area = profil.area || 'Merdeka';
      tempLokasi.branch = lokasi.branch;
      tempLokasi.area = lokasi.area;
    }
  }

  // 2. Load dari lokal Dexie terlebih dahulu agar tampilan langsung terisi (Offline-first)
  const localBranches = await db.branches.toArray();
  const localAreas = await db.areas.toArray();
  
  if (localBranches.length > 0) branchesList.value = localBranches;
  else branchesList.value = [{ name: 'Amarta / Refleksi' }, { name: 'Rumah Spa' }]; // Fallback
  
  if (localAreas.length > 0) areasList.value = localAreas;
  else areasList.value = [{ name: 'Sukamto' }, { name: 'Merdeka' }]; // Fallback

  // 3. Tarik data terbaru dari server di background, dan timpa lokal jika ada yang baru
  syncMasterData();
});

const daftarLayananAktif = computed(() => lokasi.branch === 'Rumah Spa' ? layananRumahSpa : layananMap);
const filteredServices = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return daftarLayananAktif.value;
  return daftarLayananAktif.value.filter(svc => svc.code.toLowerCase().includes(query) || svc.produk.toLowerCase().includes(query));
});

const bukaModalLokasi = () => { 
  tempLokasi.branch = lokasi.branch;
  tempLokasi.area = lokasi.area;
  showModal.value = true; 
};

const simpanLokasi = () => { 
  lokasi.branch = tempLokasi.branch; 
  lokasi.area = tempLokasi.area; 
  showModal.value = false; 
};

const pilihLayanan = (svc) => { layananTerpilih.value = svc; };

const estimasiKomisi = computed(() => {
  if (!layananTerpilih.value) return 0;
  return (layananTerpilih.value.durasi / 60) * 17000;
});

const simpanLog = async () => {
  if (!layananTerpilih.value) return;
  
  const currentId = localStorage.getItem('logged_in_id');
  if (!currentId) {
    showToast('Sesi tidak valid, silakan login ulang', 'error');
    return;
  }

  isSubmitting.value = true;
  
  try {
    const now = new Date();
    const mysqlTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');
    const currentDate = mysqlTimestamp.split(' ')[0];
    
    // Tetap buat session_id unik
    const newSessionId = 'SES' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    // SUSUN PAYLOAD SESUAI PERMINTAAN PHP
    const payload = {
      therapist_id: currentId, // Taruh ID di luar sesuai request PHP
      sessions: [ // Masukkan data sesi ke dalam array 'sessions'
        {
          session_id: newSessionId,
          service_code: layananTerpilih.value.code,
          service_name: layananTerpilih.value.produk,
          durasi: layananTerpilih.value.durasi,
          komisi: estimasiKomisi.value,
          date: currentDate,
          timestamp: mysqlTimestamp,
          kategori: kategoriTerpilih.value,
          branch: lokasi.branch,
          area: lokasi.area
        }
      ]
    };

    // Tembak langsung ke sync_sessions.php
    const response = await fetch('https://terapio.cahayaelektrik.com/api/sync_sessions.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === 'success') {
      showToast('Berhasil! Log langsung tersimpan ke server.', 'success');
      setTimeout(() => router.push('/dashboard'), 1000);
    } else {
      showToast(result.message || 'Gagal menyimpan data ke server', 'error');
    }
    
  } catch (error) {
    console.error('API Error:', error);
    showToast('Koneksi terputus. Pastikan internet Anda stabil!', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
