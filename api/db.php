<?php
// Izinkan akses dari aplikasi Vue/APK (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Tangani preflight request dari browser
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Konfigurasi Database 
// PENTING: Ganti dengan username, password, dan nama database di cPanel kamu
$host = "localhost";
$user = "cahq3348_toms"; 
$pass = "@Tomy110699_."; 
$dbname = "cahq3348_terapiodb"; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    // Setting agar error database dimunculkan dengan detail
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Koneksi DB Gagal: " . $e->getMessage()]);
    exit;
}
?>
