<template>
  <!-- Animasi transisi masuk & keluar -->
  <Transition name="toast-slide">
    <div v-if="toastState.show" class="fixed top-4 left-1/2 -translate-x-1/2 z-[999] w-11/12 max-w-sm">
      <div :class="bgClass" class="px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-white transform transition-transform">
        
        <!-- Ikon berubah sesuai tipe -->
        <CheckCircleIcon v-if="toastState.type === 'success'" :size="20" />
        <AlertCircleIcon v-else-if="toastState.type === 'error'" :size="20" />
        <InfoIcon v-else :size="20" />
        
        <p class="text-sm font-bold flex-1 leading-tight">{{ toastState.message }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { toastState } from '../composables/useToast';
import { CheckCircle as CheckCircleIcon, AlertCircle as AlertCircleIcon, Info as InfoIcon } from 'lucide-vue-next';

const bgClass = computed(() => {
  if (toastState.type === 'error') return 'bg-red-500';
  if (toastState.type === 'info') return 'bg-sky-500';
  return 'bg-teal-600'; // Success (Default)
});
</script>

<style scoped>
/* CSS khusus untuk animasi notifikasi turun dari atas */
.toast-slide-enter-active, .toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-slide-enter-from, .toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%);
}
</style>
