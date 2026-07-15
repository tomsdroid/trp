function showToast(message, type = 'success') {
  // hapus toast lama
  const old = document.querySelector('.toast-custom');
  if(old) old.remove();

  const icons = {
    success: '<i class="bi bi-check-circle-fill"></i>',
    error: '<i class="bi bi-x-circle-fill"></i>',
    info: '<i class="bi bi-info-circle-fill"></i>'
  };

  const toast = document.createElement('div');
  toast.className = `toast-custom toast-${type}`;
  toast.innerHTML = `
    <div class="icon">${icons[type]}</div>
    <div class="text">${message}</div>
  `;
  document.body.appendChild(toast);

  // animasi masuk
  setTimeout(() => toast.classList.add('show'), 10);
  // auto hilang 3 detik
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}