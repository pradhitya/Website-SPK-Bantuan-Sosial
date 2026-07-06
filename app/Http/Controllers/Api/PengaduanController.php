<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use Illuminate\Http\Request;

class PengaduanController extends Controller
{
    public function index(Request $request)
    {
        $query = Pengaduan::with('jenisBantuan');

        if ($request->has('jenis_bantuan_id')) {
            $query->where('jenis_bantuan_id', $request->jenis_bantuan_id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_pelapor' => 'required|string|max:255',
            'nik_pelapor' => 'required|string|size:16',
            'pesan' => 'required|string',
            'jenis_bantuan_id' => 'required|exists:jenis_bantuans,id',
            'bukti' => 'nullable|file|image|max:5120'
        ]);

        $data = $request->except('bukti');
        $data['status'] = 'pending';

        if ($request->hasFile('bukti')) {
            $path = $request->file('bukti')->store('pengaduan', 'public');
            $data['bukti'] = $path;
        }

        $pengaduan = Pengaduan::create($data);

        return response()->json([
            'message' => 'Pengaduan berhasil dikirim',
            'data' => $pengaduan
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,diproses,selesai,ditolak'
        ]);

        $pengaduan = Pengaduan::findOrFail($id);
        $pengaduan->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status pengaduan berhasil diperbarui',
            'data' => $pengaduan
        ]);
    }

    public function destroy($id)
    {
        $pengaduan = Pengaduan::findOrFail($id);
        $pengaduan->delete();

        return response()->json(['message' => 'Pengaduan berhasil dihapus']);
    }
}
