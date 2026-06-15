import { useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, Info, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppData, Kriteria, SubKriteria } from '../../data';
import { ConfirmDialog } from '../ConfirmDialog';

interface Props {
  data: AppData;
  setData: (d: AppData) => void;
}

interface KriteriaForm { kode: string; nama: string; atribut: 'Benefit' | 'Cost'; bobot: number; }
interface SubForm { nama: string; nilai: number; }

const emptyKriteriaForm: KriteriaForm = { kode: '', nama: '', atribut: 'Cost', bobot: 0 };
const emptySubForm: SubForm = { nama: '', nilai: 1 };

export function DataKriteria({ data, setData }: Props) {
  const [showKriteriaModal, setShowKriteriaModal] = useState(false);
  const [editKriteria, setEditKriteria] = useState<Kriteria | null>(null);
  const [kriteriaForm, setKriteriaForm] = useState<KriteriaForm>(emptyKriteriaForm);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [expandedKriteria, setExpandedKriteria] = useState<number | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [editSub, setEditSub] = useState<SubKriteria | null>(null);
  const [subForm, setSubForm] = useState<SubForm>(emptySubForm);
  const [confirmDeleteSub, setConfirmDeleteSub] = useState<number | null>(null);

  const totalBobot = data.kriteria.reduce((s, k) => s + k.bobot, 0);

  const openAddKriteria = () => {
    let nextKode = 'C1';
    if (data.kriteria.length > 0) {
      const numbers = data.kriteria
        .map(k => {
          const match = k.kode.match(/^C(\d+)$/i);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => n > 0);
      
      if (numbers.length > 0) {
        const maxNumber = Math.max(...numbers);
        nextKode = `C${maxNumber + 1}`;
      }
    }

    setEditKriteria(null);
    setKriteriaForm({ ...emptyKriteriaForm, kode: nextKode });
    setShowKriteriaModal(true);
  };

  const openEditKriteria = (k: Kriteria) => {
    setEditKriteria(k);
    setKriteriaForm({ kode: k.kode, nama: k.nama, atribut: k.atribut, bobot: k.bobot });
    setShowKriteriaModal(true);
  };

  const saveKriteria = async () => {
    if (!kriteriaForm.kode || !kriteriaForm.nama || kriteriaForm.bobot <= 0) {
      toast.error('Lengkapi semua field dan pastikan bobot > 0');
      return;
    }
    const maxAllowedBobot = 100 - (totalBobot - (editKriteria ? editKriteria.bobot : 0));
    if (kriteriaForm.bobot > maxAllowedBobot) {
      toast.error(`Bobot melebihi batas maksimal yang diperbolehkan (${maxAllowedBobot}%)`);
      return;
    }
    try {
      if (editKriteria) {
        const res = await axios.put(`/api/kriteria/${editKriteria.id}`, kriteriaForm);
        setData({ ...data, kriteria: data.kriteria.map(k => k.id === editKriteria.id ? { ...k, ...res.data } : k) });
        toast.success('Kriteria berhasil diperbarui');
      } else {
        const res = await axios.post('/api/kriteria', kriteriaForm);
        setData({ ...data, kriteria: [...data.kriteria, res.data] });
        toast.success('Kriteria berhasil ditambahkan');
      }
      setShowKriteriaModal(false);
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan kriteria');
    }
  };

  const deleteKriteria = async (id: number) => {
    try {
      await axios.delete(`/api/kriteria/${id}`);
      setData({
        ...data,
        kriteria: data.kriteria.filter(k => k.id !== id),
        subKriteria: data.subKriteria.filter(s => s.kriteriaId !== id),
      });
      toast.success('Kriteria berhasil dihapus');
      setConfirmDelete(null);
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus kriteria');
    }
  };

  const openAddSub = () => {
    setEditSub(null);
    setSubForm(emptySubForm);
    setShowSubModal(true);
  };

  const openEditSub = (s: SubKriteria) => {
    setEditSub(s);
    setSubForm({ nama: s.nama, nilai: s.nilai });
    setShowSubModal(true);
  };

  const saveSub = async () => {
    if (!subForm.nama) { toast.error('Nama sub-kriteria wajib diisi'); return; }
    try {
      if (editSub) {
        const res = await axios.put(`/api/sub-kriteria/${editSub.id}`, { ...subForm, kriteriaId: expandedKriteria });
        setData({ ...data, subKriteria: data.subKriteria.map(s => s.id === editSub.id ? { ...s, ...res.data } : s) });
        toast.success('Sub-kriteria berhasil diperbarui');
      } else {
        const res = await axios.post('/api/sub-kriteria', { ...subForm, kriteriaId: expandedKriteria });
        setData({ ...data, subKriteria: [...data.subKriteria, res.data] });
        toast.success('Sub-kriteria berhasil ditambahkan');
      }
      setShowSubModal(false);
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan sub-kriteria');
    }
  };

  const deleteSub = async (id: number) => {
    try {
      await axios.delete(`/api/sub-kriteria/${id}`);
      setData({ ...data, subKriteria: data.subKriteria.filter(s => s.id !== id) });
      toast.success('Sub-kriteria berhasil dihapus');
      setConfirmDeleteSub(null);
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus sub-kriteria');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Data Kriteria & Bobot</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola parameter dan bobot untuk perhitungan rekomendasi SPK</p>
        </div>
        <button onClick={openAddKriteria} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200">
          <Plus className="w-4 h-4" />
          <span>Tambah Kriteria</span>
        </button>
      </div>

      {totalBobot !== 100 && (
        <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm text-sm text-amber-800 animate-in fade-in slide-in-from-top-2">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="font-bold text-amber-900 mb-0.5">Peringatan Bobot Tidak Valid</p>
            <p>Total bobot saat ini adalah <strong>{totalBobot}%</strong>. Total bobot dari seluruh kriteria harus tepat berjumlah <strong>100%</strong> agar hasil perhitungan metode SAW menjadi valid dan akurat.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-12">No</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-20">Kode</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Kriteria</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Atribut</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bobot (%)</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.kriteria.map((k, i) => {
                const subs = data.subKriteria.filter(s => s.kriteriaId === k.id);
                const expanded = expandedKriteria === k.id;
                return (
                  <>
                    <tr key={k.id} className={`hover:bg-slate-50/80 transition-colors group ${expanded ? 'bg-slate-50/50' : ''}`}>
                      <td className="px-6 py-4 text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{k.kode}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{k.nama}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${k.atribut === 'Benefit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {k.atribut}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: `${k.bobot}%` }} />
                          </div>
                          <span className="font-bold text-slate-700">{k.bobot}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setExpandedKriteria(expanded ? null : k.id)}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${expanded ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                            title={expanded ? 'Tutup Sub-Kriteria' : 'Lihat Sub-Kriteria'}
                          >
                            <span className="text-xs font-semibold hidden sm:inline-block">{expanded ? 'Tutup' : 'Sub-Kriteria'}</span>
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button onClick={() => openEditKriteria(k)} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Edit Kriteria">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(k.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus Kriteria">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr key={`sub-${k.id}`}>
                        <td colSpan={6} className="p-0 border-b-0">
                          <div className="bg-slate-50/50 px-4 py-6 sm:px-8 shadow-inner">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 overflow-hidden">
                              <div className="pl-0 sm:pl-2">
                                <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="text-sm font-bold text-slate-800">Daftar Sub-Kriteria</h4>
                                  <p className="text-xs text-slate-500 mt-0.5">Penilaian untuk parameter {k.nama}</p>
                                </div>
                                <button
                                  onClick={openAddSub}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-blue-600 text-xs font-bold hover:bg-blue-50 hover:border-blue-200 transition-all"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Tambah
                                </button>
                              </div>
                              {subs.length === 0 ? (
                                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-6 text-center">
                                  <p className="text-sm text-slate-500 font-medium">Belum ada sub-kriteria yang ditambahkan.</p>
                                </div>
                              ) : (
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="text-left px-5 py-3 font-bold text-xs text-slate-500 uppercase tracking-wider">Keterangan / Indikator</th>
                                        <th className="text-left px-5 py-3 font-bold text-xs text-slate-500 uppercase tracking-wider w-32">Nilai Numerik</th>
                                        <th className="text-right px-5 py-3 font-bold text-xs text-slate-500 uppercase tracking-wider w-24">Aksi</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {subs.sort((a, b) => a.nilai - b.nilai).map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="px-5 py-3 font-medium text-slate-700">{s.nama}</td>
                                          <td className="px-5 py-3">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded bg-slate-100 border border-slate-200 font-mono font-bold text-blue-700 text-xs">{s.nilai}</span>
                                          </td>
                                          <td className="px-5 py-3">
                                            <div className="flex justify-end gap-1">
                                              <button onClick={() => openEditSub(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                              </button>
                                              <button onClick={() => setConfirmDeleteSub(s.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={4} className="px-6 py-4 text-sm font-bold text-slate-600 text-right uppercase tracking-wider">Total Bobot Sistem:</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-black ${totalBobot === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>{totalBobot}%</span>
                    {totalBobot === 100 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Info className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Kriteria */}
      {showKriteriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowKriteriaModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-gray-900">{editKriteria ? 'Edit Kriteria' : 'Tambah Kriteria Baru'}</h3>
              <button onClick={() => setShowKriteriaModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Kriteria</label>
                  <input value={kriteriaForm.kode} onChange={e => setKriteriaForm({ ...kriteriaForm, kode: e.target.value })}
                    placeholder="C1" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bobot (%)
                    {(() => {
                      const maxAllowedBobot = 100 - (totalBobot - (editKriteria ? editKriteria.bobot : 0));
                      return <span className="text-xs text-blue-600 font-normal ml-2">(Maks: {maxAllowedBobot}%)</span>;
                    })()}
                  </label>
                  <input type="number" min={1} 
                    max={100 - (totalBobot - (editKriteria ? editKriteria.bobot : 0))} 
                    value={kriteriaForm.bobot} onChange={e => setKriteriaForm({ ...kriteriaForm, bobot: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kriteria</label>
                <input value={kriteriaForm.nama} onChange={e => setKriteriaForm({ ...kriteriaForm, nama: e.target.value })}
                  placeholder="Contoh: Penghasilan per Bulan" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Atribut</label>
                <div className="flex gap-3">
                  {(['Benefit', 'Cost'] as const).map(a => (
                    <label key={a} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={kriteriaForm.atribut === a} onChange={() => setKriteriaForm({ ...kriteriaForm, atribut: a })} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{a}</span>
                      <span className="text-xs text-muted-foreground">({a === 'Benefit' ? 'semakin besar semakin baik' : 'semakin kecil semakin baik'})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowKriteriaModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={saveKriteria} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sub-Kriteria */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSubModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-gray-900">{editSub ? 'Edit Sub-Kriteria' : 'Tambah Sub-Kriteria'}</h3>
              <button onClick={() => setShowSubModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Rentang Nilai</label>
                <input value={subForm.nama} onChange={e => setSubForm({ ...subForm, nama: e.target.value })}
                  placeholder="Contoh: < Rp 500.000" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Numerik (SAW)</label>
                <input type="number" min={1} value={subForm.nilai} onChange={e => setSubForm({ ...subForm, nilai: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-muted-foreground mt-1">Nilai ini digunakan dalam perhitungan SAW.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowSubModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={saveSub} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Simpan</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus Kriteria"
        message="Apakah Anda yakin ingin menghapus kriteria ini? Semua sub-kriteria terkait juga akan terhapus."
        onConfirm={() => confirmDelete !== null && deleteKriteria(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmDialog
        open={confirmDeleteSub !== null}
        title="Hapus Sub-Kriteria"
        message="Apakah Anda yakin ingin menghapus sub-kriteria ini?"
        onConfirm={() => confirmDeleteSub !== null && deleteSub(confirmDeleteSub)}
        onCancel={() => setConfirmDeleteSub(null)}
      />
    </div>
  );
}
