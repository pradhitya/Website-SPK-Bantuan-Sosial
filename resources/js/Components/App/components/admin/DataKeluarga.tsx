import { useState, useEffect, useRef } from 'react';
import { Home, Plus, Search, Edit2, Trash2, X, Users, ChevronDown, ChevronRight, Upload, Download } from 'lucide-react';
import { AppData, Keluarga } from '../../data';
import { toast } from 'sonner';
import axios from 'axios';

interface Props {
  data: AppData;
  setData: (d: AppData | ((prev: AppData) => AppData)) => void;
}

interface WargaForm {
  nik: string;
  nama: string;
  jenis_kelamin: 'L' | 'P';
  status_keluarga: string;
}

export function DataKeluarga({ data, setData }: Props) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    no_kk: '',
    alamat: '',
    rt_rw: '',
    kelurahan: '',
    kecamatan: '',
    wargas: [] as WargaForm[],
  });

  useEffect(() => {
    if ((data.keluargas || []).length === 0) {
      axios.get('/api/keluarga').then(res => {
        setData((prev: AppData) => ({ ...prev, keluargas: res.data }));
      }).catch(err => console.error(err));
    }
  }, []);

  const keluargas = (data.keluargas || []).filter(k => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      k.no_kk?.toLowerCase().includes(s) ||
      k.alamat?.toLowerCase().includes(s) ||
      k.wargas?.some(w => w.nama.toLowerCase().includes(s))
    );
  });

  const resetForm = () => {
    setForm({ no_kk: '', alamat: '', rt_rw: '', kelurahan: '', kecamatan: '', wargas: [] });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (k: Keluarga) => {
    setForm({
      no_kk: k.no_kk,
      alamat: k.alamat,
      rt_rw: k.rt_rw || '',
      kelurahan: k.kelurahan || '',
      kecamatan: k.kecamatan || '',
      wargas: [], // Edit is disabled for nested members for now
    });
    setEditId(k.id);
    setShowForm(true);
  };

  const addWargaForm = () => {
    setForm({
      ...form,
      wargas: [...form.wargas, { nik: '', nama: '', jenis_kelamin: 'L', status_keluarga: 'Anak' }]
    });
  };

  const removeWargaForm = (index: number) => {
    const newWargas = [...form.wargas];
    newWargas.splice(index, 1);
    setForm({ ...form, wargas: newWargas });
  };

  const updateWargaForm = (index: number, field: keyof WargaForm, value: string) => {
    const newWargas = [...form.wargas];
    newWargas[index] = { ...newWargas[index], [field]: value };
    setForm({ ...form, wargas: newWargas });
  };

  const handleSubmit = async () => {
    if (!form.no_kk || !form.alamat) {
      toast.error('No KK dan Alamat wajib diisi.');
      return;
    }
    if (form.no_kk.replace(/\D/g, '').length !== 16) {
      toast.error('No KK harus 16 digit angka.');
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(`/api/keluarga/${editId}`, form);
        setData((prev: AppData) => ({
          ...prev,
          keluargas: prev.keluargas.map(k => k.id === editId ? res.data : k),
        }));
        toast.success('Data keluarga berhasil diperbarui.');
      } else {
        const res = await axios.post('/api/keluarga', form);
        setData((prev: AppData) => ({
          ...prev,
          keluargas: [res.data, ...prev.keluargas],
          wargas: res.data.wargas ? [...res.data.wargas, ...prev.wargas] : prev.wargas,
        }));
        toast.success('Data keluarga beserta anggotanya berhasil ditambahkan.');
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data keluarga ini? Semua data warga terkait akan terputus hubungannya.')) return;
    try {
      await axios.delete(`/api/keluarga/${id}`);
      setData((prev: AppData) => ({
        ...prev,
        keluargas: prev.keluargas.filter(k => k.id !== id),
      }));
      toast.success('Data keluarga berhasil dihapus.');
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
    a.download = 'template_data_keluarga_terpadu.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="bg-white rounded-none p-6 border-4 border-[#1E3A5F] shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] flex items-center justify-center">
                <Home className="w-5 h-5 text-[#1E3A5F]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">MASTER DATA KELUARGA</h1>
                <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">KELOLA DATA KARTU KELUARGA (KK) DESA</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-none bg-white border-2 border-[#1E3A5F] text-[#1E3A5F] text-xs font-black uppercase tracking-widest shadow-none">
              {keluargas.length} KK
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
              <Plus className="w-4 h-4" /> TAMBAH KK
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]" />
        <input
          type="text"
          placeholder="CARI NO KK, ALAMAT, ATAU NAMA ANGGOTA..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-none border-4 border-[#1E3A5F] bg-white text-sm font-bold placeholder-[#64748B] focus:outline-none focus:ring-0 shadow-none uppercase transition-all"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none p-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-6 border-b-4 border-[#1E3A5F] pb-4">
            <h3 className="text-xl font-black text-[#1E3A5F] uppercase tracking-widest">{editId ? 'EDIT DATA KK' : 'TAMBAH DATA KK BARU'}</h3>
            <button onClick={resetForm} className="p-2 rounded-none border-2 border-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white text-[#1E3A5F] transition-colors shadow-none">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NO. KK <span className="text-red-600">*</span></label>
              <input
                type="text"
                maxLength={16}
                value={form.no_kk}
                onChange={e => setForm({ ...form, no_kk: e.target.value.replace(/\D/g, '') })}
                placeholder="16 DIGIT NOMOR KK"
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white uppercase transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">ALAMAT <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={form.alamat}
                onChange={e => setForm({ ...form, alamat: e.target.value })}
                placeholder="ALAMAT LENGKAP"
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white uppercase transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">RT/RW</label>
              <input
                type="text"
                value={form.rt_rw}
                onChange={e => setForm({ ...form, rt_rw: e.target.value })}
                placeholder="001/002"
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white uppercase transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">KELURAHAN</label>
              <input
                type="text"
                value={form.kelurahan}
                onChange={e => setForm({ ...form, kelurahan: e.target.value })}
                placeholder="KELURAHAN"
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white uppercase transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">KECAMATAN</label>
              <input
                type="text"
                value={form.kecamatan}
                onChange={e => setForm({ ...form, kecamatan: e.target.value })}
                placeholder="KECAMATAN"
                className="w-full px-3 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] text-sm font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white uppercase transition-colors"
              />
            </div>
          </div>

          {/* Bagian Input Warga Dinamis */}
          {!editId && (
            <div className="mt-8 border-t-4 border-[#1E3A5F] pt-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-black text-[#1E3A5F] flex items-center gap-2 uppercase tracking-widest">
                  <Users className="w-5 h-5 text-[#1E3A5F]" /> DAFTAR ANGGOTA KELUARGA
                </h4>
                <button
                  onClick={addWargaForm}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-none border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-[10px] font-black hover:bg-white hover:text-[#1E3A5F] transition-colors uppercase tracking-widest shadow-none"
                >
                  <Plus className="w-4 h-4" /> TAMBAH ANGGOTA
                </button>
              </div>
              
              <div className="space-y-6">
                {form.wargas.length === 0 ? (
                  <div className="text-center py-8 bg-[#FAFAFA] border-4 border-dashed border-[#E2E8F0] rounded-none">
                    <p className="text-sm font-black text-[#64748B] uppercase tracking-widest">BELUM ADA ANGGOTA KELUARGA DITAMBAHKAN.</p>
                    <p className="text-[10px] font-bold text-[#64748B] mt-2 uppercase">KLIK TOMBOL DI ATAS UNTUK MULAI MEMASUKKAN NIK DAN NAMA WARGA.</p>
                  </div>
                ) : (
                  form.wargas.map((w, idx) => (
                    <div key={idx} className="relative bg-[#FAFAFA] p-5 rounded-none border-2 border-[#1E3A5F] shadow-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                      <button 
                        onClick={() => removeWargaForm(idx)}
                        className="absolute -top-3 -right-3 bg-red-600 text-white p-1.5 rounded-none border-2 border-[#1E3A5F] hover:bg-white hover:text-red-600 transition-colors shadow-none"
                        title="Hapus Anggota"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <div>
                        <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NIK <span className="text-red-600">*</span></label>
                        <input
                          type="text"
                          maxLength={16}
                          value={w.nik}
                          onChange={e => updateWargaForm(idx, 'nik', e.target.value.replace(/\D/g, ''))}
                          placeholder="16 DIGIT NIK"
                          className="w-full px-3 py-2 rounded-none border-2 border-[#1E3A5F] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NAMA LENGKAP <span className="text-red-600">*</span></label>
                        <input
                          type="text"
                          value={w.nama}
                          onChange={e => updateWargaForm(idx, 'nama', e.target.value)}
                          placeholder="NAMA LENGKAP"
                          className="w-full px-3 py-2 rounded-none border-2 border-[#1E3A5F] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">STATUS KELUARGA <span className="text-red-600">*</span></label>
                        <select
                          value={w.status_keluarga}
                          onChange={e => updateWargaForm(idx, 'status_keluarga', e.target.value)}
                          className="w-full px-3 py-2 rounded-none border-2 border-[#1E3A5F] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase bg-white"
                        >
                          <option value="Kepala Keluarga">KEPALA KELUARGA</option>
                          <option value="Istri">ISTRI</option>
                          <option value="Anak">ANAK</option>
                          <option value="Orang Tua">ORANG TUA</option>
                          <option value="Lainnya">LAINNYA</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">JENIS KELAMIN <span className="text-red-600">*</span></label>
                        <select
                          value={w.jenis_kelamin}
                          onChange={e => updateWargaForm(idx, 'jenis_kelamin', e.target.value)}
                          className="w-full px-3 py-2 rounded-none border-2 border-[#1E3A5F] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase bg-white"
                        >
                          <option value="L">LAKI-LAKI</option>
                          <option value="P">PEREMPUAN</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          <div className="mt-8 flex justify-end gap-4 pt-6 border-t-4 border-[#1E3A5F]">
            <button onClick={resetForm} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] text-xs font-black text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors uppercase tracking-widest shadow-none">
              BATAL
            </button>
            <button onClick={handleSubmit} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-xs font-black hover:bg-white hover:text-[#1E3A5F] transition-colors uppercase tracking-widest shadow-none">
              {editId ? 'SIMPAN PERUBAHAN' : 'TAMBAH KK'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none overflow-hidden">
        {keluargas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#FAFAFA]">
            <Home className="w-16 h-16 mb-4 text-[#1E3A5F] opacity-20" />
            <p className="font-black text-xl text-[#1E3A5F] uppercase tracking-widest">BELUM ADA DATA KELUARGA</p>
            <p className="text-xs font-bold text-[#64748B] mt-2 uppercase tracking-widest">KLIK "TAMBAH KK" UNTUK MEMULAI</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-[#E2E8F0]">
            {keluargas.map(k => {
              const isExpanded = expandedId === k.id;
              const anggota = k.wargas || [];
              const kepala = anggota.find(w => w.status_keluarga === 'Kepala Keluarga');
              return (
                <div key={k.id} className="group transition-colors">
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 cursor-pointer border-l-4 transition-colors ${isExpanded ? 'bg-[#FAFAFA] border-[#2563EB]' : 'border-transparent hover:bg-[#FAFAFA] hover:border-[#1E3A5F]'}`}
                    onClick={() => setExpandedId(isExpanded ? null : k.id)}
                  >
                    <div className="flex-shrink-0 hidden sm:block">
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-[#1E3A5F]" /> : <ChevronRight className="w-5 h-5 text-[#64748B] group-hover:text-[#1E3A5F]" />}
                    </div>
                    <div className="w-12 h-12 rounded-none border-2 border-[#1E3A5F] bg-white flex items-center justify-center flex-shrink-0 shadow-none">
                      <Home className="w-6 h-6 text-[#1E3A5F]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-black text-lg text-[#1E3A5F] uppercase tracking-wider">{k.no_kk}</span>
                        <span className="px-2 py-1 rounded-none border border-[#1E3A5F] bg-[#1E3A5F] text-white text-[10px] font-black uppercase tracking-widest">{anggota.length} ANGGOTA</span>
                      </div>
                      <p className="text-xs font-bold text-[#64748B] truncate mt-1 uppercase tracking-widest">
                        {kepala ? `KK: ${kepala.nama}` : 'BELUM ADA KEPALA KELUARGA'} • {k.alamat}
                        {k.rt_rw ? ` RT/RW ${k.rt_rw}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 sm:ml-auto mt-4 sm:mt-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(k)}
                        className="p-2.5 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors shadow-none"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(k.id)}
                        className="p-2.5 rounded-none border-2 border-[#1E3A5F] bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors shadow-none"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* Expanded: show anggota keluarga */}
                  {isExpanded && (
                    <div className="bg-[#1E3A5F]/5 border-t-2 border-[#E2E8F0] px-6 py-5 animate-in fade-in slide-in-from-top-1 duration-200">
                      {anggota.length === 0 ? (
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest italic border-l-2 border-[#64748B] pl-3">BELUM ADA ANGGOTA TERDAFTAR DI KK INI.</p>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest flex items-center">
                            <Users className="w-4 h-4 inline mr-2" /> ANGGOTA KELUARGA
                          </p>
                          <div className="grid gap-3">
                            {anggota.map(w => (
                              <div key={w.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white px-5 py-4 border-2 border-[#1E3A5F] rounded-none shadow-none">
                                <div className={`w-10 h-10 rounded-none border-2 border-[#1E3A5F] flex items-center justify-center text-xs font-black shadow-none ${
                                  w.jenis_kelamin === 'L' ? 'bg-[#2563EB] text-white' : 'bg-pink-500 text-white'
                                }`}>
                                  {w.jenis_kelamin}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black text-[#1E3A5F] uppercase tracking-widest">{w.nama}</p>
                                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">NIK: {w.nik} • {w.status_keluarga}{w.usia !== null ? ` • ${w.usia} TAHUN` : ''}</p>
                                </div>
                                {w.keterangan_khusus && (
                                  <span className="px-3 py-1 rounded-none border-2 border-[#1E3A5F] bg-amber-400 text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest shadow-none">
                                    {w.keterangan_khusus}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
