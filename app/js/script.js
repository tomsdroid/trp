// Mendaftarkan Service Worker untuk PWA
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('Service Worker berhasil didaftarkan dengan scope:', reg.scope))
                    .catch(err => console.error('Pendaftaran Service Worker gagal:', err));
            });
        }

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
  }, 3500);
}

// ==========================================
// DETEKSI STATUS ONLINE / OFFLINE & SYNC
// ==========================================

// 0. Sinkronisasi Otomatis selama 24 jam saat aplikasi dibuka pertama kali.
async function performSync() {
    const userId = localStorage.getItem('current_user_id');
    // Asumsi: Kamu mengambil data sesi dari IndexedDB yang statusnya belum sinkron
    const unsyncedSessions = await getUnsyncedSessions(userId); 

    if (unsyncedSessions.length === 0) {
        // Tidak ada yang perlu disinkronkan
        return; 
    }

    // [TAMBAHAN] Toast saat proses sinkronisasi baru dimulai
    showToast('Sinkronisasi data sedang berjalan...', 'info');

    try {
        const formData = new URLSearchParams();
        formData.append("action", "sync");
        formData.append("therapist_id", userId);
        formData.append("sessions", JSON.stringify(unsyncedSessions));

        // API_URL adalah link Google Apps Script kamu
        const API_URL = "https://script.google.com/macros/s/AKfycbx3hQszNy0HxAy96zI1gpg5htfpHAYbyr9uCaK7XtD-IKhG64uZvFMmf1E6CvwstaaP/exec"; 
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        const result = await response.json();

        if (result.status === "success") {
            // Tandai data di IndexedDB bahwa sudah berhasil tersinkron
            await markSessionsAsSynced(unsyncedSessions); 
            
            // Simpan waktu terakhir sinkron
            localStorage.setItem('last_sync', new Date().toISOString());
            
            // [TAMBAHAN] Toast saat berhasil
            showToast(`Berhasil! ${unsyncedSessions.length} log disinkronkan.`, 'success');
            
            if (typeof updateSyncStatus === 'function') {
                updateSyncStatus(); // Perbarui teks di menu Pengaturan jika ada
            }
        } else {
            console.error("Sinkronisasi gagal:", result.message);
            // [TAMBAHAN] Toast saat gagal dari respon server
            showToast('Sinkronisasi gagal: ' + result.message, 'error');
        }
    } catch (error) {
        console.error("Kesalahan jaringan saat sinkronisasi:", error);
        // [TAMBAHAN] Toast saat gagal karena masalah jaringan
        showToast('Sinkronisasi tertunda: Periksa jaringan Anda.', 'error');
    }
}

// 1. Saat koneksi terputus (Offline)
window.addEventListener('offline', () => {
    showToast('Koneksi terputus. Beralih ke mode offline.', 'error');
});

// 2. Saat koneksi kembali terhubung (Online)
window.addEventListener('online', () => {
    showToast('Yeay, Koneksi internet kembali terhubung.', 'success');
    
    // Opsional: Jika kamu punya fungsi sinkronisasi otomatis, panggil di sini
    if (typeof performSync === 'function') {
        // Kasih jeda sedikit agar toast online terbaca duluan, baru jalanin sync
        setTimeout(performSync, 2000); 
    }
});

// 3. Pengecekan awal saat aplikasi baru saja dibuka
document.addEventListener('DOMContentLoaded', () => {
    // Jika saat pertama buka aplikasi ternyata tidak ada internet
    if (!navigator.onLine) {
        setTimeout(() => {
            showToast('Anda sedang dalam mode offline.', 'error');
        }, 1000); // Delay 1 detik agar toast tidak tertumpuk dengan proses loading awal
    } else {
        // Coba sinkronisasi saat aplikasi pertama kali dibuka (jika ada internet)
        if (typeof performSync === 'function') {
            setTimeout(performSync, 1500);
        }
    }
});
