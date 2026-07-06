<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sanggahan extends Model
{
    protected $fillable = [
        'warga_pelapor',
        'nik_pelapor',
        'no_hp_pelapor',
        'warga_dilaporkan_id',
        'nama_warga_dilaporkan',
        'bantuan_id',
        'periode',
        'isi_sanggahan',
        'bukti',
        'status',
        'catatan_admin',
        'tanggal_lapor',
        'tanggal_verifikasi',
        'diverifikasi_oleh',
    ];

    protected $casts = [
        'tanggal_lapor' => 'datetime',
        'tanggal_verifikasi' => 'datetime',
    ];

    public function wargaDilaporkan()
    {
        return $this->belongsTo(Masyarakat::class, 'warga_dilaporkan_id');
    }

    public function jenisBantuan()
    {
        return $this->belongsTo(JenisBantuan::class, 'bantuan_id');
    }

    public function verifikator()
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh');
    }
}
