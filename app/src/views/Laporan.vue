<template>
  <div class="min-h-screen bg-slate-50 flex flex-col pb-6">
    <!-- Header -->
    <div class="bg-blue-600 text-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
      <button @click="$router.back()" class="mr-3 active:scale-90 transition-transform"><ArrowLeftIcon :size="20" /></button>
      <h2 class="text-base font-bold flex-1">Laporan Kerja</h2>
    </div>

    <div class="px-4 py-5 flex-1">
      
      <!-- WIDGET PERFORMA (VUE-CHARTJS BAR CHART) -->
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-xs font-bold text-slate-700">Performa Jam Kerja</h3>
            <p class="text-[9px] text-slate-400">Periode 19 - 18</p>
          </div>
          <TrendingUpIcon v-if="currentHours >= prevHours" :size="16" class="text-green-500" />
          <TrendingDownIcon v-else :size="16" class="text-red-500" />
        </div>

        <!-- Chart Area: Pastikan ada height spesifik agar chart tidak melebar tak terbatas -->
        <div class="relative h-48 w-full mt-2">
          <Bar v-if="chartLoaded" :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Filter Periode (Label) -->
      <div class="flex justify-between items-center bg-blue-50 p-3 rounded-xl shadow-sm border border-blue-100 mb-5">
        <span class="text-xs font-bold text-blue-800">Periode Aktif: {{ currentLabel }}</span>
        <CalendarIcon :size="16" class="text-blue-500" />
      </div>

      <!-- Ringkasan Grid -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
          <div class="absolute -right-3 -bottom-3 text-slate-50 opacity-50"><CheckCircleIcon :size="64" /></div>
          <p class="text-[10px] font-bold text-slate-400 uppercase mb-1 relative z-10">Total Sesi</p>
          <p class="text-3xl font-extrabold text-blue-500 relative z-10">{{ totalSesi }}</p>
        </div>
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
          <div class="absolute -right-3 -bottom-3 text-slate-50 opacity-50"><ClockIcon :size="64" /></div>
          <p class="text-[10px] font-bold text-slate-400 uppercase mb-1 relative z-10">Jam Kerja</p>
          <p class="text-3xl font-extrabold text-blue-500 relative z-10">{{ currentHours }}<span class="text-xs text-slate-400 font-normal ml-1">Jam</span></p>
        </div>
      </div>

      <!-- Kategori Terbanyak -->
      <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3 px-1">Statistik Kategori</h3>
      <div class="grid grid-cols-3 gap-2 mb-6">
        <div v-for="kat in topKategori" :key="kat.name" class="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center flex flex-col justify-between">
          <p class="text-[10px] font-bold text-slate-600 leading-tight mb-2">{{ kat.name }}</p>
          <p class="text-lg font-extrabold text-amber-500">{{ kat.count }}</p>
        </div>
        <div v-if="topKategori.length === 0" class="col-span-3 text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">
          <p class="text-[10px] text-slate-400">Belum ada data</p>
        </div>
      </div>

      <!-- Layanan Terlaris -->
      <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3 px-1">Layanan Terbanyak</h3>
      <div class="space-y-2 mb-6">
        <div v-for="(layanan, index) in topLayanan" :key="index" class="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">
              {{ index + 1 }}
            </div>
            <span class="text-xs font-bold text-slate-700 line-clamp-1">{{ layanan.name }}</span>
          </div>
          <span class="text-[10px] bg-blue-100 text-blue-600 font-bold px-2 py-1 rounded-md min-w-[55px] text-center shrink-0">{{ layanan.count }} Sesi</span>
        </div>
        <div v-if="topLayanan.length === 0" class="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200">
          <p class="text-xs text-slate-400">Belum ada sesi selesai periode ini.</p>
        </div>
      </div>

      <AppCredit />

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../db';
import AppCredit from '../components/AppCredit.vue';
import { 
  ArrowLeft as ArrowLeftIcon, 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon, 
  Calendar as CalendarIcon, 
  CheckCircle as CheckCircleIcon, 
  Clock as ClockIcon 
} from 'lucide-vue-next';

// 1. IMPORT CHART.JS & VUE-CHARTJS
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

// 2. REGISTER KOMPONEN CHART.JS
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const router = useRouter();

// State Variables
const totalSesi = ref(0);
const currentHours = ref(0);
const prevHours = ref(0);
const currentLabel = ref('');
const prevLabel = ref('');
const topKategori = ref([]);
const topLayanan = ref([]);

