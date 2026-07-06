<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jenis_bantuans', function (Blueprint $table) {
            $table->text('filter_target')->nullable()->after('deskripsi');
            $table->enum('periode_evaluasi', ['bulanan', 'tahunan', 'sekali'])->default('bulanan')->after('filter_target');
        });
    }

    public function down(): void
    {
        Schema::table('jenis_bantuans', function (Blueprint $table) {
            $table->dropColumn(['filter_target', 'periode_evaluasi']);
        });
    }
};
