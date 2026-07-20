<?php
require_once 'db.php';

try {
    // Mengambil data master terbaru
    $branches = $pdo->query("SELECT * FROM branches WHERE is_active = 1")->fetchAll(PDO::FETCH_ASSOC);
    $areas = $pdo->query("SELECT * FROM areas WHERE is_active = 1")->fetchAll(PDO::FETCH_ASSOC);
    $categories = $pdo->query("SELECT * FROM categories WHERE is_active = 1")->fetchAll(PDO::FETCH_ASSOC);
    $services = $pdo->query("SELECT * FROM services")->fetchAll(PDO::FETCH_ASSOC);
    $therapists = $pdo->query("SELECT * FROM therapists WHERE deleted_at IS NULL")->fetchAll(PDO::FETCH_ASSOC);
    
    $sessions = $pdo->query("SELECT * FROM sessions WHERE deleted_at IS NULL")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "therapists" => $therapists,
            "branches" => $branches,
            "areas" => $areas,
            "categories" => $categories,
            "services" => $services,
            "sessions" => $sessions
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
