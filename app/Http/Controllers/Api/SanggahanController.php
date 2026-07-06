<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sanggahan;
use Illuminate\Http\Request;

class SanggahanController extends Controller
{
    /**
     * List all sanggahans, with optional filters.
     */
    public function index(Request $request)
    {
        $query = Sanggahan::with(['jenisBantuan', 'wargaDilaporkan', 'verifikator']);

        if ($request->has('bantuan_id')) {
            $query->where('bantuan_id', $request->bantuan_id);
        }
        if ($request->has('periode')) {
            $query->where('periode', $request->periode);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Submit sanggahan from public portal.
     * Backward compatible with old pengaduan form.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_pelapor' => 'required|string|max:255',
            'nik_pelapor' => 'required|string|size:16',
            'pesan' => 'required|string',
            'jenis_bantuan_id' => 'required|exists:jenis_bantuans,id',
            'bukti' => 'nullable|file|image|max:5120',
            'nama_warga_dilaporkan' => 'nullable|string|max:255',
        ]);

        $data = [
            'warga_pelapor' => $request->nama_pelapor,
            'nik_pelapor' => $request->nik_pelapor,
            'no_hp_pelapor' => $request->no_hp_pelapor,
            'bantuan_id' => $request->jenis_bantuan_id,
            'periode' => $request->periode ?? date('Y-m'),
            'isi_sanggahan' => $request->pesan,
            'nama_warga_dilaporkan' => $request->nama_warga_dilaporkan,
            'status' => 'baru',
            'tanggal_lapor' => now(),
        ];

        // Try to match warga_dilaporkan by name if provided
        if ($request->nama_warga_dilaporkan) {
            $warga = \App\Models\Masyarakat::where('nama', 'like', '%' . $request->nama_warga_dilaporkan . '%')
                ->where('jenis_bantuan_id', $request->jenis_bantuan_id)
                ->first();
            if ($warga) {
                $data['warga_dilaporkan_id'] = $warga->id;
            }
        }

        if ($request->hasFile('bukti')) {
            $path = $request->file('bukti')->store('sanggahan', 'public');
            $data['bukti'] = $path;
        }

        $sanggahan = Sanggahan::create($data);

        return response()->json([
            'message' => 'Sanggahan berhasil dikirim',
            'data' => $sanggahan
        ], 201);
    }

    /**
     * Admin verifies a sanggahan.
     */
    public function verify(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:diverifikasi_valid,ditolak,perlu_cek_lapangan',
            'catatan_admin' => 'nullable|string',
        ]);

        $sanggahan = Sanggahan::findOrFail($id);
        $sanggahan->update([
            'status' => $request->status,
            'catatan_admin' => $request->catatan_admin,
            'tanggal_verifikasi' => now(),
            'diverifikasi_oleh' => $request->user_id ?? auth()->id(),
        ]);

        return response()->json([
            'message' => 'Status sanggahan berhasil diperbarui',
            'data' => $sanggahan->load(['jenisBantuan', 'wargaDilaporkan', 'verifikator'])
        ]);
    }

    /**
     * Get verified sanggahans for warga in SAW results (used by Kades).
     */
    public function getByHasilSAW(Request $request)
    {
        $bantuanId = $request->query('bantuan_id');
        $periode = $request->query('periode');

        if (!$bantuanId || !$periode) {
            return response()->json([]);
        }

        // Get warga IDs from hasil SAW for this bantuan+periode
        $wargaIds = \App\Models\HasilSAW::where('jenis_bantuan_id', $bantuanId)
            ->where('periode', $periode)
            ->pluck('masyarakat_id')
            ->toArray();

        // Get verified sanggahans for these warga
        $sanggahans = Sanggahan::with(['jenisBantuan', 'wargaDilaporkan', 'verifikator'])
            ->where('bantuan_id', $bantuanId)
            ->whereIn('status', ['diverifikasi_valid', 'ditolak', 'perlu_cek_lapangan'])
            ->where(function ($q) use ($wargaIds) {
                $q->whereIn('warga_dilaporkan_id', $wargaIds)
                  ->orWhereNull('warga_dilaporkan_id');
            })
            ->orderBy('tanggal_verifikasi', 'desc')
            ->get();

        return response()->json($sanggahans);
    }

    public function destroy($id)
    {
        $sanggahan = Sanggahan::findOrFail($id);
        $sanggahan->delete();

        return response()->json(['message' => 'Sanggahan berhasil dihapus']);
    }
}
