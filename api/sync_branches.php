<?php
require_once 'db.php';
$data = json_decode(file_get_contents("php://input"), true);

try {
    $pdo->beginTransaction();
    $sql = "INSERT INTO branches (name, is_active) VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE is_active=VALUES(is_active)";
            
    $stmt = $pdo->prepare($sql);
    foreach ($data as $item) {
        $stmt->execute([$item['name'], $item['is_active']]);
    }
    $pdo->commit();
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
