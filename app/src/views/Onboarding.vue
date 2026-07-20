<template>
  <div class="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>

    <div class="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
      
      <div v-if="slideAktif < 3" class="relative w-40 aspect-[9/19] bg-white border-[6px] border-slate-800 rounded-[24px] shadow-xl overflow-hidden mb-6 transition-all duration-300">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-2.5 bg-slate-800 rounded-b-md z-10"></div>
        <img :src="slides[slideAktif].img" class="w-full h-full object-cover object-top" alt="Mockup">
      </div>
      
      <div v-else class="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mb-6 text-teal-600 shadow-inner">
        <ShieldCheckIcon :size="48" />
      </div>

      <h2 class="text-xl font-bold text-slate-800 mb-2 transition-all">{{ slides[slideAktif].judul }}</h2>
      <p class="text-xs text-slate-500 px-4 leading-relaxed transition-all min-h-[3rem]">{{ slides[slideAktif].deskripsi }}</p>
    </div>

    <div class="p-4 bg-white border-t border-slate-100 z-10">
      
      <div class="flex justify-center gap-1.5 mb-5">
        <div v-for="(item, index) in slides" :key="index" 
             class="h-1.5 rounded-full transition-all duration-300"
             :class="slideAktif === index ? 'w-5 bg-teal-600' : 'w-1.5 bg-slate-200'">
        </div>
      </div>

      <div v-if="slideAktif < 3">
        <button @click="nextSlide" class="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md">
          Selanjutnya
        </button>
      </div>
      
      <div v-else>
        <button @click="stepModal = 'id'" class="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-teal-500/20">
          Mulai Sekarang
        </button>
      </div>
    </div>

    <!-- POPUP KONEKSI / ONBOARDING BERTAHAP -->
    <div v-if="stepModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      
      <!-- TAHAP 1: INPUT ID -->
      <div v-if="stepModal === 'id'" class="bg-white p-6 rounded-3xl w-full max-w-xs text-center shadow-2xl scale-in">
        <div class="w-14 h-14 bg-teal-50 mx-auto rounded-full flex items-center justify-center mb-4 text-teal-600">
          <UserIcon :size="24" />
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-1">Masukkan ID Anda</h3>
        <p class="text-[11px] text-slate-500 mb-5 leading-relaxed">Masukkan ID Terapis yang telah diberikan oleh Admin.</p>
        
        <form @submit.prevent="cekIdTerapis" class="space-y-4">
          <input v-model="inputId" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center font-bold tracking-widest text-slate-700 outline-none focus:border-teal-500 uppercase" placeholder="TRPXXXXXXX" required>
          <p v-if="errorMsg" class="text-red-500 text-[10px] font-medium">{{ errorMsg }}</p>
          <button type="submit" :disabled="isLoading" class="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-all shadow-md flex justify-center items-center">
            <span v-if="isLoading" class="animate-pulse">Mencari Data...</span>
            <span v-else>Cek Data</span>
          </button>
        </form>

        <p class="mt-5 text-[11px] text-slate-500 font-medium">
          Belum punya ID? 
          <button @click="$router.push('/register')" class="text-teal-600 font-extrabold hover:underline">Daftar Disini!</button>
        </p>

        <button @click="tutupModal" class="mt-3 text-[11px] font-bold text-slate-400 hover:text-slate-600">Batal</button>
      </div>

      <!-- TAHAP 2: KONFIRMASI DATA -->
      <div v-if="stepModal === 'confirm'" class="bg-white p-6 rounded-3xl w-full max-w-xs text-center shadow-2xl scale-in">
        <div class="w-20 h-20 mx-auto rounded-full bg-teal-100 flex items-center justify-center overflow-hidden border-4 border-teal-50 shadow-md mb-4">
          <img v-if="dataTerapis.avatar_url" :src="dataTerapis.avatar_url" class="w-full h-full object-cover">
          <UserIcon v-else :size="32" class="text-teal-600" />
        </div>
        <p class="text-[10px] text-teal-600 uppercase tracking-widest font-bold mb-1">Data Ditemukan</p>
        <h3 class="text-lg font-extrabold text-slate-800 mb-1">{{ dataTerapis.fullname }}</h3>
        
        <p class="text-xs text-slate-500 mb-6 font-medium">
          {{ dataTerapis.position }} - {{ dataTerapis.branch }} - {{ dataTerapis.area }}
        </p>
        
        <div class="space-y-3">
          <button @click="stepModal = 'pin'" class="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-all shadow-md">
            Ya, Ini Saya
          </button>
          <button @click="stepModal = 'id'" class="w-full bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-all">
            Bukan Saya
          </button>
        </div>
      </div>

      <!-- TAHAP 3: INPUT PIN -->
      <div v-if="stepModal === 'pin'" class="bg-white p-6 rounded-3xl w-full max-w-xs text-center shadow-2xl scale-in">
        <div class="w-14 h-14 bg-orange-50 mx-auto rounded-full flex items-center justify-center mb-4 text-orange-500">
          <LockIcon :size="24" />
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-1">Verifikasi PIN</h3>
        <p class="text-[11px] text-slate-500 mb-5 leading-relaxed">Masukkan 6 angka PIN keamanan akun Anda.</p>
        
        <form @submit.prevent="verifikasiPin" class="space-y-4">
          <input v-model="inputPin" type="password" maxlength="6" inputmode="numeric" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-4 text-2xl outline-none focus:border-orange-500 text-center tracking-[0.5em] font-bold shadow-inner text-slate-700" placeholder="••••••" required>
          <p v-if="errorMsg" class="text-red-500 text-[10px] font-medium">{{ errorMsg }}</p>
          <button type="submit" class="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-all shadow-md">
            Verifikasi & Masuk
          </button>
        </form>
        <button @click="stepModal = 'confirm'" class="mt-4 text-[11px] font-bold text-slate-400 hover:text-slate-600">Kembali</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../db';
