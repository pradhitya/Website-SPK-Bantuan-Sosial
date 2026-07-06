<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HasilSAW extends Model
{
    protected $guarded = [];

    public function masyarakat()
    {
        return $this->belongsTo(Masyarakat::class);
    }

    public function jenisBantuan()
    {
        return $this->belongsTo(JenisBantuan::class, 'jenis_bantuan_id');
    }

    public function klaimBantuan()
    {
        return $this->hasOne(KlaimBantuan::class, 'hasil_saw_id');
    }
}
