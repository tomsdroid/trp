<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-10">
    <!-- Header (Sekarang Warna Ungu menyesuaikan Dashboard) -->
    <div class="bg-purple-600 text-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-20">
      <button @click="$router.back()" class="mr-3 active:scale-90 transition-transform"><ArrowLeftIcon :size="20" /></button>
      <h2 class="text-base font-bold flex-1">Jadwal & Absensi</h2>
    </div>

    <!-- Tanggal (Pills Horizontal Scroll) -->
    <div class="bg-white p-3 border-b border-slate-200 flex gap-3 overflow-x-auto no-scrollbar shadow-sm sticky top-[48px] z-10">
      <button 
        v-for="(hari, index) in jadwalMinggu" 
        :key="index"
        @click="pilihHari(index)"
        :class="[
          'px-4 py-2 rounded-2xl text-center shrink-0 w-[72px] transition-all active:scale-95',
          hariTerpilih === index 
            ? (hari.tema === 'pagi' ? 'bg-orange-500 text-white shadow-md' : 'bg-purple-600 text-white shadow-md')
            : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
        ]"
      >
        <p class="text-[9px] uppercase font-bold tracking-wider mb-0.5">{{ hari.label }}</p>
        <p class="text-lg font-extrabold">{{ hari.tanggal }}</p>
      </button>
    </div>

    <div class="p-5 flex-1 flex flex-col">
      <!-- Info Shift Card (Berubah Warna Dinamis) -->
      <Transition name="fade" mode="out-in">
        <div :key="hariTerpilih" 
          :class="[
            'p-6 rounded-3xl shadow-lg border text-center mb-8 relative overflow-hidden',
            jadwalAktif.tema === 'pagi' 
              ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200' 
              : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
          ]"
        >
          <!-- Background Icon Transparan -->
          <div class="absolute -right-6 -top-4 opacity-10">
            <SunIcon v-if="jadwalAktif.tema === 'pagi'" :size="120" class="text-orange-500" />
            <MoonIcon v-else :size="120" class="text-purple-600" />
          </div>

          <div class="relative z-10">
            <div :class="['w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 shadow-sm', jadwalAktif.tema === 'pagi' ? 'bg-orange-500 text-white' : 'bg-purple-600 text-white']">
              <SunIcon v-if="jadwalAktif.tema === 'pagi'" :size="24" />
              <MoonIcon v-else :size="24" />
            </div>
            
            <p :class="['text-[10px] font-bold uppercase tracking-widest mb-1', jadwalAktif.tema === 'pagi' ? 'text-orange-600' : 'text-purple-600']">
              Shift Anda
            </p>
            <h3 class="text-2xl font-extrabold text-slate-800 mb-1">Shift {{ jadwalAktif.tipe }}</h3>
            <p class="text-sm font-bold text-slate-600 mb-4">{{ jadwalAktif.waktu }}</p>
            
            <!-- Status Kehadiran (Pills) -->
            <span v-if="jadwalAktif.status === 'Hadir'" class="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
              <CheckCircleIcon :size="14" /> Sudah Absen
            </span>
            <span v-else-if="jadwalAktif.status === 'Belum Waktunya'" class="inline-block bg-slate-200 text-slate-500 text-xs font-bold px-4 py-1.5 rounded-full">
              Belum Waktunya
            </span>
            <span v-else class="inline-block bg-red-100 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full">
              Belum Absen
            </span>
          </div>
        </div>
      </Transition>

      <!-- Area Fingerprint Absensi -->
      <div v-if="hariTerpilih === 0 && jadwalAktif.status === 'Belum Absen'" class="mt-auto mb-4 flex flex-col items-center">
        <p class="text-xs font-bold text-slate-500 mb-6 text-center">Tap sidik jari di bawah untuk<br>mencatat kehadiran Anda</p>
        
        <button 
          @click="lakukanAbsen"
          :disabled="isAbsenLoading"
          class="relative group"
        >
          <!-- Efek Gelombang Animasi -->
          <div class="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-20"></div>
          <div class="absolute inset-[-10px] bg-purple-300 rounded-full animate-pulse opacity-20"></div>
          
          <!-- Tombol Utama -->
          <div :class="[
            'relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl',
            isAbsenLoading ? 'bg-purple-400 scale-95' : 'bg-purple-600 group-hover:bg-purple-700 group-active:scale-90'
          ]">
            <Loader2Icon v-if="isAbsenLoading" :size="40" class="text-white animate-spin" />
            <FingerprintIcon v-else :size="48" class="text-white" />
          </div>
        </button>
      </div>

      <!-- Tampilan Jika Sudah Absen -->
      <div v-else-if="hariTerpilih === 0 && jadwalAktif.status === 'Hadir'" class="mt-auto mb-4 flex flex-col items-center justify-center bg-green-50 border border-green-100 rounded-2xl p-6">
        <div class="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-3 shadow-md animate-bounce-short">
          <CheckCircleIcon :size="32" />
        </div>
        <h3 class="text-sm font-bold text-green-700 text-center">Kerja Bagus!</h3>
        <p class="text-xs text-green-600 text-center mt-1">Anda sudah absen untuk shift ini.<br>Selamat bekerja!</p>
      </div>

      <!-- Pesan untuk hari lain -->
      <div v-else class="mt-auto text-center">
        <p class="text-[10px] text-slate-400">Jadwal ini untuk hari lain.<br>Absensi hanya bisa dilakukan di hari H.</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  ArrowLeft as ArrowLeftIcon, 
  Sun as SunIcon, 
  Moon as MoonIcon, 
  Fingerprint as FingerprintIcon,
  CheckCircle as CheckCircleIcon,
  Loader2 as Loader2Icon
} from 'lucide-vue-next';

