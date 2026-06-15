import { useState } from 'react';
import { ChevronDown, ChevronUp, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppData, Penilaian } from '../../data';

interface Props { data: AppData; setData: (d: AppData) => void; }

export function InputPenilaian({ data, setData }: Props) {
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

  const savePenilaian = (masyarakatId: number) => {
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

    const newPenilaian: Penilaian[] = Object.entries(temp).map(([kId, val]) => ({
      masyarakatId,
      kriteriaId: Number(kId),
      subKriteriaId: val.subKriteriaId,
      nilai: val.nilai,
    }));

    const filtered = data.penilaian.filter(p => p.masyarakatId !== masyarakatId);
    setData({ ...data, penilaian: [...filtered, ...newPenilaian], sawProcessed: false, hasilSAW: [], approvedIds: [] });
    toast.success('Penilaian berhasil disimpan!');
    setExpandedId(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900 font-semibold">Input Penilaian</h2>
        <p className="text-sm text-muted-foreground">
          Masukkan nilai kriteria untuk setiap calon penerima. Gunakan dropdown untuk memilih nilai.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3 text-sm text-amber-800">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
        <span>Semua kriteria wajib diisi sebelum menyimpan. Jika ada yang terlewat, sistem akan menolak menyimpan data.</span>
      </div>

      <div className="space-y-2">
        {data.masyarakat.map((m) => {
          const isExpanded = expandedId === m.id;
          const existing = getExistingPenilaian(m.id);
          const isDinilai = existing.length === data.kriteria.length;
          const errors = formErrors[m.id] || [];

          return (
            <div key={m.id} className="bg-white rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => toggleExpand(m.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{m.nama}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isDinilai ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {isDinilai ? <><CheckCircle2 className="w-3 h-3" /> Lengkap</> : `${existing.length}/${data.kriteria.length} kriteria`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.nik} — {m.alamat}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
              </button>

              {isExpanded && (
                <div className="border-t border-border px-5 pb-5">
                  <div className="pt-4 space-y-3">
                    {data.kriteria.map((k) => {
                      const subs = data.subKriteria.filter(s => s.kriteriaId === k.id).sort((a, b) => a.nilai - b.nilai);
                      const current = (tempPenilaian[m.id] || {})[k.id];
                      const hasError = errors.includes(k.id);

                      return (
                        <div key={k.id} className={`rounded-lg border p-4 transition-colors ${hasError ? 'border-red-300 bg-red-50' : 'border-border bg-gray-50'}`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <span className="inline-block font-mono text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                {k.kode}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-gray-800">{k.nama}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${k.atribut === 'Benefit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {k.atribut}
                                </span>
                                <span className="text-xs text-muted-foreground">Bobot: {k.bobot}%</span>
                              </div>
                              <div className="mt-2">
                                <select
                                  value={current ? current.subKriteriaId : ''}
                                  onChange={e => {
                                    const sub = subs.find(s => s.id === Number(e.target.value));
                                    if (sub) setNilai(m.id, k.id, sub.id, sub.nilai);
                                  }}
                                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${hasError ? 'border-red-400' : 'border-gray-300'}`}
                                >
                                  <option value="">-- Pilih kondisi --</option>
                                  {subs.map(s => (
                                    <option key={s.id} value={s.id}>
                                      [{s.nilai}] {s.nama}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {hasError && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Wajib diisi</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => savePenilaian(m.id)}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
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
