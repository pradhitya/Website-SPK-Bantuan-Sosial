<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'kuotaBansos' => 'required|integer|min:1',
        ]);

        Setting::updateOrCreate(
            ['key' => 'kuota_bansos'],
            ['value' => $validated['kuotaBansos']]
        );

        return response()->json([
            'message' => 'Pengaturan berhasil disimpan.',
            'kuotaBansos' => $validated['kuotaBansos']
        ]);
    }
}
