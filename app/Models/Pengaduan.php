<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengaduan extends Model
{
    protected $fillable = [
        'nama_pelapor',
        'nik_pelapor',
        'no_hp_pelapor',
        'pesan',
        'status',
        'jenis_bantuan_id',
        'bukti',
    ];

    public function jenisBantuan()
    {
        return $this->belongsTo(JenisBantuan::class);
    }
}
