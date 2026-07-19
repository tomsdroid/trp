<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <div class="bg-purple-500 text-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
      <button @click="$router.back()" class="mr-3 active:scale-90 transition-transform">
        <ArrowLeftIcon :size="20" />
      </button>
      <h2 class="text-base font-bold flex-1">Kritik & Saran</h2>
    </div>

    <div class="p-4 flex-1">
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <p class="text-[11px] text-slate-500 mb-4">Punya masukan untuk aplikasi ini? Atau menemukan error? Beritahu tim IT kami.</p>

        <form @submit.prevent="kirimLaporan" class="space-y-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori Laporan</label>
            <select v-model="formData.kategori" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500">
              <option value="Aplikasi Error / Bug">Aplikasi Error / Bug</option>
              <option value="Usulan Fitur Baru">Usulan Fitur Baru</option>
              <option value="Masalah Data Sinkronisasi">Masalah Data Sinkronisasi</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pesan Anda</label>
            <textarea v-model="formData.pesan" rows="4" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 placeholder:text-slate-300" placeholder="Jelaskan detail kendala Anda..." required></textarea>
          </div>
          
          <button type="submit" :disabled="isSubmitting" class="w-full text-white font-bold py-2.5 rounded-lg mt-2 text-sm transition-all flex items-center justify-center gap-2"
                  :class="isSubmitting ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-500 active:scale-95'">
            <LoaderIcon v-if="isSubmitting" :size="16" class="animate-spin" />
            {{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ArrowLeft as ArrowLeftIcon, Loader as LoaderIcon } from 'lucide-vue-next';
import { showToast } from '../composables/useToast'; 

// AMBIL DARI FILE .env
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN; 
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

const isSubmitting = ref(false);
const formData = ref({
  kategori: 'Aplikasi Error / Bug',
  pesan: ''
});

const currentTherapistId = localStorage.getItem('logged_in_id') || 'Unknown User';

const kirimLaporan = async () => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    showToast('Konfigurasi sistem belum lengkap', 'error');
    return;
  }

  if (!formData.value.pesan.trim()) {
    showToast('Pesan tidak boleh kosong', 'error');
    return;
  }

  isSubmitting.value = true;

  try {
    const textMessage = `📢 *LAPORAN TERAPIO BARU*\n\n👤 *Pengirim:* ${currentTherapistId}\n🏷 *Kategori:* ${formData.value.kategori}\n📝 *Pesan:*\n_${formData.value.pesan}_\n\n🕒 *Waktu:* ${new Date().toLocaleString('id-ID')} WIB`;

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: textMessage,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();

    if (result.ok) {
      showToast('Laporan berhasil dikirim! Terima kasih.', 'success');
      formData.value.pesan = ''; 
    } else {
      throw new Error(result.description || 'Gagal mengirim ke Telegram');
    }

  } catch (error) {
    console.error(error);
    showToast('Gagal mengirim laporan. Cek koneksi Anda.', 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
