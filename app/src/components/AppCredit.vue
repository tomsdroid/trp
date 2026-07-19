<template>
  <!-- App Info / Credit -->
  <div class="text-center mt-8 mb-2">
    <p class="text-[10px] font-bold text-slate-400 tracking-wider">
      THERALOG {{ appVersion }}
    </p>
    <p class="text-[9px] text-slate-400 mt-1">
      © 2026 Theralog. Dibuat dengan <span class="text-red-400">❤</span> untuk Terapis
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Teks awal saat data masih ditarik
const appVersion = ref('v1.3.9') 

const fetchLatestVersion = async () => {
  try {
    // Memanggil API GitHub untuk mengambil rilis terbaru dari repo kamu
    const response = await fetch('https://api.github.com/repos/tomsdroid/trp/releases/latest')
    
    if (!response.ok) {
      throw new Error('Gagal mengambil versi dari GitHub')
    }
    
    const data = await response.json()
    
    // API GitHub menyimpan versi rilis di dalam properti "tag_name" (misal: v1.3.8)
    if (data.tag_name) {
      appVersion.value = data.tag_name
    }
  } catch (error) {
    console.error('Gagal memuat versi aplikasi:', error)
    // Jika HP sedang offline atau kena limit API GitHub, 
    // akan tetap menampilkan nilai fallback di atas (v1.3.8)
  }
}

// Jalankan fungsi fetch saat komponen berhasil dimuat
onMounted(() => {
  fetchLatestVersion()
})
</script>
