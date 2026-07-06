<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubKriteria extends Model
{
    protected $guarded = [];

    public function kriteria()
    {
        return $this->belongsTo(Kriteria::class);
    }
}
