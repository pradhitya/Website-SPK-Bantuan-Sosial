<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Keluarga;
use App\Models\Warga;
use Faker\Factory as Faker;
use Carbon\Carbon;

class KeluargaWargaSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // Tambahkan minimal 20 KK
        for ($i = 0; $i < 20; $i++) {
            // 1. Buat Data Keluarga (KK)
            $keluarga = Keluarga::create([
                'no_kk' => $faker->unique()->numerify('327101##########'), // 16 digit no KK
                'alamat' => $faker->streetAddress,
                'rt_rw' => '0' . rand(1, 9) . '/0' . rand(1, 9),
                'kelurahan' => $faker->citySuffix,
                'kecamatan' => $faker->city,
            ]);

            // 2. Buat Kepala Keluarga
            Warga::create([
                'keluarga_id' => $keluarga->id,
                'nik' => $faker->unique()->numerify('327101##########'), // 16 digit NIK
                'nama' => $faker->name('male'),
                'jenis_kelamin' => 'L',
                'tempat_lahir' => $faker->city,
                'tanggal_lahir' => $faker->dateTimeBetween('-60 years', '-30 years')->format('Y-m-d'),
                'status_keluarga' => 'Kepala Keluarga',
                'no_hp' => $faker->phoneNumber,
                'pekerjaan' => $faker->jobTitle,
                'keterangan_khusus' => rand(1, 10) == 1 ? 'Disabilitas' : null,
            ]);

            // 3. Buat Istri (Opsional, sekitar 80% kemungkinan punya istri)
            if (rand(1, 10) <= 8) {
                Warga::create([
                    'keluarga_id' => $keluarga->id,
                    'nik' => $faker->unique()->numerify('327101##########'),
                    'nama' => $faker->name('female'),
                    'jenis_kelamin' => 'P',
                    'tempat_lahir' => $faker->city,
                    'tanggal_lahir' => $faker->dateTimeBetween('-55 years', '-25 years')->format('Y-m-d'),
                    'status_keluarga' => 'Istri',
                    'no_hp' => $faker->phoneNumber,
                    'pekerjaan' => 'Mengurus Rumah Tangga',
                    'keterangan_khusus' => rand(1, 10) == 1 ? 'Hamil' : null,
                ]);
            }

            // 4. Buat Anak (Opsional, 0 hingga 3 anak)
            $jumlahAnak = rand(0, 3);
            for ($j = 0; $j < $jumlahAnak; $j++) {
                $jenisKelamin = rand(0, 1) ? 'L' : 'P';
                Warga::create([
                    'keluarga_id' => $keluarga->id,
                    'nik' => $faker->unique()->numerify('327101##########'),
                    'nama' => $faker->name($jenisKelamin == 'L' ? 'male' : 'female'),
                    'jenis_kelamin' => $jenisKelamin,
                    'tempat_lahir' => $faker->city,
                    'tanggal_lahir' => $faker->dateTimeBetween('-25 years', '-1 years')->format('Y-m-d'),
                    'status_keluarga' => 'Anak',
                    'no_hp' => null,
                    'pekerjaan' => 'Pelajar/Mahasiswa',
                    'keterangan_khusus' => null,
                ]);
            }
            
            // 5. Tambahan orang tua/lainnya (Opsional, jarang terjadi)
            if (rand(1, 10) == 1) {
                Warga::create([
                    'keluarga_id' => $keluarga->id,
                    'nik' => $faker->unique()->numerify('327101##########'),
                    'nama' => $faker->name(),
                    'jenis_kelamin' => rand(0, 1) ? 'L' : 'P',
                    'tempat_lahir' => $faker->city,
                    'tanggal_lahir' => $faker->dateTimeBetween('-80 years', '-60 years')->format('Y-m-d'),
                    'status_keluarga' => 'Orang Tua',
                    'no_hp' => null,
                    'pekerjaan' => 'Tidak Bekerja',
                    'keterangan_khusus' => 'Lansia',
                ]);
            }
        }
    }
}
