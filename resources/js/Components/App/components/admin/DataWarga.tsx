import { useState, useRef, useEffect } from 'react';
import { UserCheck, Plus, Search, Edit2, Trash2, X, Upload, Filter, Download } from 'lucide-react';
import { AppData, Warga } from '../../data';
import { toast } from 'sonner';
import axios from 'axios';

interface Props {
  data: AppData;
  setData: (d: AppData | ((prev: AppData) => AppData)) => void;
}

const STATUS_KELUARGA_OPTIONS = ['Kepala Keluarga', 'Istri', 'Anak', 'Orang Tua', 'Lainnya'] as const;
const KETERANGAN_OPTIONS = ['', 'Hamil', 'Lansia', 'Disabilitas', 'Yatim Piatu'] as const;

export function DataWarga({ data, setData }: Props) {
  const [search, setSearch] = useState('');
  const [filterKK, setFilterKK] = useState<string>('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterKeterangan, setFilterKeterangan] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nik: '',
    nama: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    tempat_lahir: '',
    tanggal_lahir: '',
    status_keluarga: 'Lainnya' as string,
    keluarga_id: '' as string,
    no_hp: '',
    pekerjaan: '',
    keterangan_khusus: '',
  });

  useEffect(() => {
    if ((data.wargas || []).length === 0) {
      axios.get('/api/warga').then(res => {
        setData((prev: AppData) => ({ ...prev, wargas: res.data }));
      }).catch(err => console.error(err));
    }
  }, []);

  const wargas = (data.wargas || []).filter(w => {
    let match = true;
    if (search) {
      const s = search.toLowerCase();
      match = match && (
        w.nama.toLowerCase().includes(s) ||
        w.nik.toLowerCase().includes(s) ||
        (w.no_hp || '').toLowerCase().includes(s)
      );
    }
    if (filterKK) {
      match = match && (w.keluarga_id?.toString() === filterKK);
    }
    if (filterGender) {
      match = match && w.jenis_kelamin === filterGender;
    }
    if (filterKeterangan) {
      if (filterKeterangan === 'Lansia') {
        match = match && (w.usia !== null && w.usia >= 60);
      } else {
        match = match && (w.keterangan_khusus || '').toLowerCase().includes(filterKeterangan.toLowerCase());
      }
    }
    return match;
  });

  const resetForm = () => {
    setForm({
      nik: '', nama: '', jenis_kelamin: 'L', tempat_lahir: '', tanggal_lahir: '',
      status_keluarga: 'Lainnya', keluarga_id: '', no_hp: '', pekerjaan: '', keterangan_khusus: '',
    });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (w: Warga) => {
    setForm({
      nik: w.nik,
      nama: w.nama,
      jenis_kelamin: w.jenis_kelamin,
      tempat_lahir: w.tempat_lahir || '',
      tanggal_lahir: w.tanggal_lahir || '',
      status_keluarga: w.status_keluarga,
      keluarga_id: w.keluarga_id?.toString() || '',
      no_hp: w.no_hp || '',
      pekerjaan: w.pekerjaan || '',
      keterangan_khusus: w.keterangan_khusus || '',
    });
    setEditId(w.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.nik || !form.nama) {
      toast.error('NIK dan Nama wajib diisi.');
      return;
    }
    if (form.nik.replace(/\D/g, '').length !== 16) {
      toast.error('NIK harus 16 digit angka.');
      return;
    }

    const payload = {
      ...form,
      nik: form.nik.replace(/\D/g, ''),
      keluarga_id: form.keluarga_id ? parseInt(form.keluarga_id) : null,
      tempat_lahir: form.tempat_lahir || null,
      tanggal_lahir: form.tanggal_lahir || null,
      no_hp: form.no_hp || null,
      pekerjaan: form.pekerjaan || null,
      keterangan_khusus: form.keterangan_khusus || null,
    };

    try {
      if (editId) {
        const res = await axios.put(`/api/warga/${editId}`, payload);
        setData((prev: AppData) => ({
          ...prev,
          wargas: prev.wargas.map(w => w.id === editId ? res.data : w),
        }));
        toast.success('Data warga berhasil diperbarui.');
      } else {
        const res = await axios.post('/api/warga', payload);
        setData((prev: AppData) => ({
          ...prev,
          wargas: [...prev.wargas, res.data],
        }));
        toast.success('Data warga berhasil ditambahkan.');
      }
      resetForm();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.nik?.[0] || 'Gagal menyimpan data.';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data warga ini?')) return;
    try {
      await axios.delete(`/api/warga/${id}`);
      setData((prev: AppData) => ({
        ...prev,
        wargas: prev.wargas.filter(w => w.id !== id),
      }));
      toast.success('Data warga berhasil dihapus.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus data.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await axios.post('/api/import-warga', fd);
      toast.success(res.data.message);
      // Reload data
      const initRes = await axios.get('/api/init');
      setData((prev: AppData) => ({
        ...prev,
        wargas: initRes.data.wargas || [],
        keluargas: initRes.data.keluargas || [],
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengimpor data.');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csv = 'nik,nama,jenis_kelamin,tempat_lahir,tanggal_lahir,no_hp,status_keluarga,pekerjaan,keterangan_khusus,no_kk\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_data_warga.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFilterCount = [filterKK, filterGender, filterKeterangan].filter(Boolean).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="bg-white rounded-none p-6 border-4 border-[#1E3A5F] shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-[#1E3A5F]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">MASTER DATA WARGA</h1>
                <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">KELOLA DATA PENDUDUK / ANGGOTA KELUARGA DESA</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-none bg-white border-2 border-[#1E3A5F] text-[#1E3A5F] text-xs font-black uppercase tracking-widest shadow-none">
              {wargas.length} WARGA
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-none border-2 border-[#1E3A5F] text-xs font-black text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors uppercase tracking-widest shadow-none"
            >
              <Download className="w-4 h-4" /> TEMPLATE CSV
            </button>
            <label className={`flex items-center gap-1.5 px-4 py-2 rounded-none border-2 border-[#1E3A5F] text-xs font-black text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors uppercase tracking-widest shadow-none cursor-pointer ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload className="w-4 h-4" /> {importing ? 'MENGIMPOR...' : 'IMPORT CSV'}
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-none border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white font-black text-xs uppercase tracking-widest shadow-none hover:bg-white hover:text-[#1E3A5F] transition-colors"
            >
              <Plus className="w-4 h-4" /> TAMBAH WARGA
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]" />
          <input
            type="text"
            placeholder="CARI NAMA, NIK, ATAU NO HP..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-none border-4 border-[#1E3A5F] bg-white text-sm font-bold placeholder-[#64748B] focus:outline-none focus:ring-0 shadow-none uppercase transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-2 px-6 py-3 rounded-none border-4 transition-all uppercase font-black text-sm tracking-widest ${
            showFilter || activeFilterCount > 0 ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-none' : 'bg-white border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#FAFAFA] shadow-none'
          }`}
        >
          <Filter className="w-4 h-4" />
          FILTER
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-none border border-white bg-red-600 text-white text-[10px] font-black flex items-center justify-center ml-2">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none p-6 flex flex-wrap gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">KELUARGA (KK)</label>
            <select
              value={filterKK}
              onChange={e => setFilterKK(e.target.value)}
              className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase"
            >
              <option value="">SEMUA KK</option>
              {(data.keluargas || []).map(k => (
                <option key={k.id} value={k.id.toString()}>
                  {k.no_kk} - {k.wargas?.find(w => w.status_keluarga === 'Kepala Keluarga')?.nama || k.alamat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">JENIS KELAMIN</label>
            <select
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
              className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase"
            >
              <option value="">SEMUA</option>
              <option value="L">LAKI-LAKI</option>
              <option value="P">PEREMPUAN</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">KETERANGAN KHUSUS</label>
            <select
              value={filterKeterangan}
              onChange={e => setFilterKeterangan(e.target.value)}
              className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase"
            >
              <option value="">SEMUA</option>
              <option value="Hamil">IBU HAMIL</option>
              <option value="Lansia">LANSIA (â‰¥60 TAHUN)</option>
              <option value="Disabilitas">DISABILITAS</option>
              <option value="Yatim Piatu">YATIM PIATU</option>
            </select>
          </div>
          {activeFilterCount > 0 && (
            <div className="flex items-end w-full sm:w-auto">
              <button
                onClick={() => { setFilterKK(''); setFilterGender(''); setFilterKeterangan(''); }}
                className="w-full sm:w-auto px-6 py-3 rounded-none border-2 border-red-600 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors shadow-none"
              >
                RESET FILTER
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none p-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-6 border-b-4 border-[#1E3A5F] pb-4">
            <h3 className="text-xl font-black text-[#1E3A5F] uppercase tracking-widest">{editId ? 'EDIT DATA WARGA' : 'TAMBAH WARGA BARU'}</h3>
            <button onClick={resetForm} className="p-2 rounded-none border-2 border-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white text-[#1E3A5F] transition-colors shadow-none">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NIK <span className="text-red-600">*</span></label>
              <input
                type="text"
                maxLength={16}
                value={form.nik}
                onChange={e => setForm({ ...form, nik: e.target.value.replace(/\D/g, '') })}
                placeholder="16 DIGIT NIK"
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white uppercase transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NAMA LENGKAP <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={form.nama}
                onChange={e => setForm({ ...form, nama: e.target.value })}
                placeholder="NAMA LENGKAP"
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white uppercase transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">JENIS KELAMIN <span className="text-red-600">*</span></label>
              <select
                value={form.jenis_kelamin}
                onChange={e => setForm({ ...form, jenis_kelamin: e.target.value as 'L' | 'P' })}
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase"
              >
                <option value="L">LAKI-LAKI</option>
                <option value="P">PEREMPUAN</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">TEMPAT LAHIR</label>
              <input
                type="text"
                value={form.tempat_lahir}
                onChange={e => setForm({ ...form, tempat_lahir: e.target.value })}
                placeholder="TEMPAT LAHIR"
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white uppercase transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">TANGGAL LAHIR</label>
              <input
                type="date"
                value={form.tanggal_lahir}
                onChange={e => setForm({ ...form, tanggal_lahir: e.target.value })}
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">KELUARGA (KK)</label>
              <select
                value={form.keluarga_id}
                onChange={e => setForm({ ...form, keluarga_id: e.target.value })}
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase"
              >
                <option value="">- TIDAK TERKAIT KK -</option>
                {(data.keluargas || []).map(k => (
                  <option key={k.id} value={k.id.toString()}>
                    {k.no_kk} - {k.alamat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">STATUS KELUARGA</label>
              <select
                value={form.status_keluarga}
                onChange={e => setForm({ ...form, status_keluarga: e.target.value })}
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase"
              >
                {STATUS_KELUARGA_OPTIONS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NO HP</label>
              <input
                type="text"
                value={form.no_hp}
                onChange={e => setForm({ ...form, no_hp: e.target.value })}
                placeholder="08XXXXXXXXXX"
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white uppercase transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">PEKERJAAN</label>
              <input
                type="text"
                value={form.pekerjaan}
                onChange={e => setForm({ ...form, pekerjaan: e.target.value })}
                placeholder="PEKERJAAN"
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white uppercase transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">KETERANGAN KHUSUS</label>
              <select
                value={form.keterangan_khusus}
                onChange={e => setForm({ ...form, keterangan_khusus: e.target.value })}
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase"
              >
                {KETERANGAN_OPTIONS.map(k => <option key={k} value={k}>{k ? k.toUpperCase() : '- TIDAK ADA -'}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4 pt-6 border-t-4 border-[#1E3A5F]">
            <button onClick={resetForm} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] text-xs font-black text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors uppercase tracking-widest shadow-none">
              BATAL
            </button>
            <button onClick={handleSubmit} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-xs font-black hover:bg-white hover:text-[#1E3A5F] transition-colors uppercase tracking-widest shadow-none">
              {editId ? 'SIMPAN PERUBAHAN' : 'TAMBAH WARGA'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none overflow-hidden">
        {wargas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#FAFAFA]">
            <UserCheck className="w-16 h-16 mb-4 text-[#1E3A5F] opacity-20" />
            <p className="font-black text-xl text-[#1E3A5F] uppercase tracking-widest">BELUM ADA DATA WARGA</p>
            <p className="text-xs font-bold text-[#64748B] mt-2 uppercase tracking-widest">KLIK "TAMBAH WARGA" ATAU "IMPORT CSV" UNTUK MEMULAI</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-4 border-[#1E3A5F] bg-[#FAFAFA]">
                  <th className="text-left px-6 py-4 font-black text-[#1E3A5F] text-[10px] uppercase tracking-widest">WARGA</th>
                  <th className="text-left px-6 py-4 font-black text-[#1E3A5F] text-[10px] uppercase tracking-widest">NIK</th>
                  <th className="text-left px-6 py-4 font-black text-[#1E3A5F] text-[10px] uppercase tracking-widest hidden md:table-cell">KK</th>
                  <th className="text-left px-6 py-4 font-black text-[#1E3A5F] text-[10px] uppercase tracking-widest hidden lg:table-cell">STATUS</th>
                  <th className="text-center px-6 py-4 font-black text-[#1E3A5F] text-[10px] uppercase tracking-widest hidden sm:table-cell">USIA</th>
                  <th className="text-left px-6 py-4 font-black text-[#1E3A5F] text-[10px] uppercase tracking-widest hidden xl:table-cell">KETERANGAN</th>
                  <th className="text-center px-6 py-4 font-black text-[#1E3A5F] text-[10px] uppercase tracking-widest w-24">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#E2E8F0]">
                {wargas.map(w => (
                  <tr key={w.id} className="hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-none border-2 border-[#1E3A5F] flex items-center justify-center text-xs font-black flex-shrink-0 shadow-none ${
                          w.jenis_kelamin === 'L' ? 'bg-[#2563EB] text-white' : 'bg-pink-500 text-white'
                        }`}>
                          {w.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-[#1E3A5F] uppercase tracking-widest">{w.nama}</p>
                          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">{w.jenis_kelamin === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}{w.no_hp ? ` • ${w.no_hp}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm text-[#1E3A5F] uppercase">{w.nik}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {w.keluarga ? (
                        <span className="text-xs font-bold text-[#1E3A5F] uppercase">{w.keluarga.no_kk}</span>
                      ) : (
                        <span className="text-xs text-[#64748B] italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="px-3 py-1 rounded-none border border-[#1E3A5F] bg-[#1E3A5F] text-white text-[10px] font-black uppercase tracking-widest">{w.status_keluarga}</span>
                    </td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell">
                      {w.usia !== null ? (
                        <span className={`text-sm font-black uppercase ${w.usia >= 60 ? 'text-amber-600' : 'text-[#1E3A5F]'}`}>
                          {w.usia}
                        </span>
                      ) : (
                        <span className="text-[#64748B]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      {w.keterangan_khusus ? (
                        <span className="px-3 py-1 rounded-none border-2 border-[#1E3A5F] bg-amber-400 text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest shadow-none">
                          {w.keterangan_khusus}
                        </span>
                      ) : (
                        <span className="text-[#64748B] text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(w)}
                          className="p-2 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors shadow-none"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="p-2 rounded-none border-2 border-[#1E3A5F] bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors shadow-none"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
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
  );
}
