<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KlaimBantuan;
use App\Models\HasilSAW;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class KlaimBantuanController extends Controller
{
    /**
     * List klaim bantuans with filters.
     */
    public function index(Request $request)
    {
        $query = KlaimBantuan::with(['hasilSaw.masyarakat', 'hasilSaw.jenisBantuan', 'verifikator']);

        if ($request->has('bantuan_id')) {
            $query->whereHas('hasilSaw', function ($q) use ($request) {
                $q->where('jenis_bantuan_id', $request->bantuan_id);
            });
        }
        if ($request->has('periode')) {
            $query->whereHas('hasilSaw', function ($q) use ($request) {
                $q->where('periode', $request->periode);
            });
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Scan QR code and verify claim pickup.
     */
    public function scanVerify(Request $request)
    {
        $request->validate([
            'kode_klaim' => 'required|string',
            'user_id' => 'nullable|integer',
        ]);

        $klaim = KlaimBantuan::with(['hasilSaw.masyarakat', 'hasilSaw.jenisBantuan'])
            ->where(function ($query) use ($request) {
                $query->where('kode_klaim', $request->kode_klaim)
                      ->orWhereHas('hasilSaw.masyarakat', function ($q) use ($request) {
                          $q->where('nik', $request->kode_klaim);
                      });
            })
            ->orderByRaw("status_klaim = 'belum_diambil' DESC")
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$klaim) {
            return response()->json([
                'success' => false,
                'message' => 'Kode klaim tidak ditemukan dalam sistem.',
            ], 404);
        }

        if ($klaim->status_klaim === 'sudah_diambil') {
            return response()->json([
                'success' => false,
                'message' => 'Bantuan sudah pernah diambil!',
                'data' => [
                    'kode_klaim' => $klaim->kode_klaim,
                    'nama' => $klaim->hasilSaw->masyarakat->nama ?? '-',
                    'bantuan' => $klaim->hasilSaw->jenisBantuan->nama_program ?? '-',
                    'tanggal_diambil' => $klaim->tanggal_diambil?->format('d/m/Y H:i'),
                ]
            ], 409);
        }

        // Mark as claimed
        $klaim->update([
            'status_klaim' => 'sudah_diambil',
            'tanggal_diambil' => now(),
            'diverifikasi_oleh' => $request->user_id ?? auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bantuan berhasil diverifikasi pengambilannya!',
            'data' => [
                'kode_klaim' => $klaim->kode_klaim,
                'nama' => $klaim->hasilSaw->masyarakat->nama ?? '-',
                'bantuan' => $klaim->hasilSaw->jenisBantuan->nama_program ?? '-',
                'periode' => $klaim->hasilSaw->periode ?? '-',
                'tanggal_diambil' => now()->format('d/m/Y H:i'),
            ]
        ]);
    }

    /**
     * Resend WhatsApp notification for a failed klaim.
     */
    public function resendWA($id)
    {
        $klaim = KlaimBantuan::with(['hasilSaw.masyarakat', 'hasilSaw.jenisBantuan'])->findOrFail($id);

        $result = self::sendWhatsApp($klaim);

        return response()->json($result);
    }

    /**
     * Get WA delivery log with filters.
     */
    public function logWA(Request $request)
    {
        $query = KlaimBantuan::with(['hasilSaw.masyarakat', 'hasilSaw.jenisBantuan'])
            ->whereNotNull('tanggal_kirim_wa');

        if ($request->has('bantuan_id')) {
            $query->whereHas('hasilSaw', function ($q) use ($request) {
                $q->where('jenis_bantuan_id', $request->bantuan_id);
            });
        }
        if ($request->has('periode')) {
            $query->whereHas('hasilSaw', function ($q) use ($request) {
                $q->where('periode', $request->periode);
            });
        }
        if ($request->has('status_kirim_wa')) {
            $query->where('status_kirim_wa', $request->status_kirim_wa);
        }

        return response()->json($query->orderBy('tanggal_kirim_wa', 'desc')->get());
    }

    /**
     * Static helper: generate kode_klaim for a HasilSAW record.
     */
    public static function generateKodeKlaim(HasilSAW $hasilSaw): string
    {
        $bantuan = $hasilSaw->jenisBantuan;
        $prefix = 'BNT';
        if ($bantuan) {
            // Generate short prefix from program name
            $words = explode(' ', $bantuan->nama_program);
            if (count($words) >= 2) {
                $prefix = strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 2));
            } else {
                $prefix = strtoupper(substr($bantuan->nama_program, 0, 3));
            }
        }

        $random = strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        return "{$prefix}-{$hasilSaw->periode}-{$random}";
    }

    /**
     * Static helper: generate QR code URL from kode_klaim.
     */
    public static function generateQRCodeUrl(string $kodeKlaim): string
    {
        return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($kodeKlaim);
    }

    /**
     * Static helper: create a KlaimBantuan record and send WA.
     */
    public static function createKlaimAndSendWA(HasilSAW $hasilSaw): KlaimBantuan
    {
        $kodeKlaim = self::generateKodeKlaim($hasilSaw);
        $qrCodeUrl = self::generateQRCodeUrl($kodeKlaim);

        $masyarakat = $hasilSaw->masyarakat;
        $bantuan = $hasilSaw->jenisBantuan;
        $namaWarga = $masyarakat->nama ?? 'Warga';
        $namaBantuan = $bantuan->nama_program ?? 'Bantuan Sosial';
        $periode = $hasilSaw->periode ?? date('Y-m');

        $pesanWA = "Selamat {$namaWarga}, pengajuan {$namaBantuan} periode {$periode} Anda telah DISETUJUI Kades.\n\n"
            . "Silakan ambil bantuan di kantor desa dengan menunjukkan QR Code berikut.\n\n"
            . "Kode klaim: {$kodeKlaim}\n\n"
            . "Terima kasih.\n"
            . "— Pemerintah Desa Sukamaju";

        $klaim = KlaimBantuan::create([
            'hasil_saw_id' => $hasilSaw->id,
            'kode_klaim' => $kodeKlaim,
            'qr_code_url' => $qrCodeUrl,
            'status_klaim' => 'belum_diambil',
            'status_kirim_wa' => 'belum_dikirim',
            'pesan_wa' => $pesanWA,
        ]);

        // Attempt to send WhatsApp
        self::sendWhatsApp($klaim);

        return $klaim;
    }

    /**
     * Static helper: send WhatsApp via Fonnte API.
     */
    public static function sendWhatsApp(KlaimBantuan $klaim): array
    {
        $token = env('FONNTE_TOKEN', '');
        if (empty($token)) {
            $klaim->update([
                'status_kirim_wa' => 'gagal',
                'tanggal_kirim_wa' => now(),
            ]);
            return [
                'success' => false,
                'message' => 'Token Fonnte belum dikonfigurasi. Silakan set FONNTE_TOKEN di .env',
            ];
        }

        $masyarakat = $klaim->hasilSaw->masyarakat;
        $noHp = $masyarakat->noHp ?? '';

        // Normalize phone number to 628xxx format
        $noHp = preg_replace('/[^0-9]/', '', $noHp);
        if (str_starts_with($noHp, '0')) {
            $noHp = '62' . substr($noHp, 1);
        } elseif (!str_starts_with($noHp, '62')) {
            $noHp = '62' . $noHp;
        }

        if (strlen($noHp) < 10) {
            $klaim->update([
                'status_kirim_wa' => 'gagal',
                'tanggal_kirim_wa' => now(),
            ]);
            return [
                'success' => false,
                'message' => 'Nomor HP warga tidak valid: ' . $noHp,
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target' => $noHp,
                'message' => $klaim->pesan_wa,
                'url' => $klaim->qr_code_url,
            ]);

            $isSuccess = $response->successful() && ($response->json('status') ?? false);

            $klaim->update([
                'status_kirim_wa' => $isSuccess ? 'terkirim' : 'gagal',
                'tanggal_kirim_wa' => now(),
            ]);

            return [
                'success' => $isSuccess,
                'message' => $isSuccess ? 'WhatsApp berhasil dikirim' : 'Gagal mengirim WhatsApp: ' . ($response->json('reason') ?? 'Unknown error'),
                'response' => $response->json(),
            ];
        } catch (\Exception $e) {
            $klaim->update([
                'status_kirim_wa' => 'gagal',
                'tanggal_kirim_wa' => now(),
            ]);

            return [
                'success' => false,
                'message' => 'Error mengirim WhatsApp: ' . $e->getMessage(),
            ];
        }
    }
}
