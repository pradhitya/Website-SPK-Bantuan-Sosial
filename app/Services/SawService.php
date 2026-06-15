<?php

namespace App\Services;

use App\Models\Kriteria;
use App\Models\Masyarakat;
use App\Models\Penilaian;
use App\Models\HasilSAW;

class SawService
{
    public function calculate($kuota = 8)
    {
        $kriterias = Kriteria::all();
        $masyarakats = Masyarakat::all();
        $penilaians = Penilaian::all();

        $matrix = [];
        foreach ($masyarakats as $m) {
            $matrix[$m->id] = [];
            foreach ($kriterias as $k) {
                $p = $penilaians->where('masyarakat_id', $m->id)->where('kriteria_id', $k->id)->first();
                $matrix[$m->id][$k->id] = $p ? $p->nilai : 0;
            }
        }

        $normalized = [];
        foreach ($kriterias as $k) {
            $vals = [];
            foreach ($masyarakats as $m) {
                if ($matrix[$m->id][$k->id] > 0) {
                    $vals[] = $matrix[$m->id][$k->id];
                }
            }
            $maxVal = count($vals) ? max($vals) : 1;
            $minVal = count($vals) ? min($vals) : 1;

            foreach ($masyarakats as $m) {
                if (!isset($normalized[$m->id])) {
                    $normalized[$m->id] = [];
                }
                $xij = $matrix[$m->id][$k->id];
                if ($xij == 0) {
                    $normalized[$m->id][$k->id] = 0;
                } else if ($k->atribut === 'Benefit') {
                    $normalized[$m->id][$k->id] = round($xij / $maxVal, 4);
                } else {
                    $normalized[$m->id][$k->id] = round($minVal / $xij, 4);
                }
            }
        }

        $results = [];
        foreach ($masyarakats as $m) {
            $nilaiAkhir = 0;
            foreach ($kriterias as $k) {
                $nilaiAkhir += ($k->bobot / 100) * ($normalized[$m->id][$k->id] ?? 0);
            }
            $results[] = [
                'masyarakat_id' => $m->id,
                'namaMasyarakat' => $m->nama,
                'alamat' => $m->alamat,
                'nilaiPerKriteria' => $matrix[$m->id],
                'normalisasi' => $normalized[$m->id],
                'nilaiAkhir' => round($nilaiAkhir, 4),
                'ranking' => 0,
                'status' => 'Tidak Layak',
            ];
        }

        usort($results, function($a, $b) {
            return $b['nilaiAkhir'] <=> $a['nilaiAkhir'];
        });

        foreach ($results as $i => &$r) {
            $r['ranking'] = $i + 1;
            $r['status'] = $r['ranking'] <= $kuota ? 'Layak' : 'Tidak Layak';
        }

        // Save to DB
        HasilSAW::truncate();
        foreach ($results as $r) {
            HasilSAW::create([
                'masyarakat_id' => $r['masyarakat_id'],
                'nilaiPerKriteria' => json_encode($r['nilaiPerKriteria']),
                'normalisasi' => json_encode($r['normalisasi']),
                'nilaiAkhir' => $r['nilaiAkhir'],
                'ranking' => $r['ranking'],
                'status' => $r['status']
            ]);
        }

        return $results;
    }
}
