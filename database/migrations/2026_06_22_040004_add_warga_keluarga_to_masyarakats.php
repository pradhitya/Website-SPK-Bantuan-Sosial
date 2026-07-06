<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('masyarakats', function (Blueprint $table) {
            $table->foreignId('warga_id')->nullable()->after('id')->constrained('wargas')->nullOnDelete();
            $table->foreignId('keluarga_id')->nullable()->after('warga_id')->constrained('keluargas')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('masyarakats', function (Blueprint $table) {
            $table->dropForeign(['warga_id']);
            $table->dropColumn('warga_id');
            $table->dropForeign(['keluarga_id']);
            $table->dropColumn('keluarga_id');
        });
    }
};
