<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KlaimBantuan extends Model
{
    protected $fillable = [
        'hasil_saw_id',
        'kode_klaim',
        'qr_code_url',
        'status_klaim',
        'tanggal_kirim_wa',
        'status_kirim_wa',
        'pesan_wa',
        'tanggal_diambil',
        'diverifikasi_oleh',
    ];

    protected $casts = [
        'tanggal_kirim_wa' => 'datetime',
        'tanggal_diambil' => 'datetime',
    ];

    public function hasilSaw()
    {
        return $this->belongsTo(HasilSAW::class, 'hasil_saw_id');
    }

    public function verifikator()
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh');
    }
}
