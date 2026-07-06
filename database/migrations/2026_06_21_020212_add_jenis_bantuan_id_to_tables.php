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
        Schema::table('kriterias', function (Blueprint $table) {
            $table->foreignId('jenis_bantuan_id')->nullable()->constrained('jenis_bantuans')->onDelete('cascade');
        });
        Schema::table('masyarakats', function (Blueprint $table) {
            $table->foreignId('jenis_bantuan_id')->nullable()->constrained('jenis_bantuans')->onDelete('cascade');
        });
        Schema::table('hasil_s_a_w_s', function (Blueprint $table) {
            $table->foreignId('jenis_bantuan_id')->nullable()->constrained('jenis_bantuans')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kriterias', function (Blueprint $table) {
            $table->dropForeign(['jenis_bantuan_id']);
            $table->dropColumn('jenis_bantuan_id');
        });
        Schema::table('masyarakats', function (Blueprint $table) {
            $table->dropForeign(['jenis_bantuan_id']);
            $table->dropColumn('jenis_bantuan_id');
        });
        Schema::table('hasil_s_a_w_s', function (Blueprint $table) {
            $table->dropForeign(['jenis_bantuan_id']);
            $table->dropColumn('jenis_bantuan_id');
        });
    }
};
