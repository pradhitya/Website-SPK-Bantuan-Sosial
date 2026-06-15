import { useState } from 'react';
import { FileText, Printer, AlertCircle, Filter, Download } from 'lucide-react';
import { AppData } from '../../data';

interface Props { data: AppData; }

export function LaporanKades({ data }: Props) {
  const [periode, setPeriode] = useState(data.activePeriode || '2026-06');
  
  const filteredHasilSAW = data.hasilSAW.filter(h => h.periode === periode);
  const currentApproved = data.approvedIds[periode] || [];
  const approved = filteredHasilSAW.filter(r => currentApproved.some(id => String(id) === String(r.masyarakatId)));
  const sawProcessed = filteredHasilSAW.length > 0;
  const canPrint = approved.length > 0;

  const handleExportPDF = () => {
    window.open(`/api/cetak-sk?periode=${periode}`, '_blank');
  };

  const handleExport = () => {
    window.open(`/api/export-hasil-saw?periode=${periode}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cetak Laporan Final</h2>
          <p className="text-sm text-slate-500 mt-1">Ekspor daftar resmi penerima bansos yang telah Anda sahkan</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-600 whitespace-nowrap">Periode:</label>
          <input 
            type="month" 
            value={periode} 
            onChange={e => setPeriode(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
          />
          <button
            onClick={handleExport}
            disabled={!canPrint}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={!canPrint}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak PDF</span>
          </button>
        </div>
      </div>

      {!canPrint && (
        <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 border border-amber-200/60 rounded-2xl text-sm text-amber-800 shadow-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
          <span className="leading-relaxed font-medium">
            {!sawProcessed
              ? 'Perhitungan SAW belum dilakukan oleh Admin untuk periode ini. Laporan belum tersedia.'
              : 'Anda belum memberikan persetujuan (ACC) pada halaman Validasi. Silakan setujui data terlebih dahulu sebelum mencetak.'}
          </span>
        </div>
      )}

      {canPrint && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Informasi Dokumen</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                { label: 'Desa', value: 'Sukamaju' },
                { label: 'Tahun Anggaran', value: '2025' },
                { label: 'Jumlah Penerima', value: `${approved.length} Orang` },
                { label: 'Tanggal Cetak', value: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{item.label}</p>
                  <p className="font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Preview Daftar Penerima</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">No</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Kepala Keluarga</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Alamat</th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai SAW</th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approved.map((r, i) => (
                    <tr key={r.masyarakatId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-400">{i + 1}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{r.namaMasyarakat}</td>
                      <td className="px-6 py-4 text-slate-500 hidden md:table-cell">{r.alamat}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-blue-600">{r.nilaiAkhir.toFixed(4)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
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
