<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\JenisBantuan;
use App\Models\Kriteria;
use App\Models\SubKriteria;
use App\Models\Masyarakat;
use App\Models\Penilaian;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        User::create([ 'id' => 1, 'username' => 'admin', 'password' => Hash::make('admin123'), 'nama' => 'Ahmad Yusuf, S.Kom', 'jabatan' => 'Operator Sistem', 'role' => 'admin' ]);
        User::create([ 'id' => 2, 'username' => 'kades', 'password' => Hash::make('kades123'), 'nama' => 'H. Suryanto', 'jabatan' => 'Kepala Desa Sukamaju', 'role' => 'kades' ]);

        // 2. Jenis Bantuan (5 kategori sesuai spesifikasi)
        $jenisBantuans = [
            [ 'id' => 1, 'nama_program' => 'BLT Desa', 'deskripsi' => 'Bantuan Langsung Tunai untuk keluarga miskin ekstrem.', 'filter_target' => 'KK miskin ekstrem', 'periode_evaluasi' => 'bulanan' ],
            [ 'id' => 2, 'nama_program' => 'Bantuan Sembako/Pangan', 'deskripsi' => 'Bantuan sembako untuk keluarga rentan miskin.', 'filter_target' => 'KK rentan miskin', 'periode_evaluasi' => 'bulanan' ],
            [ 'id' => 3, 'nama_program' => 'Bantuan Lansia', 'deskripsi' => 'Bantuan untuk warga usia ≥60 tahun yang tidak produktif.', 'filter_target' => 'Warga usia ≥60 tahun tidak produktif', 'periode_evaluasi' => 'tahunan' ],
            [ 'id' => 4, 'nama_program' => 'Bantuan Stunting/Balita', 'deskripsi' => 'Bantuan untuk KK dengan ibu hamil atau anak balita.', 'filter_target' => 'KK dengan ibu hamil/anak balita', 'periode_evaluasi' => 'bulanan' ],
            [ 'id' => 5, 'nama_program' => 'Bantuan RTLH', 'deskripsi' => 'Bantuan Rumah Tidak Layak Huni untuk KK dengan kondisi rumah tidak layak.', 'filter_target' => 'KK dengan rumah tidak layak huni', 'periode_evaluasi' => 'sekali' ],
        ];
        foreach ($jenisBantuans as $jb) {
            JenisBantuan::create($jb);
        }

        // 3. Kriteria per kategori bantuan
        $kriterias = [
            // === BLT Desa (id: 1) — 5 kriteria, total bobot = 100 ===
            [ 'id' => 1, 'kode' => 'C1-BLT', 'nama' => 'Penghasilan per Bulan', 'atribut' => 'Cost', 'bobot' => 30, 'jenis_bantuan_id' => 1 ],
            [ 'id' => 2, 'kode' => 'C2-BLT', 'nama' => 'Kondisi Fisik Rumah', 'atribut' => 'Benefit', 'bobot' => 20, 'jenis_bantuan_id' => 1 ],
            [ 'id' => 3, 'kode' => 'C3-BLT', 'nama' => 'Jumlah Tanggungan Keluarga', 'atribut' => 'Benefit', 'bobot' => 20, 'jenis_bantuan_id' => 1 ],
            [ 'id' => 4, 'kode' => 'C4-BLT', 'nama' => 'Status Pekerjaan', 'atribut' => 'Benefit', 'bobot' => 15, 'jenis_bantuan_id' => 1 ],
            [ 'id' => 5, 'kode' => 'C5-BLT', 'nama' => 'Riwayat Penyakit/Disabilitas', 'atribut' => 'Benefit', 'bobot' => 15, 'jenis_bantuan_id' => 1 ],

            // === Bantuan Sembako (id: 2) — 5 kriteria, total bobot = 100 ===
            [ 'id' => 6, 'kode' => 'C1-SMB', 'nama' => 'Penghasilan per Bulan', 'atribut' => 'Cost', 'bobot' => 25, 'jenis_bantuan_id' => 2 ],
            [ 'id' => 7, 'kode' => 'C2-SMB', 'nama' => 'Jumlah Tanggungan Keluarga', 'atribut' => 'Benefit', 'bobot' => 25, 'jenis_bantuan_id' => 2 ],
            [ 'id' => 8, 'kode' => 'C3-SMB', 'nama' => 'Status Kepemilikan Rumah', 'atribut' => 'Benefit', 'bobot' => 20, 'jenis_bantuan_id' => 2 ],
            [ 'id' => 9, 'kode' => 'C4-SMB', 'nama' => 'Akses Air Bersih & Sanitasi', 'atribut' => 'Benefit', 'bobot' => 15, 'jenis_bantuan_id' => 2 ],
            [ 'id' => 10, 'kode' => 'C5-SMB', 'nama' => 'Kepemilikan Aset Produktif', 'atribut' => 'Cost', 'bobot' => 15, 'jenis_bantuan_id' => 2 ],

            // === Bantuan Lansia (id: 3) — 4 kriteria, total bobot = 100 ===
            [ 'id' => 11, 'kode' => 'C1-LNS', 'nama' => 'Usia Warga', 'atribut' => 'Benefit', 'bobot' => 30, 'jenis_bantuan_id' => 3 ],
            [ 'id' => 12, 'kode' => 'C2-LNS', 'nama' => 'Kondisi Kesehatan', 'atribut' => 'Benefit', 'bobot' => 25, 'jenis_bantuan_id' => 3 ],
            [ 'id' => 13, 'kode' => 'C3-LNS', 'nama' => 'Ketersediaan Pendamping/Keluarga', 'atribut' => 'Benefit', 'bobot' => 25, 'jenis_bantuan_id' => 3 ],
            [ 'id' => 14, 'kode' => 'C4-LNS', 'nama' => 'Penghasilan/Pensiun', 'atribut' => 'Cost', 'bobot' => 20, 'jenis_bantuan_id' => 3 ],

            // === Bantuan Stunting/Balita (id: 4) — 5 kriteria, total bobot = 100 ===
            [ 'id' => 15, 'kode' => 'C1-STN', 'nama' => 'Status Gizi Anak/Ibu', 'atribut' => 'Benefit', 'bobot' => 30, 'jenis_bantuan_id' => 4 ],
            [ 'id' => 16, 'kode' => 'C2-STN', 'nama' => 'Penghasilan Keluarga', 'atribut' => 'Cost', 'bobot' => 25, 'jenis_bantuan_id' => 4 ],
            [ 'id' => 17, 'kode' => 'C3-STN', 'nama' => 'Akses ke Fasilitas Kesehatan', 'atribut' => 'Benefit', 'bobot' => 20, 'jenis_bantuan_id' => 4 ],
            [ 'id' => 18, 'kode' => 'C4-STN', 'nama' => 'Jumlah Anak Balita', 'atribut' => 'Benefit', 'bobot' => 15, 'jenis_bantuan_id' => 4 ],
            [ 'id' => 19, 'kode' => 'C5-STN', 'nama' => 'Pendidikan Ibu', 'atribut' => 'Benefit', 'bobot' => 10, 'jenis_bantuan_id' => 4 ],

            // === Bantuan RTLH (id: 5) — 5 kriteria, total bobot = 100 ===
            [ 'id' => 20, 'kode' => 'C1-RTL', 'nama' => 'Kondisi Atap Rumah', 'atribut' => 'Benefit', 'bobot' => 25, 'jenis_bantuan_id' => 5 ],
            [ 'id' => 21, 'kode' => 'C2-RTL', 'nama' => 'Kondisi Dinding Rumah', 'atribut' => 'Benefit', 'bobot' => 25, 'jenis_bantuan_id' => 5 ],
            [ 'id' => 22, 'kode' => 'C3-RTL', 'nama' => 'Kondisi Lantai Rumah', 'atribut' => 'Benefit', 'bobot' => 20, 'jenis_bantuan_id' => 5 ],
            [ 'id' => 23, 'kode' => 'C4-RTL', 'nama' => 'Penghasilan Keluarga', 'atribut' => 'Cost', 'bobot' => 15, 'jenis_bantuan_id' => 5 ],
            [ 'id' => 24, 'kode' => 'C5-RTL', 'nama' => 'Status Kepemilikan Rumah', 'atribut' => 'Benefit', 'bobot' => 15, 'jenis_bantuan_id' => 5 ],
        ];
        foreach ($kriterias as $k) {
            Kriteria::create($k);
        }

        // 4. Sub Kriteria
        $subKriterias = [
            // === BLT Desa ===
            // C1-BLT: Penghasilan per Bulan (Cost)
            [ 'kriteria_id' => 1, 'nama' => '< Rp 500.000', 'nilai' => 1 ],
            [ 'kriteria_id' => 1, 'nama' => 'Rp 500.001 – Rp 1.000.000', 'nilai' => 2 ],
            [ 'kriteria_id' => 1, 'nama' => 'Rp 1.000.001 – Rp 2.000.000', 'nilai' => 3 ],
            [ 'kriteria_id' => 1, 'nama' => 'Rp 2.000.001 – Rp 3.500.000', 'nilai' => 4 ],
            [ 'kriteria_id' => 1, 'nama' => '> Rp 3.500.000', 'nilai' => 5 ],
            // C2-BLT: Kondisi Fisik Rumah (Benefit — 5 = sangat jelek = lebih butuh)
            [ 'kriteria_id' => 2, 'nama' => 'Permanen Mewah', 'nilai' => 1 ],
            [ 'kriteria_id' => 2, 'nama' => 'Permanen Sederhana', 'nilai' => 2 ],
            [ 'kriteria_id' => 2, 'nama' => 'Semi Permanen', 'nilai' => 3 ],
            [ 'kriteria_id' => 2, 'nama' => 'Papan/Kayu/Bambu', 'nilai' => 4 ],
            [ 'kriteria_id' => 2, 'nama' => 'Darurat / Sangat Tidak Layak', 'nilai' => 5 ],
            // C3-BLT: Jumlah Tanggungan (Benefit)
            [ 'kriteria_id' => 3, 'nama' => '1 Orang', 'nilai' => 1 ],
            [ 'kriteria_id' => 3, 'nama' => '2 Orang', 'nilai' => 2 ],
            [ 'kriteria_id' => 3, 'nama' => '3 Orang', 'nilai' => 3 ],
            [ 'kriteria_id' => 3, 'nama' => '4 Orang', 'nilai' => 4 ],
            [ 'kriteria_id' => 3, 'nama' => '≥ 5 Orang', 'nilai' => 5 ],
            // C4-BLT: Status Pekerjaan (Benefit — 5 = pengangguran = lebih butuh)
            [ 'kriteria_id' => 4, 'nama' => 'PNS / TNI / Polri', 'nilai' => 1 ],
            [ 'kriteria_id' => 4, 'nama' => 'Karyawan Swasta Tetap', 'nilai' => 2 ],
            [ 'kriteria_id' => 4, 'nama' => 'Wiraswasta / Pedagang', 'nilai' => 3 ],
            [ 'kriteria_id' => 4, 'nama' => 'Buruh Harian Lepas', 'nilai' => 4 ],
            [ 'kriteria_id' => 4, 'nama' => 'Tidak Bekerja / Pengangguran', 'nilai' => 5 ],
            // C5-BLT: Riwayat Penyakit/Disabilitas (Benefit)
            [ 'kriteria_id' => 5, 'nama' => 'Sehat Jasmani Rohani', 'nilai' => 1 ],
            [ 'kriteria_id' => 5, 'nama' => 'Sakit Ringan', 'nilai' => 2 ],
            [ 'kriteria_id' => 5, 'nama' => 'Lansia Masih Produktif', 'nilai' => 3 ],
            [ 'kriteria_id' => 5, 'nama' => 'Penyakit Menahun', 'nilai' => 4 ],
            [ 'kriteria_id' => 5, 'nama' => 'Lansia Tidak Produktif / Disabilitas', 'nilai' => 5 ],

            // === Bantuan Sembako ===
            // C1-SMB: Penghasilan (Cost)
            [ 'kriteria_id' => 6, 'nama' => '< Rp 500.000', 'nilai' => 1 ],
            [ 'kriteria_id' => 6, 'nama' => 'Rp 500.001 – Rp 1.000.000', 'nilai' => 2 ],
            [ 'kriteria_id' => 6, 'nama' => 'Rp 1.000.001 – Rp 2.000.000', 'nilai' => 3 ],
            [ 'kriteria_id' => 6, 'nama' => 'Rp 2.000.001 – Rp 3.500.000', 'nilai' => 4 ],
            [ 'kriteria_id' => 6, 'nama' => '> Rp 3.500.000', 'nilai' => 5 ],
            // C2-SMB: Jumlah Tanggungan (Benefit)
            [ 'kriteria_id' => 7, 'nama' => '1 Orang', 'nilai' => 1 ],
            [ 'kriteria_id' => 7, 'nama' => '2 Orang', 'nilai' => 2 ],
            [ 'kriteria_id' => 7, 'nama' => '3 Orang', 'nilai' => 3 ],
            [ 'kriteria_id' => 7, 'nama' => '4 Orang', 'nilai' => 4 ],
            [ 'kriteria_id' => 7, 'nama' => '≥ 5 Orang', 'nilai' => 5 ],
            // C3-SMB: Status Kepemilikan Rumah (Benefit — 5 = tidak punya = lebih butuh)
            [ 'kriteria_id' => 8, 'nama' => 'Milik Sendiri (Mewah)', 'nilai' => 1 ],
            [ 'kriteria_id' => 8, 'nama' => 'Milik Sendiri (Sederhana)', 'nilai' => 2 ],
            [ 'kriteria_id' => 8, 'nama' => 'Sewa / Kontrak', 'nilai' => 3 ],
            [ 'kriteria_id' => 8, 'nama' => 'Menumpang', 'nilai' => 4 ],
            [ 'kriteria_id' => 8, 'nama' => 'Tidak Punya Tempat Tinggal Tetap', 'nilai' => 5 ],
            // C4-SMB: Akses Air Bersih & Sanitasi (Benefit — 5 = tidak ada = lebih butuh)
            [ 'kriteria_id' => 9, 'nama' => 'Air PDAM + WC Layak', 'nilai' => 1 ],
            [ 'kriteria_id' => 9, 'nama' => 'Sumur Bor + WC Sederhana', 'nilai' => 2 ],
            [ 'kriteria_id' => 9, 'nama' => 'Sumur Gali / Pompa', 'nilai' => 3 ],
            [ 'kriteria_id' => 9, 'nama' => 'Air Hujan / Sungai', 'nilai' => 4 ],
            [ 'kriteria_id' => 9, 'nama' => 'Tidak Ada Akses Air Bersih', 'nilai' => 5 ],
            // C5-SMB: Kepemilikan Aset Produktif (Cost)
            [ 'kriteria_id' => 10, 'nama' => 'Tidak Ada Aset', 'nilai' => 1 ],
            [ 'kriteria_id' => 10, 'nama' => 'Sedikit (< Rp 1 Juta)', 'nilai' => 2 ],
            [ 'kriteria_id' => 10, 'nama' => 'Sedang (Rp 1-5 Juta)', 'nilai' => 3 ],
            [ 'kriteria_id' => 10, 'nama' => 'Cukup (Rp 5-15 Juta)', 'nilai' => 4 ],
            [ 'kriteria_id' => 10, 'nama' => 'Banyak (> Rp 15 Juta)', 'nilai' => 5 ],

            // === Bantuan Lansia ===
            // C1-LNS: Usia Warga (Benefit — 5 = sangat tua)
            [ 'kriteria_id' => 11, 'nama' => '60 – 64 Tahun', 'nilai' => 1 ],
            [ 'kriteria_id' => 11, 'nama' => '65 – 69 Tahun', 'nilai' => 2 ],
            [ 'kriteria_id' => 11, 'nama' => '70 – 74 Tahun', 'nilai' => 3 ],
            [ 'kriteria_id' => 11, 'nama' => '75 – 79 Tahun', 'nilai' => 4 ],
            [ 'kriteria_id' => 11, 'nama' => '≥ 80 Tahun', 'nilai' => 5 ],
            // C2-LNS: Kondisi Kesehatan (Benefit — 5 = sangat sakit)
            [ 'kriteria_id' => 12, 'nama' => 'Sehat / Aktif Mandiri', 'nilai' => 1 ],
            [ 'kriteria_id' => 12, 'nama' => 'Sakit Ringan', 'nilai' => 2 ],
            [ 'kriteria_id' => 12, 'nama' => 'Sakit Menahun', 'nilai' => 3 ],
            [ 'kriteria_id' => 12, 'nama' => 'Tidak Bisa Beraktivitas Mandiri', 'nilai' => 4 ],
            [ 'kriteria_id' => 12, 'nama' => 'Bed-rest / Lumpuh Total', 'nilai' => 5 ],
            // C3-LNS: Ketersediaan Pendamping (Benefit — 5 = tidak ada = lebih butuh)
            [ 'kriteria_id' => 13, 'nama' => 'Tinggal dengan Keluarga Mampu', 'nilai' => 1 ],
            [ 'kriteria_id' => 13, 'nama' => 'Tinggal dengan Keluarga Kurang Mampu', 'nilai' => 2 ],
            [ 'kriteria_id' => 13, 'nama' => 'Tinggal dengan Keluarga Miskin', 'nilai' => 3 ],
            [ 'kriteria_id' => 13, 'nama' => 'Tinggal Sendiri (Ada Tetangga)', 'nilai' => 4 ],
            [ 'kriteria_id' => 13, 'nama' => 'Tinggal Sendiri (Terisolasi)', 'nilai' => 5 ],
            // C4-LNS: Penghasilan/Pensiun (Cost)
            [ 'kriteria_id' => 14, 'nama' => 'Tidak Ada Penghasilan', 'nilai' => 1 ],
            [ 'kriteria_id' => 14, 'nama' => '< Rp 300.000', 'nilai' => 2 ],
            [ 'kriteria_id' => 14, 'nama' => 'Rp 300.000 – Rp 750.000', 'nilai' => 3 ],
            [ 'kriteria_id' => 14, 'nama' => 'Rp 750.001 – Rp 1.500.000', 'nilai' => 4 ],
            [ 'kriteria_id' => 14, 'nama' => '> Rp 1.500.000', 'nilai' => 5 ],

            // === Bantuan Stunting/Balita ===
            // C1-STN: Status Gizi Anak/Ibu (Benefit — 5 = gizi buruk)
            [ 'kriteria_id' => 15, 'nama' => 'Gizi Baik', 'nilai' => 1 ],
            [ 'kriteria_id' => 15, 'nama' => 'Gizi Cukup', 'nilai' => 2 ],
            [ 'kriteria_id' => 15, 'nama' => 'Gizi Kurang', 'nilai' => 3 ],
            [ 'kriteria_id' => 15, 'nama' => 'Gizi Buruk', 'nilai' => 4 ],
            [ 'kriteria_id' => 15, 'nama' => 'Stunting / KEK', 'nilai' => 5 ],
            // C2-STN: Penghasilan Keluarga (Cost)
            [ 'kriteria_id' => 16, 'nama' => '< Rp 500.000', 'nilai' => 1 ],
            [ 'kriteria_id' => 16, 'nama' => 'Rp 500.001 – Rp 1.000.000', 'nilai' => 2 ],
            [ 'kriteria_id' => 16, 'nama' => 'Rp 1.000.001 – Rp 2.000.000', 'nilai' => 3 ],
            [ 'kriteria_id' => 16, 'nama' => 'Rp 2.000.001 – Rp 3.500.000', 'nilai' => 4 ],
            [ 'kriteria_id' => 16, 'nama' => '> Rp 3.500.000', 'nilai' => 5 ],
            // C3-STN: Akses Fasilitas Kesehatan (Benefit — 5 = tidak ada akses)
            [ 'kriteria_id' => 17, 'nama' => 'Dekat RS/Puskesmas (< 1 km)', 'nilai' => 1 ],
            [ 'kriteria_id' => 17, 'nama' => 'Dekat Posyandu (1-3 km)', 'nilai' => 2 ],
            [ 'kriteria_id' => 17, 'nama' => 'Jauh (3-5 km)', 'nilai' => 3 ],
            [ 'kriteria_id' => 17, 'nama' => 'Sangat Jauh (5-10 km)', 'nilai' => 4 ],
            [ 'kriteria_id' => 17, 'nama' => 'Tidak Ada Akses Faskes', 'nilai' => 5 ],
            // C4-STN: Jumlah Anak Balita (Benefit)
            [ 'kriteria_id' => 18, 'nama' => '1 Anak Balita', 'nilai' => 1 ],
            [ 'kriteria_id' => 18, 'nama' => '2 Anak Balita', 'nilai' => 3 ],
            [ 'kriteria_id' => 18, 'nama' => '≥ 3 Anak Balita', 'nilai' => 5 ],
            // C5-STN: Pendidikan Ibu (Benefit — 5 = tidak sekolah = lebih butuh edukasi gizi)
            [ 'kriteria_id' => 19, 'nama' => 'Sarjana / D3+', 'nilai' => 1 ],
            [ 'kriteria_id' => 19, 'nama' => 'SMA / Sederajat', 'nilai' => 2 ],
            [ 'kriteria_id' => 19, 'nama' => 'SMP / Sederajat', 'nilai' => 3 ],
            [ 'kriteria_id' => 19, 'nama' => 'SD / Sederajat', 'nilai' => 4 ],
            [ 'kriteria_id' => 19, 'nama' => 'Tidak Sekolah', 'nilai' => 5 ],

            // === Bantuan RTLH ===
            // C1-RTL: Kondisi Atap (Benefit — 5 = sangat rusak)
            [ 'kriteria_id' => 20, 'nama' => 'Beton/Genteng Bagus', 'nilai' => 1 ],
            [ 'kriteria_id' => 20, 'nama' => 'Genteng Biasa', 'nilai' => 2 ],
            [ 'kriteria_id' => 20, 'nama' => 'Seng/Asbes Layak', 'nilai' => 3 ],
            [ 'kriteria_id' => 20, 'nama' => 'Seng Berkarat/Bocor', 'nilai' => 4 ],
            [ 'kriteria_id' => 20, 'nama' => 'Daun/Terpal/Tidak Ada', 'nilai' => 5 ],
            // C2-RTL: Kondisi Dinding (Benefit — 5 = sangat rusak)
            [ 'kriteria_id' => 21, 'nama' => 'Bata/Beton Diplester', 'nilai' => 1 ],
            [ 'kriteria_id' => 21, 'nama' => 'Bata Tanpa Plester', 'nilai' => 2 ],
            [ 'kriteria_id' => 21, 'nama' => 'Kayu/Papan Layak', 'nilai' => 3 ],
            [ 'kriteria_id' => 21, 'nama' => 'Bambu/Anyaman', 'nilai' => 4 ],
            [ 'kriteria_id' => 21, 'nama' => 'Rusak Berat/Tidak Ada', 'nilai' => 5 ],
            // C3-RTL: Kondisi Lantai (Benefit — 5 = tanah)
            [ 'kriteria_id' => 22, 'nama' => 'Keramik/Granit', 'nilai' => 1 ],
            [ 'kriteria_id' => 22, 'nama' => 'Ubin/Tegel', 'nilai' => 2 ],
            [ 'kriteria_id' => 22, 'nama' => 'Plester Semen', 'nilai' => 3 ],
            [ 'kriteria_id' => 22, 'nama' => 'Semen Kasar/Rusak', 'nilai' => 4 ],
            [ 'kriteria_id' => 22, 'nama' => 'Tanah', 'nilai' => 5 ],
            // C4-RTL: Penghasilan Keluarga (Cost)
            [ 'kriteria_id' => 23, 'nama' => '< Rp 500.000', 'nilai' => 1 ],
            [ 'kriteria_id' => 23, 'nama' => 'Rp 500.001 – Rp 1.000.000', 'nilai' => 2 ],
            [ 'kriteria_id' => 23, 'nama' => 'Rp 1.000.001 – Rp 2.000.000', 'nilai' => 3 ],
            [ 'kriteria_id' => 23, 'nama' => 'Rp 2.000.001 – Rp 3.500.000', 'nilai' => 4 ],
            [ 'kriteria_id' => 23, 'nama' => '> Rp 3.500.000', 'nilai' => 5 ],
            // C5-RTL: Status Kepemilikan Rumah (Benefit — 5 = menumpang)
            [ 'kriteria_id' => 24, 'nama' => 'Milik Sendiri + Sertifikat', 'nilai' => 1 ],
            [ 'kriteria_id' => 24, 'nama' => 'Milik Sendiri Tanpa Sertifikat', 'nilai' => 2 ],
            [ 'kriteria_id' => 24, 'nama' => 'Hak Pakai / Pinjam', 'nilai' => 3 ],
            [ 'kriteria_id' => 24, 'nama' => 'Menumpang di Rumah Keluarga', 'nilai' => 4 ],
            [ 'kriteria_id' => 24, 'nama' => 'Lahan Sengketa / Ilegal', 'nilai' => 5 ],
        ];
        foreach ($subKriterias as $sk) {
            SubKriteria::create($sk);
        }

        // 5. Masyarakat (Dummy Data per kategori)
        $periode = date('Y-m');

        $masyarakats = [
            // BLT Desa (jenis_bantuan_id: 1)
            [ 'nik' => '3271010101800001', 'nama' => 'Budi Santoso', 'alamat' => 'Jl. Merdeka No. 12 RT 01', 'noHp' => '081234567890', 'rtRw' => '01/02', 'periode' => $periode, 'jenis_bantuan_id' => 1 ],
            [ 'nik' => '3271010202850002', 'nama' => 'Siti Rahayu', 'alamat' => 'Jl. Mawar No. 5 RT 02', 'noHp' => '082345678901', 'rtRw' => '02/01', 'periode' => $periode, 'jenis_bantuan_id' => 1 ],
            [ 'nik' => '3271010303790003', 'nama' => 'Ahmad Fauzi', 'alamat' => 'Jl. Kenanga No. 8 RT 03', 'noHp' => '083456789012', 'rtRw' => '03/02', 'periode' => $periode, 'jenis_bantuan_id' => 1 ],

            // Bantuan Sembako (jenis_bantuan_id: 2)
            [ 'nik' => '3271010404900004', 'nama' => 'Dewi Lestari', 'alamat' => 'Jl. Melati No. 3 RT 01', 'noHp' => '084567890123', 'rtRw' => '01/03', 'periode' => $periode, 'jenis_bantuan_id' => 2 ],
            [ 'nik' => '3271010505750005', 'nama' => 'Suparman', 'alamat' => 'Jl. Anggrek No. 17 RT 04', 'noHp' => '085678901234', 'rtRw' => '04/01', 'periode' => $periode, 'jenis_bantuan_id' => 2 ],
            [ 'nik' => '3271010606880006', 'nama' => 'Ratna Wulandari', 'alamat' => 'Jl. Dahlia No. 22 RT 02', 'noHp' => '086789012345', 'rtRw' => '02/04', 'periode' => $periode, 'jenis_bantuan_id' => 2 ],

            // Bantuan Lansia (jenis_bantuan_id: 3)
            [ 'nik' => '3271010707820007', 'nama' => 'Haji Mulyono', 'alamat' => 'Jl. Flamboyan No. 9 RT 03', 'noHp' => '087890123456', 'rtRw' => '03/03', 'periode' => $periode, 'jenis_bantuan_id' => 3 ],
            [ 'nik' => '3271010808910008', 'nama' => 'Suminah', 'alamat' => 'Jl. Cempaka No. 1 RT 05', 'noHp' => '088901234567', 'rtRw' => '05/02', 'periode' => $periode, 'jenis_bantuan_id' => 3 ],

            // Bantuan Stunting/Balita (jenis_bantuan_id: 4)
            [ 'nik' => '3271010909770009', 'nama' => 'Agus Setiawan', 'alamat' => 'Jl. Teratai No. 15 RT 01', 'noHp' => '089012345678', 'rtRw' => '01/05', 'periode' => $periode, 'jenis_bantuan_id' => 4 ],
            [ 'nik' => '3271011010860010', 'nama' => 'Sri Mulyani', 'alamat' => 'Jl. Kamboja No. 7 RT 04', 'noHp' => '081123456789', 'rtRw' => '04/03', 'periode' => $periode, 'jenis_bantuan_id' => 4 ],

            // Bantuan RTLH (jenis_bantuan_id: 5)
            [ 'nik' => '3271011111830011', 'nama' => 'Joko Susilo', 'alamat' => 'Jl. Seruni No. 11 RT 02', 'noHp' => '082234567890', 'rtRw' => '02/05', 'periode' => $periode, 'jenis_bantuan_id' => 5 ],
            [ 'nik' => '3271011212920012', 'nama' => 'Maryati', 'alamat' => 'Jl. Tulip No. 4 RT 05', 'noHp' => '083345678901', 'rtRw' => '05/04', 'periode' => $periode, 'jenis_bantuan_id' => 5 ],
        ];
        foreach ($masyarakats as $m) {
            $m['tglDaftar'] = Carbon::now()->format('Y-m-d');
            Masyarakat::create($m);
        }

        // 6. Setting kuota per kategori
        \App\Models\Setting::create(['key' => 'kuota_bansos_1', 'value' => '5']);
        \App\Models\Setting::create(['key' => 'kuota_bansos_2', 'value' => '5']);
        \App\Models\Setting::create(['key' => 'kuota_bansos_3', 'value' => '3']);
        \App\Models\Setting::create(['key' => 'kuota_bansos_4', 'value' => '5']);
        \App\Models\Setting::create(['key' => 'kuota_bansos_5', 'value' => '3']);
    }
}
