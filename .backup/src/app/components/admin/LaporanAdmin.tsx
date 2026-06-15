import { FileText, Printer, AlertCircle } from 'lucide-react';
import { AppData } from '../../data';

interface Props { data: AppData; }

export function LaporanAdmin({ data }: Props) {
  const approved = data.hasilSAW.filter(r => data.approvedIds.includes(r.masyarakatId));
  const canPrint = approved.length > 0;

  const handlePrint = () => {
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const rows = approved.map((r, i) => `
      <tr>
        <td style="border:1px solid #ccc;padding:6px 10px;text-align:center">${i + 1}</td>
        <td style="border:1px solid #ccc;padding:6px 10px">${r.namaMasyarakat}</td>
        <td style="border:1px solid #ccc;padding:6px 10px">${r.alamat}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;text-align:center">${r.ranking}</td>
        <td style="border:1px solid #ccc;padding:6px 10px;text-align:center">${r.nilaiAkhir.toFixed(4)}</td>
      </tr>`).join('');

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Laporan Penerima Bansos</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 13px; margin: 40px; color: #000; }
          .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 20px; }
          .kop h2 { margin: 0; font-size: 16px; font-weight: bold; }
          .kop h3 { margin: 4px 0 0; font-size: 14px; }
          .kop p { margin: 2px 0; font-size: 12px; }
          .judul { text-align: center; margin-bottom: 16px; }
          .judul h4 { margin: 0; font-size: 14px; text-decoration: underline; font-weight: bold; }
          .judul p { margin: 4px 0 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { border: 1px solid #000; padding: 7px 10px; background: #f0f0f0; text-align: center; }
          td { border: 1px solid #ccc; padding: 6px 10px; }
          .ttd { margin-top: 40px; display: flex; justify-content: flex-end; }
          .ttd-box { text-align: center; }
          .ttd-box p { margin: 0; font-size: 12px; }
          .ttd-box .gap { height: 70px; }
          @media print { body { margin: 20mm; } }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>PEMERINTAH DESA SUKAMAJU</h2>
          <h3>KECAMATAN SUKAJADI — KABUPATEN BANDUNG</h3>
          <p>Jl. Raya Sukamaju No. 1, Telepon (022) 123456</p>
        </div>
        <div class="judul">
          <h4>DAFTAR PENERIMA BANTUAN SOSIAL (BANSOS)</h4>
          <p>Berdasarkan Hasil Perhitungan Metode SAW — Tahun 2025</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Kepala Keluarga</th>
              <th>Alamat</th>
              <th>Ranking</th>
              <th>Nilai SAW</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="font-size:12px">Tanggal Cetak: ${today}</p>
        <div class="ttd">
          <div class="ttd-box">
            <p>Sukamaju, ${today}</p>
            <p>Kepala Desa Sukamaju</p>
            <div class="gap"></div>
            <p style="text-decoration:underline;font-weight:bold">H. Suryanto</p>
            <p>NIP. 197501012005011001</p>
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-semibold">Laporan Penerima Bansos</h2>
          <p className="text-sm text-muted-foreground">Data penerima yang telah divalidasi oleh Kepala Desa</p>
        </div>
        <button
          onClick={handlePrint}
          disabled={!canPrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Printer className="w-4 h-4" />
          Cetak PDF
        </button>
      </div>

      {!data.sawProcessed ? (
        <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
          <span>Perhitungan SAW belum diproses. Silakan lakukan proses hitung SAW terlebih dahulu.</span>
        </div>
      ) : !canPrint ? (
        <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
          <span>Hasil SAW belum divalidasi oleh Kepala Desa. Laporan hanya dapat dicetak setelah Kepala Desa memberikan persetujuan (ACC).</span>
        </div>
      ) : null}

      {canPrint ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Daftar Penerima Bansos Resmi</h3>
              <p className="text-xs text-muted-foreground">Telah disetujui oleh Kepala Desa — {approved.length} penerima</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">No</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Kepala Keluarga</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Alamat</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ranking</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nilai SAW</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {approved.map((r, i) => (
                  <tr key={r.masyarakatId} className="hover:bg-gray-50 bg-green-50/30">
                    <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{r.namaMasyarakat}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{r.alamat}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="font-mono font-semibold text-blue-700">#{r.ranking}</span>
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-gray-700">{r.nilaiAkhir.toFixed(4)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Disetujui
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : data.sawProcessed && data.hasilSAW.length > 0 ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-gray-900">Draft Hasil SAW (Menunggu Validasi)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Data berikut belum disahkan oleh Kepala Desa</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ranking</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nilai SAW</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.hasilSAW.map(r => (
                  <tr key={r.masyarakatId} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-semibold text-gray-700">#{r.ranking}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{r.namaMasyarakat}</td>
                    <td className="px-5 py-3 text-center font-mono text-gray-700">{r.nilaiAkhir.toFixed(4)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === 'Layak' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
