<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Masyarakat extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function sanggahans()
    {
        return $this->hasMany(Sanggahan::class, 'warga_dilaporkan_id');
    }

    public function jenisBantuan()
    {
        return $this->belongsTo(JenisBantuan::class);
    }

    /**
     * Relasi ke master data warga (individu).
     */
    public function warga()
    {
        return $this->belongsTo(Warga::class);
    }

    /**
     * Relasi ke master data keluarga (KK).
     */
    public function keluarga()
    {
        return $this->belongsTo(Keluarga::class);
    }
}
