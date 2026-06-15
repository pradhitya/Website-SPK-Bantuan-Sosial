<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kriteria;
use App\Models\SubKriteria;
use App\Models\Masyarakat;
use App\Models\Penilaian;
use App\Models\HasilSAW;
use App\Models\Setting;

class DataController extends Controller
{
    public function init()
    {
        $kriterias = Kriteria::all();
        $subKriterias = SubKriteria::all()->map(function($item) {
            return [
                'id' => $item->id,
                'kriteriaId' => $item->kriteria_id,
                'nama' => $item->nama,
                'nilai' => $item->nilai,
            ];
        });
        
        $masyarakats = Masyarakat::all()->map(function($m) {
            return [
                'id' => $m->id,
                'nama' => $m->nama,
                'nik' => $m->nik,
                'alamat' => $m->alamat,
                'rtRw' => $m->rtRw,
                'noHp' => $m->noHp,
                'tglDaftar' => $m->created_at->format('Y-m-d'),
                'periode' => $m->periode,
            ];
        });
        
        $penilaians = Penilaian::all()->map(function($item) {
            return [
                'masyarakatId' => $item->masyarakat_id,
                'kriteriaId' => $item->kriteria_id,
                'subKriteriaId' => $item->sub_kriteria_id,
                'nilai' => $item->nilai,
            ];
        });

        $hasilSAWs = HasilSAW::with('masyarakat')->get()->map(function($item) {
            return [
                'masyarakatId' => $item->masyarakat_id,
                'periode' => $item->periode,
                'namaMasyarakat' => $item->masyarakat->nama ?? '',
                'alamat' => $item->masyarakat->alamat ?? '',
                'nilaiAkhir' => (float) $item->nilaiAkhir,
                'ranking' => $item->ranking,
                'status' => $item->status,
                'catatan' => $item->catatan,
                'nilaiPerKriteria' => is_string($item->nilaiPerKriteria) ? json_decode($item->nilaiPerKriteria, true) : $item->nilaiPerKriteria,
                'normalisasi' => is_string($item->normalisasi) ? json_decode($item->normalisasi, true) : $item->normalisasi,
            ];
        });
        
        $approvedSettings = Setting::where('key', 'like', 'approved_ids_%')->get();
        $approvedIds = []; // Expected format: ['2026-06' => [1, 2, ...], ...]
        foreach ($approvedSettings as $setting) {
            $ids = json_decode($setting->value, true);
            $periode = str_replace('approved_ids_', '', $setting->key);
            if (is_array($ids)) {
                $approvedIds[$periode] = $ids;
            }
        }

        return response()->json([
            'kriteria' => $kriterias,
            'subKriteria' => $subKriterias,
            'masyarakat' => $masyarakats,
            'penilaian' => $penilaians,
            'hasilSAW' => $hasilSAWs,
            'approvedIds' => (object) $approvedIds,
            'kuotaBansos' => (int) (Setting::where('key', 'kuota_bansos')->value('value') ?? 8),
            'sawProcessed' => count($hasilSAWs) > 0,
        ]);
    }

    public function importMasyarakat(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'file' => 'required|file',
            'periode' => 'required|string'
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), "r");
        
        $header = fgetcsv($handle, 1000, ",");
        // Asumsi header: nik, nama, alamat, rt_rw, no_hp
        // Jika format ; gunakan fgetcsv($handle, 1000, ";")
        if ($header && strpos(implode(',', $header), ';') !== false) {
            rewind($handle);
            $header = fgetcsv($handle, 1000, ";");
        }

        // Map header ke index
        $headerMap = [];
        if ($header) {
            foreach ($header as $index => $colName) {
                $headerMap[strtolower(trim($colName))] = $index;
            }
        }

        $importedCount = 0;
        $periode = $request->periode;

        while (($row = fgetcsv($handle, 1000, isset($headerMap['nik']) && strpos(implode(',', $header), ';') !== false ? ';' : ',')) !== FALSE) {
            if (empty($row[0])) continue;
            
            $nik = isset($headerMap['nik']) ? $row[$headerMap['nik']] : $row[0];
            $nama = isset($headerMap['nama']) && isset($row[$headerMap['nama']]) ? $row[$headerMap['nama']] : (isset($row[1]) ? $row[1] : '-');
            $alamat = isset($headerMap['alamat']) && isset($row[$headerMap['alamat']]) ? $row[$headerMap['alamat']] : (isset($row[2]) ? $row[2] : '-');
            $rtRw = isset($headerMap['rt_rw']) && isset($row[$headerMap['rt_rw']]) ? $row[$headerMap['rt_rw']] : (isset($row[3]) ? $row[3] : '-');
            $noHp = isset($headerMap['no_hp']) && isset($row[$headerMap['no_hp']]) ? $row[$headerMap['no_hp']] : (isset($row[4]) ? $row[4] : '-');

            if (empty(trim($nik))) continue;

            // Cek duplikasi
            $exists = Masyarakat::where('nik', $nik)->where('periode', $periode)->first();
            if (!$exists) {
                Masyarakat::create([
                    'nik' => $nik,
                    'nama' => $nama,
                    'alamat' => $alamat,
                    'rtRw' => $rtRw,
                    'noHp' => $noHp,
                    'tglDaftar' => \Carbon\Carbon::now()->format('Y-m-d'),
                    'periode' => $periode,
                ]);
                $importedCount++;
            }
        }
        fclose($handle);

        return response()->json(['message' => "$importedCount data berhasil diimpor."]);
    }

    public function exportHasilSAW(\Illuminate\Http\Request $request)
    {
        $periode = $request->query('periode', '2026-06');
        $hasilSAWs = \App\Models\HasilSAW::with('masyarakat')->where('periode', $periode)->orderBy('ranking')->get();

        $filename = "Export_Hasil_SAW_$periode.csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($hasilSAWs) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Peringkat', 'NIK', 'Nama Calon', 'Alamat', 'Nilai Akhir', 'Status Kelayakan', 'Catatan']);

            foreach ($hasilSAWs as $item) {
                fputcsv($file, [
                    $item->ranking,
                    $item->masyarakat->nik ?? '-',
                    $item->masyarakat->nama ?? '-',
                    $item->masyarakat->alamat ?? '-',
                    $item->nilaiAkhir,
                    $item->status,
                    $item->catatan ?? '-'
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function cetakSK(\Illuminate\Http\Request $request)
    {
        $periode = $request->query('periode', '2026-06');
        // Ambil data yang Layak
        $layak = \App\Models\HasilSAW::with('masyarakat')
            ->where('periode', $periode)
            ->where('status', 'Layak')
            ->orderBy('ranking')
            ->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.sk-penerima', [
            'layak' => $layak,
            'periode' => $periode,
        ]);

        return $pdf->download("SK_Penerima_Bansos_$periode.pdf");
    }
}
