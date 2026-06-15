import { useState } from 'react';
import axios from 'axios';
import { Calculator, AlertCircle, CheckCircle2, ChevronRight, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { AppData, calculateSAW } from '../../data';

interface Props { data: AppData; setData: (d: AppData) => void; }

type Tab = 'matrix' | 'normalisasi' | 'ranking';

export function HasilSAW({ data, setData }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('ranking');
  const [processing, setProcessing] = useState(false);

  const allDinilai = data.masyarakat.every(m => data.penilaian.some(p => p.masyarakatId === m.id));
  const belumDinilai = data.masyarakat.filter(m => !data.penilaian.some(p => p.masyarakatId === m.id));

  const activePeriode = data.activePeriode || '2026-06';
  const filteredHasilSAW = data.hasilSAW.filter(h => h.periode === activePeriode);
  const sawProcessed = filteredHasilSAW.length > 0;
  const currentApproved = data.approvedIds[activePeriode] || [];

  const handleProcess = async () => {
    if (!allDinilai) {
      toast.error(`Masih ada ${belumDinilai.length} warga yang belum dinilai!`);
      return;
    }
    setProcessing(true);
    try {
      const hasil = calculateSAW(data.masyarakat, data.penilaian, data.kriteria, data.kuotaBansos, activePeriode);
      await axios.post('/api/penilaian/save-hasil-saw', { hasilSAW: hasil, periode: activePeriode });
      
      const newHasilSAW = [...data.hasilSAW.filter(h => h.periode !== activePeriode), ...hasil];
      setData({ ...data, hasilSAW: newHasilSAW, sawProcessed: true, approvedIds: { ...data.approvedIds, [activePeriode]: [] } });
      toast.success('Perhitungan SAW berhasil diproses!');
    } catch (e) {
      console.error(e);
      toast.error('Gagal memproses perhitungan SAW');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    window.open(`/api/cetak-sk?periode=${activePeriode}`, '_blank');
  };

  const handleExport = () => {
    window.open(`/api/export-hasil-saw?periode=${activePeriode}`, '_blank');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'matrix', label: 'Matriks Keputusan' },
    { id: 'normalisasi', label: 'Matriks Normalisasi' },
    { id: 'ranking', label: 'Hasil Akhir & Ranking' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Hasil Perhitungan SAW</h2>
          <p className="text-sm text-slate-500 mt-1">Proses perhitungan Simple Additive Weighting untuk menentukan ranking penerima bansos</p>
        </div>
      </div>

      {!allDinilai && (
        <div className="flex items-start gap-3 px-5 py-4 bg-rose-50/50 border border-rose-200/60 rounded-xl text-sm text-rose-800 shadow-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-rose-500" />
          <div className="leading-relaxed">
            <span className="font-bold">Penilaian belum lengkap.</span>
            {' '}Masih ada <span className="font-bold underline decoration-rose-300 underline-offset-2">{belumDinilai.length} warga</span> yang belum dinilai:{' '}
            <span className="font-medium">{belumDinilai.map(m => m.nama).join(', ')}</span>.
            <br className="hidden sm:block" /> Silakan lengkapi di halaman Input Penilaian terlebih dahulu.
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="mb-5 flex flex-col sm:flex-row gap-4 items-end border-b border-slate-100 pb-5">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-bold text-slate-600 mb-2">Periode Bantuan</label>
            <input 
              type="month" 
              value={activePeriode} 
              onChange={e => setData({...data, activePeriode: e.target.value})}
              className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 mb-2.5">Status Perhitungan</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${sawProcessed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                {sawProcessed ? <><CheckCircle2 className="w-4 h-4" /> SAW Sudah Diproses</> : 'Belum Diproses'}
              </span>
              {sawProcessed && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${currentApproved.length > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'}`}>
                  {currentApproved.length > 0 ? <><CheckCircle2 className="w-4 h-4" /> Divalidasi Kades</> : 'Menunggu Validasi Kades'}
                </span>
              )}
            </div>
            {sawProcessed && (
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-3 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                <span>Kuota Bansos: <strong className="text-slate-700">{data.kuotaBansos} orang</strong></span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>Total Kandidat: <strong className="text-slate-700">{data.masyarakat.length} orang</strong></span>
              </div>
            )}
          </div>
          <button
            onClick={handleProcess}
            disabled={processing || !allDinilai}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all"
          >
            <Calculator className="w-4 h-4" />
            {processing ? 'Memproses...' : 'PROSES HITUNG SAW'}
          </button>
        </div>
      </div>

      {sawProcessed && filteredHasilSAW.length > 0 && (
        <>
          <div className="flex gap-2 bg-slate-100/80 rounded-xl border border-slate-200 p-1.5 shadow-sm">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === t.id ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'matrix' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
                <h3 className="font-bold text-slate-800 text-lg">Matriks Keputusan (X)</h3>
                <p className="text-sm text-slate-500 mt-1">Nilai asli dari setiap alternatif berdasarkan kriteria</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50/90 backdrop-blur">Nama</th>
                      {data.kriteria.map(k => (
                        <th key={k.id} className="text-center px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          <div className="font-mono text-slate-700">{k.kode}</div>
                          <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1.5 ${k.atribut === 'Benefit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{k.atribut}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHasilSAW.map(r => (
                      <tr key={r.masyarakatId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700 sticky left-0 bg-white/90 backdrop-blur">{r.namaMasyarakat}</td>
                        {data.kriteria.map(k => (
                          <td key={k.id} className="px-4 py-4 text-center font-mono font-medium text-slate-600">
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
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
                <h3 className="font-bold text-slate-800 text-lg">Matriks Normalisasi (R)</h3>
                <p className="text-sm text-slate-500 mt-1">
                  <span className="font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-xs mr-2 border border-emerald-100">Benefit: r<sub>ij</sub> = x<sub>ij</sub> / max(x<sub>j</sub>)</span>
                  <span className="font-mono bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-xs border border-rose-100">Cost: r<sub>ij</sub> = min(x<sub>j</sub>) / x<sub>ij</sub></span>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50/90 backdrop-blur">Nama</th>
                      {data.kriteria.map(k => (
                        <th key={k.id} className="text-center px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <div className="font-mono text-slate-700">{k.kode}</div>
                          <div className="text-[10px] px-2 py-0.5 rounded-full inline-block bg-slate-100 text-slate-600 mt-1.5">W={k.bobot}%</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHasilSAW.map(r => (
                      <tr key={r.masyarakatId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700 sticky left-0 bg-white/90 backdrop-blur">{r.namaMasyarakat}</td>
                        {data.kriteria.map(k => (
                          <td key={k.id} className="px-4 py-4 text-center font-mono font-medium text-slate-600">
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
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Hasil Akhir & Ranking</h3>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-3">
                    <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs border border-blue-100">V<sub>i</sub> = Σ(w<sub>j</sub> × r<sub>ij</sub>)</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">Kuota: {data.kuotaBansos} orang</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xs font-bold px-4 py-2 rounded-xl border ${currentApproved.length > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60'}`}>
                    {currentApproved.length > 0 ? 'Telah Divalidasi Kades' : 'Menunggu Validasi Kepala Desa'}
                  </span>
                  {currentApproved.length > 0 && (
                    <>
                      <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Export CSV</span>
                      </button>
                      <button
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cetak PDF</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ranking</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Alamat</th>
                      <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai SAW (V)</th>
                      <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Catatan Kades</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHasilSAW.map(r => (
                      <tr key={r.masyarakatId} className={`transition-colors ${r.ranking <= data.kuotaBansos ? 'bg-emerald-50/30 hover:bg-emerald-50/60' : 'hover:bg-slate-50/50'}`}>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-black shadow-sm ${
                            r.ranking === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 border border-yellow-400' :
                            r.ranking === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 border border-slate-300' :
                            r.ranking === 3 ? 'bg-gradient-to-br from-orange-200 to-orange-400 text-orange-900 border border-orange-300' :
                            r.ranking <= data.kuotaBansos ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {r.ranking}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{r.namaMasyarakat}</td>
                        <td className="px-6 py-4 text-slate-500 hidden md:table-cell truncate max-w-[200px]" title={r.alamat}>{r.alamat}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-mono font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{r.nilaiAkhir.toFixed(4)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${r.status === 'Layak' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {r.catatan ? (
                            <span className="italic font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">"{r.catatan}"</span>
                          ) : <span className="text-slate-300">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                <ChevronRight className="w-3 h-3" />
                Baris berwarna hijau menunjukkan warga yang masuk dalam kuota penerima bansos ({data.kuotaBansos} orang teratas)
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
