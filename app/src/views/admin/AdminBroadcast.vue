<template>
  <div class="min-h-screen bg-slate-50 p-4">
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 class="text-lg font-bold text-slate-800 mb-4">Buat Notifikasi Baru</h2>
      
      <form @submit.prevent="kirimNotifikasi" class="space-y-4">
        <div>
          <label class="text-[10px] font-bold text-slate-400 uppercase">Judul</label>
          <input v-model="form.title" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1" required placeholder="Contoh: Pengumuman Lembur">
        </div>

        <div>
          <label class="text-[10px] font-bold text-slate-400 uppercase">Tipe</label>
          <select v-model="form.type" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1">
            <option value="info">Info</option>
            <option value="success">Sukses</option>
            <option value="warning">Peringatan</option>
          </select>
        </div>

        <div>
          <label class="text-[10px] font-bold text-slate-400 uppercase">Pesan</label>
          <textarea v-model="form.message" rows="5" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1" required placeholder="Tulis isi pesan pengumuman..."></textarea>
        </div>

        <button :disabled="loading" class="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 shadow-md">
          {{ loading ? 'Mengirim...' : 'Kirim ke Semua Terapis' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from '../../composables/useToast';

const router = useRouter();
const loading = ref(false);
const form = ref({ title: '', type: 'info', message: '' });

const kirimNotifikasi = async () => {
  loading.value = true;
  try {
    const res = await fetch('https://terapio.cahayaelektrik.com/api/send_notifikasi.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    const result = await res.json();
    if (result.status === 'success') {
      showToast('Pesan berhasil dikirim!', 'success');
      router.back();
    }
  } catch (e) {
    showToast('Gagal mengirim pesan', 'error');
  } finally {
    loading.value = false;
  }
};
</script>
