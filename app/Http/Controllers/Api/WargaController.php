<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warga;
use App\Models\Keluarga;
use Illuminate\Http\Request;

class WargaController extends Controller
{
    public function index(Request $request)
    {
        $query = Warga::with('keluarga');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%$search%")
                  ->orWhere('nik', 'like', "%$search%");
            });
        }

        if ($request->has('keluarga_id')) {
            $query->where('keluarga_id', $request->keluarga_id);
        }

        if ($request->has('jenis_kelamin')) {
            $query->where('jenis_kelamin', $request->jenis_kelamin);
        }

        if ($request->has('status_keluarga')) {
            $query->where('status_keluarga', $request->status_keluarga);
        }

        // Filter khusus untuk target bantuan
        if ($request->has('filter_target')) {
            $filter = strtolower($request->filter_target);
            if ($filter === 'lansia') {
                $query->lansia();
            } elseif ($filter === 'hamil' || $filter === 'ibu hamil') {
                $query->ibuHamil();
            } elseif ($filter === 'disabilitas') {
                $query->disabilitas();
            }
        }

        return response()->json($query->orderBy('nama')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nik' => 'required|string|size:16|unique:wargas,nik',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
        ]);

        $warga = Warga::create($request->all());
        $warga->load('keluarga');

        return response()->json($warga, 201);
    }

    public function show($id)
    {
        $warga = Warga::with('keluarga')->findOrFail($id);
        return response()->json($warga);
    }

    public function update(Request $request, $id)
    {
        $warga = Warga::findOrFail($id);

        $request->validate([
            'nik' => 'sometimes|string|size:16|unique:wargas,nik,' . $id,
            'nama' => 'sometimes|string|max:255',
            'jenis_kelamin' => 'sometimes|in:L,P',
        ]);

        $warga->update($request->all());
        $warga->load('keluarga');

        return response()->json($warga);
    }

    public function destroy($id)
    {
        Warga::findOrFail($id)->delete();
        return response()->json(['message' => 'Data warga berhasil dihapus.']);
    }

    /**
     * Import data warga dari file CSV.
     * Format CSV: nik, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, no_hp, status_keluarga, pekerjaan, keterangan_khusus, no_kk
     */
    public function importCsv(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), "r");

        // Detect delimiter
        $header = fgetcsv($handle, 2000, ",");
        if ($header && strpos(implode(',', $header), ';') !== false) {
            rewind($handle);
            $header = fgetcsv($handle, 2000, ";");
        }

        $headerMap = [];
        if ($header) {
            foreach ($header as $index => $colName) {
                $headerMap[strtolower(trim($colName))] = $index;
            }
        }

        $delimiter = isset($headerMap['nik']) && strpos(implode(',', $header), ';') !== false ? ';' : ',';
        $importedCount = 0;
        $skippedCount = 0;

        while (($row = fgetcsv($handle, 2000, $delimiter)) !== FALSE) {
            if (empty($row[0])) continue;

            $nik = $this->getCol($row, $headerMap, 'nik', 0);
            $nik = preg_replace('/[^0-9]/', '', $nik);

            if (strlen($nik) < 15 || strlen($nik) > 17) {
                $skippedCount++;
                continue;
            }

            // Skip jika NIK sudah ada
            if (Warga::where('nik', $nik)->exists()) {
                $skippedCount++;
                continue;
            }

            $nama = $this->getCol($row, $headerMap, 'nama', 1) ?: '-';
            $jenisKelamin = strtoupper($this->getCol($row, $headerMap, 'jenis_kelamin', 2) ?: 'L');
            if (!in_array($jenisKelamin, ['L', 'P'])) $jenisKelamin = 'L';

            $tempatLahir = $this->getCol($row, $headerMap, 'tempat_lahir', 3);
            $tanggalLahir = $this->getCol($row, $headerMap, 'tanggal_lahir', 4);
            $noHp = $this->getCol($row, $headerMap, 'no_hp', 5);
            $statusKeluarga = $this->getCol($row, $headerMap, 'status_keluarga', 6) ?: 'Lainnya';
            $pekerjaan = $this->getCol($row, $headerMap, 'pekerjaan', 7);
            $keteranganKhusus = $this->getCol($row, $headerMap, 'keterangan_khusus', 8);
            $noKK = $this->getCol($row, $headerMap, 'no_kk', 9);

            // Validate status_keluarga
            $validStatus = ['Kepala Keluarga', 'Istri', 'Anak', 'Orang Tua', 'Lainnya'];
            if (!in_array($statusKeluarga, $validStatus)) {
                $statusKeluarga = 'Lainnya';
            }

            // Link ke keluarga jika no_kk diberikan
            $keluargaId = null;
            if ($noKK) {
                $noKK = preg_replace('/[^0-9]/', '', $noKK);
                if (strlen($noKK) >= 15) {
                    $keluarga = Keluarga::firstOrCreate(
                        ['no_kk' => $noKK],
                        ['alamat' => '-', 'rt_rw' => '-']
                    );
                    $keluargaId = $keluarga->id;
                }
            }

            // Parse tanggal_lahir
            $parsedTanggalLahir = null;
            if ($tanggalLahir) {
                try {
                    $parsedTanggalLahir = \Carbon\Carbon::parse($tanggalLahir)->format('Y-m-d');
                } catch (\Exception $e) {
                    $parsedTanggalLahir = null;
                }
            }

            Warga::create([
                'keluarga_id' => $keluargaId,
                'nik' => $nik,
                'nama' => $nama,
                'jenis_kelamin' => $jenisKelamin,
                'tempat_lahir' => $tempatLahir,
                'tanggal_lahir' => $parsedTanggalLahir,
                'status_keluarga' => $statusKeluarga,
                'no_hp' => $noHp ? preg_replace('/[^0-9\+]/', '', $noHp) : null,
                'pekerjaan' => $pekerjaan,
                'keterangan_khusus' => $keteranganKhusus,
            ]);
            $importedCount++;
        }
        fclose($handle);

        return response()->json([
            'message' => "$importedCount data warga berhasil diimpor. $skippedCount data dilewati (duplikat/invalid).",
            'imported' => $importedCount,
            'skipped' => $skippedCount,
        ]);
    }

    /**
     * Helper: ambil kolom dari row CSV berdasarkan header map atau index fallback.
     */
    private function getCol(array $row, array $headerMap, string $key, int $fallbackIndex): ?string
    {
        if (isset($headerMap[$key]) && isset($row[$headerMap[$key]])) {
            $val = trim($row[$headerMap[$key]]);
            return $val !== '' ? $val : null;
        }
        if (isset($row[$fallbackIndex])) {
            $val = trim($row[$fallbackIndex]);
            return $val !== '' ? $val : null;
        }
        return null;
    }
}
