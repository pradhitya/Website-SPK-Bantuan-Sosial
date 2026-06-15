import { useState } from 'react';
import { Calculator, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { AppData, calculateSAW } from '../../data';

interface Props { data: AppData; setData: (d: AppData) => void; }

type Tab = 'matrix' | 'normalisasi' | 'ranking';

export function HasilSAW({ data, setData }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('ranking');
  const [processing, setProcessing] = useState(false);

  const allDinilai = data.masyarakat.every(m => data.penilaian.some(p => p.masyarakatId === m.id));
  const belumDinilai = data.masyarakat.filter(m => !data.penilaian.some(p => p.masyarakatId === m.id));

  const handleProcess = () => {
    if (!allDinilai) {
      toast.error(`Masih ada ${belumDinilai.length} warga yang belum dinilai!`);
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      const hasil = calculateSAW(data.masyarakat, data.penilaian, data.kriteria, data.kuotaBansos);
      setData({ ...data, hasilSAW: hasil, sawProcessed: true, approvedIds: [] });
      toast.success('Perhitungan SAW berhasil diproses!');
      setProcessing(false);
    }, 800);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'matrix', label: 'Matriks Keputusan' },
    { id: 'normalisasi', label: 'Matriks Normalisasi' },
    { id: 'ranking', label: 'Hasil Akhir & Ranking' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900 font-semibold">Hasil Perhitungan SAW</h2>
        <p className="text-sm text-muted-foreground">Proses perhitungan Simple Additive Weighting untuk menentukan ranking penerima bansos</p>
      </div>

      {!allDinilai && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
          <div>
            <span className="font-semibold">Penilaian belum lengkap.</span>
            {' '}Masih ada {belumDinilai.length} warga yang belum dinilai:{' '}
            <span className="font-medium">{belumDinilai.map(m => m.nama).join(', ')}</span>.
            Silakan lengkapi di halaman Input Penilaian terlebih dahulu.
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">Status Perhitungan</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${data.sawProcessed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {data.sawProcessed ? <><CheckCircle2 className="w-3 h-3" /> SAW Sudah Diproses</> : 'Belum Diproses'}
              </span>
              {data.sawProcessed && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${data.approvedIds.length > 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {data.approvedIds.length > 0 ? <><CheckCircle2 className="w-3 h-3" /> Divalidasi Kades</> : 'Menunggu Validasi Kades'}
                </span>
              )}
            </div>
            {data.sawProcessed && (
              <p className="text-xs text-muted-foreground mt-2">
                Kuota Bansos: <strong>{data.kuotaBansos} orang</strong> | Total Kandidat: <strong>{data.masyarakat.length} orang</strong>
              </p>
            )}
          </div>
          <button
            onClick={handleProcess}
            disabled={processing || !allDinilai}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Calculator className="w-4 h-4" />
            {processing ? 'Memproses...' : 'PROSES HITUNG SAW'}
          </button>
        </div>
      </div>

      {data.sawProcessed && data.hasilSAW.length > 0 && (
        <>
          <div className="flex gap-1 bg-white rounded-xl border border-border p-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'matrix' && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-gray-900">Matriks Keputusan (X)</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Nilai asli dari setiap alternatif berdasarkan kriteria</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide sticky left-0 bg-gray-50">Nama</th>
                      {data.kriteria.map(k => (
                        <th key={k.id} className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                          <div>{k.kode}</div>
                          <div className={`text-xs font-normal mt-0.5 ${k.atribut === 'Benefit' ? 'text-green-600' : 'text-red-600'}`}>{k.atribut}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.hasilSAW.map(r => (
                      <tr key={r.masyarakatId} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-900 sticky left-0 bg-white">{r.namaMasyarakat}</td>
                        {data.kriteria.map(k => (
                          <td key={k.id} className="px-4 py-3 text-center font-mono text-gray-700">
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
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-gray-900">Matriks Normalisasi (R)</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Benefit: r<sub>ij</sub> = x<sub>ij</sub> / max(x<sub>j</sub>) | Cost: r<sub>ij</sub> = min(x<sub>j</sub>) / x<sub>ij</sub>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide sticky left-0 bg-gray-50">Nama</th>
                      {data.kriteria.map(k => (
                        <th key={k.id} className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          <div>{k.kode}</div>
                          <div className="text-xs font-normal text-muted-foreground/60">W={k.bobot}%</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.hasilSAW.map(r => (
                      <tr key={r.masyarakatId} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-900 sticky left-0 bg-white">{r.namaMasyarakat}</td>
                        {data.kriteria.map(k => (
                          <td key={k.id} className="px-4 py-3 text-center font-mono text-gray-700">
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
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Hasil Akhir & Ranking</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    V<sub>i</sub> = Σ(w<sub>j</sub> × r<sub>ij</sub>) | Kuota: {data.kuotaBansos} orang
                  </p>
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                  {data.approvedIds.length > 0 ? 'Telah Divalidasi Kades' : 'Menunggu Validasi Kepala Desa'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ranking</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Alamat</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nilai SAW (V)</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.hasilSAW.map(r => (
                      <tr key={r.masyarakatId} className={`hover:bg-gray-50 transition-colors ${r.ranking <= data.kuotaBansos ? 'bg-green-50/40' : ''}`}>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            r.ranking === 1 ? 'bg-yellow-400 text-yellow-900' :
                            r.ranking === 2 ? 'bg-gray-300 text-gray-700' :
                            r.ranking === 3 ? 'bg-orange-300 text-orange-800' :
                            r.ranking <= data.kuotaBansos ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {r.ranking}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900">{r.namaMasyarakat}</td>
                        <td className="px-5 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[180px]">{r.alamat}</td>
                        <td className="px-5 py-3 text-center">
                          <span className="font-mono font-semibold text-blue-700">{r.nilaiAkhir.toFixed(4)}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === 'Layak' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {r.status}
                          </span>
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
