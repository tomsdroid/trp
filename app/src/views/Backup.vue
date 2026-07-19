<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Header -->
    <div class="bg-pink-500 text-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
      <button @click="$router.back()" class="mr-3 active:scale-90 transition-transform"><ArrowLeftIcon :size="20" /></button>
      <h2 class="text-base font-bold flex-1">Backup Data Lokal</h2>
    </div>

    <div class="p-4 flex-1">
      <p class="text-xs text-slate-500 mb-6 text-center">Amankan data aplikasi Anda sebelum melakukan reset atau ganti HP baru.</p>

      <div class="space-y-3">
        <!-- Tombol Export -->
        <button 
          @click="prosesBackup" 
          :disabled="isExporting"
          class="w-full bg-white border border-pink-200 text-pink-600 active:scale-95 p-4 rounded-xl shadow-sm transition-transform flex items-center gap-4 text-left disabled:opacity-50"
        >
          <div class="bg-pink-50 p-2 rounded-lg">
            <LoaderIcon v-if="isExporting" :size="24" class="animate-spin" />
            <DownloadIcon v-else :size="24" />
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-bold">{{ isExporting ? 'Memproses Backup...' : 'Download Backup' }}</h3>
            <p class="text-[10px] text-slate-400">Simpan data ke folder Documents/Terapio</p>
          </div>
        </button>

        <!-- Tombol Import -->
        <button 
          @click="triggerPilihFile" 
          :disabled="isImporting"
          class="w-full bg-white border border-slate-200 text-slate-700 active:scale-95 p-4 rounded-xl shadow-sm transition-transform flex items-center gap-4 text-left disabled:opacity-50"
        >
          <div class="bg-slate-50 p-2 rounded-lg text-slate-500">
            <LoaderIcon v-if="isImporting" :size="24" class="animate-spin" />
            <UploadIcon v-else :size="24" />
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-bold">{{ isImporting ? 'Memulihkan Data...' : 'Pulihkan Data (Restore)' }}</h3>
            <p class="text-[10px] text-slate-400">Pilih file backup sebelumnya</p>
          </div>
        </button>

        <!-- Input File Tersembunyi untuk Restore -->
        <input 
          type="file" 
          ref="fileInputRef" 
          accept=".json,application/json" 
          class="hidden" 
          @change="prosesRestore" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { db } from '../db';
import { showToast } from '../composables/useToast';
import { 
  ArrowLeft as ArrowLeftIcon, 
  Download as DownloadIcon, 
  Upload as UploadIcon,
  Loader as LoaderIcon 
} from 'lucide-vue-next';

// State Loading
const isExporting = ref(false);
const isImporting = ref(false);
const fileInputRef = ref(null);

// ==========================================
// FITUR BACKUP (EXPORT)
// ==========================================
const prosesBackup = async () => {
  isExporting.value = true;
  try {
    // 1. Ambil semua data dari Dexie
    const backupData = {
      therapists: await db.therapists.toArray(),
      sessions: await db.sessions.toArray(),
      timestamp: new Date().toISOString()
    };

    const jsonData = JSON.stringify(backupData, null, 2);
    const namaFile = `Terapio_Backup_${new Date().getTime()}.json`;

    // 2. Cek apakah berjalan di Cordova (HP) atau Browser
    if (window.cordova && window.cordova.file) {
      simpanKeCordovaDocuments(namaFile, jsonData);
    } else {
      simpanKeBrowser(namaFile, jsonData);
    }
  } catch (error) {
    console.error("Gagal backup:", error);
    showToast('Gagal membuat file backup.', 'error');
    isExporting.value = false;
  }
};

const simpanKeCordovaDocuments = (filename, data) => {
  // Folder target utama: Documents
  let targetDir = cordova.file.dataDirectory; // Fallback aman
  if (cordova.platformId === 'android') {
    targetDir = cordova.file.externalRootDirectory + 'Documents/';
  } else if (cordova.platformId === 'ios') {
    targetDir = cordova.file.documentsDirectory;
  }

  // Buka akses ke folder Documents
  window.resolveLocalFileSystemURL(targetDir, (dirEntry) => {
    
    // Buat folder 'Terapio' di dalam Documents (jika belum ada)
    dirEntry.getDirectory('Terapio', { create: true, exclusive: false }, (terapioDir) => {
      
      // Buat file JSON di dalam folder 'Terapio'
      terapioDir.getFile(filename, { create: true, exclusive: false }, (fileEntry) => {
        fileEntry.createWriter((fileWriter) => {
          
          fileWriter.onwriteend = () => {
            showToast(`Berhasil! Tersimpan di Documents/Terapio/`, 'success');
            isExporting.value = false;
          };
          
          fileWriter.onerror = (e) => {
            showToast('Gagal menulis file ke memori HP.', 'error');
            isExporting.value = false;
          };
          
          const blob = new Blob([data], { type: 'application/json' });
          fileWriter.write(blob);
          
        }, () => { showToast('Gagal membuat akses tulis.', 'error'); isExporting.value = false; });
      }, () => { showToast('Gagal membuat file backup.', 'error'); isExporting.value = false; });
    }, () => { showToast('Gagal membuat folder Terapio.', 'error'); isExporting.value = false; });
  }, (err) => {
    console.error("Error resolve dir:", err);
    // Fallback jika Android memblokir akses ke root (Scoped Storage Android 11+)
    simpanKeBrowser(filename, data); 
  });
};

const simpanKeBrowser = (filename, data) => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Backup berhasil diunduh.', 'success');
  isExporting.value = false;
};

// ==========================================
// FITUR RESTORE (IMPORT)
// ==========================================
const triggerPilihFile = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const prosesRestore = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isImporting.value = true;
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      // Validasi sederhana
      if (!data.therapists || !data.sessions) {
        throw new Error("Format file backup tidak valid!");
      }

      // Masukkan data kembali ke Dexie
      if (data.therapists.length > 0) {
        await db.therapists.bulkPut(data.therapists);
      }
      if (data.sessions.length > 0) {
        await db.sessions.bulkPut(data.sessions);
      }

      showToast('Data berhasil dipulihkan!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Gagal! File backup rusak atau tidak valid.', 'error');
    } finally {
      isImporting.value = false;
      event.target.value = ''; 
    }
  };

  reader.onerror = () => {
    showToast('Gagal membaca file.', 'error');
    isImporting.value = false;
  };

  reader.readAsText(file);
};
</script>
