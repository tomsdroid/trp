<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? '';

if (empty($id)) {
    echo json_encode(["status" => "error", "message" => "ID tidak boleh kosong"]);
    exit;
}

try {
    // Cari Terapis berdasarkan ID yang Aktif dan Belum dihapus (soft delete)
    $stmt = $pdo->prepare("SELECT * FROM therapists WHERE therapist_id = ? AND deleted_at IS NULL AND is_active = 1 LIMIT 1");
    $stmt->execute([$id]);
    $terapis = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($terapis) {
        echo json_encode([
            "status" => "success", 
            "data" => $terapis
        ]);
    } else {
        echo json_encode([
            "status" => "error", 
            "message" => "ID tidak terdaftar atau akun dinonaktifkan."
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "status" => "error", 
        "message" => "Terjadi kesalahan server: " . $e->getMessage()
    ]);
}
?>
