<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <div class="bg-red-500 text-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
      <button @click="$router.back()" class="mr-3 active:scale-90 transition-transform"><ArrowLeftIcon :size="20" /></button>
      <h2 class="text-base font-bold flex-1">Video Tutorial</h2>
    </div>

    <div class="p-4 flex-1 space-y-4">
      <!-- Thumbnail Video 1 -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden active:scale-[0.98] transition-transform">
        <div class="h-32 bg-slate-800 relative flex items-center justify-center">
          <PlayCircleIcon :size="40" class="text-white/80" />
          <span class="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">02:15</span>
        </div>
        <div class="p-3">
          <h3 class="text-xs font-bold text-slate-800 mb-1">Cara Input Data Sesi Klien</h3>
          <p class="text-[10px] text-slate-500">Pelajari cara mencatat sesi saat sedang offline.</p>
        </div>
      </div>

      <!-- Thumbnail Video 2 -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden active:scale-[0.98] transition-transform">
        <div class="h-32 bg-slate-800 relative flex items-center justify-center">
          <PlayCircleIcon :size="40" class="text-white/80" />
          <span class="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">01:40</span>
        </div>
        <div class="p-3">
          <h3 class="text-xs font-bold text-slate-800 mb-1">Cara Cek Saldo Komisi</h3>
          <p class="text-[10px] text-slate-500">Membaca laporan kerja dan estimasi pendapatan.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft as ArrowLeftIcon, PlayCircle as PlayCircleIcon } from 'lucide-vue-next';
</script>
