<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Keluarga extends Model
{
    use HasFactory;

    protected $fillable = [
        'no_kk',
        'alamat',
        'rt_rw',
        'kelurahan',
        'kecamatan',
    ];

    /**
     * Semua anggota keluarga dalam KK ini.
     */
    public function wargas()
    {
        return $this->hasMany(Warga::class);
    }

    /**
     * Kepala Keluarga dari KK ini.
     */
    public function kepalaKeluarga()
    {
        return $this->hasOne(Warga::class)->where('status_keluarga', 'Kepala Keluarga');
    }

    /**
     * Semua pengajuan bantuan yang terkait KK ini.
     */
    public function masyarakats()
    {
        return $this->hasMany(Masyarakat::class);
    }
}
