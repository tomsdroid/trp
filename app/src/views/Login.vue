<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center px-6 relative">
    
    <!-- TAMPILAN LOGIN NORMAL -->
    <div v-if="!isResettingPin" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center w-full max-w-sm mx-auto">
      
      <!-- Avatar User -->
      <div v-if="terapisTersimpan" class="mb-4">
        <div class="w-16 h-16 mx-auto rounded-full bg-teal-100 flex items-center justify-center overflow-hidden border-2 border-teal-500 shadow-sm">
          <img v-if="terapisTersimpan.avatar_url || terapisTersimpan.avatarUrl" :src="terapisTersimpan.avatar_url || terapisTersimpan.avatarUrl" class="w-full h-full object-cover">
          <UserIcon v-else :size="32" class="text-teal-600" />
        </div>
        <h2 class="text-lg font-bold text-slate-800 mt-2">{{ terapisTersimpan.fullname }}</h2>
        <p class="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{{ terapisTersimpan.position }} {{ terapisTersimpan.branch }} {{ terapisTersimpan.area }}</p>
      </div>

      <div v-else class="w-14 h-14 bg-teal-50 mx-auto rounded-full flex items-center justify-center mb-4 text-teal-600 shadow-sm">
        <LockIcon :size="24" />
      </div>

      <h2 v-if="!terapisTersimpan" class="text-lg font-bold text-slate-800 mb-6">Masuk Terapio</h2>

      <form v-if="terapisTersimpan" @submit.prevent="loginTerapis" class="space-y-4">
        <div>
          <input v-model="loginPin" type="password" maxlength="6" inputmode="numeric" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-4 text-2xl outline-none focus:border-teal-500 text-center tracking-[0.5em] font-bold shadow-inner" required placeholder="••••••">
        </div>
        
        <p v-if="errorMsg" class="text-red-500 text-[11px] font-bold leading-tight px-2">{{ errorMsg }}</p>
        
        <button type="submit" class="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md">
          Buka Aplikasi
        </button>
      </form>

      <div v-else class="py-4">
        <p class="text-xs text-slate-500 mb-4">Tidak ada profil terdaftar.</p>
        <button @click="$router.push('/register')" class="w-full bg-teal-600 text-white font-bold py-3 rounded-xl text-sm shadow-md">Buat Profil</button>
      </div>

      <button v-if="terapisTersimpan" @click="mulaiResetPin" class="text-[11px] font-bold text-slate-400 hover:text-teal-600 mt-4">Lupa PIN?</button>

      <!-- Tombol Sidik Jari -->
      <div v-if="terapisTersimpan" class="mt-6 pt-6 border-t border-slate-50">
        <p class="text-[10px] text-slate-400 mb-3 font-bold uppercase tracking-wider">Atau dengan Sidik Jari</p>
        <button type="button" @click="loginBiometric" class="w-16 h-16 mx-auto bg-slate-50 text-slate-500 border border-slate-100 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 rounded-full flex items-center justify-center active:scale-90 transition-all shadow-sm">
          <FingerprintIcon :size="32" />
        </button>
      </div>
    </div>

    <!-- TAMPILAN LUPA PIN -->
    <div v-else class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center w-full max-w-sm mx-auto">
      <div class="w-14 h-14 bg-orange-50 mx-auto rounded-full flex items-center justify-center mb-4 text-orange-500 shadow-sm"><KeyIcon :size="24" /></div>
      <h2 class="text-lg font-bold text-slate-800 mb-1">Reset PIN</h2>
      <div v-if="resetStep === 1">
        <p class="text-[11px] text-slate-500 mb-5">Masukkan Nomor HP yang didaftarkan.</p>
        <form @submit.prevent="verifikasiUser" class="space-y-4">
          <input v-model="verifyPhone" type="tel" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none text-center font-bold" required placeholder="08123456789">
          <p v-if="resetError" class="text-red-500 text-[10px] font-medium">{{ resetError }}</p>
          <button type="submit" class="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl text-sm">Verifikasi Data</button>
        </form>
      </div>
      <div v-else>
        <p class="text-[11px] text-slate-500 mb-5">Silakan buat PIN baru.</p>
        <form @submit.prevent="simpanPinBaru" class="space-y-4">
          <input v-model="newPin" type="password" maxlength="6" inputmode="numeric" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-4 text-2xl text-center tracking-[0.5em] font-bold" required placeholder="••••••">
          <button type="submit" class="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl text-sm">Simpan PIN Baru</button>
        </form>
      </div>
      <button @click="batalReset" class="text-[11px] font-bold text-slate-400 hover:text-slate-600 mt-6">Batalkan</button>
    </div>

    <!-- POPUP PILIH ROLE -->
    <div v-if="showRoleModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <div class="bg-white p-6 rounded-2xl w-full max-w-xs text-center shadow-2xl">
        <div class="w-16 h-16 bg-orange-50 mx-auto rounded-full flex items-center justify-center mb-4 text-orange-500"><UserCogIcon :size="28" /></div>
        <h3 class="text-lg font-bold text-slate-800 mb-1">Pilih Akses Masuk</h3>
        <div class="space-y-3 mt-6">
          <button @click="lanjutKeDashboard('admin')" class="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl text-sm">Masuk sebagai Admin</button>
          <button @click="lanjutKeDashboard('terapis')" class="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl text-sm">Masuk sebagai Terapis</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../db';
