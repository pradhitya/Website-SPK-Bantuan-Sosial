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
        const res = await axios.post('/api/kriteria', { 
          ...kriteriaForm, 
          jenis_bantuan_id: data.activeJenisBantuanId 
        });
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
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">DATA KRITERIA & BOBOT</h2>
          <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">KELOLA PARAMETER DAN BOBOT UNTUK PERHITUNGAN REKOMENDASI SPK</p>
        </div>
        <button onClick={openAddKriteria} className="flex items-center gap-2 px-4 py-2.5 rounded-none border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#1E3A5F] transition-colors shadow-none">
          <Plus className="w-4 h-4" />
          <span>TAMBAH KRITERIA</span>
        </button>
      </div>

      {totalBobot !== 100 && (
        <div className="flex items-start gap-4 px-6 py-5 bg-amber-400 border-4 border-[#1E3A5F] shadow-none text-sm text-[#1E3A5F] rounded-none animate-in fade-in slide-in-from-top-2">
          <Info className="w-6 h-6 mt-0.5 flex-shrink-0 text-[#1E3A5F]" />
          <div>
            <p className="font-black text-[#1E3A5F] uppercase tracking-widest mb-1">PERINGATAN BOBOT TIDAK VALID</p>
            <p className="font-bold text-[10px] uppercase tracking-widest leading-relaxed">TOTAL BOBOT SAAT INI ADALAH <strong className="text-sm">{totalBobot}%</strong>. TOTAL BOBOT DARI SELURUH KRITERIA HARUS TEPAT BERJUMLAH <strong className="text-sm">100%</strong> AGAR HASIL PERHITUNGAN METODE SAW MENJADI VALID DAN AKURAT.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white border-b-4 border-[#1E3A5F]">
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest w-12">NO</th>
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest w-20">KODE</th>
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">NAMA KRITERIA</th>
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">ATRIBUT</th>
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">BOBOT (%)</th>
                <th className="text-right px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#E2E8F0]">
              {data.kriteria.map((k, i) => {
                const subs = data.subKriteria.filter(s => s.kriteriaId === k.id);
                const expanded = expandedKriteria === k.id;
                return (
                  <>
                    <tr key={k.id} className={`hover:bg-[#FAFAFA] transition-colors group ${expanded ? 'bg-[#FAFAFA]' : ''}`}>
                      <td className="px-3 py-3 text-[#1E3A5F] font-black text-sm">{i + 1}</td>
                      <td className="px-3 py-3">
                        <span className="font-bold text-[10px] text-[#1E3A5F] bg-white px-3 py-1.5 rounded-none border-2 border-[#1E3A5F] shadow-none inline-block uppercase tracking-widest">{k.kode}</span>
                      </td>
                      <td className="px-3 py-3 font-black text-[#1E3A5F] uppercase tracking-widest">{k.nama}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-none border-2 border-[#1E3A5F] text-[10px] font-black uppercase tracking-widest shadow-none ${k.atribut === 'Benefit' ? 'bg-emerald-400 text-[#1E3A5F]' : 'bg-rose-400 text-[#1E3A5F]'}`}>
                          {k.atribut}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-3 rounded-none bg-[#FAFAFA] border-2 border-[#1E3A5F] overflow-hidden">
                            <div className="h-full bg-[#1E3A5F]" style={{ width: `${k.bobot}%` }} />
                          </div>
                          <span className="font-black text-[#1E3A5F] text-xs">{k.bobot}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setExpandedKriteria(expanded ? null : k.id)}
                            className={`p-1.5 rounded-none border-2 border-[#1E3A5F] transition-colors flex items-center gap-1 shadow-none ${expanded ? 'bg-[#1E3A5F] text-white' : 'bg-white text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white'}`}
                            title={expanded ? 'TUTUP SUB-KRITERIA' : 'LIHAT SUB-KRITERIA'}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline-block">{expanded ? 'TUTUP' : 'SUB-KRITERIA'}</span>
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button onClick={() => openEditKriteria(k)} className="p-1.5 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors shadow-none" title="EDIT KRITERIA">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(k.id)} className="p-1.5 rounded-none border-2 border-[#1E3A5F] bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors shadow-none" title="HAPUS KRITERIA">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr key={`sub-${k.id}`}>
                        <td colSpan={6} className="p-0 border-b-0">
                          <div className="bg-[#FAFAFA] px-4 py-6 sm:px-8 shadow-inner border-y-2 border-[#E2E8F0]">
                            <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none p-5 sm:p-6 overflow-hidden">
                              <div className="pl-0 sm:pl-2">
                                <div className="flex items-center justify-between mb-6">
                                <div>
                                  <h4 className="text-sm font-black text-[#1E3A5F] uppercase tracking-widest">DAFTAR SUB-KRITERIA</h4>
                                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">PENILAIAN UNTUK PARAMETER <span className="text-[#1E3A5F] font-black">{k.nama}</span></p>
                                </div>
                                <button
                                  onClick={openAddSub}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-none bg-white border-2 border-[#1E3A5F] shadow-none text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A5F] hover:text-white transition-all"
                                >
                                  <Plus className="w-4 h-4" />
                                  TAMBAH
                                </button>
                              </div>
                              {subs.length === 0 ? (
                                <div className="bg-white rounded-none border-4 border-dashed border-[#1E3A5F] p-8 text-center">
                                  <p className="text-xs text-[#1E3A5F] font-black uppercase tracking-widest opacity-50">BELUM ADA SUB-KRITERIA YANG DITAMBAHKAN.</p>
                                </div>
                              ) : (
                                <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden shadow-none">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="bg-[#FAFAFA] border-b-4 border-[#1E3A5F]">
                                        <th className="text-left px-5 py-4 font-black text-[10px] text-[#1E3A5F] uppercase tracking-widest">KETERANGAN / INDIKATOR</th>
                                        <th className="text-left px-5 py-4 font-black text-[10px] text-[#1E3A5F] uppercase tracking-widest w-32">NILAI NUMERIK</th>
                                        <th className="text-right px-5 py-4 font-black text-[10px] text-[#1E3A5F] uppercase tracking-widest w-24">AKSI</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-[#1E3A5F]">
                                      {subs.sort((a, b) => a.nilai - b.nilai).map(s => (
                                        <tr key={s.id} className="hover:bg-[#FAFAFA] transition-colors">
                                          <td className="px-5 py-4 font-bold text-[#1E3A5F] text-xs uppercase tracking-widest">{s.nama}</td>
                                          <td className="px-5 py-4">
                                            <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1.5 rounded-none bg-white border-2 border-[#1E3A5F] font-black text-[#1E3A5F] text-xs shadow-none">{s.nilai}</span>
                                          </td>
                                          <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                              <button onClick={() => openEditSub(s)} className="p-2 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors shadow-none">
                                                <Pencil className="w-3.5 h-3.5" />
                                              </button>
                                              <button onClick={() => setConfirmDeleteSub(s.id)} className="p-2 rounded-none border-2 border-[#1E3A5F] bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors shadow-none">
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
              <tr className="bg-[#FAFAFA] border-t-4 border-[#1E3A5F]">
                <td colSpan={4} className="px-3 py-4 text-[10px] font-black text-[#1E3A5F] text-right uppercase tracking-widest">TOTAL BOBOT SISTEM:</td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-black ${totalBobot === 100 ? 'text-emerald-500' : 'text-rose-600'}`}>{totalBobot}%</span>
                    {totalBobot === 100 ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Info className="w-6 h-6 text-rose-500" />
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowKriteriaModal(false)} />
          <div className="relative bg-white rounded-none border-4 border-[#1E3A5F] shadow-none w-full max-w-md z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b-4 border-[#1E3A5F] bg-[#FAFAFA]">
              <h3 className="font-black text-lg text-[#1E3A5F] uppercase tracking-widest">{editKriteria ? 'EDIT KRITERIA' : 'TAMBAH KRITERIA BARU'}</h3>
              <button onClick={() => setShowKriteriaModal(false)} className="p-2 rounded-none border-2 border-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white text-[#1E3A5F] transition-colors shadow-none">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">KODE KRITERIA</label>
                  <input value={kriteriaForm.kode} onChange={e => setKriteriaForm({ ...kriteriaForm, kode: e.target.value })}
                    placeholder="C1" className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] text-sm font-bold uppercase transition-colors focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA] focus:bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest flex items-center gap-1">
                    BOBOT (%)
                    {(() => {
                      const maxAllowedBobot = 100 - (totalBobot - (editKriteria ? editKriteria.bobot : 0));
                      return <span className="text-[9px] text-[#2563EB] font-bold uppercase">(MAKS: {maxAllowedBobot}%)</span>;
                    })()}
                  </label>
                  <input type="number" min={1} 
                    max={100 - (totalBobot - (editKriteria ? editKriteria.bobot : 0))} 
                    value={kriteriaForm.bobot} onChange={e => setKriteriaForm({ ...kriteriaForm, bobot: Number(e.target.value) })}
                    className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] text-sm font-bold uppercase transition-colors focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA] focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NAMA KRITERIA</label>
                <input value={kriteriaForm.nama} onChange={e => setKriteriaForm({ ...kriteriaForm, nama: e.target.value })}
                  placeholder="CONTOH: PENGHASILAN PER BULAN" className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] text-sm font-bold uppercase transition-colors focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA] focus:bg-white" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#1E3A5F] mb-3 uppercase tracking-widest">ATRIBUT</label>
                <div className="flex flex-col gap-3">
                  {(['Benefit', 'Cost'] as const).map(a => (
                    <label key={a} className={`flex items-start gap-3 cursor-pointer p-3 border-2 transition-all ${kriteriaForm.atribut === a ? 'border-[#1E3A5F] bg-blue-50 shadow-none' : 'border-[#1E3A5F] bg-white opacity-70 hover:opacity-100'}`}>
                      <input type="radio" checked={kriteriaForm.atribut === a} onChange={() => setKriteriaForm({ ...kriteriaForm, atribut: a })} className="mt-1 w-4 h-4 accent-[#1E3A5F]" />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[#1E3A5F] uppercase tracking-widest">{a}</span>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">({a === 'Benefit' ? 'SEMAKIN BESAR SEMAKIN BAIK' : 'SEMAKIN KECIL SEMAKIN BAIK'})</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 px-6 py-5 border-t-4 border-[#1E3A5F] bg-[#FAFAFA]">
              <button onClick={() => setShowKriteriaModal(false)} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] text-xs font-black text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white uppercase tracking-widest transition-colors shadow-none">BATAL</button>
              <button onClick={saveKriteria} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-xs font-black hover:bg-white hover:text-[#1E3A5F] uppercase tracking-widest transition-colors shadow-none">SIMPAN</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sub-Kriteria */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSubModal(false)} />
          <div className="relative bg-white rounded-none border-4 border-[#1E3A5F] shadow-none w-full max-w-sm z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b-4 border-[#1E3A5F] bg-[#FAFAFA]">
              <h3 className="font-black text-lg text-[#1E3A5F] uppercase tracking-widest">{editSub ? 'EDIT SUB-KRITERIA' : 'TAMBAH SUB-KRITERIA'}</h3>
              <button onClick={() => setShowSubModal(false)} className="p-2 rounded-none border-2 border-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white text-[#1E3A5F] transition-colors shadow-none"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">KETERANGAN / RENTANG NILAI</label>
                <input value={subForm.nama} onChange={e => setSubForm({ ...subForm, nama: e.target.value })}
                  placeholder="CONTOH: < RP 500.000" className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] text-sm font-bold uppercase transition-colors focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA] focus:bg-white" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NILAI NUMERIK (SAW)</label>
                <input type="number" min={1} value={subForm.nilai} onChange={e => setSubForm({ ...subForm, nilai: Number(e.target.value) })}
                  className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] text-sm font-bold uppercase transition-colors focus:outline-none focus:border-[#2563EB] bg-[#FAFAFA] focus:bg-white" />
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-2 border-l-2 border-[#1E3A5F] pl-2">NILAI INI DIGUNAKAN DALAM PERHITUNGAN SAW.</p>
              </div>
            </div>
            <div className="flex justify-end gap-4 px-6 py-5 border-t-4 border-[#1E3A5F] bg-[#FAFAFA]">
              <button onClick={() => setShowSubModal(false)} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] text-xs font-black text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white uppercase tracking-widest transition-colors shadow-none">BATAL</button>
              <button onClick={saveSub} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-xs font-black hover:bg-white hover:text-[#1E3A5F] uppercase tracking-widest transition-colors shadow-none">SIMPAN</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="HAPUS KRITERIA"
        message="APAKAH ANDA YAKIN INGIN MENGHAPUS KRITERIA INI? SEMUA SUB-KRITERIA TERKAIT JUGA AKAN TERHAPUS."
        onConfirm={() => confirmDelete !== null && deleteKriteria(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmDialog
        open={confirmDeleteSub !== null}
        title="HAPUS SUB-KRITERIA"
        message="APAKAH ANDA YAKIN INGIN MENGHAPUS SUB-KRITERIA INI?"
        onConfirm={() => confirmDeleteSub !== null && deleteSub(confirmDeleteSub)}
        onCancel={() => setConfirmDeleteSub(null)}
      />
    </div>
  );
}
