import { FileText, Printer, AlertCircle, Filter } from 'lucide-react';
import { AppData } from '../../data';

interface Props { data: AppData; }

export function LaporanKades({ data }: Props) {
  const approved = data.hasilSAW.filter(r => data.approvedIds.includes(r.masyarakatId));
  const canPrint = approved.length > 0;

  const handleExportPDF = () => {
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const rows = approved.map((r, i) => `
      <tr>
        <td style="border:1px solid #ccc;padding:7px 10px;text-align:center">${i + 1}</td>
        <td style="border:1px solid #ccc;padding:7px 10px">${r.namaMasyarakat}</td>
        <td style="border:1px solid #ccc;padding:7px 10px">${r.alamat}</td>
        <td style="border:1px solid #ccc;padding:7px 10px;text-align:center">${r.ranking}</td>
        <td style="border:1px solid #ccc;padding:7px 10px;text-align:center">${r.nilaiAkhir.toFixed(4)}</td>
        <td style="border:1px solid #ccc;padding:7px 10px;text-align:center;color:green;font-weight:bold">Disetujui</td>
      </tr>`).join('');

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Laporan Resmi Penerima Bansos Desa Sukamaju</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 13px; margin: 40px; color: #000; }
          .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 14px; margin-bottom: 24px; }
          .kop h2 { margin: 0; font-size: 17px; font-weight: bold; text-transform: uppercase; }
          .kop h3 { margin: 4px 0; font-size: 14px; font-weight: normal; }
          .kop p { margin: 2px 0; font-size: 12px; }
          .judul { text-align: center; margin-bottom: 16px; }
          .judul h4 { margin: 0 0 4px; font-size: 15px; text-decoration: underline; font-weight: bold; text-transform: uppercase; }
          .judul p { margin: 2px 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
          th { border: 1px solid #000; padding: 8px 10px; background: #dbeafe; text-align: center; font-weight: bold; }
          .footer-note { font-size: 11px; color: #555; margin-top: 8px; }
          .ttd-section { margin-top: 50px; display: flex; justify-content: space-between; }
          .ttd-box { text-align: center; }
          .ttd-box p { margin: 2px 0; font-size: 12px; }
          .ttd-box .space { height: 70px; border-bottom: 1px solid #000; width: 180px; margin: 12px auto; }
          @media print { body { margin: 15mm 20mm; } button { display:none; } }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>Pemerintah Desa Sukamaju</h2>
          <h3>Kecamatan Sukajadi, Kabupaten Bandung, Provinsi Jawa Barat</h3>
          <p>Alamat: Jl. Raya Sukamaju No. 1, Kode Pos 40376 | Telepon: (022) 123456</p>
        </div>
        <div class="judul">
          <h4>Daftar Resmi Penerima Bantuan Sosial (Bansos)</h4>
          <p>Berdasarkan Hasil Sistem Pendukung Keputusan (SPK) Metode SAW</p>
          <p>Tahun Anggaran 2025 | Tanggal: ${today}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:5%">No</th>
              <th style="width:25%">Nama Kepala Keluarga</th>
              <th style="width:35%">Alamat</th>
              <th style="width:8%">Ranking</th>
              <th style="width:12%">Nilai SAW</th>
              <th style="width:15%">Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="footer-note">* Dokumen ini diterbitkan berdasarkan hasil perhitungan sistem dan telah mendapat persetujuan Kepala Desa.</p>
        <div class="ttd-section">
          <div class="ttd-box">
            <p>Mengetahui,</p>
            <p>Operator Sistem</p>
            <div class="space"></div>
            <p><strong>Ahmad Yusuf, S.Kom</strong></p>
            <p>NIP. 199001012020011001</p>
          </div>
          <div class="ttd-box">
            <p>Sukamaju, ${today}</p>
            <p>Kepala Desa Sukamaju</p>
            <div class="space"></div>
            <p><strong>H. Suryanto</strong></p>
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
          <h2 className="text-gray-900 font-semibold">Cetak Laporan Final</h2>
          <p className="text-sm text-muted-foreground">Ekspor daftar resmi penerima bansos yang telah Anda sahkan</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={!canPrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Printer className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {!canPrint && (
        <div className="flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
          <span>
            {!data.sawProcessed
              ? 'Perhitungan SAW belum dilakukan oleh Admin. Laporan belum tersedia.'
              : 'Anda belum memberikan persetujuan (ACC) pada halaman Validasi. Silakan setujui data terlebih dahulu sebelum mencetak.'}
          </span>
        </div>
      )}

      {canPrint && (
        <>
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Informasi Dokumen</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                { label: 'Desa', value: 'Sukamaju' },
                { label: 'Tahun Anggaran', value: '2025' },
                { label: 'Jumlah Penerima', value: `${approved.length} Orang` },
                { label: 'Tanggal Cetak', value: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Preview Daftar Penerima</h3>
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
                    <tr key={r.masyarakatId} className="hover:bg-gray-50 bg-green-50/20">
                      <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{r.namaMasyarakat}</td>
                      <td className="px-5 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{r.alamat}</td>
                      <td className="px-5 py-3 text-center font-mono font-semibold text-blue-700">#{r.ranking}</td>
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
        </>
      )}
    </div>
  );
}
