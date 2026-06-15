import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { AppData, Masyarakat } from '../../data';
import { ConfirmDialog } from '../ConfirmDialog';

interface Props { data: AppData; setData: (d: AppData) => void; }

const emptyForm = { nik: '', nama: '', alamat: '', noHp: '', rtRw: '' };

export function DataMasyarakat({ data, setData }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Masyarakat | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = data.masyarakat.filter(m =>
    m.nama.toLowerCase().includes(search.toLowerCase()) ||
    m.nik.includes(search) ||
    m.alamat.toLowerCase().includes(search.toLowerCase())
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

  const save = () => {
    if (!validate()) return;
    const today = new Date().toISOString().slice(0, 10);
    if (editItem) {
      setData({ ...data, masyarakat: data.masyarakat.map(m => m.id === editItem.id ? { ...m, ...form } : m) });
      toast.success('Data masyarakat berhasil diperbarui');
    } else {
      if (data.masyarakat.some(m => m.nik === form.nik)) {
        setErrors({ nik: 'NIK sudah terdaftar' });
        return;
      }
      const newId = Math.max(0, ...data.masyarakat.map(m => m.id)) + 1;
      setData({ ...data, masyarakat: [...data.masyarakat, { id: newId, ...form, tglDaftar: today }] });
      toast.success('Data masyarakat berhasil ditambahkan');
    }
    setShowModal(false);
  };

  const deleteMasyarakat = (id: number) => {
    setData({
      ...data,
      masyarakat: data.masyarakat.filter(m => m.id !== id),
      penilaian: data.penilaian.filter(p => p.masyarakatId !== id),
    });
    toast.success('Data masyarakat berhasil dihapus');
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-semibold">Data Calon Penerima Bansos</h2>
          <p className="text-sm text-muted-foreground">Kelola data biodata warga calon penerima</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Tambah Data</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, NIK, atau alamat..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-sm text-muted-foreground">{filtered.length} data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">No</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">NIK</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Kepala Keluarga</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Alamat</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">RT/RW</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">No. HP</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m, i) => {
                const dinilai = data.penilaian.some(p => p.masyarakatId === m.id);
                return (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{m.nik}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{m.nama}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{m.alamat}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{m.rtRw}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{m.noHp}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${dinilai ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {dinilai ? 'Sudah Dinilai' : 'Belum Dinilai'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(m.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">Tidak ada data ditemukan</td></tr>
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

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus Data Masyarakat"
        message="Apakah Anda yakin ingin menghapus data ini? Data penilaian terkait juga akan ikut terhapus."
        onConfirm={() => confirmDelete !== null && deleteMasyarakat(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
