<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[90px]">
    
    <div class="bg-teal-600 px-4 py-5 shadow-sm text-white sticky top-0 z-20 flex items-center gap-3">
      <button @click="$router.push('/dashboard')" class="p-2 -ml-2 bg-teal-700/50 rounded-full active:scale-95 transition-transform">
        <ArrowLeftIcon :size="20" />
      </button>
      <div>
        <h1 class="text-lg font-bold leading-tight">Data Terapis</h1>
        <p class="text-[10px] text-teal-100 font-medium">Manajemen Akun Pengguna</p>
      </div>
    </div>

    <div class="p-4 flex-1">
      <div v-if="terapisList.length === 0" class="text-center py-10">
        <div class="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
          <UsersIcon :size="32" />
        </div>
        <p class="text-sm font-bold text-slate-600">Belum ada terapis</p>
        <p class="text-xs text-slate-400 mt-1">Silakan tambah akun terapis baru.</p>
      </div>

      <div class="space-y-3">
        <div v-for="t in terapisList" :key="t.therapist_id" 
             class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          
          <div class="flex items-center gap-3 flex-1">
            <div class="w-12 h-12 rounded-full overflow-hidden border-2 shadow-sm shrink-0 flex items-center justify-center bg-slate-100"
                 :class="t.is_admin == 1 ? 'border-orange-400' : 'border-teal-500'">
              <img v-if="t.avatar_url" :src="t.avatar_url" class="w-full h-full object-cover">
              <UserIcon v-else :size="24" :class="t.is_admin == 1 ? 'text-orange-400' : 'text-teal-600'" />
            </div>
            
            <div class="flex-1 overflow-hidden">
              <div class="flex items-center gap-1.5 mb-0.5">
                <h3 class="font-bold text-slate-800 truncate text-sm" :class="{'line-through text-slate-400': t.is_active == 0}">
                  {{ t.shortname }}
                </h3>
                <span v-if="t.is_admin == 1" class="bg-orange-100 text-orange-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded">ADMIN</span>
              </div>
              <p class="text-[10px] font-bold text-teal-600 mb-0.5">{{ t.therapist_id }}</p>
              
              <p class="text-[10px] text-slate-500 font-medium truncate">
                {{ t.position }} - {{ t.branch }} - {{ t.area }}
              </p>
            </div>
          </div>

          <button @click="bukaModalEdit(t)" class="p-2 text-blue-500 bg-blue-50 rounded-xl active:scale-95 transition-transform shrink-0 ml-2">
            <Edit2Icon :size="16" />
          </button>
        </div>
      </div>
    </div>

    <button @click="bukaModalTambah" class="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center active:scale-90 transition-transform z-10">
      <UserPlusIcon :size="28" />
    </button>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center z-50">
      <div class="bg-white w-full rounded-t-3xl p-5 shadow-2xl modal-slide-up flex flex-col max-h-[85vh]">
        
        <div class="flex justify-between items-center mb-4 shrink-0">
          <h3 class="text-base font-bold text-slate-800">{{ isEdit ? 'Edit Akun' : 'Tambah Terapis' }}</h3>
          <button @click="tutupModal" class="text-slate-400 bg-slate-100 p-1.5 rounded-full"><XIcon :size="16" /></button>
        </div>

        <div class="overflow-y-auto pr-1 space-y-3 mb-4">
          
          <div v-if="isEdit" class="bg-teal-50 border border-teal-100 p-2.5 rounded-xl flex justify-between items-center">
            <span class="text-[11px] font-bold text-teal-700">ID Terapis</span>
            <span class="text-sm font-extrabold text-teal-700 tracking-widest">{{ formData.therapist_id }}</span>
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-500 mb-1 block">Nama Lengkap</label>
            <input v-model="formData.fullname" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" placeholder="Misal: Siti Aminah" required>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="text-[11px] font-bold text-slate-500 mb-1 block">Panggilan</label>
              <input v-model="formData.shortname" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" placeholder="Misal: Ami" required>
            </div>
            <div>
              <label class="text-[11px] font-bold text-slate-500 mb-1 block">No. HP</label>
              <input v-model="formData.phone" type="tel" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" placeholder="08..." required>
            </div>
          </div>
          
          <div>
            <label class="text-[11px] font-bold text-slate-500 mb-1 block">Email</label>
            <input v-model="formData.email" type="email" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" placeholder="email@contoh.com">
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="text-[11px] font-bold text-slate-500 mb-1 block">Cabang</label>
              <select v-model="formData.branch" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" required>
                <option value="" disabled>Pilih Cabang</option>
                <option v-for="b in branchList" :key="b.id" :value="b.name">{{ b.name }}</option>
              </select>
            </div>
            <div>
              <label class="text-[11px] font-bold text-slate-500 mb-1 block">Area</label>
              <select v-model="formData.area" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" required>
                <option value="" disabled>Pilih Area</option>
                <option v-for="a in areaList" :key="a.id" :value="a.name">{{ a.name }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="text-[11px] font-bold text-slate-500 mb-1 block">Jabatan</label>
              <select v-model="formData.position" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" required>
                <option value="Terapis">Terapis</option>
                <option value="Kasir">Kasir</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div>
              <label class="text-[11px] font-bold text-slate-500 mb-1 block">PIN Masuk</label>
              <input v-model="formData.pin" type="text" maxlength="6" inputmode="numeric" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-orange-500 tracking-widest text-center" placeholder="123456" required>
            </div>
          </div>

          <div class="space-y-2 mt-1">
            <div class="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
              <div>
                <p class="text-xs font-bold text-orange-800">Akses Admin</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="formData.is_admin" class="sr-only peer">
                <div class="w-9 h-5 bg-orange-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-orange-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div v-if="isEdit" class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p class="text-xs font-bold text-slate-800">Status Akun (Aktif)</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="formData.is_active" class="sr-only peer">
                <div class="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>
          </div>

        </div>

        <div class="pt-3 border-t border-slate-100 shrink-0">
          <button @click="simpanData" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-all shadow-md">
            Simpan Data
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { showToast } from '../../composables/useToast'; // <-- Import Toast Here
import { 
  ArrowLeft as ArrowLeftIcon, 
  Users as UsersIcon, 
  User as UserIcon,
  UserPlus as UserPlusIcon, 
  Edit2 as Edit2Icon, 
  X as XIcon 
} from 'lucide-vue-next';

const terapisList = ref([]);
const branchList = ref([]);
const areaList = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const isLoading = ref(false);

const formData = ref({
  therapist_id: '',
  fullname: '',
  shortname: '',
  phone: '',
  branch: '',
  area: '',
  position: 'Terapis',
  pin: '123456',
  is_admin: false,
  is_active: true,
  email: '',
  avatar_url: ''
});

const API_URL = 'https://terapio.cahayaelektrik.com/api'; 

const getMysqlDate = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

const loadData = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`${API_URL}/get_master.php`);
    if (!response.ok) throw new Error("Gagal mengambil data dari server");
    
    const result = await response.json();
    
    if (result.status === 'success') {
      if (result.data.therapists) {
        terapisList.value = result.data.therapists.sort((a, b) => a.shortname.localeCompare(b.shortname));
      }
      if (result.data.branches) {
        branchList.value = result.data.branches;
      }
      if (result.data.areas) {
        areaList.value = result.data.areas;
      }
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error(error);
    showToast("Gagal mengambil data dari server", "error");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const generateId = () => {
  const randomStr = Math.random().toString(36).substr(2, 8).toUpperCase();
  return 'TRP' + randomStr;
};

const bukaModalTambah = () => {
  isEdit.value = false;
  formData.value = { 
    therapist_id: '', fullname: '', shortname: '', phone: '', 
    branch: '', area: '', position: 'Terapis', pin: '123456', 
    is_admin: false, is_active: true, email: '', avatar_url: ''
  };
  showModal.value = true;
};

const bukaModalEdit = (t) => {
  isEdit.value = true;
  formData.value = { 
    therapist_id: t.therapist_id, fullname: t.fullname, shortname: t.shortname, 
    phone: t.phone, branch: t.branch, area: t.area, position: t.position || 'Terapis',
    pin: t.pin, is_admin: t.is_admin == 1, is_active: t.is_active == 1,
    email: t.email || '', avatar_url: t.avatar_url || ''
  };
  showModal.value = true;
};

const tutupModal = () => {
  showModal.value = false;
};

const simpanData = async () => {
  if(!formData.value.fullname || !formData.value.shortname || !formData.value.branch || !formData.value.area || !formData.value.pin) {
    showToast("Mohon lengkapi semua data form yang wajib!", "error");
    return;
  }

  if(formData.value.pin.length !== 6) {
    showToast("PIN harus tepat 6 angka!", "error");
    return;
  }

  try {
    const timeNow = getMysqlDate();
    
    const dataDikirim = {
      therapist_id: isEdit.value ? formData.value.therapist_id : generateId(),
      fullname: formData.value.fullname,
      shortname: formData.value.shortname,
      phone: formData.value.phone,
      branch: formData.value.branch,
      area: formData.value.area,
      position: formData.value.position,
      pin: formData.value.pin,
      is_admin: formData.value.is_admin ? 1 : 0,
      is_active: formData.value.is_active ? 1 : 0,
      email: formData.value.email, 
      avatar_url: formData.value.avatar_url,
      registration_date: timeNow,
      created_at: timeNow,
      updated_at: timeNow,
      deleted_at: null
    };

    const response = await fetch(`${API_URL}/sync_therapist.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([dataDikirim]) 
    });

    const result = await response.json();

    if (result.status === 'error') {
      throw new Error(result.message || "Gagal menyimpan di server");
    }
    
    await loadData();
    tutupModal();
    
    // Ganti alert dengan Toast sukses
    if (isEdit.value) {
      showToast("Data akun berhasil diperbarui!", "success");
    } else {
      showToast("Terapis baru berhasil ditambahkan!", "success");
    }
    
  } catch (error) {
    console.error(error);
    showToast("Terjadi kesalahan: " + error.message, "error");
  }
};
</script>

<style scoped>
.modal-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent; 
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 4px;
}
</style>
