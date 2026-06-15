<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubKriteria;
use Illuminate\Http\Request;

class SubKriteriaController extends Controller
{
    public function store(Request $request)
    {
        $subKriteria = SubKriteria::create([
            'kriteria_id' => $request->kriteriaId,
            'nama' => $request->nama,
            'nilai' => $request->nilai,
        ]);
        return response()->json([
            'id' => $subKriteria->id,
            'kriteriaId' => $subKriteria->kriteria_id,
            'nama' => $subKriteria->nama,
            'nilai' => $subKriteria->nilai,
        ]);
    }

    public function update(Request $request, $id)
    {
        $subKriteria = SubKriteria::findOrFail($id);
        $subKriteria->update([
            'kriteria_id' => $request->kriteriaId ?? $subKriteria->kriteria_id,
            'nama' => $request->nama ?? $subKriteria->nama,
            'nilai' => $request->nilai ?? $subKriteria->nilai,
        ]);
        return response()->json([
            'id' => $subKriteria->id,
            'kriteriaId' => $subKriteria->kriteria_id,
            'nama' => $subKriteria->nama,
            'nilai' => $subKriteria->nilai,
        ]);
    }

    public function destroy($id)
    {
        SubKriteria::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
