import { useState } from 'react';
import { FileText, Printer, AlertCircle, Filter, Download } from 'lucide-react';
import { AppData } from '../../data';

interface Props { data: AppData; }

export function LaporanKades({ data }: Props) {
  const [periode, setPeriode] = useState(data.activePeriode || '2026-06');
  const [selectedBantuan, setSelectedBantuan] = useState<string>('all');
  
  const filteredHasilSAW = selectedBantuan === 'all'
    ? data.hasilSAW.filter(h => h.periode === periode)
    : data.hasilSAW.filter(h => h.periode === periode && String(h.jenis_bantuan_id) === selectedBantuan);

  const approved = filteredHasilSAW.filter(r => {
    if (r.status_approval === 'disetujui') return true;
    const k = periode + '_' + r.jenis_bantuan_id;
    const currentApproved = data.approvedIds[k] || [];
    return currentApproved.some(id => String(id) === String(r.masyarakatId));
  });

  const sawProcessed = filteredHasilSAW.length > 0;
  const canPrint = approved.length > 0;

  const handleExportPDF = () => {
    const jenisParam = selectedBantuan !== 'all' ? `&jenis_bantuan_id=${selectedBantuan}` : '';
    window.open(`/api/cetak-sk?periode=${periode}${jenisParam}`, '_blank');
  };

  const handleExport = () => {
    const jenisParam = selectedBantuan !== 'all' ? `&jenis_bantuan_id=${selectedBantuan}` : '';
    window.open(`/api/export-hasil-saw?periode=${periode}${jenisParam}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b-4 border-[#1E3A5F] pb-4">
        <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">CETAK LAPORAN FINAL</h2>
        <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">EKSPOR DAFTAR RESMI PENERIMA BANSOS YANG TELAH ANDA SAHKAN</p>
      </div>

      <div className="bg-white p-5 border-4 border-[#1E3A5F] flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">PERIODE</label>
            <input 
              type="month" 
              value={periode} 
              onChange={e => setPeriode(e.target.value)}
              className="px-4 py-3 border-2 border-[#1E3A5F] rounded-none text-xs font-bold uppercase focus:outline-none focus:border-blue-600 transition-colors bg-white w-full sm:w-auto"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">PROGRAM</label>
            <select
              value={selectedBantuan}
              onChange={e => setSelectedBantuan(e.target.value)}
              className="px-4 py-3 border-2 border-[#1E3A5F] rounded-none text-xs font-bold uppercase focus:outline-none focus:border-blue-600 transition-colors bg-white appearance-none pr-10 w-full sm:w-auto"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231E3A5F' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', backgroundRepeat: 'no-repeat' }}
            >
              <option value="all">SEMUA BANTUAN SOSIAL</option>
              {data.jenisBantuan.map(jb => (
                <option key={jb.id} value={jb.id}>{jb.nama_program.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleExport}
            disabled={!canPrint}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 border-4 border-[#1E3A5F] bg-[#10B981] text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={!canPrint}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 border-4 border-[#1E3A5F] bg-[#3B82F6] text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            <span>CETAK PDF</span>
          </button>
        </div>
      </div>

      {!canPrint && (
        <div className="flex items-start gap-4 p-6 bg-amber-300 border-4 border-[#1E3A5F] rounded-none">
          <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0 text-[#1E3A5F]" />
          <span className="leading-relaxed font-black text-[#1E3A5F] uppercase tracking-widest text-xs">
            {!sawProcessed
              ? 'DATA TIDAK DITEMUKAN ATAU PERHITUNGAN SAW BELUM DILAKUKAN OLEH ADMIN UNTUK PARAMETER YANG DIPILIH.'
              : 'ANDA BELUM MEMBERIKAN PERSETUJUAN (ACC) PADA HALAMAN VALIDASI. SILAKAN SETUJUI DATA TERLEBIH DAHULU SEBELUM MENCETAK.'}
          </span>
        </div>
      )}

      {canPrint && (
        <>
          <div className="bg-white rounded-none border-4 border-[#1E3A5F] p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-200 border-2 border-[#1E3A5F] rounded-none">
                <Filter className="w-6 h-6 text-[#1E3A5F]" />
              </div>
              <h3 className="font-black text-[#1E3A5F] text-lg uppercase tracking-widest">INFORMASI DOKUMEN</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
              {[
                { label: 'DESA', value: 'SUKAMAJU' },
                { label: 'TAHUN ANGGARAN', value: periode.split('-')[0] || '2026' },
                { label: 'JUMLAH PENERIMA', value: `${approved.length} ORANG` },
                { label: 'TANGGAL CETAK', value: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase() },
              ].map((item, i) => (
                <div key={i} className="bg-[#FAFAFA] border-2 border-[#1E3A5F] rounded-none p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-2">{item.label}</p>
                  <p className="font-black text-[#1E3A5F] text-sm tracking-wider">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden">
            <div className="px-6 py-6 border-b-4 border-[#1E3A5F] bg-[#FAFAFA] flex items-center gap-4">
              <div className="p-3 bg-blue-200 border-2 border-[#1E3A5F] rounded-none">
                <FileText className="w-6 h-6 text-[#1E3A5F]" />
              </div>
              <h3 className="font-black text-[#1E3A5F] text-lg uppercase tracking-widest">PREVIEW DAFTAR PENERIMA</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1E3A5F] border-b-4 border-[#1E3A5F]">
                    <th className="text-left px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest border-r-2 border-[#1E3A5F]/20">NO</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest border-r-2 border-[#1E3A5F]/20">NAMA KEPALA KELUARGA</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest hidden md:table-cell border-r-2 border-[#1E3A5F]/20">ALAMAT</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest border-r-2 border-[#1E3A5F]/20">JENIS BANTUAN</th>
                    <th className="text-center px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest border-r-2 border-[#1E3A5F]/20">NILAI SAW</th>
                    <th className="text-center px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest">STATUS VALIDASI</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#1E3A5F]">
                  {approved.map((r, i) => {
                    const programName = data.jenisBantuan.find(j => j.id === r.jenis_bantuan_id)?.nama_program || '-';
                    return (
                      <tr key={r.masyarakatId + '_' + r.jenis_bantuan_id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-6 py-4 font-black text-[#1E3A5F] border-r-2 border-[#1E3A5F]">{i + 1}</td>
                        <td className="px-6 py-4 font-black text-[#1E3A5F] uppercase tracking-wider border-r-2 border-[#1E3A5F]">{r.namaMasyarakat}</td>
                        <td className="px-6 py-4 text-[10px] font-bold text-[#64748B] hidden md:table-cell uppercase tracking-widest border-r-2 border-[#1E3A5F]">{r.alamat}</td>
                        <td className="px-6 py-4 border-r-2 border-[#1E3A5F]">
                          <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-[#1E3A5F] font-black text-[10px] uppercase tracking-widest border-2 border-[#1E3A5F]">
                            {programName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-black text-[#1E3A5F] border-r-2 border-[#1E3A5F]">{r.nilaiAkhir.toFixed(4)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 bg-emerald-300 text-[#1E3A5F] font-black text-[10px] uppercase tracking-widest border-2 border-[#1E3A5F]">
                            DISETUJUI
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
