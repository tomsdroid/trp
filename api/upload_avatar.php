<?php
require_once 'cors.php';

// Folder otomatis akan dibuat oleh PHP jika belum ada
$uploadDir = '../uploads/avatars/';
if (!is_dir($uploadDir)) { mkdir($uploadDir, 0755, true); }

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['avatar'])) {
    $therapist_id = $_POST['therapist_id'];
    $fileTmp = $_FILES['avatar']['tmp_name'];
    $fileExt = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
    $newFileName = $therapist_id . '_' . time() . '.' . $fileExt;
    $destPath = $uploadDir . $newFileName;

    if (move_uploaded_file($fileTmp, $destPath)) {
        echo json_encode(["status" => "success", "avatar_url" => "uploads/avatars/" . $newFileName]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal simpan file"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Tidak ada file"]);
}
?>
