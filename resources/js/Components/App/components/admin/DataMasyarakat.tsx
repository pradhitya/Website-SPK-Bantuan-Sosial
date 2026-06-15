import { useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, Search, Upload, CheckCircle2, Clock, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { AppData, Masyarakat } from '../../data';
import { ConfirmDialog } from '../ConfirmDialog';

interface Props { data: AppData; setData: (d: AppData) => void; onNavigate?: (page: string) => void; }

const emptyForm = { nik: '', nama: '', alamat: '', noHp: '', rtRw: '' };

export function DataMasyarakat({ data, setData, onNavigate }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Masyarakat | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const activePeriode = data.activePeriode || '2026-06';
  
  const filtered = data.masyarakat.filter(m =>
    (!m.periode || m.periode === activePeriode) &&
    (m.nama.toLowerCase().includes(search.toLowerCase()) ||
    m.nik.includes(search) ||
    m.alamat.toLowerCase().includes(search.toLowerCase()))
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nik || form.nik.length !== 16) e.nik = 'NIK harus 16 digit';
    if (!form.nama) e.nama = 'Nama wajib diisi';
    if (!form.alamat) e.alamat = 'Alamat wajib diisi';
    if (!form.rtRw || !/^\d{2}\/\d{2}$/.test(form.rtRw)) e.rtRw = 'Format RT/RW: 01/01';
    if (!form.noHp) e.noHp = 'No. HP wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (m: Masyarakat) => {
    setEditItem(m);
    setForm({ nik: m.nik, nama: m.nama, alamat: m.alamat, noHp: m.noHp, rtRw: m.rtRw });
    setErrors({});
    setShowModal(true);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    
    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('periode', activePeriode);
    
    setImporting(true);
    try {
      const res = await axios.post('/api/import-masyarakat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message || 'Data berhasil diimpor');
      setImportModalOpen(false);
      setImportFile(null);
      // Refresh
      const refreshRes = await axios.get('/api/init');
      setData({ ...data, masyarakat: refreshRes.data.masyarakat });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Gagal mengimpor data';
      toast.error(errMsg);
    } finally {
      setImporting(false);
    }
  };

  const save = async () => {
    if (!validate()) return;
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (editItem) {
        const res = await axios.put(`/api/masyarakat/${editItem.id}`, form);
        setData({ ...data, masyarakat: data.masyarakat.map(m => m.id === editItem.id ? { ...m, ...res.data } : m) });
        toast.success('Data masyarakat berhasil diperbarui');
      } else {
        if (data.masyarakat.some(m => m.nik === form.nik && m.periode === activePeriode)) {
          setErrors({ nik: 'NIK sudah terdaftar pada periode ini' });
          return;
        }
        const payload = { ...form, tglDaftar: today, periode: activePeriode };
        const res = await axios.post('/api/masyarakat', payload);
        setData({ ...data, masyarakat: [...data.masyarakat, res.data] });
        toast.success('Data masyarakat berhasil ditambahkan');
      }
      setShowModal(false);
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan data');
    }
  };

  const deleteMasyarakat = async (id: number) => {
    try {
      await axios.delete(`/api/masyarakat/${id}`);
      setData({
        ...data,
        masyarakat: data.masyarakat.filter(m => m.id !== id),
        penilaian: data.penilaian.filter(p => p.masyarakatId !== id),
      });
      toast.success('Data masyarakat berhasil dihapus');
      setConfirmDelete(null);
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus data');
    }
  };

  const deleteBulkMasyarakat = async () => {
    try {
      await axios.post('/api/masyarakat/bulk-delete', { ids: selectedIds });
      setData({
        ...data,
        masyarakat: data.masyarakat.filter(m => !selectedIds.includes(m.id)),
        penilaian: data.penilaian.filter(p => !selectedIds.includes(p.masyarakatId)),
      });
      setSelectedIds([]);
      setConfirmBulkDelete(false);
      toast.success(`${selectedIds.length} data masyarakat berhasil dihapus`);
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus data terpilih');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Data Calon Penerima Bansos</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola data biodata warga calon penerima</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedIds.length > 0 && (
            <button onClick={() => setConfirmBulkDelete(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold hover:bg-rose-100 hover:text-rose-700 transition-all border border-rose-200 shadow-sm">
              <Trash2 className="w-4 h-4" />
              <span>Hapus {selectedIds.length}</span>
            </button>
          )}
          <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-bold hover:bg-emerald-100 hover:text-emerald-700 transition-all border border-emerald-200 shadow-sm">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Data</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 justify-between bg-slate-50/30">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-bold text-slate-600 whitespace-nowrap">Periode:</label>
            <input 
              type="month" 
              value={activePeriode} 
              onChange={e => setData({...data, activePeriode: e.target.value})}
              className="px-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama, NIK, atau alamat..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
              />
            </div>
            <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold whitespace-nowrap">
              {filtered.length} Data
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-colors"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                         setSelectedIds(filtered.map(m => m.id));
                      } else {
                         setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">No</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NIK</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Kepala Keluarga</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Alamat</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">RT/RW</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">No. HP</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m, i) => {
                const dinilai = data.penilaian.some(p => p.masyarakatId === m.id);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-colors"
                        checked={selectedIds.includes(m.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, m.id]);
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== m.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-400">{i + 1}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-mono text-xs font-medium">
                        {m.nik}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{m.nama}</td>
                    <td className="px-6 py-4 text-slate-500 hidden lg:table-cell max-w-[200px] truncate" title={m.alamat}>{m.alamat}</td>
                    <td className="px-6 py-4 font-medium text-slate-600 hidden md:table-cell">{m.rtRw}</td>
                    <td className="px-6 py-4 font-medium text-slate-600 hidden md:table-cell">{m.noHp}</td>
                    <td className="px-6 py-4">
                      {dinilai ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dinilai</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Belum</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onNavigate && onNavigate('penilaian')} className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Beri Penilaian">
                          <ClipboardList className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(m)} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit Data">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(m.id)} className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Hapus Data">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="inline-flex flex-col items-center justify-center text-slate-400">
                      <Search className="w-8 h-8 mb-3 opacity-50" />
                      <p className="text-sm font-medium">Tidak ada data ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-gray-900">{editItem ? 'Edit Data Masyarakat' : 'Tambah Data Masyarakat'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK (16 digit)</label>
                <input value={form.nik} onChange={e => setForm({ ...form, nik: e.target.value })} maxLength={16} placeholder="3271010101800001"
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nik ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                {errors.nik && <p className="text-xs text-red-500 mt-1">{errors.nik}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kepala Keluarga</label>
                <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama lengkap"
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nama ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="Jl. ..." rows={2}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.alamat ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                {errors.alamat && <p className="text-xs text-red-500 mt-1">{errors.alamat}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RT/RW</label>
                  <input value={form.rtRw} onChange={e => setForm({ ...form, rtRw: e.target.value })} placeholder="01/02"
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.rtRw ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  {errors.rtRw && <p className="text-xs text-red-500 mt-1">{errors.rtRw}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                  <input value={form.noHp} onChange={e => setForm({ ...form, noHp: e.target.value })} placeholder="081234567890"
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.noHp ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  {errors.noHp && <p className="text-xs text-red-500 mt-1">{errors.noHp}</p>}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !importing && setImportModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-gray-900">Import Data CSV</h3>
              <button onClick={() => !importing && setImportModalOpen(false)} disabled={importing} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleImport}>
              <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-gray-600">
                  Unggah file CSV yang berisi data masyarakat. Pastikan format kolom sesuai: <br/>
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">nik, nama, alamat, rt_rw, no_hp</code>
                </p>
                <div>
                  <input type="file" accept=".csv" required onChange={e => setImportFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
                <button type="button" onClick={() => setImportModalOpen(false)} disabled={importing} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Batal</button>
                <button type="submit" disabled={!importFile || importing} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                  {importing ? 'Mengimpor...' : <><Upload className="w-4 h-4" /> Import</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus Data Masyarakat"
        message="Apakah Anda yakin ingin menghapus data ini? Data penilaian terkait juga akan ikut terhapus."
        onConfirm={() => confirmDelete !== null && deleteMasyarakat(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Hapus ${selectedIds.length} Data Masyarakat`}
        message="Apakah Anda yakin ingin menghapus data-data terpilih ini? Data penilaian terkait juga akan ikut terhapus."
        onConfirm={deleteBulkMasyarakat}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  );
}
