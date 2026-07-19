<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Header Sky Blue -->
    <div class="bg-sky-500 text-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
      <button @click="router.back()" class="mr-3 active:scale-90 transition-transform">
        <ArrowLeftIcon :size="20" />
      </button>
      <h2 class="text-base font-bold flex-1">Pusat Bantuan</h2>
    </div>

    <!-- Tombol WhatsApp Cepat -->
    <div class="bg-sky-500 px-4 pb-6 rounded-b-[1.5rem] shadow-sm text-center">
      <button @click="hubungiAdmin" class="w-full bg-white text-sky-600 font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95">
        <MessageCircleIcon :size="20" class="text-green-500" /> Chat Admin via WhatsApp
      </button>
    </div>

    <div class="p-4 flex-1 mt-2">
      <h3 class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3 pl-1">Tanya Jawab Terpopuler</h3>
      
      <!-- FAQ Accordion Dinamis -->
      <div class="space-y-2">
        <div v-for="(faq, index) in daftarFaq" :key="index" 
             @click="toggleFaq(index)"
             class="cursor-pointer transition-all duration-300 rounded-xl shadow-sm border"
             :class="activeIndex === index ? 'bg-white border-sky-200 ring-1 ring-sky-100 p-3.5' : 'bg-white border-slate-100 p-3.5'">
          
          <div class="flex justify-between items-center"
               :class="activeIndex === index ? 'text-sky-700 mb-2' : 'text-slate-700'">
            <h4 class="text-xs font-bold text-left">{{ faq.pertanyaan }}</h4>
            <ChevronUpIcon v-if="activeIndex === index" :size="16" class="text-sky-500 shrink-0" />
            <ChevronDownIcon v-else :size="16" class="text-slate-400 shrink-0" />
          </div>
          
          <!-- Jawaban (Hanya muncul jika index cocok) -->
          <p v-show="activeIndex === index" class="text-[10px] text-slate-500 leading-relaxed">
            {{ faq.jawaban }}
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft as ArrowLeftIcon, MessageCircle as MessageCircleIcon, ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon } from 'lucide-vue-next';

const router = useRouter();

// ================= STATE =================
const activeIndex = ref(null); // Menyimpan index FAQ yang sedang terbuka

// ================= DATA FAQ =================
const daftarFaq = ref([
  {
    pertanyaan: "Kenapa data saya tidak sinkron?",
    jawaban: "Pastikan Anda memiliki koneksi internet yang stabil. Anda bisa masuk ke menu Sinkronisasi dan menekan tombol 'Mulai Sinkronisasi' secara manual jika data belum otomatis terkirim."
  },
  {
    pertanyaan: "Lupa PIN Login Aplikasi",
    jawaban: "Jika Anda lupa PIN, masuk ke menu Pengaturan lalu pilih 'Hapus Data Lokal & Reset'. Setelah itu daftarkan ulang profil Anda dari halaman awal menggunakan ID yang sama."
  },
  {
    pertanyaan: "Cara edit sesi yang salah input?",
    jawaban: "Sesi yang sudah diinput tidak bisa diubah langsung oleh Terapis melalui aplikasi. Silakan klik tombol 'Chat Admin via WhatsApp' di atas untuk meminta Admin memperbaiki data Anda di server."
  }
]);

// ================= FUNGSI UTAMA =================
const toggleFaq = (index) => {
  // Jika di-klik kotak yang sama, maka akan tertutup (null). Jika kotak lain, ganti yang terbuka.
  activeIndex.value = activeIndex.value === index ? null : index;
};

const hubungiAdmin = () => {
  // Mengubah awalan 0 menjadi 62 agar formatnya sesuai dengan API WhatsApp Internasional
  const nomorWa = "62895350422012"; 
  const pesan = encodeURIComponent("Halo Admin, saya butuh bantuan terkait aplikasi pencatatan.");
  
  // Membuka WhatsApp di tab/aplikasi baru
  window.open(`https://wa.me/${nomorWa}?text=${pesan}`, '_blank');
};
</script>
