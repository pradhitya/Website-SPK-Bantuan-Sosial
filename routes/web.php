<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

use App\Http\Controllers\DashboardController;

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

use App\Http\Controllers\Api\DataController;
use App\Http\Controllers\Api\MasyarakatController;
use App\Http\Controllers\Api\KriteriaController;
use App\Http\Controllers\Api\SubKriteriaController;
use App\Http\Controllers\Api\PenilaianController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SanggahanController;
use App\Http\Controllers\Api\KlaimBantuanController;
use App\Http\Controllers\Api\WargaController;
use App\Http\Controllers\Api\KeluargaController;

Route::prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    
    // Public routes (for residents reporting and public portal)
    Route::get('/init', [DataController::class, 'init']);
    Route::post('/sanggahan', [SanggahanController::class, 'store']);
    Route::post('/pengaduan', [SanggahanController::class, 'store']);

    // Protected API routes
    Route::middleware('auth')->group(function () {
        Route::post('/settings', [SettingController::class, 'update']);
        Route::post('/import-masyarakat', [DataController::class, 'importMasyarakat']);
        Route::get('/export-hasil-saw', [DataController::class, 'exportHasilSAW']);
        Route::get('/cetak-sk', [DataController::class, 'cetakSK']);
        Route::post('/masyarakat/bulk-delete', [MasyarakatController::class, 'destroyBulk']);
        Route::post('/masyarakat/bulk', [MasyarakatController::class, 'storeBulk']);
        Route::apiResource('masyarakat', MasyarakatController::class);
        Route::apiResource('users', UserController::class);
        Route::apiResource('kriteria', KriteriaController::class);
        Route::apiResource('sub-kriteria', SubKriteriaController::class);
        Route::post('/penilaian/save-all', [PenilaianController::class, 'saveAll']);
        Route::post('/penilaian/process-saw', [PenilaianController::class, 'processSaw']);
        Route::post('/penilaian/save-catatan', [PenilaianController::class, 'saveCatatan']);
        Route::post('/penilaian/reset-saw', [PenilaianController::class, 'resetSaw']);

        // Kades only routes
        Route::middleware('role:kades')->group(function () {
            Route::post('/penilaian/approve', [PenilaianController::class, 'approve']);
            Route::post('/penilaian/reset-approval', [PenilaianController::class, 'resetApproval']);
        });

        // Master Data Warga & Keluarga
        Route::apiResource('warga', WargaController::class);
        Route::post('/import-warga', [WargaController::class, 'importCsv']);
        Route::apiResource('keluarga', KeluargaController::class);

        // Sanggahan (replaces pengaduan)
        Route::get('/sanggahan', [SanggahanController::class, 'index']);
        Route::patch('/sanggahan/{id}/verify', [SanggahanController::class, 'verify']);
        Route::get('/sanggahan/by-hasil-saw', [SanggahanController::class, 'getByHasilSAW']);
        Route::delete('/sanggahan/{id}', [SanggahanController::class, 'destroy']);

        // Backward compatibility
        Route::get('/pengaduan', [SanggahanController::class, 'index']);

        // Klaim Bantuan (QR + WA)
        Route::get('/klaim-bantuan', [KlaimBantuanController::class, 'index']);
        Route::post('/klaim-bantuan/scan', [KlaimBantuanController::class, 'scanVerify']);
        Route::post('/klaim-bantuan/{id}/resend-wa', [KlaimBantuanController::class, 'resendWA']);
        Route::get('/klaim-bantuan/log-wa', [KlaimBantuanController::class, 'logWA']);
    });
});
