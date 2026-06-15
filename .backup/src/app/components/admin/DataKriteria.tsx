import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, Info } from 'lucide-react';
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
    setEditKriteria(null);
    setKriteriaForm(emptyKriteriaForm);
    setShowKriteriaModal(true);
  };

  const openEditKriteria = (k: Kriteria) => {
    setEditKriteria(k);
    setKriteriaForm({ kode: k.kode, nama: k.nama, atribut: k.atribut, bobot: k.bobot });
    setShowKriteriaModal(true);
  };

  const saveKriteria = () => {
    if (!kriteriaForm.kode || !kriteriaForm.nama || kriteriaForm.bobot <= 0) {
      toast.error('Lengkapi semua field dan pastikan bobot > 0');
      return;
    }
    if (editKriteria) {
      setData({ ...data, kriteria: data.kriteria.map(k => k.id === editKriteria.id ? { ...k, ...kriteriaForm } : k) });
      toast.success('Kriteria berhasil diperbarui');
    } else {
      const newId = Math.max(0, ...data.kriteria.map(k => k.id)) + 1;
      setData({ ...data, kriteria: [...data.kriteria, { id: newId, ...kriteriaForm }] });
      toast.success('Kriteria berhasil ditambahkan');
    }
    setShowKriteriaModal(false);
  };

  const deleteKriteria = (id: number) => {
    setData({
      ...data,
      kriteria: data.kriteria.filter(k => k.id !== id),
      subKriteria: data.subKriteria.filter(s => s.kriteriaId !== id),
    });
    toast.success('Kriteria berhasil dihapus');
    setConfirmDelete(null);
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

  const saveSub = () => {
    if (!subForm.nama) { toast.error('Nama sub-kriteria wajib diisi'); return; }
    if (editSub) {
      setData({ ...data, subKriteria: data.subKriteria.map(s => s.id === editSub.id ? { ...s, ...subForm } : s) });
      toast.success('Sub-kriteria berhasil diperbarui');
    } else {
      const newId = Math.max(0, ...data.subKriteria.map(s => s.id)) + 1;
      setData({ ...data, subKriteria: [...data.subKriteria, { id: newId, kriteriaId: expandedKriteria!, ...subForm }] });
      toast.success('Sub-kriteria berhasil ditambahkan');
    }
    setShowSubModal(false);
  };

  const deleteSub = (id: number) => {
    setData({ ...data, subKriteria: data.subKriteria.filter(s => s.id !== id) });
    toast.success('Sub-kriteria berhasil dihapus');
    setConfirmDeleteSub(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-semibold">Data Kriteria & Bobot</h2>
          <p className="text-sm text-muted-foreground">Kelola kriteria dan bobot penilaian SPK</p>
        </div>
        <button onClick={openAddKriteria} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Tambah Kriteria</span>
        </button>
      </div>

      {totalBobot !== 100 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
          <span>Total bobot saat ini <strong>{totalBobot}%</strong>. Total bobot harus berjumlah <strong>100%</strong> agar perhitungan SAW akurat.</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-10">No</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-16">Kode</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Kriteria</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Atribut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bobot (%)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.kriteria.map((k, i) => {
                const subs = data.subKriteria.filter(s => s.kriteriaId === k.id);
                const expanded = expandedKriteria === k.id;
                return (
                  <>
                    <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{k.kode}</span>
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900">{k.nama}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${k.atribut === 'Benefit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {k.atribut}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-gray-100">
                            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${k.bobot}%` }} />
                          </div>
                          <span className="font-semibold text-gray-900">{k.bobot}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setExpandedKriteria(expanded ? null : k.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Lihat Sub-Kriteria"
                          >
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button onClick={() => openEditKriteria(k)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(k.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr key={`sub-${k.id}`}>
                        <td colSpan={6} className="bg-blue-50/50 px-5 py-3">
                          <div className="ml-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                Sub-Kriteria: {k.nama}
                              </p>
                              <button
                                onClick={openAddSub}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                Tambah
                              </button>
                            </div>
                            {subs.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">Belum ada sub-kriteria</p>
                            ) : (
                              <table className="w-full text-xs">
                                <thead>
                                  <tr>
                                    <th className="text-left py-1 font-medium text-muted-foreground">Keterangan</th>
                                    <th className="text-left py-1 font-medium text-muted-foreground">Nilai</th>
                                    <th className="text-right py-1 font-medium text-muted-foreground">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subs.sort((a, b) => a.nilai - b.nilai).map(s => (
                                    <tr key={s.id} className="border-t border-blue-100">
                                      <td className="py-1.5 text-gray-700">{s.nama}</td>
                                      <td className="py-1.5">
                                        <span className="font-mono font-semibold text-blue-700">{s.nilai}</span>
                                      </td>
                                      <td className="py-1.5">
                                        <div className="flex justify-end gap-1">
                                          <button onClick={() => openEditSub(s)} className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition-colors">
                                            <Pencil className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => setConfirmDeleteSub(s.id)} className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-100 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-border">
                <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-gray-700 text-right">Total Bobot:</td>
                <td className="px-5 py-3">
                  <span className={`font-bold ${totalBobot === 100 ? 'text-green-600' : 'text-red-600'}`}>{totalBobot}%</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bobot (%)</label>
                  <input type="number" min={1} max={100} value={kriteriaForm.bobot} onChange={e => setKriteriaForm({ ...kriteriaForm, bobot: Number(e.target.value) })}
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
