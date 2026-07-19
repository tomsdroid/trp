// src/composables/useConfirm.js
import { reactive } from 'vue';

export const confirmState = reactive({
  show: false,
  title: '',
  message: '',
  onConfirm: null
});

export const showConfirm = (title, message, onConfirm) => {
  confirmState.title = title;
  confirmState.message = message;
  confirmState.onConfirm = onConfirm;
  confirmState.show = true;
};
