import { useState } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Save, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AppData, Penilaian } from '../../data';

interface Props { data: AppData; setData: (d: AppData) => void; onNavigate?: (page: string) => void; }

export function InputPenilaian({ data, setData, onNavigate }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [tempPenilaian, setTempPenilaian] = useState<Record<number, Record<number, { subKriteriaId: number; nilai: number }>>>({});
  const [formErrors, setFormErrors] = useState<Record<number, number[]>>({});

  const getExistingPenilaian = (masyarakatId: number) =>
    data.penilaian.filter(p => p.masyarakatId === masyarakatId);

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const existing = getExistingPenilaian(id);
      const map: Record<number, { subKriteriaId: number; nilai: number }> = {};
      for (const p of existing) {
        map[p.kriteriaId] = { subKriteriaId: p.subKriteriaId, nilai: p.nilai };
      }
      setTempPenilaian(prev => ({ ...prev, [id]: map }));
      setFormErrors(prev => ({ ...prev, [id]: [] }));
    }
  };

  const setNilai = (masyarakatId: number, kriteriaId: number, subKriteriaId: number, nilai: number) => {
    setTempPenilaian(prev => ({
      ...prev,
      [masyarakatId]: {
        ...(prev[masyarakatId] || {}),
        [kriteriaId]: { subKriteriaId, nilai },
      },
    }));
    setFormErrors(prev => ({
      ...prev,
      [masyarakatId]: (prev[masyarakatId] || []).filter(k => k !== kriteriaId),
    }));
  };

  const savePenilaian = async (masyarakatId: number) => {
    const temp = tempPenilaian[masyarakatId] || {};
    const missing: number[] = [];
    for (const k of data.kriteria) {
      if (!temp[k.id]) missing.push(k.id);
    }
    if (missing.length > 0) {
      setFormErrors(prev => ({ ...prev, [masyarakatId]: missing }));
      toast.error(`Masih ada ${missing.length} kriteria yang belum diisi!`);
      return;
    }

    try {
      const newPenilaian: Penilaian[] = Object.entries(temp).map(([kId, val]) => ({
        masyarakatId,
        kriteriaId: Number(kId),
        subKriteriaId: val.subKriteriaId,
        nilai: val.nilai,
      }));

      const filtered = data.penilaian.filter(p => p.masyarakatId !== masyarakatId);
      const updatedPenilaian = [...filtered, ...newPenilaian];

      await axios.post('/api/penilaian/save-all', { penilaian: updatedPenilaian });

      setData({ ...data, penilaian: updatedPenilaian, sawProcessed: false, hasilSAW: [], approvedIds: {} });
      toast.success('Penilaian berhasil disimpan!');
      setExpandedId(null);
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan penilaian');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          {onNavigate && (
            <button
              onClick={() => onNavigate('masyarakat')}
              className="mt-1 sm:mt-0 p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
              title="Kembali ke Data Masyarakat"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Beri Penilaian Warga</h2>
            <p className="text-sm text-slate-500 mt-1">
              Masukkan nilai kriteria untuk setiap calon penerima. Gunakan dropdown untuk memilih nilai.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-600 whitespace-nowrap">Periode:</label>
          <input 
            type="month" 
            value={data.activePeriode || '2026-06'} 
            onChange={e => setData({...data, activePeriode: e.target.value})}
            className="px-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
          />
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl px-5 py-4 flex items-start gap-3 text-sm text-amber-800 shadow-sm">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-500" />
        <span className="font-medium leading-relaxed">Semua kriteria wajib diisi sebelum menyimpan. Jika ada yang terlewat, sistem akan menolak menyimpan data.</span>
      </div>

      <div className="space-y-4">
        {data.masyarakat.filter(m => !m.periode || m.periode === (data.activePeriode || '2026-06')).map((m) => {
          const isExpanded = expandedId === m.id;
          const existing = getExistingPenilaian(m.id);
          const isDinilai = existing.length === data.kriteria.length;
          const errors = formErrors[m.id] || [];

          return (
            <div key={m.id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-blue-200 shadow-md ring-4 ring-blue-50' : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'}`}>
              <button
                onClick={() => toggleExpand(m.id)}
                className="w-full flex items-center gap-4 px-6 py-5 bg-white text-left transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800 text-base">{m.nama}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isDinilai ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'}`}>
                      {isDinilai ? <><CheckCircle2 className="w-3.5 h-3.5" /> Lengkap</> : `${existing.length}/${data.kriteria.length} kriteria`}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mt-1">{m.nik} <span className="mx-1 text-slate-300">•</span> {m.alamat}</p>
                </div>
                <div className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                  {isExpanded ? <ChevronUp className="w-5 h-5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 flex-shrink-0" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-6 pb-6 pt-2">
                  <div className="pt-4 space-y-4">
                    {data.kriteria.map((k) => {
                      const subs = data.subKriteria.filter(s => s.kriteriaId === k.id).sort((a, b) => a.nilai - b.nilai);
                      const current = (tempPenilaian[m.id] || {})[k.id];
                      const hasError = errors.includes(k.id);

                      return (
                        <div key={k.id} className={`rounded-2xl border p-5 transition-all shadow-sm ${hasError ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-white'}`}>
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-3">
                                <span className="inline-block font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                                  {k.kode}
                                </span>
                                <span className="text-sm font-bold text-slate-800">{k.nama}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${k.atribut === 'Benefit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                  {k.atribut}
                                </span>
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Bobot: {k.bobot}%</span>
                              </div>
                              <div className="relative">
                                <select
                                  value={current ? current.subKriteriaId : ''}
                                  onChange={e => {
                                    const sub = subs.find(s => s.id === Number(e.target.value));
                                    if (sub) setNilai(m.id, k.id, sub.id, sub.nilai);
                                  }}
                                  className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-4 transition-all appearance-none cursor-pointer ${hasError ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500/20 bg-red-50' : 'border-slate-200 text-slate-700 focus:border-blue-500 focus:ring-blue-500/10 bg-white hover:border-slate-300'}`}
                                >
                                  <option value="">-- Pilih kondisi untuk kriteria ini --</option>
                                  {subs.map(s => (
                                    <option key={s.id} value={s.id}>
                                      [{s.nilai}] {s.nama}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${hasError ? 'text-red-400' : 'text-slate-400'}`} />
                              </div>
                              {hasError && <p className="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Pilihan ini wajib diisi</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end mt-6 pt-6 border-t border-slate-200/60">
                    <button
                      onClick={() => savePenilaian(m.id)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Penilaian
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
