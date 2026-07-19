<?php
require_once 'db.php';
$data = json_decode(file_get_contents("php://input"), true);

try {
    $pdo->beginTransaction();
    // Memperbaiki field avatarUrl menjadi avatar_url agar konsisten dengan DB
    $sql = "INSERT INTO therapists (therapist_id, fullname, shortname, phone, branch, area, email, pin, position, is_admin, is_active, avatar_url, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                fullname=VALUES(fullname), shortname=VALUES(shortname), phone=VALUES(phone), 
                branch=VALUES(branch), area=VALUES(area), email=VALUES(email), pin=VALUES(pin), 
                position=VALUES(position), is_admin=VALUES(is_admin), is_active=VALUES(is_active), 
                avatar_url=VALUES(avatar_url), updated_at=VALUES(updated_at)";
            
    $stmt = $pdo->prepare($sql);
    foreach ($data as $t) {
        $stmt->execute([
            $t['therapist_id'], $t['fullname'], $t['shortname'], $t['phone'], 
            $t['branch'], $t['area'], $t['email'], $t['pin'], $t['position'], 
            $t['is_admin'], $t['is_active'], $t['avatar_url'], $t['created_at'], $t['updated_at']
        ]);
    }
    $pdo->commit();
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
