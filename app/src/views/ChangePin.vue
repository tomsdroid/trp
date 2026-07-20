<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Header -->
    <div class="bg-teal-600 text-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center">
      <button @click="$router.back()" class="mr-3 active:scale-90 transition-transform"><ArrowLeftIcon :size="20" /></button>
      <h2 class="text-base font-bold flex-1">Ubah PIN Keamanan</h2>
    </div>

    <!-- Form Container -->
    <div class="p-4 flex-1 pt-6">
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <p class="text-[11px] text-slate-500 mb-5 text-center">Ganti PIN Anda secara berkala untuk menjaga keamanan akun lokal ini.</p>

        <form @submit.prevent="simpanPinBaru" class="space-y-4">
          
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">PIN Saat Ini</label>
            <input v-model="form.oldPin" type="password" maxlength="6" inputmode="numeric" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 text-center tracking-[0.5em] text-lg font-bold" required placeholder="••••••">
          </div>

          <hr class="border-slate-100 my-2">

          <div>
            <label class="block text-[10px] font-bold text-teal-600 uppercase mb-1">PIN Baru (6 Angka)</label>
            <input v-model="form.newPin" type="password" maxlength="6" inputmode="numeric" class="w-full bg-teal-50/50 border border-teal-200 text-teal-800 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 text-center tracking-[0.5em] text-lg font-bold" required placeholder="••••••">
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Konfirmasi PIN Baru</label>
            <input v-model="form.confirmPin" type="password" maxlength="6" inputmode="numeric" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 text-center tracking-[0.5em] text-lg font-bold" required placeholder="••••••">
          </div>
          
          <button type="submit" class="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold py-3 rounded-xl mt-2 text-sm transition-all shadow-sm">
            Perbarui PIN
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../db';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-vue-next';
import { showToast } from '../composables/useToast';

const router = useRouter();
const currentId = localStorage.getItem('logged_in_id');
const form = reactive({ oldPin: '', newPin: '', confirmPin: '' });

const simpanPinBaru = async () => {
  if (form.newPin.length !== 6) {
    showToast('PIN harus 6 angka!', 'error');
    return;
  }
  if (form.newPin !== form.confirmPin) {
    showToast('Konfirmasi PIN tidak cocok!', 'error');
    return;
  }

  try {
    // 1. Ambil data asli dari Dexie
    const terapisData = await db.therapists.get(currentId);
    
    if (terapisData) {
      if (terapisData.pin !== form.oldPin) {
        showToast('PIN saat ini salah!', 'error');
        return;
      }

      // 2. Siapkan data untuk dikirim ke server
      const payload = [{
        ...terapisData,
        pin: form.newPin, // Update PIN
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }];

      // 3. Tembak API Server
      const response = await fetch('https://terapio.cahayaelektrik.com/api/sync_therapist.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();

      if (result.status === 'success') {
        // 4. Jika server oke, baru update lokal
        await db.therapists.update(currentId, { pin: form.newPin });
        showToast('PIN berhasil diperbarui di server & lokal!', 'success');
        router.back();
      } else {
        showToast('Gagal update ke server: ' + (result.message || 'Error'), 'error');
      }
    }
  } catch (error) {
    showToast('Terjadi kesalahan jaringan.', 'error');
    console.error(error);
  }
};
</script>
