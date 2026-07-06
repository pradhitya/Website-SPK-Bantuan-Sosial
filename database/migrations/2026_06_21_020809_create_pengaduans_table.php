<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pengaduans', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pelapor');
            $table->string('nik_pelapor', 16);
            $table->string('no_hp_pelapor')->nullable();
            $table->text('pesan');
            $table->string('status')->default('pending'); // pending, diproses, selesai, ditolak
            $table->foreignId('jenis_bantuan_id')->nullable()->constrained('jenis_bantuans')->nullOnDelete();
            $table->string('bukti')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaduans');
    }
};
