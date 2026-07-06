<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penilaian;
use App\Models\HasilSAW;
use App\Models\KlaimBantuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PenilaianController extends Controller
{
    public function saveAll(Request $request)
    {
        $penilaians = $request->input('penilaian', []);
        $periode = $request->input('periode', date('Y-m'));
        $jenisBantuanId = $request->input('jenis_bantuan_id');
        
        $masyarakatQuery = \App\Models\Masyarakat::where('periode', $periode);
        if ($jenisBantuanId) {
            $masyarakatQuery->where('jenis_bantuan_id', $jenisBantuanId);
        }
        $masyarakatIds = $masyarakatQuery->pluck('id')->toArray();

        try {
            DB::beginTransaction();
            if (count($masyarakatIds) > 0) {
                Penilaian::whereIn('masyarakat_id', $masyarakatIds)->delete();
            }
            
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
            if (count($insertData) > 0) {
                Penilaian::insert($insertData);
            }
            
            DB::commit();
            return response()->json(['message' => 'Penilaian saved successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyimpan penilaian: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Process SAW per kategori bantuan.
     * Parameter: bantuan_id (jenis_bantuan_id), periode
     * - Filter warga by jenis_bantuan_id & periode
     * - Filter kriteria by jenis_bantuan_id
     * - Bobot dinormalisasi per kategori (total = 100%)
     * - Save hasil dengan status_approval = 'pending'
     */
    public function processSaw(Request $request)
    {
        $periode = $request->input('periode', date('Y-m'));
        $jenisBantuanId = $request->input('jenis_bantuan_id');
        
        $kuotaKey = 'kuota_bansos' . ($jenisBantuanId ? '_' . $jenisBantuanId : '');
        $kuotaBansos = (int) (\App\Models\Setting::where('key', $kuotaKey)->value('value') ?? 8);

        $masyarakatQuery = \App\Models\Masyarakat::where('periode', $periode);
        $kriteriaQuery = \App\Models\Kriteria::query();
        
        if ($jenisBantuanId) {
            $masyarakatQuery->where('jenis_bantuan_id', $jenisBantuanId);
            $kriteriaQuery->where('jenis_bantuan_id', $jenisBantuanId);
        }

        $masyarakat = $masyarakatQuery->get();
        $kriteria = $kriteriaQuery->get();
        $penilaian = Penilaian::whereIn('masyarakat_id', $masyarakat->pluck('id'))->get();

        // Normalize bobot so total = 100 for this category
        $totalBobot = $kriteria->sum('bobot');
        if ($totalBobot == 0) $totalBobot = 1;

        // Build decision matrix
        $matrix = [];
        foreach ($masyarakat as $m) {
            $matrix[$m->id] = [];
            foreach ($kriteria as $k) {
                $p = $penilaian->where('masyarakat_id', $m->id)->where('kriteria_id', $k->id)->first();
                $matrix[$m->id][$k->id] = $p ? $p->nilai : 0;
            }
        }

        // Normalize matrix
        $normalized = [];
        foreach ($kriteria as $k) {
            $vals = [];
            foreach ($masyarakat as $m) {
                $v = $matrix[$m->id][$k->id];
                if ($v > 0) $vals[] = $v;
            }
            $maxVal = count($vals) ? max($vals) : 1;
            $minVal = count($vals) ? min($vals) : 1;

            if ($maxVal == 0) $maxVal = 1;

            foreach ($masyarakat as $m) {
                $xij = $matrix[$m->id][$k->id];
                if ($xij == 0) {
                    if ($k->atribut === 'Benefit') {
                        $normalized[$m->id][$k->id] = 0;
                    } else {
                        // For Cost, 0 is the best possible value (lowest cost).
                        // Normalization: min / xij. To avoid division by zero, we assign the max score (1.0)
                        $normalized[$m->id][$k->id] = 1.0;
                    }
                } else if ($k->atribut === 'Benefit') {
                    $normalized[$m->id][$k->id] = round($xij / $maxVal, 4);
                } else {
                    $normalized[$m->id][$k->id] = round($minVal / $xij, 4);
                }
            }
        }

        // Calculate final scores with normalized weights
        $results = [];
        foreach ($masyarakat as $m) {
            $nilaiAkhir = 0;
            foreach ($kriteria as $k) {
                $bobotNormalized = $k->bobot / $totalBobot;
                $nilaiAkhir += $bobotNormalized * ($normalized[$m->id][$k->id] ?? 0);
            }
            $results[] = [
                'masyarakat_id' => $m->id,
                'periode' => $periode,
                'nilaiPerKriteria' => $matrix[$m->id],
                'normalisasi' => $normalized[$m->id],
                'nilaiAkhir' => round($nilaiAkhir, 4),
            ];
        }

        usort($results, function($a, $b) {
            return $b['nilaiAkhir'] <=> $a['nilaiAkhir'];
        });

        try {
            DB::beginTransaction();
            // Delete previous results for this bantuan+periode
            $hasilSawQuery = HasilSAW::where('periode', $periode);
            if ($jenisBantuanId) {
                $hasilSawQuery->where('jenis_bantuan_id', $jenisBantuanId);
            }
            $hasilSawQuery->delete();

            // Insert new results
            $insertData = [];
            foreach ($results as $index => $r) {
                $ranking = $index + 1;
                $status = $ranking <= $kuotaBansos ? 'Layak' : 'Tidak Layak';
                
                $insertData[] = [
                    'masyarakat_id' => $r['masyarakat_id'],
                    'periode' => $r['periode'],
                    'jenis_bantuan_id' => $jenisBantuanId,
                    'nilaiPerKriteria' => json_encode($r['nilaiPerKriteria']),
                    'normalisasi' => json_encode($r['normalisasi']),
                    'nilaiAkhir' => $r['nilaiAkhir'],
                    'ranking' => $ranking,
                    'status' => $status,
                    'status_approval' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (count($insertData) > 0) {
                HasilSAW::insert($insertData);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memproses SAW: ' . $e->getMessage()], 500);
        }

        // Return fresh results
        $hasilSawQuery = HasilSAW::with('masyarakat')->where('periode', $periode);
        if ($jenisBantuanId) {
            $hasilSawQuery->where('jenis_bantuan_id', $jenisBantuanId);
        }
        $hasilSAWs = $hasilSawQuery->orderBy('ranking')->get()->map(function($item) {
            return $this->mapHasilSAW($item);
        });

        return response()->json(['message' => 'SAW processed successfully', 'hasilSAW' => $hasilSAWs]);
    }

    public function saveCatatan(Request $request)
    {
        $request->validate([
            'masyarakatId' => 'required',
            'periode' => 'required',
            'catatan' => 'nullable|string'
        ]);

        $query = HasilSAW::where('masyarakat_id', $request->masyarakatId)
                ->where('periode', $request->periode);
        
        if ($request->has('jenis_bantuan_id')) {
            $query->where('jenis_bantuan_id', $request->jenis_bantuan_id);
        }
        
        $query->update(['catatan' => $request->catatan]);

        return response()->json(['message' => 'Catatan saved successfully']);
    }

    /**
     * Kades approve/reject SAW results.
     * - approvedIds[] → status_approval = 'disetujui'
     * - Not in list → status_approval = 'ditolak'
     * - Trigger auto: generate kode_klaim + QR + send WA for each approved
     */
    public function approve(Request $request)
    {
        $periode = $request->input('periode', date('Y-m'));
        $jenisBantuanId = $request->input('jenis_bantuan_id');
        $approvedIds = $request->input('approvedIds', []);

        // Get all hasil SAW for this bantuan+periode
        $query = HasilSAW::with(['masyarakat', 'jenisBantuan'])
            ->where('periode', $periode);
        if ($jenisBantuanId) {
            $query->where('jenis_bantuan_id', $jenisBantuanId);
        }
        $allHasil = $query->get();

        try {
            DB::beginTransaction();

            $klaimResults = [];

            foreach ($allHasil as $hasil) {
                if (in_array($hasil->masyarakat_id, $approvedIds)) {
                    $hasil->update(['status_approval' => 'disetujui']);
                    
                    // Check if klaim already exists for this hasil
                    $existingKlaim = KlaimBantuan::where('hasil_saw_id', $hasil->id)->first();
                    if (!$existingKlaim) {
                        // Generate kode klaim + QR + send WA
                        $klaim = \App\Http\Controllers\Api\KlaimBantuanController::createKlaimAndSendWA($hasil);
                        $klaimResults[] = [
                            'masyarakat_id' => $hasil->masyarakat_id,
                            'nama' => $hasil->masyarakat->nama ?? '-',
                            'kode_klaim' => $klaim->kode_klaim,
                            'status_kirim_wa' => $klaim->status_kirim_wa,
                        ];
                    }
                } else {
                    $hasil->update(['status_approval' => 'ditolak']);
                }
            }

            // Also save to settings for backward compatibility
            $approvalKey = "approved_ids_$periode" . ($jenisBantuanId ? "_$jenisBantuanId" : "");
            \App\Models\Setting::updateOrCreate(
                ['key' => $approvalKey],
                ['value' => json_encode($approvedIds)]
            );

            DB::commit();

            return response()->json([
                'message' => 'Approval saved successfully',
                'klaim_results' => $klaimResults,
                'total_approved' => count($approvedIds),
                'total_rejected' => $allHasil->count() - count($approvedIds),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyimpan pengesahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reset/batalkan hasil perhitungan SAW untuk bantuan+periode tertentu.
     * Menghapus: hasil_s_a_w_s, klaim_bantuans (cascade), dan approved_ids settings.
     */
    public function resetSaw(Request $request)
    {
        $periode = $request->input('periode', date('Y-m'));
        $jenisBantuanId = $request->input('jenis_bantuan_id');

        try {
            DB::beginTransaction();
            // Delete HasilSAW (klaim_bantuans will cascade delete)
            $query = HasilSAW::where('periode', $periode);
            if ($jenisBantuanId) {
                $query->where('jenis_bantuan_id', $jenisBantuanId);
            }
            $deletedCount = $query->delete();

            // Delete related approved_ids settings
            $approvalKey = "approved_ids_{$periode}" . ($jenisBantuanId ? "_{$jenisBantuanId}" : "");
            \App\Models\Setting::where('key', $approvalKey)->delete();

            DB::commit();
            return response()->json([
                'message' => 'Perhitungan SAW berhasil dibatalkan',
                'deleted_count' => $deletedCount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membatalkan perhitungan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reset/batalkan approval kades untuk bantuan+periode tertentu.
     * Mengembalikan status_approval ke 'pending' dan menghapus klaim bantuan terkait.
     */
    public function resetApproval(Request $request)
    {
        $periode = $request->input('periode', date('Y-m'));
        $jenisBantuanId = $request->input('jenis_bantuan_id');

        try {
            DB::beginTransaction();
            // Get all hasil SAW for this bantuan+periode
            $query = HasilSAW::where('periode', $periode);
            if ($jenisBantuanId) {
                $query->where('jenis_bantuan_id', $jenisBantuanId);
            }
            $hasilIds = $query->pluck('id')->toArray();

            // Delete related klaim bantuan
            if (count($hasilIds) > 0) {
                KlaimBantuan::whereIn('hasil_saw_id', $hasilIds)->delete();
            }

            // Reset all status_approval to 'pending'
            $query2 = HasilSAW::where('periode', $periode);
            if ($jenisBantuanId) {
                $query2->where('jenis_bantuan_id', $jenisBantuanId);
            }
            $query2->update(['status_approval' => 'pending']);

            // Delete related approved_ids settings
            $approvalKey = "approved_ids_{$periode}" . ($jenisBantuanId ? "_{$jenisBantuanId}" : "");
            \App\Models\Setting::where('key', $approvalKey)->delete();

            DB::commit();
            return response()->json([
                'message' => 'Pengesahan berhasil dibatalkan, status dikembalikan ke pending',
                'reset_count' => count($hasilIds),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membatalkan pengesahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Map a HasilSAW eloquent model to API response format.
     */
    private function mapHasilSAW($item): array
    {
        return [
            'id' => $item->id,
            'masyarakatId' => $item->masyarakat_id,
            'periode' => $item->periode,
            'jenis_bantuan_id' => $item->jenis_bantuan_id,
            'namaMasyarakat' => $item->masyarakat->nama ?? '',
            'alamat' => $item->masyarakat->alamat ?? '',
            'noHp' => $item->masyarakat->noHp ?? '',
            'nilaiAkhir' => (float) $item->nilaiAkhir,
            'ranking' => $item->ranking,
            'status' => $item->status,
            'status_approval' => $item->status_approval ?? 'pending',
            'catatan' => $item->catatan,
            'nilaiPerKriteria' => is_string($item->nilaiPerKriteria) ? json_decode($item->nilaiPerKriteria, true) : $item->nilaiPerKriteria,
            'normalisasi' => is_string($item->normalisasi) ? json_decode($item->normalisasi, true) : $item->normalisasi,
        ];
    }
}
