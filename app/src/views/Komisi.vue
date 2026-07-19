<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-6">
    <!-- Header -->
    <div class="bg-green-600 text-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-20">
      <button @click="$router.back()" class="mr-3 active:scale-90 transition-transform"><ArrowLeftIcon :size="20" /></button>
      <h2 class="text-base font-bold flex-1">Estimasi Komisi</h2>
    </div>

    <!-- Saldo Utama -->
    <div class="bg-green-600 px-4 pb-12 pt-2 rounded-b-[2rem] shadow-sm text-center text-white relative z-10">
      <p class="text-[10px] text-green-100 uppercase tracking-wider font-bold mb-1">Total Pendapatan Bulan Ini</p>
      <h1 class="text-4xl font-extrabold tracking-tight">Rp {{ totalKomisi.toLocaleString('id-ID') }}</h1>
      <p class="text-[10px] text-green-200 mt-2 font-medium">Periode Aktif: {{ labelPeriode }}</p>
    </div>

    <!-- Rincian Breakdown (Melayang menimpa header) -->
    <div class="px-4 -mt-8 relative z-20 mb-6">
      <div class="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 flex justify-between items-center divide-x divide-slate-100">
        
        <!-- Total Komisi Jasa -->
        <div class="flex-1 pr-3">
          <div class="flex items-center gap-1.5 mb-1">
            <ReceiptIcon :size="14" class="text-slate-400" />
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Komisi Sesi</p>
          </div>
          <p class="text-sm font-extrabold text-slate-700">Rp {{ komisiDasar.toLocaleString('id-ID') }}</p>
        </div>

        <!-- Total Bonus Request -->
        <div class="flex-1 pl-4">
          <div class="flex items-center gap-1.5 mb-1">
            <StarIcon :size="14" class="text-amber-500" />
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Bonus Request ({{ totalRequest }})</p>
          </div>
          <p class="text-sm font-extrabold text-amber-500">+ Rp {{ bonusRequest.toLocaleString('id-ID') }}</p>
        </div>
        
      </div>
    </div>

    <div class="px-4 flex-1">
      <div class="flex justify-between items-end mb-3 px-1">
        <h3 class="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Riwayat Sesi Terakhir</h3>
        <span class="text-[10px] font-bold text-green-600">{{ riwayatKomisi.length }} Sesi Diselesaikan</span>
      </div>
      
      <!-- List History Komisi -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        <div v-if="riwayatKomisi.length === 0" class="p-8 text-center">
          <p class="text-xs text-slate-400 font-medium">Belum ada komisi tercatat di periode ini.</p>
        </div>

        <div 
          v-for="sesi in riwayatKomisi" 
          :key="sesi.id"
          class="flex items-center justify-between p-3.5 border-b border-slate-50 last:border-b-0 hover:bg-slate-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div :class="['w-9 h-9 rounded-full flex items-center justify-center shrink-0', sesi.kategori === 'R' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-600']">
              <StarIcon v-if="sesi.kategori === 'R'" :size="18" fill="currentColor" />
              <CheckCircleIcon v-else :size="18" />
            </div>
            <div>
              <p class="text-xs font-bold text-slate-700 leading-tight mb-0.5">{{ sesi.service_name || sesi.service_code }}</p>
              <p class="text-[9px] text-slate-400 font-medium">{{ formatWaktu(sesi.timestamp) }} • {{ sesi.durasi }} Menit</p>
            </div>
          </div>
          <div class="text-right">
            <span class="block text-xs font-bold text-green-600">+ Rp {{ (sesi.komisi || 0).toLocaleString('id-ID') }}</span>
            <span v-if="sesi.kategori === 'R'" class="text-[8px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block">Request</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../db';
import { ArrowLeft as ArrowLeftIcon, CheckCircle as CheckCircleIcon, Star as StarIcon, Receipt as ReceiptIcon } from 'lucide-vue-next';

const router = useRouter();

// State
const totalKomisi = ref(0);
const komisiDasar = ref(0);
const bonusRequest = ref(0);
const totalRequest = ref(0);
const riwayatKomisi = ref([]);
const labelPeriode = ref('');

// Format Waktu Tampil ke User (Misal: 18 Jul, 14:30 WIB)
const formatWaktu = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + 
         date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
};

// Logika Menghitung Tanggal Cut-Off (19 - 18)
const getPeriodeAktif = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const date = dateObj.getDate();

  let start, end;
  
  if (date <= 18) {
    start = new Date(year, month - 1, 19);
    end = new Date(year, month, 18, 23, 59, 59);
  } else {
    start = new Date(year, month, 19);
    end = new Date(year, month + 1, 18, 23, 59, 59);
  }

  const formatTgl = (d) => d.toISOString().split('T')[0];
  const formatLabel = (d) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  return {
    startText: formatTgl(start),
    endText: formatTgl(end),
    label: `${formatLabel(start)} - ${formatLabel(end)}`
  };
};

onMounted(async () => {
  const currentId = localStorage.getItem('logged_in_id');
  if (!currentId) return;

  const hariIni = new Date();
  const periodeCurrent = getPeriodeAktif(hariIni);
  labelPeriode.value = periodeCurrent.label;

  try {
    // Tarik Semua Data dari IndexedDB (Dexie)
    const allSessions = await db.sessions.where('therapist_id').equals(currentId).toArray();
    
    // Saring hanya untuk periode cut-off saat ini
    const dataCurrent = allSessions.filter(s => s.date >= periodeCurrent.startText && s.date <= periodeCurrent.endText);

    // Urutkan Riwayat dari yang paling baru
    riwayatKomisi.value = dataCurrent.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Kalkulasi
    let sumKomisi = 0;
    let countRequest = 0;

    dataCurrent.forEach(s => {
      sumKomisi += (s.komisi || 0);
      if (s.kategori === 'R') {
        countRequest++;
      }
    });

    komisiDasar.value = sumKomisi;
    totalRequest.value = countRequest;

    // Logika Bonus Request (1-10 dpt 50rb, >10 dpt 100rb)
    if (countRequest > 10) {
      bonusRequest.value = 100000;
    } else if (countRequest >= 1) {
      bonusRequest.value = 50000;
    } else {
      bonusRequest.value = 0;
    }

    // Total Semua Pendapatan
    totalKomisi.value = komisiDasar.value + bonusRequest.value;

  } catch (error) {
    console.error("Gagal memuat data komisi:", error);
  }
});
</script>
