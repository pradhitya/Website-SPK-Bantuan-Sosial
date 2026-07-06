<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kriteria;
use App\Models\SubKriteria;
use App\Models\Masyarakat;
use App\Models\Penilaian;
use App\Models\HasilSAW;
use App\Models\Setting;
use App\Models\Sanggahan;
use App\Models\KlaimBantuan;
use App\Models\Warga;
use App\Models\Keluarga;

class DataController extends Controller
{
    public function init(\Illuminate\Http\Request $request)
    {
        $jenisBantuanId = $request->query('jenis_bantuan_id');
        $periode = $request->query('periode');
        $kriteriaQuery = Kriteria::query();
        if ($jenisBantuanId) {
            $kriteriaQuery->where('jenis_bantuan_id', $jenisBantuanId);
        }
        $kriterias = $kriteriaQuery->get();

        $subKriteriaQuery = SubKriteria::query();
        if ($jenisBantuanId) {
            $subKriteriaQuery->whereHas('kriteria', function($q) use ($jenisBantuanId) {
                $q->where('jenis_bantuan_id', $jenisBantuanId);
            });
        }
        $subKriterias = $subKriteriaQuery->get()->map(function($item) {
            return [
                'id' => $item->id,
                'kriteriaId' => $item->kriteria_id,
                'nama' => $item->nama,
                'nilai' => $item->nilai,
            ];
        });
        
        $masyarakatQuery = Masyarakat::query();
        if ($jenisBantuanId) {
            $masyarakatQuery->where('jenis_bantuan_id', $jenisBantuanId);
        }
        if ($periode) {
            $masyarakatQuery->where('periode', $periode);
        }
        
        $masyarakats = $masyarakatQuery->get()->map(function($m) {
            return [
                'id' => $m->id,
                'nama' => $m->nama,
                'nik' => $m->nik,
                'alamat' => $m->alamat,
                'rtRw' => $m->rtRw,
                'noHp' => $m->noHp,
                'tglDaftar' => $m->created_at->format('Y-m-d'),
                'periode' => $m->periode,
                'jenis_bantuan_id' => $m->jenis_bantuan_id,
            ];
        });
        
        $penilaianQuery = Penilaian::query();
        if ($jenisBantuanId) {
            $penilaianQuery->whereHas('masyarakat', function($q) use ($jenisBantuanId) {
                $q->where('jenis_bantuan_id', $jenisBantuanId);
            });
        }
        if ($periode) {
            $penilaianQuery->whereHas('masyarakat', function($q) use ($periode) {
                $q->where('periode', $periode);
            });
        }
        
        $penilaians = $penilaianQuery->get()->map(function($item) {
            return [
                'masyarakatId' => $item->masyarakat_id,
                'kriteriaId' => $item->kriteria_id,
                'subKriteriaId' => $item->sub_kriteria_id,
                'nilai' => $item->nilai,
            ];
        });

        $hasilSawQuery = HasilSAW::with('masyarakat');
        if ($jenisBantuanId) {
            $hasilSawQuery->where('jenis_bantuan_id', $jenisBantuanId);
        }
        if ($periode) {
            $hasilSawQuery->where('periode', $periode);
        }

        $hasilSAWs = $hasilSawQuery->orderBy('ranking')->get()->map(function($item) {
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
        });
        
        // Build approvedIds from status_approval (backward compatible format)
        $approvedIds = [];
        $approvedHasil = HasilSAW::where('status_approval', 'disetujui')->get();
        foreach ($approvedHasil as $ah) {
            $key = $ah->periode . ($ah->jenis_bantuan_id ? '_' . $ah->jenis_bantuan_id : '');
            if (!isset($approvedIds[$key])) {
                $approvedIds[$key] = [];
            }
            $approvedIds[$key][] = $ah->masyarakat_id;
        }

        // Fallback: also check settings-based approved_ids
        $approvedSettings = Setting::where('key', 'like', 'approved_ids_%')->get();
        foreach ($approvedSettings as $setting) {
            $ids = json_decode($setting->value, true);
            $settingPeriode = str_replace('approved_ids_', '', $setting->key);
            if (is_array($ids) && !empty($ids) && !isset($approvedIds[$settingPeriode])) {
                $approvedIds[$settingPeriode] = $ids;
            }
        }

        $jenisBantuans = \App\Models\JenisBantuan::all();

        // Sanggahan counts
        $sanggahanQuery = Sanggahan::with(['jenisBantuan', 'wargaDilaporkan', 'verifikator']);
        if ($jenisBantuanId) {
            $sanggahanQuery->where('bantuan_id', $jenisBantuanId);
        }
        $sanggahans = $sanggahanQuery->orderBy('created_at', 'desc')->get();

        // Klaim bantuan for this context
        $klaimQuery = KlaimBantuan::with(['hasilSaw.masyarakat', 'hasilSaw.jenisBantuan', 'verifikator']);
        if ($jenisBantuanId) {
            $klaimQuery->whereHas('hasilSaw', function ($q) use ($jenisBantuanId) {
                $q->where('jenis_bantuan_id', $jenisBantuanId);
            });
        }
        $klaimBantuans = $klaimQuery->orderBy('created_at', 'desc')->get();

        // Kuota per bantuan
        $kuotaKey = 'kuota_bansos' . ($jenisBantuanId ? '_' . $jenisBantuanId : '');
        $kuotaBansos = (int) (Setting::where('key', $kuotaKey)->value('value') ?? 8);

        // Lightweight stats for dashboard instead of fetching all Warga and Keluarga
        $stats = [
            'totalWarga' => Warga::count(),
            'totalKeluarga' => Keluarga::count(),
            'totalLansia' => Warga::lansia()->count(),
            'totalHamil' => Warga::ibuHamil()->count(),
        ];

        // Fetch all Wargas with Keluarga for Master Data Warga and demographic charts
        $wargas = Warga::with('keluarga')->get();
        // Fetch all Keluargas with wargas for Master Data Keluarga and Masyarakat
        $keluargas = Keluarga::with('wargas')->get();

        // Get all available periods from HasilSAW
        $availablePeriods = \App\Models\HasilSAW::select('periode')->distinct()->pluck('periode')->toArray();
        if (empty($availablePeriods)) {
            $availablePeriods = \App\Models\Masyarakat::select('periode')->distinct()->pluck('periode')->toArray();
        }
        if (empty($availablePeriods)) {
            $availablePeriods = ['2026-06']; // Fallback
        }
        
        // Ensure requested periode is always available to prevent frontend from reverting it
        if ($periode && !in_array($periode, $availablePeriods)) {
            $availablePeriods[] = $periode;
        }
        
        rsort($availablePeriods);

        return response()->json([
            'jenisBantuan' => $jenisBantuans,
            'kriteria' => $kriterias,
            'subKriteria' => $subKriterias,
            'masyarakat' => $masyarakats,
            'penilaian' => $penilaians,
            'hasilSAW' => $hasilSAWs,
            'approvedIds' => (object) $approvedIds,
            'kuotaBansos' => $kuotaBansos,
            'sawProcessed' => count($hasilSAWs) > 0,
            'sanggahans' => $sanggahans,
            'klaimBantuans' => $klaimBantuans,
            'stats' => $stats,
            'wargas' => $wargas,
            'keluargas' => $keluargas,
            'availablePeriods' => array_values(array_unique($availablePeriods)),
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
        $jenisBantuanId = $request->jenis_bantuan_id;

        while (($row = fgetcsv($handle, 1000, isset($headerMap['nik']) && strpos(implode(',', $header), ';') !== false ? ';' : ',')) !== FALSE) {
            if (empty($row[0])) continue;
            
            $nik = isset($headerMap['nik']) ? $row[$headerMap['nik']] : $row[0];
            $nama = isset($headerMap['nama']) && isset($row[$headerMap['nama']]) ? $row[$headerMap['nama']] : (isset($row[1]) ? $row[1] : '-');
            $alamat = isset($headerMap['alamat']) && isset($row[$headerMap['alamat']]) ? $row[$headerMap['alamat']] : (isset($row[2]) ? $row[2] : '-');
            $rtRw = isset($headerMap['rt_rw']) && isset($row[$headerMap['rt_rw']]) ? $row[$headerMap['rt_rw']] : (isset($row[3]) ? $row[3] : '-');
            $noHp = isset($headerMap['no_hp']) && isset($row[$headerMap['no_hp']]) ? $row[$headerMap['no_hp']] : (isset($row[4]) ? $row[4] : '-');

            if (empty(trim($nik))) continue;

            // Validasi format: Hanya biarkan angka untuk NIK, angka/+ untuk NoHp
            $nik = preg_replace('/[^0-9]/', '', $nik);
            $noHp = preg_replace('/[^0-9\+]/', '', $noHp);

            // NIK Indonesia umumnya 16 digit
            if (strlen($nik) < 15 || strlen($nik) > 17) continue;

            // Dapatkan info program
            $jenisBantuan = \App\Models\JenisBantuan::find($jenisBantuanId);
            $targetPenerima = $jenisBantuan ? strtolower($jenisBantuan->target_penerima) : 'keluarga';
            $programName = $jenisBantuan ? strtolower($jenisBantuan->nama_program) : '';
            $filterTarget = $jenisBantuan ? strtolower($jenisBantuan->filter_target) : '';

            $warga = \App\Models\Warga::where('nik', $nik)->first();
            
            $jenisKelamin = 'L';
            $usia = 0;
            $statusKeluarga = 'unknown';

            if ($warga) {
                $jenisKelamin = $warga->jenis_kelamin;
                $usia = $warga->usia;
                $statusKeluarga = strtolower($warga->status_keluarga);
            } else {
                // Parse NIK if not found in DB
                $dd = (int) substr($nik, 6, 2);
                $mm = (int) substr($nik, 8, 2);
                $yy = (int) substr($nik, 10, 2);
                $jenisKelamin = $dd > 40 ? 'P' : 'L';
                $tanggal = $dd > 40 ? $dd - 40 : $dd;
                
                $currentYear2 = (int) date('y');
                $tahun = $yy > $currentYear2 ? 1900 + $yy : 2000 + $yy;
                try {
                    $usia = \Carbon\Carbon::createFromDate($tahun, $mm, $tanggal)->age;
                } catch (\Exception $e) {
                    $usia = 0;
                }
            }

            // Filter Lansia
            if (str_contains($filterTarget, 'lansia') || str_contains($programName, 'lansia')) {
                if ($usia < 60) continue;
            }

            // Filter Stunting (hanya perempuan/ibu)
            if (str_contains($filterTarget, 'stunting') || str_contains($programName, 'stunting')) {
                if ($jenisKelamin !== 'P') continue;
            }

            // Filter Kepala Keluarga (BLT, Sembako, RTLH)
            if ($targetPenerima === 'keluarga' || str_contains($programName, 'blt') || str_contains($programName, 'sembako') || str_contains($programName, 'rtlh') || str_contains($programName, 'rlth')) {
                // Hanya skip jika kita tahu pasti dari database bahwa dia bukan kepala keluarga
                if ($warga && $statusKeluarga !== 'kepala keluarga') {
                    continue;
                }
            }

            // Cek duplikasi
            $existsQuery = Masyarakat::where('nik', $nik)->where('periode', $periode);
            if ($jenisBantuanId) {
                $existsQuery->where('jenis_bantuan_id', $jenisBantuanId);
            }
            $exists = $existsQuery->first();

            if (!$exists) {
                Masyarakat::create([
                    'nik' => $nik,
                    'nama' => $nama,
                    'alamat' => $alamat,
                    'rtRw' => $rtRw,
                    'noHp' => $noHp,
                    'tglDaftar' => \Carbon\Carbon::now()->format('Y-m-d'),
                    'periode' => $periode,
                    'jenis_bantuan_id' => $jenisBantuanId,
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
        $jenisBantuanId = $request->query('jenis_bantuan_id');

        $query = \App\Models\HasilSAW::with('masyarakat')->where('periode', $periode);
        if ($jenisBantuanId) {
            $query->where('jenis_bantuan_id', $jenisBantuanId);
        }
        $hasilSAWs = $query->orderBy('ranking')->get();

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
            fputcsv($file, ['Peringkat', 'NIK', 'Nama Calon', 'Alamat', 'Nilai Akhir', 'Status Kelayakan', 'Status Approval', 'Catatan']);

            foreach ($hasilSAWs as $item) {
                fputcsv($file, [
                    $item->ranking,
                    $item->masyarakat->nik ?? '-',
                    $item->masyarakat->nama ?? '-',
                    $item->masyarakat->alamat ?? '-',
                    $item->nilaiAkhir,
                    $item->status,
                    $item->status_approval ?? 'pending',
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
        $jenisBantuanId = $request->query('jenis_bantuan_id');

        $query = \App\Models\HasilSAW::with('masyarakat')
            ->where('periode', $periode)
            ->where('status', 'Layak')
            ->where('status_approval', 'disetujui');
            
        if ($jenisBantuanId) {
            $query->where('jenis_bantuan_id', $jenisBantuanId);
        }

        $layak = $query->orderBy('ranking')->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.sk-penerima', [
            'layak' => $layak,
            'periode' => $periode,
        ]);

        return $pdf->download("SK_Penerima_Bansos_$periode.pdf");
    }
}
