<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sanggahans', function (Blueprint $table) {
            $table->id();
            $table->string('warga_pelapor')->nullable();
            $table->string('nik_pelapor', 16)->nullable();
            $table->string('no_hp_pelapor')->nullable();
            $table->foreignId('warga_dilaporkan_id')->nullable()->constrained('masyarakats')->nullOnDelete();
            $table->string('nama_warga_dilaporkan')->nullable();
            $table->foreignId('bantuan_id')->nullable()->constrained('jenis_bantuans')->nullOnDelete();
            $table->string('periode')->nullable();
            $table->text('isi_sanggahan');
            $table->string('bukti')->nullable();
            $table->enum('status', ['baru', 'diverifikasi_valid', 'ditolak', 'perlu_cek_lapangan'])->default('baru');
            $table->text('catatan_admin')->nullable();
            $table->timestamp('tanggal_lapor')->useCurrent();
            $table->timestamp('tanggal_verifikasi')->nullable();
            $table->foreignId('diverifikasi_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sanggahans');
    }
};
