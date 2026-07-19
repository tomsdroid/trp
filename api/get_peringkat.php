<?php
require_once 'db.php';

$start_date = $_GET['start_date'] ?? date('Y-m-d');
$end_date = $_GET['end_date'] ?? date('Y-m-d');

try {
    // Kita gunakan INNER JOIN agar hanya terapis yang memiliki sesi yang masuk ke Peringkat
    // Mengubah avatarUrl menjadi avatar_url menyesuaikan database
    $sql = "SELECT 
                t.therapist_id, 
                t.shortname, 
                t.branch, 
                t.avatar_url,
                COUNT(s.session_id) as total_sesi, 
                COALESCE(SUM(s.komisi), 0) as total_komisi
            FROM therapists t
            JOIN sessions s ON t.therapist_id = s.therapist_id 
                AND s.date >= ? 
                AND s.date <= ? 
                AND s.deleted_at IS NULL
            WHERE t.deleted_at IS NULL
            GROUP BY t.therapist_id
            ORDER BY total_sesi DESC, total_komisi DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$start_date, $end_date]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Casting ke integer agar format angkanya aman di Vue
    foreach ($data as &$row) {
        $row['total_sesi'] = (int)$row['total_sesi'];
        $row['total_komisi'] = (int)$row['total_komisi'];
    }

    echo json_encode(["status" => "success", "data" => $data]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
