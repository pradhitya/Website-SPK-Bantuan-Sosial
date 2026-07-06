<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Masyarakat;
use Illuminate\Http\Request;

class MasyarakatController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nik' => 'required|string|size:16',
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'rtRw' => 'nullable|string',
            'noHp' => 'nullable|string',
            'periode' => 'required|string',
            'jenis_bantuan_id' => 'required|exists:jenis_bantuans,id',
            'tglDaftar' => 'nullable|date',
            'warga_id' => 'nullable|exists:wargas,id',
            'keluarga_id' => 'nullable|exists:keluargas,id'
        ]);

        $masyarakat = Masyarakat::create($validated);
        return response()->json($masyarakat);
    }

    public function update(Request $request, $id)
    {
        $masyarakat = Masyarakat::findOrFail($id);
        $validated = $request->validate([
            'nik' => 'sometimes|string|size:16',
            'nama' => 'sometimes|string|max:255',
            'alamat' => 'nullable|string',
            'rtRw' => 'nullable|string',
            'noHp' => 'nullable|string',
            'periode' => 'sometimes|string',
            'jenis_bantuan_id' => 'sometimes|exists:jenis_bantuans,id',
            'tglDaftar' => 'nullable|date',
            'warga_id' => 'nullable|exists:wargas,id',
            'keluarga_id' => 'nullable|exists:keluargas,id'
        ]);

        $masyarakat->update($validated);
        return response()->json($masyarakat);
    }

    public function destroy($id)
    {
        $masyarakat = Masyarakat::findOrFail($id);
        // Check if this masyarakat has SAW results (will be cascade deleted)
        $hadSawResults = \App\Models\HasilSAW::where('masyarakat_id', $id)->exists();
        $jenisBantuanId = $masyarakat->jenis_bantuan_id;
        $periode = $masyarakat->periode;
        $masyarakat->delete();
        return response()->json([
            'message' => 'Deleted successfully',
            'had_saw_results' => $hadSawResults,
            'jenis_bantuan_id' => $jenisBantuanId,
            'periode' => $periode,
        ]);
    }

    public function destroyBulk(Request $request)
    {
        $ids = $request->input('ids', []);
        // Check if any of these masyarakat have SAW results
        $hadSawResults = \App\Models\HasilSAW::whereIn('masyarakat_id', $ids)->exists();
        // Get affected jenis_bantuan_id and periode for state cleanup
        $affected = Masyarakat::whereIn('id', $ids)->select('jenis_bantuan_id', 'periode')->distinct()->get();
        Masyarakat::whereIn('id', $ids)->delete();
        return response()->json([
            'message' => 'Deleted successfully',
            'had_saw_results' => $hadSawResults,
            'affected' => $affected,
        ]);
    }

    public function storeBulk(Request $request)
    {
        $data = $request->input('data', []);
        $created = [];
        foreach ($data as $item) {
            // Check if already exists in the same period
            $exists = Masyarakat::where('nik', $item['nik'])
                                ->where('periode', $item['periode'])
                                ->exists();
            if (!$exists) {
                $created[] = Masyarakat::create($item);
            }
        }
        return response()->json($created);
    }
}
