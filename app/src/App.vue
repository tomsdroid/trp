<template>
  <div id="app">
    <CustomToast />
    <CustomConfirm />
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CustomToast from './components/CustomToast.vue';
import CustomConfirm from './components/CustomConfirm.vue';

const router = useRouter();

onMounted(() => {
  document.addEventListener('deviceready', () => {
    
    window.plugins.OneSignal.setAppId("a5a9b014-2131-433d-9442-8f8e499eb72a");
    
    // Mendaftarkan ID Terapis ke OneSignal agar bisa dikirim notif spesifik dari server
    const loggedInId = localStorage.getItem('logged_in_id');
    if (loggedInId) {
      window.plugins.OneSignal.setExternalUserId(loggedInId);
    }
    
    window.plugins.OneSignal.promptForPushNotificationsWithUserResponse(function(accepted) {
      console.log("User accepted notifications: " + accepted);
    });

    // Menangani notifikasi yang ditekan (dibuka) dari bar notifikasi HP
    window.plugins.OneSignal.setNotificationOpenedHandler(function(jsonData) {
      const additionalData = jsonData.notification.additionalData;
      if (additionalData && additionalData.notif_id) {
        router.push({ 
          path: '/notifikasi', 
          query: { id: additionalData.notif_id } 
        });
      } else {
        router.push('/notifikasi');
      }
    });

    // Menangani notifikasi masuk SAAT aplikasi sedang terbuka (Foreground)
    window.plugins.OneSignal.setNotificationWillShowInForegroundHandler(function(notificationReceivedEvent) {
      notificationReceivedEvent.complete(notificationReceivedEvent.getNotification());
      
      // Memicu event custom agar Halaman Notif dan BottomNav mereload datanya
      window.dispatchEvent(new Event('refresh-notif'));
    });

  }, false);
});
</script>
