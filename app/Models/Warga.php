<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Warga extends Model
{
    use HasFactory;

    protected $fillable = [
        'keluarga_id',
        'nik',
        'nama',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'status_keluarga',
        'no_hp',
        'pekerjaan',
        'keterangan_khusus',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    protected $appends = ['usia'];

    /**
     * Keluarga (KK) dari warga ini.
     */
    public function keluarga()
    {
        return $this->belongsTo(Keluarga::class);
    }

    /**
     * Riwayat pengajuan bantuan warga ini.
     */
    public function masyarakats()
    {
        return $this->hasMany(Masyarakat::class);
    }

    /**
     * Accessor: Hitung usia otomatis dari tanggal_lahir.
     */
    public function getUsiaAttribute(): ?int
    {
        if (!$this->tanggal_lahir) return null;
        return Carbon::parse($this->tanggal_lahir)->age;
    }

    /**
     * Scope: Filter warga lansia (usia >= 60).
     */
    public function scopeLansia($query)
    {
        return $query->whereNotNull('tanggal_lahir')
            ->whereDate('tanggal_lahir', '<=', Carbon::now()->subYears(60));
    }

    /**
     * Scope: Filter warga ibu hamil.
     */
    public function scopeIbuHamil($query)
    {
        return $query->where('keterangan_khusus', 'like', '%hamil%');
    }

    /**
     * Scope: Filter warga disabilitas.
     */
    public function scopeDisabilitas($query)
    {
        return $query->where('keterangan_khusus', 'like', '%disabilitas%');
    }
}
