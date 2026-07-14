// js/layanan.js

// ===== 1. Data Lama / Kode Huruf - KHUSUS AMARTA & REFLEKSI =====
export const layananMap = {
  'A': { produk: 'Refleksi', durasi: 60 },
  'B': { produk: 'Refleksi', durasi: 90 },
  'C': { produk: 'Refleksi', durasi: 120 },
  '1': { produk: 'Javanese Massage', durasi: 60 },
  '1A': { produk: 'Javanese Massage', durasi: 90 },
  '1B': { produk: 'Javanese Massage', durasi: 120 },
  '2A': { produk: 'Swedish Massage', durasi: 90 },
  '2B': { produk: 'Swedish Massage', durasi: 120 },
  '3': { produk: 'Lulur / Scrubbing', durasi: 60 },
  '4A': { produk: 'Shiatsu', durasi: 90 },
  '4B': { produk: 'Shiatsu', durasi: 120 },
  '5': { produk: 'Manicure', durasi: 60 },
  '6': { produk: 'Pedicure', durasi: 60 },
  '7': { produk: 'Dry Back Massage', durasi: 60 },
  '7A': { produk: 'Dry Back Massage', durasi: 90 },
  '8': { produk: 'Totok Wajah', durasi: 60 },
  'RM1': { produk: 'Refleksi + Massage', durasi: 90 },
  'RM2': { produk: 'Refleksi + Massage', durasi: 120 },
  'MT1': { produk: 'Massage + Totok Wajah', durasi: 90 },
  'MT2': { produk: 'Massage + Totok Wajah', durasi: 120 }
};

// ===== 2. Data Menu Rumah Spa Terbaru dari Foto =====
export const layananRumahSpa = {
  // Massage 1-27
  '1': { produk: 'Refleksi', durasi: 60 }, '2': { produk: 'Refleksi', durasi: 90 }, '3': { produk: 'Refleksi', durasi: 120 },
  '2m': { produk: 'Refleksi + Massage', durasi: 90 }, '3m': { produk: 'Refleksi + Massage', durasi: 120 },
  '4': { produk: 'Javanese Massage', durasi: 60 }, '5': { produk: 'Javanese Massage', durasi: 90 }, '6': { produk: 'Javanese Massage', durasi: 120 },
  '7': { produk: 'Swedish Massage', durasi: 60 }, '8': { produk: 'Swedish Massage', durasi: 90 }, '9': { produk: 'Swedish Massage', durasi: 120 },
  '10': { produk: 'Japanese Massage / Shiatsu', durasi: 60 }, '11': { produk: 'Japanese Massage / Shiatsu', durasi: 90 }, '12': { produk: 'Japanese Massage / Shiatsu', durasi: 120 },
  '13': { produk: 'Thai Massage', durasi: 60 }, '14': { produk: 'Thai Massage', durasi: 90 }, '15': { produk: 'Thai Massage', durasi: 120 },
  '16': { produk: 'Balinese Massage', durasi: 60 }, '17': { produk: 'Balinese Massage', durasi: 90 }, '18': { produk: 'Balinese Massage', durasi: 120 },
  '19': { produk: 'COM. MSG (Java + Thai)', durasi: 60 }, '20': { produk: 'COM. MSG (Java + Thai)', durasi: 90 }, '21': { produk: 'COM. MSG (Java + Thai)', durasi: 120 },
  '22': { produk: 'COM. MSG (Java + Japan)', durasi: 60 }, '23': { produk: 'COM. MSG (Java + Japan)', durasi: 90 }, '24': { produk: 'COM. MSG (Java + Japan)', durasi: 120 },
  '25': { produk: 'Hot Stone Massage', durasi: 60 }, '26': { produk: 'Hot Stone Massage', durasi: 90 }, '27': { produk: 'Hot Stone Massage', durasi: 120 },

  // Spa 28-44
  '28': { produk: 'V. Spa', durasi: 60 }, '29': { produk: 'Breast Care', durasi: 60 }, '30': { produk: 'Scrubbing (Lulur)', durasi: 60 },
  '31': { produk: 'Standard Spa', durasi: 120 }, '32': { produk: 'Warm Ball Spa', durasi: 120 }, '33': { produk: 'Javanese Herbal Spa', durasi: 150 },
  '34': { produk: 'Avocado Spa', durasi: 150 }, '35': { produk: 'Green Tea Spa', durasi: 150 }, '36': { produk: 'Coffee Mud Spa', durasi: 150 },
  '37': { produk: 'Lavender Spa', durasi: 150 }, '38': { produk: 'Relaxing Spa', durasi: 150 }, '39': { produk: 'Chocolate Spa', durasi: 180 },
  '40': { produk: 'Kendedes Spa', durasi: 180 }, '41': { produk: 'Whitening Spa', durasi: 180 }, '42': { produk: 'Bengkoang Spa', durasi: 180 },
  '43': { produk: 'Jasmine Spa', durasi: 180 }, '44': { produk: 'Harmony Sensation Spa', durasi: 180 },

  // Paket PRWT 45-56
  '45': { produk: 'Putri Pinang Masak (Javanese Spa)', durasi: 0, note: 'PRWT Ke 1' }, '46': { produk: 'Putri Pinang Masak (Kendedes Spa)', durasi: 0, note: 'PRWT Ke 2' },
  '47': { produk: 'Putri Rambut Selako (Javanese Spa)', durasi: 0, note: 'PRWT Ke 1' }, '48': { produk: 'Putri Rambut Selako (Whitening Spa)', durasi: 0, note: 'PRWT Ke 2' }, '49': { produk: 'Putri Rambut Selako (Kendedes Spa)', durasi: 0, note: 'PRWT Ke 3' },
  '50': { produk: 'Putri Dayang Merindu (Javanese Spa)', durasi: 0, note: 'PRWT Ke 1' }, '51': { produk: 'Putri Dayang Merindu (Bengkoang Spa)', durasi: 0, note: 'PRWT Ke 2' }, '52': { produk: 'Putri Dayang Merindu (Kendedes Spa)', durasi: 0, note: 'PRWT Ke 3' },
  '53': { produk: 'Putri Kembang Dadar (Javanese Spa)', durasi: 0, note: 'PRWT Ke 1' }, '54': { produk: 'Putri Kembang Dadar (Whitening Spa)', durasi: 0, note: 'PRWT Ke 2' }, '55': { produk: 'Putri Kembang Dadar (Bengkoang Spa)', durasi: 0, note: 'PRWT Ke 3' }, '56': { produk: 'Putri Kembang Dadar (Kendedes Spa)', durasi: 0, note: 'PRWT Ke 4' },

  // Tambahan tulisan tangan
  '57': { produk: 'Totok Wajah', durasi: 60 }, '58': { produk: 'Masker Badan', durasi: 60 }, '60': { produk: 'Massage + Totok Wajah', durasi: 90 }, '61': { produk: 'Massage + Totok Wajah', durasi: 120 },
};