import { ShieldCheck as ShieldCheckIcon, User as UserIcon, Lock as LockIcon } from 'lucide-vue-next';

const router = useRouter();
const slideAktif = ref(0);

const slides = [
  { img: './screenshot/input.png', judul: 'Catat Sesi Terapi', deskripsi: 'Pencatatan lebih cepat dan rapi. Semua layanan produk ada dalam genggaman Anda.' },
  { img: './screenshot/statistik.png', judul: 'Pantau Kinerja', deskripsi: 'Lihat progres kerja bulanan Anda lewat grafik visual yang akurat secara real-time.' },
  { img: './screenshot/home.png', judul: 'Offline & Sinkron', deskripsi: 'Tak ada sinyal? Tetap bisa input data. Otomatis terkirim saat internet kembali stabil.' },
  { img: '', judul: 'Siap Memulai?', deskripsi: 'Amankan data terapi Anda sekarang. Daftarkan perangkat Anda.' }
];

const nextSlide = () => {
  if (slideAktif.value < 3) slideAktif.value++;
};

const stepModal = ref(null); 
const inputId = ref('');
const inputPin = ref('');
const errorMsg = ref('');
const isLoading = ref(false);
const dataTerapis = ref(null);

const API_URL = 'https://terapio.cahayaelektrik.com/api';

const tutupModal = () => {
  stepModal.value = null;
  inputId.value = '';
  inputPin.value = '';
  errorMsg.value = '';
};

const cekIdTerapis = async () => {
  if (!inputId.value) return;
  isLoading.value = true;
  errorMsg.value = '';
  
  try {
    const response = await fetch(`${API_URL}/check_therapist.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: inputId.value.toUpperCase() })
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      dataTerapis.value = result.data;
      stepModal.value = 'confirm'; 
    } else {
      errorMsg.value = result.message || 'ID tidak ditemukan atau tidak aktif.';
    }
  } catch (error) {
    errorMsg.value = 'Gagal terhubung ke server. Pastikan internet Anda aktif.';
  } finally {
    isLoading.value = false;
  }
};

const verifikasiPin = async () => {
  errorMsg.value = '';
  
  if (String(inputPin.value) === String(dataTerapis.value.pin)) {
    try {
      // PERBAIKAN: Fokus murni pada therapist_id
      const uniqueId = dataTerapis.value.therapist_id || inputId.value.toUpperCase();
      
      const dataUntukDisimpan = {
        ...dataTerapis.value,
        therapist_id: uniqueId, 
        _isDirty: 0
      };

      await db.therapists.put(dataUntukDisimpan);
      
      // Langsung Set Login & Redirect
      localStorage.setItem('logged_in_id', uniqueId);
      localStorage.setItem('last_logged_in_id', uniqueId);
      
      if (dataTerapis.value.is_admin == 1 || dataTerapis.value.is_admin === '1') {
        localStorage.setItem('active_role', 'admin');
      } else {
        localStorage.setItem('active_role', 'terapis');
      }

      tutupModal();
      router.push('/'); 
      
    } catch (error) {
      errorMsg.value = 'Gagal menyimpan ke HP: ' + error.message;
    }
  } else {
    errorMsg.value = 'PIN yang Anda masukkan salah.';
  }
};
</script>

<style scoped>
.scale-in {
  animation: scaleIn 0.2s ease-out forwards;
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