// Data Jadwal Dummy Dinamis
const jadwalMinggu = ref([]);
const hariTerpilih = ref(0);
const isAbsenLoading = ref(false);

const jadwalAktif = computed(() => jadwalMinggu.value[hariTerpilih.value] || {});

const pilihHari = (index) => {
  hariTerpilih.value = index;
};

// Fungsi simulasi Tap Fingerprint
const lakukanAbsen = () => {
  isAbsenLoading.value = true;
  
  // Simulasi loading 1.5 detik
  setTimeout(() => {
    isAbsenLoading.value = false;
    jadwalMinggu.value[0].status = 'Hadir'; // Ubah status hari ini jadi Hadir
  }, 1500);
};

onMounted(() => {
  // Bikin data jadwal 7 hari ke depan dengan pola selang-seling (Pagi/Siang)
  const today = new Date();
  const labelHari = ['HARI INI', 'BESOK', 'LUSA'];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    
    // Logika Selang-Seling: Misal tanggal genap Pagi, ganjil Siang (Bisa disesuaikan)
    const isPagi = d.getDate() % 2 === 0;
    
    // Logika variasi Siang (Jam 11 atau 12)
    const isSiang11 = d.getDate() % 3 === 0;
    
    let tipe, waktu, tema, status;

    if (isPagi) {
      tipe = 'Pagi';
      waktu = '09:00 - 21:00 WIB';
      tema = 'pagi';
    } else {
      tipe = 'Siang';
      waktu = isSiang11 ? '11:00 - 21:15 WIB' : '12:00 - 21:15 WIB';
      tema = 'siang';
    }

    if (i === 0) {
      status = 'Belum Absen'; // Hari ini wajib absen
    } else {
      status = 'Belum Waktunya'; // Besok dan lusa
    }

    jadwalMinggu.value.push({
      tanggal: d.getDate(),
      label: i < 3 ? labelHari[i] : d.toLocaleDateString('id-ID', { weekday: 'short' }),
      tipe,
      waktu,
      tema,
      status
    });
  }
});
</script>

<style scoped>
/* Transisi untuk pergantian hari */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Animasi untuk logo sukses absen */
.animate-bounce-short {
  animation: bounceShort 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes bounceShort {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Sembunyikan scrollbar di menu tanggal */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
