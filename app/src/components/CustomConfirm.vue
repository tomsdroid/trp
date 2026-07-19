<template>
  <Transition name="fade">
    <div v-if="confirmState.show" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="confirmState.show = false"></div>
      
      <!-- Modal Box -->
      <div class="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-modal">
        <h3 class="text-lg font-bold text-slate-800 mb-2">{{ confirmState.title }}</h3>
        <p class="text-sm text-slate-500 mb-6">{{ confirmState.message }}</p>
        
        <div class="flex gap-3">
          <button @click="confirmState.show = false" class="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 text-sm">Batal</button>
          <button @click="handleConfirm" class="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 text-sm shadow-md shadow-red-500/30">Ya, Lanjutkan</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { confirmState } from '../composables/useConfirm';

const handleConfirm = () => {
  if (confirmState.onConfirm) confirmState.onConfirm();
  confirmState.show = false;
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-modal { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes pop { from { transform: scale(0.9); } to { transform: scale(1); } }
</style>
