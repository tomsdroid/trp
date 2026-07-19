<?php
// Pastikan file cors dipanggil agar Vue tidak kena blokir
require_once 'cors.php';
require_once 'db.php';

// 1. Tangkap Payload JSON dari Vue (Karena Vue pakai metode POST)
$json_input = file_get_contents("php://input");
$request = json_decode($json_input, true);

// 2. Ambil parameter filter, berikan nilai default jika kosong
$startDate = $request['startDate'] ?? date('Y-m-01'); // Awal bulan ini
$endDate = $request['endDate'] ?? date('Y-m-t');      // Akhir bulan ini
$therapist_id = $request['therapist_id'] ?? 'ALL';
$branch = $request['branch'] ?? 'ALL';

try {
    // 3. Query untuk mengambil DAFTAR SESI (bukan grup per terapis)
    $sql = "SELECT 
                s.session_id,
                s.date,
                s.therapist_id,
                s.service_code,
                s.service_name,
                s.komisi,
                s.branch
            FROM sessions s
            WHERE s.date BETWEEN ? AND ?";
            
    $params = [$startDate, $endDate];
    
    // Jika filter Terapis aktif
    if ($therapist_id !== 'ALL') {
        $sql .= " AND s.therapist_id = ?";
        $params[] = $therapist_id;
    }
    
    // Jika filter Cabang aktif
    if ($branch !== 'ALL') {
        $sql .= " AND s.branch = ?";
        $params[] = $branch;
    }
    
    // Urutkan dari tanggal terbaru
    $sql .= " ORDER BY s.date DESC"; 
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Konversi tipe data agar angka komisi tidak dianggap teks oleh Vue
    foreach ($data as &$row) {
        $row['komisi'] = (int)$row['komisi'];
    }

    // 4. Kirim balasan ke Vue
    echo json_encode(["status" => "success", "data" => $data]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
