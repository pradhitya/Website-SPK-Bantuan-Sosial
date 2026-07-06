<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Keluarga;
use App\Models\Warga;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // === Keluarga 1: Budi Santoso ===
        $kk1 = Keluarga::create([
            'no_kk' => '3201011234560001',
            'alamat' => 'Jl. Mawar No. 10',
            'rt_rw' => '001/002',
            'kelurahan' => 'Sukamaju',
            'kecamatan' => 'Cianjur',
        ]);

        Warga::create([
            'keluarga_id' => $kk1->id, 'nik' => '3201011234560101',
            'nama' => 'Budi Santoso', 'jenis_kelamin' => 'L',
            'tempat_lahir' => 'Cianjur', 'tanggal_lahir' => '1985-03-15',
            'status_keluarga' => 'Kepala Keluarga', 'no_hp' => '081234567890',
            'pekerjaan' => 'Buruh Tani',
        ]);
        Warga::create([
            'keluarga_id' => $kk1->id, 'nik' => '3201011234560102',
            'nama' => 'Siti Nurhasanah', 'jenis_kelamin' => 'P',
            'tempat_lahir' => 'Bandung', 'tanggal_lahir' => '1990-07-22',
            'status_keluarga' => 'Istri', 'no_hp' => '081234567891',
            'pekerjaan' => 'Ibu Rumah Tangga', 'keterangan_khusus' => 'Hamil',
        ]);
        Warga::create([
            'keluarga_id' => $kk1->id, 'nik' => '3201011234560103',
            'nama' => 'Andi Santoso', 'jenis_kelamin' => 'L',
            'tempat_lahir' => 'Cianjur', 'tanggal_lahir' => '2010-01-05',
            'status_keluarga' => 'Anak',
            'pekerjaan' => 'Pelajar',
        ]);
        Warga::create([
            'keluarga_id' => $kk1->id, 'nik' => '3201011234560104',
            'nama' => 'Haji Kosim', 'jenis_kelamin' => 'L',
            'tempat_lahir' => 'Cianjur', 'tanggal_lahir' => '1955-12-01',
            'status_keluarga' => 'Orang Tua', 'no_hp' => '081234567892',
            'pekerjaan' => 'Pensiunan',
        ]);

        // === Keluarga 2: Ahmad Hidayat ===
        $kk2 = Keluarga::create([
            'no_kk' => '3201011234560002',
            'alamat' => 'Jl. Melati No. 5',
            'rt_rw' => '002/003',
            'kelurahan' => 'Sukamaju',
            'kecamatan' => 'Cianjur',
        ]);

        Warga::create([
            'keluarga_id' => $kk2->id, 'nik' => '3201011234560201',
            'nama' => 'Ahmad Hidayat', 'jenis_kelamin' => 'L',
            'tempat_lahir' => 'Cianjur', 'tanggal_lahir' => '1980-06-10',
            'status_keluarga' => 'Kepala Keluarga', 'no_hp' => '082345678901',
            'pekerjaan' => 'Pedagang',
        ]);
        Warga::create([
            'keluarga_id' => $kk2->id, 'nik' => '3201011234560202',
            'nama' => 'Dewi Lestari', 'jenis_kelamin' => 'P',
            'tempat_lahir' => 'Sukabumi', 'tanggal_lahir' => '1983-11-28',
            'status_keluarga' => 'Istri', 'no_hp' => '082345678902',
            'pekerjaan' => 'Ibu Rumah Tangga',
        ]);
        Warga::create([
            'keluarga_id' => $kk2->id, 'nik' => '3201011234560203',
            'nama' => 'Rina Hidayat', 'jenis_kelamin' => 'P',
            'tempat_lahir' => 'Cianjur', 'tanggal_lahir' => '2005-04-18',
            'status_keluarga' => 'Anak',
            'pekerjaan' => 'Pelajar',
        ]);

        // === Keluarga 3: Joko Widodo ===
        $kk3 = Keluarga::create([
            'no_kk' => '3201011234560003',
            'alamat' => 'Jl. Dahlia No. 8',
            'rt_rw' => '003/001',
            'kelurahan' => 'Sukamaju',
            'kecamatan' => 'Cianjur',
        ]);

        Warga::create([
            'keluarga_id' => $kk3->id, 'nik' => '3201011234560301',
            'nama' => 'Joko Widodo', 'jenis_kelamin' => 'L',
            'tempat_lahir' => 'Cianjur', 'tanggal_lahir' => '1978-02-14',
            'status_keluarga' => 'Kepala Keluarga', 'no_hp' => '083456789012',
            'pekerjaan' => 'Petani',
        ]);
        Warga::create([
            'keluarga_id' => $kk3->id, 'nik' => '3201011234560302',
            'nama' => 'Iriana Widodo', 'jenis_kelamin' => 'P',
            'tempat_lahir' => 'Bogor', 'tanggal_lahir' => '1982-09-05',
            'status_keluarga' => 'Istri',
            'pekerjaan' => 'Ibu Rumah Tangga', 'keterangan_khusus' => 'Hamil',
        ]);
        Warga::create([
            'keluarga_id' => $kk3->id, 'nik' => '3201011234560303',
            'nama' => 'Mbah Surip', 'jenis_kelamin' => 'L',
            'tempat_lahir' => 'Cianjur', 'tanggal_lahir' => '1950-08-17',
            'status_keluarga' => 'Orang Tua',
            'pekerjaan' => 'Tidak Bekerja',
        ]);

        // === Keluarga 4: Sugeng Riyadi (keluarga miskin) ===
        $kk4 = Keluarga::create([
            'no_kk' => '3201011234560004',
            'alamat' => 'Gang Sempit RT 04',
            'rt_rw' => '004/002',
            'kelurahan' => 'Sukamaju',
            'kecamatan' => 'Cianjur',
        ]);

        Warga::create([
            'keluarga_id' => $kk4->id, 'nik' => '3201011234560401',
            'nama' => 'Sugeng Riyadi', 'jenis_kelamin' => 'L',
            'tempat_lahir' => 'Cianjur', 'tanggal_lahir' => '1975-05-20',
            'status_keluarga' => 'Kepala Keluarga', 'no_hp' => '084567890123',
            'pekerjaan' => 'Buruh Harian', 'keterangan_khusus' => 'Disabilitas',
        ]);
        Warga::create([
            'keluarga_id' => $kk4->id, 'nik' => '3201011234560402',
            'nama' => 'Yuli Astuti', 'jenis_kelamin' => 'P',
            'tempat_lahir' => 'Cianjur', 'tanggal_lahir' => '1980-12-10',
            'status_keluarga' => 'Istri',
            'pekerjaan' => 'Pembantu Rumah Tangga',
        ]);

        // === Keluarga 5: Nenek Minah (single, lansia) ===
        $kk5 = Keluarga::create([
            'no_kk' => '3201011234560005',
            'alamat' => 'Kampung Lama RT 05',
            'rt_rw' => '005/001',
            'kelurahan' => 'Sukamaju',
            'kecamatan' => 'Cianjur',
        ]);

        Warga::create([
            'keluarga_id' => $kk5->id, 'nik' => '3201011234560501',
            'nama' => 'Nenek Minah', 'jenis_kelamin' => 'P',
            'tempat_lahir' => 'Cianjur', 'tanggal_lahir' => '1948-03-08',
            'status_keluarga' => 'Kepala Keluarga', 'no_hp' => '085678901234',
            'pekerjaan' => 'Tidak Bekerja',
        ]);
    }
}
