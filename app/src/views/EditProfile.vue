<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-[70px]">
    <div class="bg-teal-600 text-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
      <button @click="$router.back()" class="mr-3 active:scale-90 transition-transform"><ArrowLeftIcon :size="20" /></button>
      <h2 class="text-base font-bold flex-1">Edit Profil</h2>
    </div>

    <div class="px-4 py-6 flex-1">
      <!-- FOTO PROFIL (HANYA LOKAL) -->
      <div class="flex flex-col items-center mb-6">
        <div class="relative group cursor-pointer" @click="triggerFileInput">
          <div class="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
            <img v-if="form.avatar_url" :src="form.avatar_url" class="w-full h-full object-cover" alt="Avatar">
            <UserIcon v-else :size="40" class="text-teal-500" />
          </div>
          <div class="absolute bottom-0 right-0 bg-teal-500 text-white p-2 rounded-full border-2 border-white shadow-sm">
            <CameraIcon :size="14" />
          </div>
        </div>
        <p class="text-[10px] text-slate-400 mt-2 font-medium">Ketuk foto untuk ganti</p>
        <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileChange">
      </div>

      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <form @submit.prevent="simpanPerubahan" class="space-y-3">
          
          <!-- DISABLED FIELDS -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Lengkap</label>
            <input v-model="form.fullname" type="text" disabled class="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <!-- BISA DIEDIT (TEMBAK SERVER) -->
            <div>
              <label class="block text-[10px] font-bold text-teal-600 uppercase mb-1">Panggilan</label>
              <input v-model="form.shortname" type="text" required class="w-full bg-slate-50 border border-teal-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all">
            </div>
            
            <!-- DISABLED FIELDS -->
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">No. HP</label>
              <input v-model="form.phone" type="tel" disabled class="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <!-- DISABLED FIELDS -->
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cabang</label>
              <input v-model="form.branch" type="text" disabled class="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Area</label>
              <input v-model="form.area" type="text" disabled class="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
            </div>
          </div>
          
          <!-- BISA DIEDIT (TEMBAK SERVER) -->
          <div>
            <label class="block text-[10px] font-bold text-teal-600 uppercase mb-1">Email Aktif</label>
            <input v-model="form.email" type="email" class="w-full bg-slate-50 border border-teal-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all">
          </div>
          
          <button type="submit" :disabled="isSubmitting" class="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold py-3 rounded-lg mt-4 text-sm transition-all shadow-sm flex justify-center items-center">
            {{ isSubmitting ? 'Menyimpan ke Server...' : 'Simpan Perubahan' }}
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
const isSubmitting = ref(false);

const dataLama = ref({}); // Menyimpan data original dari DB
const form = reactive({ fullname: '', shortname: '', phone: '', branch: '', area: '', email: '', avatar_url: '' });

onMounted(async () => {
  if (currentId) {
    // 1. CARA BACA ANTI GAGAL
    const semuaTerapis = await db.therapists.toArray();
    const data = semuaTerapis.find(t => t.therapist_id == currentId);
    
    if (data) {
      dataLama.value = { ...data }; // Kopi data asli
      Object.assign(form, data);
    }
  }
});

const triggerFileInput = () => fileInput.value.click();

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => { form.avatar_url = e.target.result; };
  reader.readAsDataURL(file);
};

const simpanPerubahan = async () => {
  if (!currentId) return;
  isSubmitting.value = true;
  
  try {
    // 1. SIAPKAN PAYLOAD UNTUK SERVER
    // avatar_url SUDAH DIHAPUS DARI SINI KARENA DI SERVER SUDAH TIDAK ADA
    const payload = [{
      therapist_id: currentId,
      fullname: dataLama.value.fullname,
      shortname: form.shortname, 
      phone: dataLama.value.phone,
      branch: dataLama.value.branch,
      area: dataLama.value.area,
      email: form.email, 
      
      pin: dataLama.value.pin, 
      position: dataLama.value.position,
      is_admin: dataLama.value.is_admin,
      is_active: dataLama.value.is_active,
      created_at: dataLama.value.created_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }];

    // 2. TEMBAK API SERVER
    const response = await fetch('https://terapio.cahayaelektrik.com/api/sync_therapist.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      // 3. UPDATE LOKAL MENGGUNAKAN MODIFY AGAR TIPE DATA ID TIDAK JADI MASALAH
      await db.therapists.where('therapist_id').equals(currentId).modify({ 
        shortname: form.shortname,
        email: form.email,
        avatar_url: form.avatar_url // Foto tersimpan LOKAL SAJA di Dexie
      });
      
      showToast('Profil berhasil diupdate ke server!', 'success');
      setTimeout(() => router.back(), 1000);
    } else {
      showToast(result.message || 'Gagal update ke server', 'error');
    }
    
  } catch (error) {
    console.error(error);
    showToast('Gagal terhubung ke server', 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
