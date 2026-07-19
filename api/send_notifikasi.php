<?php
require_once 'cors.php';
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$title = $data['title'];
$type = $data['type'];
$message = $data['message'];

try {
    // 1. Simpan ke database MySQL (Notifikasi Global untuk Semua Terapis)
    $stmt = $pdo->prepare("INSERT INTO notifications (title, message, type, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$title, $message, $type]);
    
    // Ambil ID notif yang baru saja disimpan
    $notif_id = $pdo->lastInsertId();
    
    // 2. Kirim ke FCM (Firebase Cloud Messaging) API v1
    $projectId = 'GANTI_DENGAN_PROJECT_ID_FIREBASE_KAMU';
    $url = 'https://fcm.googleapis.com/v1/projects/' . $projectId . '/messages:send';
    
    // PENTING: Kamu harus men-generate OAuth2 Token dari service-account.json (GCP)
    $accessToken = 'GANTI_DENGAN_OAUTH2_ACCESS_TOKEN'; 

    // Susun isi pesan FCM
    $messagePayload = [
        "topic" => "semua_terapis", // Otomatis mengirim ke semua HP yang subscribe topik ini
        "notification" => [
            "title" => $title,
            "body" => $message
        ],
        "data" => [
            "type" => $type,
            "notif_id" => (string)$notif_id // Data di FCM wajib berupa string
        ]
    ];

    // Opsional: Jika kamu tetap ingin FCM nembak ke 1 HP saja (via Token) meski di DB bersifat global
    if (isset($data['fcm_token']) && !empty($data['fcm_token'])) {
        unset($messagePayload["topic"]); // Hapus target topik
        $messagePayload["token"] = $data['fcm_token']; // Ganti dengan target token
    }

    $fcmData = [
        "message" => $messagePayload
    ];

    // Eksekusi cURL ke Firebase
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fcmData));

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo json_encode([
        "status" => "success", 
        "fcm_response" => json_decode($response)
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
