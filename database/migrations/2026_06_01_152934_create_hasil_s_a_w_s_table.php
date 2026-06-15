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
        Schema::create('hasil_s_a_w_s', function (Blueprint $table) {
            $table->id();
            $table->foreignId('masyarakat_id')->constrained('masyarakats')->cascadeOnDelete();
            $table->json('nilaiPerKriteria')->nullable();
            $table->json('normalisasi')->nullable();
            $table->decimal('nilaiAkhir', 8, 4);
            $table->integer('ranking');
            $table->enum('status', ['Layak', 'Tidak Layak']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hasil_s_a_w_s');
    }
};
