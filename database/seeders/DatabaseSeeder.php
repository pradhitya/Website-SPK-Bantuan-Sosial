<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Kriteria;
use App\Models\SubKriteria;
use App\Models\Masyarakat;
use App\Models\Penilaian;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        User::create([ 'id' => 1, 'username' => 'admin', 'password' => Hash::make('admin123'), 'nama' => 'Ahmad Yusuf, S.Kom', 'jabatan' => 'Operator Sistem', 'role' => 'admin' ]);
        User::create([ 'id' => 2, 'username' => 'kades', 'password' => Hash::make('kades123'), 'nama' => 'H. Suryanto', 'jabatan' => 'Kepala Desa Sukamaju', 'role' => 'kades' ]);

        // Kriteria
        $kriterias = [
            [ 'id' => 1, 'kode' => 'C1', 'nama' => 'Penghasilan per Bulan', 'atribut' => 'Cost', 'bobot' => 20 ],
            [ 'id' => 2, 'kode' => 'C2', 'nama' => 'Jumlah Tanggungan Keluarga', 'atribut' => 'Benefit', 'bobot' => 15 ],
            [ 'id' => 3, 'kode' => 'C3', 'nama' => 'Status Kepemilikan Rumah', 'atribut' => 'Benefit', 'bobot' => 15 ],
            [ 'id' => 4, 'kode' => 'C4', 'nama' => 'Tingkat Pendidikan Terakhir', 'atribut' => 'Benefit', 'bobot' => 10 ],
            [ 'id' => 5, 'kode' => 'C5', 'nama' => 'Kondisi Fisik Rumah', 'atribut' => 'Benefit', 'bobot' => 10 ],
            [ 'id' => 6, 'kode' => 'C6', 'nama' => 'Status Pekerjaan', 'atribut' => 'Benefit', 'bobot' => 10 ],
            [ 'id' => 7, 'kode' => 'C7', 'nama' => 'Akses Listrik', 'atribut' => 'Benefit', 'bobot' => 5 ],
            [ 'id' => 8, 'kode' => 'C8', 'nama' => 'Akses Air Bersih', 'atribut' => 'Benefit', 'bobot' => 5 ],
            [ 'id' => 9, 'kode' => 'C9', 'nama' => 'Kepemilikan Lahan/Tanah', 'atribut' => 'Benefit', 'bobot' => 5 ],
            [ 'id' => 10, 'kode' => 'C10', 'nama' => 'Kepemilikan Kendaraan', 'atribut' => 'Benefit', 'bobot' => 5 ],
        ];
        foreach ($kriterias as $k) {
            Kriteria::create($k);
        }

        // Sub Kriteria
        $subKriterias = [
            [ 'id' => 1, 'kriteria_id' => 1, 'nama' => '< Rp 500.000', 'nilai' => 1 ],
            [ 'id' => 2, 'kriteria_id' => 1, 'nama' => 'Rp 500.001 – Rp 1.000.000', 'nilai' => 2 ],
            [ 'id' => 3, 'kriteria_id' => 1, 'nama' => 'Rp 1.000.001 – Rp 2.000.000', 'nilai' => 3 ],
            [ 'id' => 4, 'kriteria_id' => 1, 'nama' => 'Rp 2.000.001 – Rp 3.500.000', 'nilai' => 4 ],
            [ 'id' => 5, 'kriteria_id' => 1, 'nama' => '> Rp 3.500.000', 'nilai' => 5 ],
            [ 'id' => 6, 'kriteria_id' => 2, 'nama' => '1 Orang', 'nilai' => 1 ],
            [ 'id' => 7, 'kriteria_id' => 2, 'nama' => '2 Orang', 'nilai' => 2 ],
            [ 'id' => 8, 'kriteria_id' => 2, 'nama' => '3 Orang', 'nilai' => 3 ],
            [ 'id' => 9, 'kriteria_id' => 2, 'nama' => '4 Orang', 'nilai' => 4 ],
            [ 'id' => 10, 'kriteria_id' => 2, 'nama' => '≥ 5 Orang', 'nilai' => 5 ],
            [ 'id' => 11, 'kriteria_id' => 3, 'nama' => 'Milik Sendiri', 'nilai' => 1 ],
            [ 'id' => 12, 'kriteria_id' => 3, 'nama' => 'Sewa / Kontrak', 'nilai' => 2 ],
            [ 'id' => 13, 'kriteria_id' => 3, 'nama' => 'Menumpang', 'nilai' => 3 ],
            [ 'id' => 14, 'kriteria_id' => 3, 'nama' => 'Tanpa Tempat Tinggal', 'nilai' => 4 ],
            [ 'id' => 15, 'kriteria_id' => 4, 'nama' => 'Sarjana (S1/S2/S3)', 'nilai' => 1 ],
            [ 'id' => 16, 'kriteria_id' => 4, 'nama' => 'SMA / Sederajat', 'nilai' => 2 ],
            [ 'id' => 17, 'kriteria_id' => 4, 'nama' => 'SMP / Sederajat', 'nilai' => 3 ],
            [ 'id' => 18, 'kriteria_id' => 4, 'nama' => 'SD / Sederajat', 'nilai' => 4 ],
            [ 'id' => 19, 'kriteria_id' => 4, 'nama' => 'Tidak Sekolah', 'nilai' => 5 ],
            [ 'id' => 20, 'kriteria_id' => 5, 'nama' => 'Permanen (Layak Huni)', 'nilai' => 1 ],
            [ 'id' => 21, 'kriteria_id' => 5, 'nama' => 'Semi Permanen', 'nilai' => 2 ],
            [ 'id' => 22, 'kriteria_id' => 5, 'nama' => 'Darurat / Tidak Layak Huni', 'nilai' => 3 ],
            [ 'id' => 23, 'kriteria_id' => 6, 'nama' => 'PNS / TNI / Polri', 'nilai' => 1 ],
            [ 'id' => 24, 'kriteria_id' => 6, 'nama' => 'Karyawan Swasta', 'nilai' => 2 ],
            [ 'id' => 25, 'kriteria_id' => 6, 'nama' => 'Wiraswasta / Pedagang', 'nilai' => 3 ],
            [ 'id' => 26, 'kriteria_id' => 6, 'nama' => 'Buruh Harian Lepas', 'nilai' => 4 ],
            [ 'id' => 27, 'kriteria_id' => 6, 'nama' => 'Tidak Bekerja / Pengangguran', 'nilai' => 5 ],
            [ 'id' => 28, 'kriteria_id' => 7, 'nama' => 'Listrik PLN Mandiri', 'nilai' => 1 ],
            [ 'id' => 29, 'kriteria_id' => 7, 'nama' => 'Listrik Bersama / Numpang', 'nilai' => 2 ],
            [ 'id' => 30, 'kriteria_id' => 7, 'nama' => 'Tidak Ada Listrik', 'nilai' => 3 ],
            [ 'id' => 31, 'kriteria_id' => 8, 'nama' => 'Air PDAM / Ledeng', 'nilai' => 1 ],
            [ 'id' => 32, 'kriteria_id' => 8, 'nama' => 'Sumur / Pompa Tangan', 'nilai' => 2 ],
            [ 'id' => 33, 'kriteria_id' => 8, 'nama' => 'Sungai / Tidak Layak', 'nilai' => 3 ],
            [ 'id' => 34, 'kriteria_id' => 9, 'nama' => 'Memiliki > 1 Bidang Tanah', 'nilai' => 1 ],
            [ 'id' => 35, 'kriteria_id' => 9, 'nama' => 'Memiliki 1 Bidang Tanah', 'nilai' => 2 ],
            [ 'id' => 36, 'kriteria_id' => 9, 'nama' => 'Tidak Memiliki Tanah', 'nilai' => 3 ],
            [ 'id' => 37, 'kriteria_id' => 10, 'nama' => 'Memiliki > 2 Kendaraan', 'nilai' => 1 ],
            [ 'id' => 38, 'kriteria_id' => 10, 'nama' => 'Memiliki 1–2 Kendaraan', 'nilai' => 2 ],
            [ 'id' => 39, 'kriteria_id' => 10, 'nama' => 'Tidak Memiliki Kendaraan', 'nilai' => 3 ],
        ];
        foreach ($subKriterias as $sk) {
            SubKriteria::create($sk);
        }

        // Masyarakat
        $masyarakats = [
            [ 'id' => 1, 'nik' => '3271010101800001', 'nama' => 'Budi Santoso', 'alamat' => 'Jl. Merdeka No. 12 RT 01/RW 02', 'noHp' => '081234567890', 'rtRw' => '01/02', 'tglDaftar' => '2025-01-05' ],
            [ 'id' => 2, 'nik' => '3271010202850002', 'nama' => 'Siti Rahayu', 'alamat' => 'Jl. Mawar No. 5 RT 02/RW 01', 'noHp' => '082345678901', 'rtRw' => '02/01', 'tglDaftar' => '2025-01-06' ],
            [ 'id' => 3, 'nik' => '3271010303790003', 'nama' => 'Ahmad Fauzi', 'alamat' => 'Jl. Kenanga No. 8 RT 03/RW 02', 'noHp' => '083456789012', 'rtRw' => '03/02', 'tglDaftar' => '2025-01-07' ],
            [ 'id' => 4, 'nik' => '3271010404900004', 'nama' => 'Dewi Lestari', 'alamat' => 'Jl. Melati No. 3 RT 01/RW 03', 'noHp' => '084567890123', 'rtRw' => '01/03', 'tglDaftar' => '2025-01-08' ],
            [ 'id' => 5, 'nik' => '3271010505750005', 'nama' => 'Suparman', 'alamat' => 'Jl. Anggrek No. 17 RT 04/RW 01', 'noHp' => '085678901234', 'rtRw' => '04/01', 'tglDaftar' => '2025-01-09' ],
            [ 'id' => 6, 'nik' => '3271010606880006', 'nama' => 'Ratna Wulandari', 'alamat' => 'Jl. Dahlia No. 22 RT 02/RW 04', 'noHp' => '086789012345', 'rtRw' => '02/04', 'tglDaftar' => '2025-01-10' ],
            [ 'id' => 7, 'nik' => '3271010707820007', 'nama' => 'Hendra Wijaya', 'alamat' => 'Jl. Flamboyan No. 9 RT 03/RW 03', 'noHp' => '087890123456', 'rtRw' => '03/03', 'tglDaftar' => '2025-01-11' ],
            [ 'id' => 8, 'nik' => '3271010808910008', 'nama' => 'Fatimah', 'alamat' => 'Jl. Cempaka No. 1 RT 05/RW 02', 'noHp' => '088901234567', 'rtRw' => '05/02', 'tglDaftar' => '2025-01-12' ],
            [ 'id' => 9, 'nik' => '3271010909770009', 'nama' => 'Agus Setiawan', 'alamat' => 'Jl. Teratai No. 15 RT 01/RW 05', 'noHp' => '089012345678', 'rtRw' => '01/05', 'tglDaftar' => '2025-01-13' ],
            [ 'id' => 10, 'nik' => '3271011010860010', 'nama' => 'Sri Mulyani', 'alamat' => 'Jl. Kamboja No. 7 RT 04/RW 03', 'noHp' => '081123456789', 'rtRw' => '04/03', 'tglDaftar' => '2025-01-14' ],
        ];
        foreach ($masyarakats as $m) {
            Masyarakat::create($m);
        }

        // Penilaian
        $penilaians = [
            // Budi Santoso
            [ 'masyarakat_id' => 1, 'kriteria_id' => 1, 'sub_kriteria_id' => 2, 'nilai' => 2 ],
            [ 'masyarakat_id' => 1, 'kriteria_id' => 2, 'sub_kriteria_id' => 9, 'nilai' => 4 ],
            [ 'masyarakat_id' => 1, 'kriteria_id' => 3, 'sub_kriteria_id' => 12, 'nilai' => 2 ],
            [ 'masyarakat_id' => 1, 'kriteria_id' => 4, 'sub_kriteria_id' => 18, 'nilai' => 4 ],
            [ 'masyarakat_id' => 1, 'kriteria_id' => 5, 'sub_kriteria_id' => 21, 'nilai' => 2 ],
            [ 'masyarakat_id' => 1, 'kriteria_id' => 6, 'sub_kriteria_id' => 26, 'nilai' => 4 ],
            [ 'masyarakat_id' => 1, 'kriteria_id' => 7, 'sub_kriteria_id' => 29, 'nilai' => 2 ],
            [ 'masyarakat_id' => 1, 'kriteria_id' => 8, 'sub_kriteria_id' => 32, 'nilai' => 2 ],
            [ 'masyarakat_id' => 1, 'kriteria_id' => 9, 'sub_kriteria_id' => 36, 'nilai' => 3 ],
            [ 'masyarakat_id' => 1, 'kriteria_id' => 10, 'sub_kriteria_id' => 39, 'nilai' => 3 ],
            // Siti Rahayu
            [ 'masyarakat_id' => 2, 'kriteria_id' => 1, 'sub_kriteria_id' => 1, 'nilai' => 1 ],
            [ 'masyarakat_id' => 2, 'kriteria_id' => 2, 'sub_kriteria_id' => 10, 'nilai' => 5 ],
            [ 'masyarakat_id' => 2, 'kriteria_id' => 3, 'sub_kriteria_id' => 13, 'nilai' => 3 ],
            [ 'masyarakat_id' => 2, 'kriteria_id' => 4, 'sub_kriteria_id' => 19, 'nilai' => 5 ],
            [ 'masyarakat_id' => 2, 'kriteria_id' => 5, 'sub_kriteria_id' => 22, 'nilai' => 3 ],
            [ 'masyarakat_id' => 2, 'kriteria_id' => 6, 'sub_kriteria_id' => 27, 'nilai' => 5 ],
            [ 'masyarakat_id' => 2, 'kriteria_id' => 7, 'sub_kriteria_id' => 30, 'nilai' => 3 ],
            [ 'masyarakat_id' => 2, 'kriteria_id' => 8, 'sub_kriteria_id' => 33, 'nilai' => 3 ],
            [ 'masyarakat_id' => 2, 'kriteria_id' => 9, 'sub_kriteria_id' => 36, 'nilai' => 3 ],
            [ 'masyarakat_id' => 2, 'kriteria_id' => 10, 'sub_kriteria_id' => 39, 'nilai' => 3 ],
        ];
        foreach ($penilaians as $p) {
            Penilaian::create($p);
        }

        $this->call(MasyarakatSeeder::class);
    }
}
