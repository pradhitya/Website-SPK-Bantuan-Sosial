<?php

namespace App\Imports;

use App\Models\Masyarakat;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Carbon\Carbon;

class MasyarakatImport implements ToModel, WithHeadingRow
{
    protected $periode;

    public function __construct($periode)
    {
        $this->periode = $periode;
    }

    public function model(array $row)
    {
        // Pastikan NIK ada, jika tidak, lewati baris ini
        if (!isset($row['nik']) || empty($row['nik'])) {
            return null;
        }

        return new Masyarakat([
            'nik' => $row['nik'],
            'nama' => $row['nama'] ?? '-',
            'alamat' => $row['alamat'] ?? '-',
            'no_hp' => $row['no_hp'] ?? '-',
            'rt_rw' => $row['rt_rw'] ?? '-',
            'tglDaftar' => Carbon::now()->format('Y-m-d'),
            'periode' => $this->periode,
        ]);
    }
}
