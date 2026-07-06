<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Keluarga;
use Illuminate\Http\Request;

class KeluargaController extends Controller
{
    public function index(Request $request)
    {
        $query = Keluarga::with(['wargas', 'kepalaKeluarga']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_kk', 'like', "%$search%")
                  ->orWhere('alamat', 'like', "%$search%")
                  ->orWhereHas('wargas', function ($wq) use ($search) {
                      $wq->where('nama', 'like', "%$search%");
                  });
            });
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'no_kk' => 'required|string|size:16|unique:keluargas,no_kk',
            'alamat' => 'required|string|max:255',
            'wargas' => 'sometimes|array',
            'wargas.*.nik' => 'required|string|size:16|unique:wargas,nik',
            'wargas.*.nama' => 'required|string|max:255',
            'wargas.*.jenis_kelamin' => 'required|in:L,P',
            'wargas.*.status_keluarga' => 'required|string',
        ]);

        \DB::beginTransaction();
        try {
            $keluarga = Keluarga::create($request->except('wargas'));

            if ($request->has('wargas') && is_array($request->wargas)) {
                foreach ($request->wargas as $wargaData) {
                    $keluarga->wargas()->create($wargaData);
                }
            }
            \DB::commit();
        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'message' => 'Gagal menyimpan data keluarga beserta warganya.', 
                'error' => $e->getMessage()
            ], 500);
        }

        $keluarga->load(['wargas', 'kepalaKeluarga']);

        return response()->json($keluarga, 201);
    }

    public function show($id)
    {
        $keluarga = Keluarga::with(['wargas', 'kepalaKeluarga'])->findOrFail($id);
        return response()->json($keluarga);
    }

    public function update(Request $request, $id)
    {
        $keluarga = Keluarga::findOrFail($id);

        $request->validate([
            'no_kk' => 'sometimes|string|size:16|unique:keluargas,no_kk,' . $id,
            'alamat' => 'sometimes|string|max:255',
        ]);

        $keluarga->update($request->all());
        $keluarga->load(['wargas', 'kepalaKeluarga']);

        return response()->json($keluarga);
    }

    public function destroy($id)
    {
        Keluarga::findOrFail($id)->delete();
        return response()->json(['message' => 'Data keluarga berhasil dihapus.']);
    }
}
