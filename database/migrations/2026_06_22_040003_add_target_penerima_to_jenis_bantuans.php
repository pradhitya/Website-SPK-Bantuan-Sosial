<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jenis_bantuans', function (Blueprint $table) {
            $table->enum('target_penerima', ['keluarga', 'individu'])->default('individu')->after('deskripsi');
        });
    }

    public function down(): void
    {
        Schema::table('jenis_bantuans', function (Blueprint $table) {
            $table->dropColumn('target_penerima');
        });
    }
};
