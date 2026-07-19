<?php
require_once 'cors.php';
require_once 'db.php';

$json_input = file_get_contents("php://input");
$data = json_decode($json_input, true);

if (!$data || !is_array($data)) {
    echo json_encode(["status" => "error", "message" => "Data tidak valid"]);
    exit;
}

// 1. AMBIL ARRAY SESSIONS DARI DALAM PAYLOAD
$sessions = $data['sessions'] ?? [];
$therapist_id = $data['therapist_id'] ?? '';

try {
    $pdo->beginTransaction();
    
    $sql = "INSERT INTO sessions (session_id, therapist_id, service_code, service_name, durasi, komisi, date, timestamp, kategori, branch, area) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                service_code = VALUES(service_code),
                service_name = VALUES(service_name),
                durasi = VALUES(durasi),
                komisi = VALUES(komisi),
                date = VALUES(date),
                timestamp = VALUES(timestamp),
                kategori = VALUES(kategori),
                branch = VALUES(branch),
                area = VALUES(area)";
            
    $stmt = $pdo->prepare($sql);
    
    // 2. LOOPING HANYA PADA ARRAY SESSIONS
    foreach ($sessions as $s) {
        // Antisipasi jika namanya 'id' atau 'session_id' di HP
        $id_sesi = $s['session_id'] ?? $s['id'] ?? null;
        
        if (!$id_sesi) {
            continue; // Lewati jika tidak ada ID agar tidak error 1048
        }

        $stmt->execute([
            $id_sesi, 
            $therapist_id, 
            $s['service_code'] ?? '', 
            $s['service_name'] ?? '', 
            $s['durasi'] ?? 0, 
            $s['komisi'] ?? 0,
            $s['date'] ?? date('Y-m-d'), 
            $s['timestamp'] ?? date('Y-m-d H:i:s'), 
            $s['kategori'] ?? '', 
            $s['branch'] ?? '', 
            $s['area'] ?? ''
        ]);
    }
    
    $pdo->commit();
    echo json_encode(["status" => "success"]);
    
} catch (PDOException $e) {
    $pdo->rollBack();
    // Mengembalikan pesan error spesifik PDO untuk mempermudah debugging
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
