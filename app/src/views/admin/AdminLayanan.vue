<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[90px] max-w-md mx-auto w-full overflow-x-hidden relative shadow-sm">
    
    <!-- Header Admin -->
    <div class="bg-teal-600 px-4 py-5 shadow-sm text-white sticky top-0 z-20 flex items-center gap-3">
      <button @click="$router.push('/dashboard')" class="p-2 -ml-2 bg-teal-700/50 rounded-full shrink-0 active:scale-95 transition-transform">
        <ArrowLeftIcon :size="20" />
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-lg font-bold leading-tight truncate">Kelola Layanan</h1>
        <p class="text-[10px] text-teal-100 font-medium truncate">Master Data Terapio</p>
      </div>
    </div>

    <!-- List Data Layanan -->
    <div class="p-4 flex-1">
      <div v-if="layananList.length === 0" class="text-center py-10">
        <div class="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
          <ClipboardListIcon :size="32" />
        </div>
        <p class="text-sm font-bold text-slate-600">{{ isLoading ? 'Memuat data...' : 'Belum ada layanan' }}</p>
        <p v-if="!isLoading" class="text-xs text-slate-400 mt-1">Silakan tambah menu layanan baru.</p>
      </div>

      <div class="space-y-3">
        <div v-for="layanan in layananList" :key="layanan.id" 
             class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-3">
          
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <!-- Ikon Bulat Kode -->
            <div class="w-12 h-12 rounded-full flex flex-col items-center justify-center shrink-0"
                 :class="layanan.is_active == 1 ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-400'">
              <span class="text-xs font-bold">{{ layanan.code }}</span>
            </div>
            
            <!-- Area Teks Konten -->
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-slate-800 truncate text-sm flex items-center gap-1.5" 
                  :class="{'text-slate-400': layanan.is_active == 0}">
                <span class="truncate">{{ layanan.name }}</span>
                <span v-if="layanan.is_active == 0" class="text-[8px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded font-bold shrink-0">NONAKTIF</span>
              </h3>
              
              <div class="flex items-center gap-1.5 mt-1.5 overflow-hidden">
                <span class="text-[9px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">
                  <ClockIcon :size="10" class="inline mb-0.5 mr-0.5" /> {{ layanan.durasi || 0 }} mnt
                </span>
                <span class="text-[9px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded truncate">
                  Cabang: {{ layanan.branch_type || 'ALL' }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Tombol Edit -->
          <button @click="bukaModalEdit(layanan)" class="p-2 text-blue-500 bg-blue-50 rounded-xl active:scale-95 transition-transform shrink-0">
            <Edit2Icon :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Tombol Tambah -->
    <div class="fixed bottom-6 right-0 left-0 max-w-md mx-auto w-full pointer-events-none z-10 flex justify-end px-6">
      <button @click="bukaModalTambah" class="w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center active:scale-90 transition-transform pointer-events-auto">
        <PlusIcon :size="28" />
      </button>
    </div>

    <!-- POPUP MODAL (TAMBAH / EDIT) -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center z-50 p-0 sm:p-4">
      <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl modal-slide-up max-h-[90vh] overflow-y-auto flex flex-col">
        <div class="flex justify-between items-center mb-6 shrink-0">
          <h3 class="text-lg font-bold text-slate-800">{{ isEdit ? 'Edit Layanan' : 'Tambah Layanan' }}</h3>
          <button @click="tutupModal" class="text-slate-400 bg-slate-100 p-1.5 rounded-full shrink-0"><XIcon :size="18" /></button>
        </div>

        <form @submit.prevent="simpanData" class="space-y-4 pb-4">
          <!-- Kode Layanan -->
          <div>
            <label class="text-xs font-bold text-slate-500 mb-1 block">Kode Layanan</label>
            <input v-model="formData.code" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500 uppercase" placeholder="Misal: A1" required>
          </div>

          <!-- Nama Layanan -->
          <div>
            <label class="text-xs font-bold text-slate-500 mb-1 block">Nama Layanan</label>
            <input v-model="formData.name" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" placeholder="Misal: Pijat Tradisional" required>
          </div>

          <!-- Durasi & Cabang -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-bold text-slate-500 mb-1 block">Durasi (Menit)</label>
              <input v-model="formData.durasi" type="number" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" placeholder="Misal: 60" required>
            </div>
            <div>
              <label class="text-xs font-bold text-slate-500 mb-1 block">Tipe Cabang</label>
              <select v-model="formData.branch_type" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" required>
                <option value="ALL">Semua Cabang (ALL)</option>
                <option value="STANDARD">Amarta / Refleksi</option>
                <option value="RUMAH_SPA">Khusus Rumah Spa</option>
              </select>
            </div>
          </div>

          <!-- Status Aktif -->
          <div v-if="isEdit" class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div class="pr-3">
              <p class="text-sm font-bold text-slate-800">Status Aktif</p>
              <p class="text-[10px] text-slate-500 leading-tight mt-0.5">Jika nonaktif, tidak bisa dipilih saat input log.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" v-model="formData.is_active" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          <button type="submit" class="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-all shadow-md mt-4">
            Simpan Layanan
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  ArrowLeft as ArrowLeftIcon, 
  ClipboardList as ClipboardListIcon, 
  Plus as PlusIcon, 
  Edit2 as Edit2Icon, 
  X as XIcon,
  Clock as ClockIcon
} from 'lucide-vue-next';

// 1. IMPORT CUSTOM TOAST DI SINI
import { showToast } from '../../composables/useToast'; 

const API_URL = 'https://terapio.cahayaelektrik.com/api';
const layananList = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const isLoading = ref(false);

const formData = ref({ id: null, code: '', name: '', durasi: '', branch_type: 'ALL', is_active: true });

const loadData = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`${API_URL}/get_master.php`);
    if (!response.ok) throw new Error("Gagal mengambil data dari server");
    
    const result = await response.json();
    if (result.status === 'success') {
      if (result.data.services) {
        layananList.value = result.data.services.sort((a, b) => a.code.localeCompare(b.code));
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => loadData());

const bukaModalTambah = () => {
  isEdit.value = false;
  formData.value = { id: null, code: '', name: '', durasi: '', branch_type: 'ALL', is_active: true };
  showModal.value = true;
};

const bukaModalEdit = (layanan) => {
  isEdit.value = true;
  formData.value = { 
    id: layanan.id, 
    code: layanan.code, 
    name: layanan.name,
    durasi: layanan.durasi || '', 
    branch_type: layanan.branch_type || 'ALL',
    is_active: layanan.is_active == 1 
  };
  showModal.value = true;
};

const tutupModal = () => showModal.value = false;

const simpanData = async () => {
  try {
    const dataDisimpan = {
      id: formData.value.id,
      code: formData.value.code.toUpperCase(),
      name: formData.value.name,
      durasi: Number(formData.value.durasi) || 0,
      branch_type: formData.value.branch_type,
      is_active: formData.value.is_active ? 1 : 0
    };

    const response = await fetch(`${API_URL}/sync_services.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([dataDisimpan]) 
    });

    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    
    await loadData();
    tutupModal();
    
    // 2. GANTI ALERT MENJADI SHOW TOAST
    showToast("Berhasil disimpan ke server!", "success");
    
  } catch (error) {
    // GANTI ALERT MENJADI SHOW TOAST UNTUK ERROR
    showToast("Gagal menyimpan data: " + error.message, "error");
  }
};
</script>

<style scoped>
.modal-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>
