<?php
require_once 'db.php';
$data = json_decode(file_get_contents("php://input"), true);

try {
    $pdo->beginTransaction();
    // Hanya kode, nama, dan tipe cabang
    $sql = "INSERT INTO services (code, name, branch_type) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE name=VALUES(name), branch_type=VALUES(branch_type)";
            
    $stmt = $pdo->prepare($sql);
    foreach ($data as $item) {
        $stmt->execute([$item['code'], $item['name'], $item['branch_type']]);
    }
    $pdo->commit();
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
