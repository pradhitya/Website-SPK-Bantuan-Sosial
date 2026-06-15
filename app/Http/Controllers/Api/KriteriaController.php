<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kriteria;
use Illuminate\Http\Request;

class KriteriaController extends Controller
{
    public function store(Request $request)
    {
        $kriteria = Kriteria::create($request->only('kode', 'nama', 'atribut', 'bobot'));
        return response()->json($kriteria);
    }

    public function update(Request $request, $id)
    {
        $kriteria = Kriteria::findOrFail($id);
        $kriteria->update($request->only('kode', 'nama', 'atribut', 'bobot'));
        return response()->json($kriteria);
    }

    public function destroy($id)
    {
        Kriteria::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
