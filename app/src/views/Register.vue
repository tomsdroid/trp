<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4">
    
    <div class="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="bg-teal-600 px-6 py-8 text-center text-white">
        <h1 class="text-2xl font-extrabold mb-1">Daftar Terapis</h1>
        <p class="text-teal-100 text-xs font-medium">Isi form di bawah untuk bergabung dengan Terapio</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="kirimKeWhatsApp" class="p-6 space-y-4">
        
        <!-- Nama Lengkap -->
        <div>
          <label class="text-xs font-bold text-slate-500 mb-1 block">Nama Lengkap</label>
          <input v-model="form.fullname" type="text" placeholder="Misal: Siti Aminah" 
                 class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" required>
        </div>

        <!-- Nama Panggilan -->
        <div>
          <label class="text-xs font-bold text-slate-500 mb-1 block">Nama Panggilan (Muncul di Aplikasi)</label>
          <input v-model="form.shortname" type="text" placeholder="Misal: Ami" 
                 class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" required>
        </div>

        <!-- No WhatsApp -->
        <div>
          <label class="text-xs font-bold text-slate-500 mb-1 block">Nomor WhatsApp</label>
          <input v-model="form.phone" type="tel" placeholder="Misal: 081234567890" 
                 class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" required>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- Pilihan Cabang -->
          <div>
            <label class="text-xs font-bold text-slate-500 mb-1 block">Pilih Cabang</label>
            <input v-model="form.branch" type="text" placeholder="Misal: Amarta" 
                   class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" required>
          </div>
          
          <!-- Pilihan Area -->
          <div>
            <label class="text-xs font-bold text-slate-500 mb-1 block">Area</label>
            <input v-model="form.area" type="text" placeholder="Misal: Palembang" 
                   class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500" required>
          </div>
        </div>

        <!-- Buat PIN -->
        <div>
          <label class="text-xs font-bold text-slate-500 mb-1 block">Buat PIN (6 Angka)</label>
          <input v-model="form.pin" type="text" maxlength="6" inputmode="numeric" placeholder="Misal: 123456" 
                 class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500 tracking-widest" required>
          <p class="text-[10px] text-slate-400 mt-1">PIN ini akan digunakan untuk login ke aplikasi.</p>
        </div>

        <!-- Tombol Kirim -->
        <button type="submit" 
                class="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-transform shadow-lg shadow-green-500/30 mt-6 flex items-center justify-center gap-2">
          <!-- Icon WhatsApp sederhana dari SVG -->
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Kirim Pendaftaran via WA
        </button>

        <p class="text-center text-[10px] text-slate-400 mt-4">
          Sudah punya akun? <router-link to="/login" class="text-teal-600 font-bold underline">Login di sini</router-link>
        </p>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const form = ref({
  fullname: '',
  shortname: '',
  phone: '',
  branch: '',
  area: '',
  pin: ''
});

// GANTI DENGAN NOMOR WA ADMIN KAMU (Gunakan format 62 tanpa angka 0 di depan)
const nomorWaAdmin = '62895350422012'; 

const kirimKeWhatsApp = () => {
  // Validasi PIN harus 6 angka
  if (form.value.pin.length !== 6 || isNaN(form.value.pin)) {
    alert("PIN harus berupa 6 digit angka!");
    return;
  }

  // Merakit pesan WhatsApp
  const pesan = `Halo Admin Terapio, saya ingin mendaftar sebagai Terapis baru. Berikut data diri saya:

*Nama Lengkap:* ${form.value.fullname}
*Nama Panggilan:* ${form.value.shortname}
*No. WhatsApp:* ${form.value.phone}
*Cabang:* ${form.value.branch}
*Area:* ${form.value.area}
*PIN Login:* ${form.value.pin}

Mohon bantuannya untuk didaftarkan ke dalam sistem aplikasi. Terima kasih!`;

  // Encode pesan agar aman dikirim lewat URL
  const pesanEncoded = encodeURIComponent(pesan);

  // Membuat link WhatsApp (wa.me)
  const waLink = `https://wa.me/${nomorWaAdmin}?text=${pesanEncoded}`;

  // Membuka WhatsApp di tab/aplikasi baru
  window.open(waLink, '_blank');
};
</script>
