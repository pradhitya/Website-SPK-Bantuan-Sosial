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
}
