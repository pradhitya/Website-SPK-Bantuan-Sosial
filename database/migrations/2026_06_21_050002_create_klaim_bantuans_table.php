<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('klaim_bantuans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hasil_saw_id')->constrained('hasil_s_a_w_s')->cascadeOnDelete();
            $table->string('kode_klaim')->unique();
            $table->string('qr_code_url');
            $table->enum('status_klaim', ['belum_diambil', 'sudah_diambil'])->default('belum_diambil');
            $table->timestamp('tanggal_kirim_wa')->nullable();
            $table->enum('status_kirim_wa', ['belum_dikirim', 'terkirim', 'gagal'])->default('belum_dikirim');
            $table->text('pesan_wa')->nullable();
            $table->timestamp('tanggal_diambil')->nullable();
            $table->foreignId('diverifikasi_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('klaim_bantuans');
    }
};
