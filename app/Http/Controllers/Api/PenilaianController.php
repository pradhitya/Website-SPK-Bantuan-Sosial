<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penilaian;
use App\Models\HasilSAW;
use Illuminate\Http\Request;

class PenilaianController extends Controller
{
    public function saveAll(Request $request)
    {
        $penilaians = $request->input('penilaian', []);
        
        Penilaian::query()->delete();
        
        $insertData = [];
        foreach($penilaians as $p) {
            $insertData[] = [
                'masyarakat_id' => $p['masyarakatId'],
                'kriteria_id' => $p['kriteriaId'],
                'sub_kriteria_id' => $p['subKriteriaId'],
                'nilai' => $p['nilai'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        Penilaian::insert($insertData);
        
        return response()->json(['message' => 'Penilaian saved successfully']);
    }

    public function saveHasilSaw(Request $request)
    {
        $hasilSAW = $request->input('hasilSAW', []);
        $periode = $request->input('periode', date('Y-m'));
        
        HasilSAW::where('periode', $periode)->delete();
        
        $insertData = [];
        foreach($hasilSAW as $h) {
            $insertData[] = [
                'masyarakat_id' => $h['masyarakatId'],
                'periode' => $periode,
                'nilaiPerKriteria' => json_encode($h['nilaiPerKriteria']),
                'normalisasi' => json_encode($h['normalisasi']),
                'nilaiAkhir' => $h['nilaiAkhir'],
                'ranking' => $h['ranking'],
                'status' => $h['status'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        HasilSAW::insert($insertData);
        
        return response()->json(['message' => 'Hasil SAW saved successfully']);
    }

    public function saveCatatan(Request $request)
    {
        $request->validate([
            'masyarakatId' => 'required',
            'periode' => 'required',
            'catatan' => 'nullable|string'
        ]);

        HasilSAW::where('masyarakat_id', $request->masyarakatId)
                ->where('periode', $request->periode)
                ->update(['catatan' => $request->catatan]);

        return response()->json(['message' => 'Catatan saved successfully']);
    }

    public function approve(Request $request)
    {
        $periode = $request->input('periode', date('Y-m'));
        $approvedIds = $request->input('approvedIds', []);

        \App\Models\Setting::updateOrCreate(
            ['key' => "approved_ids_$periode"],
            ['value' => json_encode($approvedIds)]
        );

        return response()->json(['message' => 'Approval saved successfully']);
    }
}
