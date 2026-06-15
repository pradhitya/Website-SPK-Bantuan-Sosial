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

Route::prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/settings', [SettingController::class, 'update']);
    Route::get('/init', [DataController::class, 'init']);
    Route::post('/import-masyarakat', [DataController::class, 'importMasyarakat']);
    Route::get('/export-hasil-saw', [DataController::class, 'exportHasilSAW']);
    Route::get('/cetak-sk', [DataController::class, 'cetakSK']);
    Route::post('/masyarakat/bulk-delete', [MasyarakatController::class, 'destroyBulk']);
    Route::apiResource('masyarakat', MasyarakatController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('kriteria', KriteriaController::class);
    Route::apiResource('sub-kriteria', SubKriteriaController::class);
    Route::post('/penilaian/save-all', [PenilaianController::class, 'saveAll']);
    Route::post('/penilaian/save-hasil-saw', [PenilaianController::class, 'saveHasilSaw']);
    Route::post('/penilaian/save-catatan', [PenilaianController::class, 'saveCatatan']);
    Route::post('/penilaian/approve', [PenilaianController::class, 'approve']);
});
