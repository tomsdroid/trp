<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[70px]">
    <!-- Header -->
    <div class="bg-teal-600 text-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
      <button @click="$router.back()" class="mr-3 active:scale-90 transition-transform"><ArrowLeftIcon :size="20" /></button>
      <h2 class="text-base font-bold flex-1">Edit Profil</h2>
    </div>

    <!-- Form Container -->
    <div class="px-4 py-6 flex-1">
      
      <!-- Area Ganti Avatar -->
      <div class="flex flex-col items-center mb-6">
        <div class="relative group cursor-pointer" @click="triggerFileInput">
          <!-- Tampilkan Avatar jika ada, jika tidak pakai icon default -->
          <div v-if="form.avatar_url" class="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100">
            <img :src="form.avatar_url" class="w-full h-full object-cover" alt="Avatar">
          </div>
          <div v-else class="w-24 h-24 bg-teal-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-teal-500">
            <UserIcon :size="40" />
          </div>
          
          <div class="absolute bottom-0 right-0 bg-teal-500 text-white p-2 rounded-full border-2 border-white shadow-sm active:scale-90 transition-transform">
            <CameraIcon :size="14" />
          </div>
        </div>
        
        <p class="text-[10px] text-slate-400 mt-2 font-medium">Ketuk foto untuk mengubah</p>
        
        <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileChange">
      </div>

      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <form @submit.prevent="simpanPerubahan" class="space-y-3">
          
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Lengkap (KTP)</label>
            <input v-model="form.fullname" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500" required>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Panggilan</label>
              <input v-model="form.shortname" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500" required>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">No. HP / WA</label>
              <input v-model="form.phone" type="tel" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500" required>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cabang Klinik</label>
              <input v-model="form.branch" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500" required>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Area / Kota</label>
              <input v-model="form.area" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500" required>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Aktif</label>
            <input v-model="form.email" type="email" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500" required>
          </div>
          
          <button type="submit" class="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold py-2.5 rounded-lg mt-4 text-sm transition-all shadow-sm">
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../db';
import { showToast } from '../composables/useToast';
import { ArrowLeft as ArrowLeftIcon, User as UserIcon, Camera as CameraIcon } from 'lucide-vue-next';

const router = useRouter();
const currentId = localStorage.getItem('logged_in_id');
const fileInput = ref(null);

const form = reactive({ 
  fullname: '', 
  shortname: '', 
  phone: '', 
  branch: '', 
  area: '', 
  email: '',
  avatar_url: '' 
});

onMounted(async () => {
  if (currentId) {
    const data = await db.therapists.get(currentId);
    if (data) {
      form.fullname = data.fullname;
      form.shortname = data.shortname;
      form.phone = data.phone;
      form.branch = data.branch;
      form.area = data.area;
      form.email = data.email;
      form.avatar_url = data.avatar_url || '';
    }
  }
});

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 2MB!', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      form.avatar_url = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const simpanPerubahan = async () => {
  try {
    await db.therapists.update(currentId, {
      fullname: form.fullname,
      shortname: form.shortname,
      phone: form.phone,
      branch: form.branch,
      area: form.area,
      email: form.email,
      avatar_url: form.avatar_url,
      _isDirty: true
    });
    
    showToast('Profil berhasil diperbarui!', 'success');
    
    setTimeout(() => {
      router.back();
    }, 1000); 
    
  } catch (error) {
    console.error("Gagal update profil:", error);
    showToast('Terjadi kesalahan saat menyimpan data.', 'error');
  }
};
</script>
