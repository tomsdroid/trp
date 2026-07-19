<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[90px]">
    <!-- Header Admin -->
    <div class="bg-teal-600 px-4 py-5 shadow-sm text-white sticky top-0 z-20 flex items-center gap-3">
      <button @click="$router.push('/dashboard')" class="p-2 -ml-2 bg-teal-700/50 rounded-full active:scale-95 transition-transform">
        <ArrowLeftIcon :size="20" />
      </button>
      <div>
        <h1 class="text-lg font-bold leading-tight">Kelola Cabang</h1>
        <p class="text-[10px] text-teal-100 font-medium">Master Data Terapio</p>
      </div>
    </div>

    <!-- List Data Cabang -->
    <div class="p-4 flex-1">
      <div v-if="cabangList.length === 0" class="text-center py-10">
        <div class="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
          <StoreIcon :size="32" />
        </div>
        <p class="text-sm font-bold text-slate-600">{{ isLoading ? 'Memuat data...' : 'Belum ada cabang' }}</p>
        <p v-if="!isLoading" class="text-xs text-slate-400 mt-1">Silakan tambah cabang baru.</p>
      </div>

      <div class="space-y-3">
        <div v-for="cabang in cabangList" :key="cabang.id" 
             class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center"
                 :class="cabang.is_active == 1 ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'">
              <StoreIcon :size="20" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800" :class="{'line-through text-slate-400': cabang.is_active == 0}">
                {{ cabang.name }}
              </h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="cabang.is_active == 1 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'">
                {{ cabang.is_active == 1 ? 'Aktif' : 'Nonaktif' }}
              </span>
            </div>
          </div>
          <!-- Tombol Edit -->
          <button @click="bukaModalEdit(cabang)" class="p-2 text-blue-500 bg-blue-50 rounded-xl active:scale-95 transition-transform">
            <Edit2Icon :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Tombol Tambah Mengambang (FAB) -->
    <button @click="bukaModalTambah" class="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center active:scale-90 transition-transform z-10">
      <PlusIcon :size="28" />
    </button>

    <!-- POPUP MODAL (TAMBAH / EDIT) -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center z-50">
      <div class="bg-white w-full rounded-t-3xl p-6 shadow-2xl modal-slide-up">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-slate-800">{{ isEdit ? 'Edit Cabang' : 'Tambah Cabang' }}</h3>
          <button @click="tutupModal" class="text-slate-400 bg-slate-100 p-1.5 rounded-full"><XIcon :size="18" /></button>
        </div>

        <form @submit.prevent="simpanData" class="space-y-4">
          <div>
            <label class="text-xs font-bold text-slate-500 mb-1 block">Nama Cabang</label>
            <input v-model="formData.name" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" placeholder="Misal: Amarta Pusat" required>
          </div>

          <div v-if="isEdit" class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p class="text-sm font-bold text-slate-800">Status Aktif</p>
              <p class="text-[10px] text-slate-500">Cabang nonaktif tidak akan muncul di HP Terapis.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="formData.is_active" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          <button type="submit" class="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-all shadow-md mt-4">
            Simpan Cabang
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { showToast } from '../../composables/useToast';
import { ref, onMounted } from 'vue';
import { ArrowLeft as ArrowLeftIcon, Store as StoreIcon, Plus as PlusIcon, Edit2 as Edit2Icon, X as XIcon } from 'lucide-vue-next';

const API_URL = 'https://terapio.cahayaelektrik.com/api';
const cabangList = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const isLoading = ref(false);

const formData = ref({ id: null, name: '', is_active: true });

const loadData = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`${API_URL}/get_master.php`);
    if (!response.ok) throw new Error("Gagal mengambil data dari server");
    
    const result = await response.json();
    if (result.status === 'success' && result.data.branches) {
      cabangList.value = result.data.branches.sort((a, b) => a.name.localeCompare(b.name));
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
  formData.value = { id: null, name: '', is_active: true };
  showModal.value = true;
};

const bukaModalEdit = (cabang) => {
  isEdit.value = true;
  formData.value = { id: cabang.id, name: cabang.name, is_active: cabang.is_active == 1 };
  showModal.value = true;
};

const tutupModal = () => showModal.value = false;

const simpanData = async () => {
  try {
    const dataDisimpan = {
      id: formData.value.id,
      name: formData.value.name,
      is_active: formData.value.is_active ? 1 : 0
    };

    const response = await fetch(`${API_URL}/sync_branches.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([dataDisimpan]) 
    });

    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    
    await loadData();
    tutupModal();
    showToast("Berhasil disimpan ke server!", 'success');
  } catch (error) {
    showToast("Gagal menyimpan data: " + error.message, 'error');
  }
};
</script>

<style scoped>
.modal-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>