// State untuk Chart
const chartLoaded = ref(false);
const chartData = ref({
  labels: ['Bulan Lalu', 'Bulan Ini'],
  datasets: [{ data: [0, 0] }]
});

// Konfigurasi Tampilan Chart
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }, // Sembunyikan label legend
    tooltip: {
      backgroundColor: '#1e293b', // slate-800
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (context) => ` ${context.raw} Jam Kerja`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#f1f5f9' }, // slate-100 (garis samar)
      border: { display: false }
    },
    x: {
      grid: { display: false }, // Hilangkan garis vertikal
      border: { display: false }
    }
  }
};

// Fungsi Format Tanggal Lokal
const formatLocal = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Fungsi Menghitung Periode Cut-Off (Tgl 19 - 18)
const getPeriodeAktif = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const date = dateObj.getDate();
  let start, end;
  
  if (date <= 18) { 
    start = new Date(year, month - 1, 19); 
    end = new Date(year, month, 18); 
  } else { 
    start = new Date(year, month, 19); 
    end = new Date(year, month + 1, 18); 
  }
  
  return { 
    startText: formatLocal(start), 
    endText: formatLocal(end), 
    label: `${start.toLocaleDateString('id-ID', {day:'numeric', month:'short'})} - ${end.toLocaleDateString('id-ID', {day:'numeric', month:'short'})}` 
  };
};

onMounted(async () => {
  const currentId = localStorage.getItem('logged_in_id');
  if (!currentId) { 
    router.replace('/login'); 
    return; 
  }

  // Tentukan Tanggal Periode Bulan Ini dan Bulan Lalu
  const now = new Date();
  const currentPeriod = getPeriodeAktif(now);
  
  const pastDate = new Date(now);
  pastDate.setMonth(pastDate.getMonth() - 1);
  const prevPeriod = getPeriodeAktif(pastDate);

  currentLabel.value = currentPeriod.label;
  prevLabel.value = prevPeriod.label;

  // Ambil Data Sesi dari IndexedDB
  const allSessions = await db.sessions.where('therapist_id').equals(currentId).toArray();

  const currSessions = allSessions.filter(s => s.date >= currentPeriod.startText && s.date <= currentPeriod.endText);
  const prevSessions = allSessions.filter(s => s.date >= prevPeriod.startText && s.date <= prevPeriod.endText);

  totalSesi.value = currSessions.length;

  // Hitung Jam Kerja
  const hitungMenit = (sessions) => sessions.reduce((acc, s) => acc + (Number(s.durasi) || 0), 0);

  const currMins = hitungMenit(currSessions);
  const prevMins = hitungMenit(prevSessions);

  currentHours.value = Number((currMins / 60).toFixed(1));
  prevHours.value = Number((prevMins / 60).toFixed(1));

  // Update Data Chart dengan Reaktivitas
  chartData.value = {
    labels: ['Bulan Lalu', 'Bulan Ini'],
    datasets: [
      {
        label: 'Jam Kerja',
        backgroundColor: ['#cbd5e1', '#3b82f6'], // slate-300 untuk bulan lalu, blue-500 untuk bulan ini
        hoverBackgroundColor: ['#94a3b8', '#2563eb'],
        borderRadius: 6, // Ujung batang membulat
        data: [prevHours.value, currentHours.value]
      }
    ]
  };
  
  // Tampilkan chart setelah data siap
  chartLoaded.value = true;

  // Kelompokkan Tipe Klien / Kategori (Bulan Ini)
  const kategoriMap = {};
  currSessions.forEach(s => {
    let kname = s.kategori || 'Urutan';
    if(kname === 'U') kname = 'Urutan';
    else if(kname === 'R') kname = 'Request';
    else if(kname === 'PN') kname = 'Permintaan Nama';
    kategoriMap[kname] = (kategoriMap[kname] || 0) + 1;
  });
  
  topKategori.value = Object.keys(kategoriMap)
    .map(key => ({ name: key, count: kategoriMap[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3); 

  // Kelompokkan Layanan Terbanyak (Bulan Ini)
  const layananMap = {};
  currSessions.forEach(s => {
    const lname = s.service_name || s.service_code || 'Layanan Lainnya';
    layananMap[lname] = (layananMap[lname] || 0) + 1;
  });
  
  topLayanan.value = Object.keys(layananMap)
    .map(key => ({ name: key, count: layananMap[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); 
});
</script>