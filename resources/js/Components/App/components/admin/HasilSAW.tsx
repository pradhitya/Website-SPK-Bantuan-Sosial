import { useState } from 'react';
import axios from 'axios';
import { Calculator, AlertCircle, CheckCircle2, ChevronRight, Download, Printer, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppData } from '../../data';
import { ConfirmDialog } from '../ConfirmDialog';

interface Props { data: AppData; setData: (d: AppData) => void; }

type Tab = 'matrix' | 'normalisasi' | 'ranking';

export function HasilSAW({ data, setData }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('ranking');
  const [processing, setProcessing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const activePeriode = data.activePeriode || '2026-06';
  const currentMasyarakat = data.masyarakat.filter(m => (!m.periode || m.periode === activePeriode) && (!data.activeJenisBantuanId || m.jenis_bantuan_id == data.activeJenisBantuanId));
  const allDinilai = currentMasyarakat.length > 0 && currentMasyarakat.every(m => data.penilaian.some(p => p.masyarakatId === m.id));
  const belumDinilai = currentMasyarakat.filter(m => !data.penilaian.some(p => p.masyarakatId === m.id));

  const filteredHasilSAW = data.hasilSAW.filter(h => h.periode === activePeriode && (!data.activeJenisBantuanId || h.jenis_bantuan_id == data.activeJenisBantuanId));
  const sawProcessed = filteredHasilSAW.length > 0;
  const approvalKey = activePeriode + (data.activeJenisBantuanId ? '_' + data.activeJenisBantuanId : '');
  const currentApproved = data.approvedIds[approvalKey] || [];

  // Detect orphan data (SAW results where masyarakat was deleted)
  const orphanHasil = filteredHasilSAW.filter(h => !h.namaMasyarakat || h.namaMasyarakat === '');

  const handleProcess = async () => {
    if (!allDinilai) {
      toast.error(`Masih ada ${belumDinilai.length} warga yang belum dinilai!`);
      return;
    }
    setProcessing(true);
    try {
      const response = await axios.post('/api/penilaian/process-saw', { 
        periode: activePeriode,
        jenis_bantuan_id: data.activeJenisBantuanId
      });
      const hasil = response.data.hasilSAW || [];
      
      // Filter out old results for this specific bantuan+periode, keep other programs' results
      const newHasilSAW = [
        ...data.hasilSAW.filter(h => !(h.periode === activePeriode && h.jenis_bantuan_id == data.activeJenisBantuanId)),
        ...hasil
      ];
      setData({ ...data, hasilSAW: newHasilSAW, sawProcessed: true, approvedIds: { ...data.approvedIds, [approvalKey]: [] } });
      toast.success('Perhitungan SAW berhasil diproses oleh sistem!');
    } catch (e) {
      console.error(e);
      toast.error('Gagal memproses perhitungan SAW');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    const jenisParam = data.activeJenisBantuanId ? `&jenis_bantuan_id=${data.activeJenisBantuanId}` : '';
    window.open(`/api/cetak-sk?periode=${activePeriode}${jenisParam}`, '_blank');
  };

  const handleExport = () => {
    const jenisParam = data.activeJenisBantuanId ? `&jenis_bantuan_id=${data.activeJenisBantuanId}` : '';
    window.open(`/api/export-hasil-saw?periode=${activePeriode}${jenisParam}`, '_blank');
  };

  const handleResetSaw = async () => {
    setResetting(true);
    try {
      await axios.post('/api/penilaian/reset-saw', {
        periode: activePeriode,
        jenis_bantuan_id: data.activeJenisBantuanId,
      });
      // Remove SAW results for this bantuan+periode from state
      const newHasilSAW = data.hasilSAW.filter(h => !(h.periode === activePeriode && h.jenis_bantuan_id == data.activeJenisBantuanId));
      const newApprovedIds = { ...data.approvedIds };
      delete newApprovedIds[approvalKey];
      // Also remove related klaim bantuans
      const removedHasilIds = filteredHasilSAW.map(h => h.id);
      const newKlaimBantuans = data.klaimBantuans.filter(k => !removedHasilIds.includes(k.hasil_saw_id));
      setData({ ...data, hasilSAW: newHasilSAW, sawProcessed: false, approvedIds: newApprovedIds, klaimBantuans: newKlaimBantuans });
      toast.success('Perhitungan SAW berhasil dibatalkan');
    } catch (e) {
      console.error(e);
      toast.error('Gagal membatalkan perhitungan SAW');
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'matrix', label: 'MATRIKS KEPUTUSAN' },
    { id: 'normalisasi', label: 'MATRIKS NORMALISASI' },
    { id: 'ranking', label: 'HASIL AKHIR & RANKING' },
  ];

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">HASIL PERHITUNGAN SAW</h2>
          <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">PROSES PERHITUNGAN SIMPLE ADDITIVE WEIGHTING UNTUK MENENTUKAN RANKING PENERIMA BANSOS</p>
        </div>
      </div>

      {!allDinilai && (
        <div className="flex items-start gap-4 px-6 py-5 bg-rose-400 border-4 border-[#1E3A5F] shadow-none text-[#1E3A5F] rounded-none animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0 text-[#1E3A5F]" />
          <div className="leading-relaxed">
            <span className="font-black text-sm uppercase tracking-widest">PENILAIAN BELUM LENGKAP.</span>
            {' '}MASIH ADA <span className="font-black underline decoration-[#1E3A5F] underline-offset-4">{belumDinilai.length} WARGA</span> YANG BELUM DINILAI:{' '}
            <span className="font-bold text-xs">{belumDinilai.map(m => m.nama).join(', ')}</span>.
            <br className="hidden sm:block mt-1" /> SILAKAN LENGKAPI DI HALAMAN INPUT PENILAIAN TERLEBIH DAHULU.
          </div>
        </div>
      )}

      {orphanHasil.length > 0 && (
        <div className="flex items-start gap-4 px-6 py-5 bg-amber-400 border-4 border-[#1E3A5F] shadow-none text-[#1E3A5F] rounded-none animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0 text-[#1E3A5F]" />
          <div className="leading-relaxed">
            <span className="font-black text-sm uppercase tracking-widest">DATA TIDAK VALID.</span>
            {' '}ADA <span className="font-black underline decoration-[#1E3A5F] underline-offset-4">{orphanHasil.length} HASIL SAW</span> YANG DATANYA SUDAH DIHAPUS.
            <br className="hidden sm:block mt-1" /> SILAKAN BATALKAN PERHITUNGAN DAN PROSES ULANG DENGAN DATA TERBARU.
          </div>
        </div>
      )}

      <div className="bg-white rounded-none border-4 border-[#1E3A5F] p-6 shadow-none">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-end border-b-4 border-[#1E3A5F] pb-6">
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest mb-2">PERIODE BANTUAN</label>
            <input 
              type="month" 
              value={activePeriode} 
              onChange={e => setData({...data, activePeriode: e.target.value})}
              className="w-full sm:w-auto px-4 py-3 border-2 border-[#1E3A5F] rounded-none shadow-none text-sm font-bold uppercase focus:outline-none focus:border-[#2563EB] transition-colors bg-white"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest mb-3">STATUS PERHITUNGAN</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest border-2 shadow-none ${sawProcessed ? 'bg-emerald-400 text-[#1E3A5F] border-[#1E3A5F]' : 'bg-white text-[#1E3A5F] border-[#1E3A5F]'}`}>
                {sawProcessed ? <><CheckCircle2 className="w-4 h-4" /> SAW SUDAH DIPROSES</> : 'BELUM DIPROSES'}
              </span>
              {sawProcessed && (
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest border-2 shadow-none ${currentApproved.length > 0 ? 'bg-emerald-400 text-[#1E3A5F] border-[#1E3A5F]' : 'bg-amber-400 text-[#1E3A5F] border-[#1E3A5F]'}`}>
                  {currentApproved.length > 0 ? <><CheckCircle2 className="w-4 h-4" /> DIVALIDASI KADES</> : 'MENUNGGU VALIDASI KADES'}
                </span>
              )}
            </div>
            {sawProcessed && (
              <div className="flex items-center gap-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest mt-4 bg-[#FAFAFA] w-fit px-4 py-2 rounded-none border-2 border-[#1E3A5F] shadow-none">
                <span>KUOTA BANSOS: <strong className="text-sm">{data.kuotaBansos} ORANG</strong></span>
                <span className="w-1.5 h-1.5 bg-[#1E3A5F]"></span>
                <span>TOTAL KANDIDAT: <strong className="text-sm">{currentMasyarakat.length} ORANG</strong></span>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {sawProcessed && (
              <button
                onClick={() => setConfirmReset(true)}
                disabled={resetting}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-none bg-white border-2 border-red-600 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white disabled:opacity-50 transition-colors shadow-none"
              >
                {resetting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                {resetting ? 'MEMBATALKAN...' : 'BATALKAN PERHITUNGAN'}
              </button>
            )}
            <button
              onClick={handleProcess}
              disabled={processing || !allDinilai || currentMasyarakat.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-none bg-[#1E3A5F] border-2 border-[#1E3A5F] text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#1E3A5F] disabled:opacity-50 disabled:hover:bg-[#1E3A5F] disabled:hover:text-white transition-colors shadow-none"
            >
              <Calculator className="w-5 h-5" />
              {processing ? 'MEMPROSES...' : sawProcessed ? 'PROSES ULANG SAW' : 'PROSES HITUNG SAW'}
            </button>
          </div>
        </div>
      </div>

      {sawProcessed && filteredHasilSAW.length > 0 && (
        <>
          <div className="flex gap-3">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-3 px-4 rounded-none text-[10px] font-black uppercase tracking-widest transition-all border-2 border-[#1E3A5F] ${activeTab === t.id ? 'bg-[#1E3A5F] text-white shadow-none' : 'bg-white text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white shadow-none'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'matrix' && (
            <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden shadow-none">
              <div className="px-6 py-5 border-b-4 border-[#1E3A5F] bg-[#FAFAFA]">
                <h3 className="font-black text-lg text-[#1E3A5F] uppercase tracking-widest">MATRIKS KEPUTUSAN (X)</h3>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">NILAI ASLI DARI SETIAP ALTERNATIF BERDASARKAN KRITERIA</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white border-b-4 border-[#1E3A5F]">
                      <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest sticky left-0 bg-white">NAMA</th>
                      {data.kriteria.map(k => (
                        <th key={k.id} className="text-center px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest whitespace-nowrap border-l-2 border-[#E2E8F0]">
                          <div className="text-sm">{k.kode}</div>
                          <div className={`text-[9px] px-2 py-0.5 rounded-none inline-block mt-2 border-2 border-[#1E3A5F] shadow-none ${k.atribut === 'Benefit' ? 'bg-emerald-400 text-[#1E3A5F]' : 'bg-rose-400 text-[#1E3A5F]'}`}>{k.atribut}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#E2E8F0]">
                    {filteredHasilSAW.map(r => (
                      <tr key={r.masyarakatId} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-3 py-3 font-black text-sm text-[#1E3A5F] sticky left-0 bg-white uppercase tracking-widest">{r.namaMasyarakat}</td>
                        {data.kriteria.map(k => (
                          <td key={k.id} className="px-3 py-3 text-center font-black text-sm text-[#1E3A5F] border-l-2 border-[#E2E8F0]">
                            {r.nilaiPerKriteria[k.id] ?? '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'normalisasi' && (
            <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden shadow-none">
              <div className="px-6 py-5 border-b-4 border-[#1E3A5F] bg-[#FAFAFA]">
                <h3 className="font-black text-lg text-[#1E3A5F] uppercase tracking-widest">MATRIKS NORMALISASI (R)</h3>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-2 flex flex-wrap gap-2">
                  <span className="bg-emerald-400 text-[#1E3A5F] font-black px-2 py-1 border-2 border-[#1E3A5F] shadow-none">BENEFIT: R<sub>IJ</sub> = X<sub>IJ</sub> / MAX(X<sub>J</sub>)</span>
                  <span className="bg-rose-400 text-[#1E3A5F] font-black px-2 py-1 border-2 border-[#1E3A5F] shadow-none">COST: R<sub>IJ</sub> = MIN(X<sub>J</sub>) / X<sub>IJ</sub></span>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white border-b-4 border-[#1E3A5F]">
                      <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest sticky left-0 bg-white">NAMA</th>
                      {data.kriteria.map(k => (
                        <th key={k.id} className="text-center px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest border-l-2 border-[#E2E8F0]">
                          <div className="text-sm">{k.kode}</div>
                          <div className="text-[9px] px-2 py-0.5 rounded-none inline-block bg-[#1E3A5F] text-white mt-2 font-black border-2 border-[#1E3A5F] shadow-none">W={k.bobot}%</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#E2E8F0]">
                    {filteredHasilSAW.map(r => (
                      <tr key={r.masyarakatId} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-3 py-3 font-black text-sm text-[#1E3A5F] sticky left-0 bg-white uppercase tracking-widest">{r.namaMasyarakat}</td>
                        {data.kriteria.map(k => (
                          <td key={k.id} className="px-3 py-3 text-center font-bold text-sm text-[#1E3A5F] border-l-2 border-[#E2E8F0]">
                            {r.normalisasi[k.id]?.toFixed(4) ?? '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ranking' && (
            <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden shadow-none">
              <div className="px-6 py-5 border-b-4 border-[#1E3A5F] bg-[#FAFAFA] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="font-black text-lg text-[#1E3A5F] uppercase tracking-widest">HASIL AKHIR & RANKING</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px]">
                    <span className="font-black bg-white text-[#1E3A5F] px-2 py-1 rounded-none border-2 border-[#1E3A5F] shadow-none uppercase">V<sub>I</sub> = Î£(W<sub>J</sub> Ã— R<sub>IJ</sub>)</span>
                    <span className="bg-[#1E3A5F] text-white px-2 py-1 rounded-none border-2 border-[#1E3A5F] shadow-none font-black uppercase tracking-widest">KUOTA: {data.kuotaBansos} ORANG</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`text-[10px] font-black px-4 py-2.5 rounded-none border-2 shadow-none uppercase tracking-widest ${currentApproved.length > 0 ? 'bg-emerald-400 text-[#1E3A5F] border-[#1E3A5F]' : 'bg-amber-400 text-[#1E3A5F] border-[#1E3A5F]'}`}>
                    {currentApproved.length > 0 ? 'TELAH DIVALIDASI KADES' : 'MENUNGGU VALIDASI KEPALA DESA'}
                  </span>
                  {currentApproved.length > 0 && (
                    <>
                      <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] text-[10px] font-black hover:bg-[#1E3A5F] hover:text-white uppercase tracking-widest transition-colors shadow-none"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">EXPORT CSV</span>
                      </button>
                      <button
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-none border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-[10px] font-black hover:bg-white hover:text-[#1E3A5F] uppercase tracking-widest transition-colors shadow-none"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">CETAK PDF</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white border-b-4 border-[#1E3A5F]">
                      <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">RANKING</th>
                      <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">NAMA</th>
                      <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest hidden md:table-cell">ALAMAT</th>
                      <th className="text-center px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">NILAI SAW (V)</th>
                      <th className="text-center px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">STATUS</th>
                      <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">CATATAN KADES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#E2E8F0]">
                    {filteredHasilSAW.map(r => (
                      <tr key={r.masyarakatId} className={`transition-colors ${r.ranking <= data.kuotaBansos ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-[#FAFAFA]'}`}>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1.5 rounded-none text-sm font-black border-2 border-[#1E3A5F] shadow-none ${
                            r.ranking === 1 ? 'bg-amber-300 text-[#1E3A5F]' :
                            r.ranking === 2 ? 'bg-slate-300 text-[#1E3A5F]' :
                            r.ranking === 3 ? 'bg-orange-400 text-[#1E3A5F]' :
                            r.ranking <= data.kuotaBansos ? 'bg-white text-[#1E3A5F]' : 'bg-[#FAFAFA] text-[#64748B]'
                          }`}>
                            {r.ranking}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-black text-[#1E3A5F] uppercase tracking-widest">{r.namaMasyarakat}</td>
                        <td className="px-3 py-3 text-[10px] font-bold text-[#64748B] hidden md:table-cell truncate max-w-[200px] uppercase tracking-widest" title={r.alamat}>{r.alamat}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-black text-[#1E3A5F] bg-white px-3 py-1.5 rounded-none border-2 border-[#1E3A5F] shadow-none">{r.nilaiAkhir.toFixed(4)}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest border-2 shadow-none ${r.status === 'Layak' ? 'bg-emerald-400 text-[#1E3A5F] border-[#1E3A5F]' : 'bg-rose-400 text-[#1E3A5F] border-[#1E3A5F]'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-[#1E3A5F]">
                          {r.catatan ? (
                            <span className="font-black bg-rose-200 px-3 py-1.5 rounded-none border-2 border-[#1E3A5F] uppercase tracking-widest inline-block shadow-none">"{r.catatan}"</span>
                          ) : <span className="text-[#64748B] font-bold">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-[#FAFAFA] border-t-4 border-[#1E3A5F] flex items-center gap-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">
                <ChevronRight className="w-4 h-4" />
                BARIS BERWARNA HIJAU MENUNJUKKAN WARGA YANG MASUK DALAM KUOTA PENERIMA BANSOS ({data.kuotaBansos} ORANG TERATAS)
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="BATALKAN PERHITUNGAN SAW"
        message={`Yakin ingin membatalkan seluruh hasil perhitungan SAW untuk periode ${activePeriode}? Semua data ranking, approval kades, dan klaim bantuan terkait akan dihapus. Data calon penerima dan penilaian tetap tersimpan.`}
        confirmLabel="YA, BATALKAN"
        onConfirm={handleResetSaw}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
