<?php
require_once 'db.php';
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !is_array($data)) {
    echo json_encode(["status" => "error", "message" => "Data tidak valid"]);
    exit;
}

try {
    $pdo->beginTransaction();
    $sql = "INSERT INTO categories (code, name, sort_order, is_active) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name), 
                sort_order = VALUES(sort_order),
                is_active = VALUES(is_active)";
                
    $stmt = $pdo->prepare($sql);
    foreach ($data as $item) {
        $stmt->execute([
            $item['code'], 
            $item['name'], 
            $item['sort_order'],
            $item['is_active'] ?? 1 // Default aktif jika tidak dikirim dari front-end
        ]);
    }
    $pdo->commit();
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
