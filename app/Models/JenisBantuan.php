<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisBantuan extends Model
{
    protected $fillable = ['nama_program', 'deskripsi', 'target_penerima', 'filter_target', 'periode_evaluasi'];

    public function kriterias()
    {
        return $this->hasMany(Kriteria::class);
    }

    public function masyarakats()
    {
        return $this->hasMany(Masyarakat::class);
    }

    public function sanggahans()
    {
        return $this->hasMany(Sanggahan::class, 'bantuan_id');
    }
}