import { Lock as LockIcon, Fingerprint as FingerprintIcon, User as UserIcon, Key as KeyIcon, UserCog as UserCogIcon } from 'lucide-vue-next';

const router = useRouter();
const loginPin = ref('');
const errorMsg = ref('');
const terapisTersimpan = ref(null);
const isResettingPin = ref(false);
const resetStep = ref(1);
const verifyPhone = ref('');
const newPin = ref('');
const resetError = ref('');
const showRoleModal = ref(false);

onMounted(async () => {
  const loggedInId = localStorage.getItem('logged_in_id');
  const activeRole = localStorage.getItem('active_role');
  
  if (loggedInId && activeRole) {
    router.push('/dashboard');
    return; 
  }

  // PERBAIKAN: Fokus murni pada therapist_id
  let lastId = localStorage.getItem('last_logged_in_id'); 
  
  if (!lastId) {
    const semuaTerapis = await db.therapists.toArray();
    if (semuaTerapis.length > 0) {
      lastId = semuaTerapis[0].therapist_id;
    }
  }
  
  if (lastId) {
    terapisTersimpan.value = await db.therapists.get(lastId);
    
    // Fallback pencarian manual di Dexie khusus untuk therapist_id
    if (!terapisTersimpan.value) {
      const semuaData = await db.therapists.toArray();
      terapisTersimpan.value = semuaData.find(t => t.therapist_id === lastId);
    }
  }

  document.addEventListener('deviceready', () => {
    if (!window.Fingerprint) {
      console.warn("Plugin Fingerprint belum terpasang/tidak berjalan di browser!");
    }
  }, false);
});

const prosesLoginBerhasil = () => {
  errorMsg.value = '';
  if (terapisTersimpan.value.is_admin == 1 || terapisTersimpan.value.is_admin === '1') {
    showRoleModal.value = true;
  } else {
    lanjutKeDashboard('terapis');
  }
};

const loginTerapis = async () => {
  if (terapisTersimpan.value && String(terapisTersimpan.value.pin) === String(loginPin.value)) {
    prosesLoginBerhasil();
  } else {
    errorMsg.value = 'PIN salah. Silakan coba lagi.';
  }
};

const loginBiometric = () => {
  errorMsg.value = ''; 
  const isEnabled = localStorage.getItem('use_biometrics') === 'true';

  if (!isEnabled) {
    errorMsg.value = "Sensor sidik jari belum diaktifkan di Pengaturan.";
    return;
  }

  if (window.Fingerprint) {
    window.Fingerprint.show(
      {
        description: "Sentuh sensor untuk masuk ke Terapio",
        disableBackup: true,
      },
      (success) => {
        prosesLoginBerhasil();
      },
      (error) => {
        errorMsg.value = "Otentikasi sidik jari gagal atau dibatalkan.";
      }
    );
  } else {
    errorMsg.value = "Sensor sidik jari tidak ditemukan pada perangkat ini.";
  }
};

const lanjutKeDashboard = (role) => {
  const uniqueId = terapisTersimpan.value.therapist_id; // STRICT
  localStorage.setItem('logged_in_id', uniqueId);
  localStorage.setItem('last_logged_in_id', uniqueId); 
  localStorage.setItem('active_role', role);
  showRoleModal.value = false;
  router.push('/dashboard');
};

const mulaiResetPin = () => { isResettingPin.value = true; resetError.value = ''; };
const verifikasiUser = () => {
  if (terapisTersimpan.value.phone === verifyPhone.value) {
    resetStep.value = 2;
    resetError.value = '';
  } else {
    resetError.value = 'Nomor HP tidak sesuai dengan profil.';
  }
};
const simpanPinBaru = async () => {
  const uniqueId = terapisTersimpan.value.therapist_id; // STRICT
  await db.therapists.update(uniqueId, { pin: newPin.value });
  alert('PIN berhasil diperbarui.');
  batalReset();
};
const batalReset = () => { isResettingPin.value = false; loginPin.value = ''; resetStep.value = 1; };
</script>
