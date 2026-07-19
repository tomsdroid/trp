// src/composables/useToast.js
import { reactive } from 'vue';

export const toastState = reactive({
  show: false,
  message: '',
  type: 'success' // Bisa 'success', 'error', atau 'info'
});

export const showToast = (message, type = 'success') => {
  toastState.message = message;
  toastState.type = type;
  toastState.show = true;
  
  // Otomatis hilang setelah 3 detik
  setTimeout(() => {
    toastState.show = false;
  }, 3000);
};
