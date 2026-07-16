if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                reg.update();
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            window.location.reload();
                        }
                    };
                };
            })
            .catch(err => console.error(err));
    });
}

function showToast(message, type = 'success') {
    const old = document.querySelector('.toast-custom');
    if (old) old.remove();

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

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

async function performSync() {
    const userId = localStorage.getItem('current_user_id');
    const unsyncedSessions = await getUnsyncedSessions(userId); 

    if (unsyncedSessions.length === 0) return; 

    showToast('Sinkronisasi data sedang berjalan...', 'info');

    try {
        const formData = new URLSearchParams();
        formData.append("action", "sync");
        formData.append("therapist_id", userId);
        formData.append("sessions", JSON.stringify(unsyncedSessions));

        const API_URL = "https://script.google.com/macros/s/AKfycbx3hQszNy0HxAy96zI1gpg5htfpHAYbyr9uCaK7XtD-IKhG64uZvFMmf1E6CvwstaaP/exec"; 
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (result.status === "success") {
            await markSessionsAsSynced(unsyncedSessions); 
            localStorage.setItem('last_sync', new Date().toISOString());
            showToast(`Berhasil! ${unsyncedSessions.length} log disinkronkan.`, 'success');
            
            if (typeof updateSyncStatus === 'function') {
                updateSyncStatus();
            }
        } else {
            showToast('Sinkronisasi gagal: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('Sinkronisasi tertunda: Periksa jaringan Anda.', 'error');
    }
}

window.addEventListener('offline', () => {
    showToast('Koneksi terputus. Beralih ke mode offline.', 'error');
});

window.addEventListener('online', () => {
    showToast('Koneksi internet kembali terhubung.', 'success');
});

document.addEventListener("DOMContentLoaded", () => {
    if (!navigator.onLine) {
        setTimeout(() => {
            showToast('Anda sedang dalam mode offline.', 'error');
        }, 1000); 
    }
    
    let lastBackPressTime = 0;
    const timeToExit = 2000; 

    document.addEventListener("deviceready", () => {
        document.addEventListener("backbutton", (e) => {
            e.preventDefault(); 
            handleBackButton(false);
        }, false);
    }, false);

    if (!window.cordova) {
        history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', (e) => {
            handleBackButton(true);
        });
    }

    function handleBackButton(isWeb) {
        const currentPath = window.location.pathname.toLowerCase();
        
        const isIndex = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath.endsWith('/app');
        const isAuthPage = currentPath.endsWith('login.html') || currentPath.endsWith('onboarding.html');

        if (isIndex || isAuthPage) {
            const currentTime = new Date().getTime();
            
            if (currentTime - lastBackPressTime < timeToExit) {
                if (window.cordova) {
                    navigator.app.exitApp(); 
                } else {
                    history.back(); 
                }
            } else {
                lastBackPressTime = currentTime;
                
                if(typeof showToast === 'function') {
                    showToast('Tekan sekali lagi untuk keluar', 'warning');
                } else {
                    alert('Tekan sekali lagi untuk keluar');
                }
                
                if (isWeb) {
                    history.pushState(null, null, window.location.href);
                }
            }
        } else {
            window.location.href = 'index.html';
        }
    }
});

function sendNotification(title, message) {
    if (window.cordova && cordova.plugins && cordova.plugins.notification) {
        cordova.plugins.notification.local.schedule({
            title: title,
            text: message,
            foreground: true, 
            vibrate: true     
        });
    } 
    else {
        if (typeof showToast === 'function') {
            showToast(message, 'success');
        } else {
            alert(title + "\n" + message);
        }
    }
}
