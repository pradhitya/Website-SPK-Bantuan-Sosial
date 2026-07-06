import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, Search, Upload, CheckCircle2, Clock, ClipboardList, Database } from 'lucide-react';
import { toast } from 'sonner';
import { AppData, Masyarakat, Keluarga, Warga } from '../../data';
import { ConfirmDialog } from '../ConfirmDialog';

interface Props { data: AppData; setData: (d: AppData) => void; onNavigate?: (page: string) => void; }

const emptyForm = { nik: '', nama: '', alamat: '', noHp: '', rtRw: '', warga_id: null as number | null, keluarga_id: null as number | null };

export function DataMasyarakat({ data, setData, onNavigate }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Masyarakat | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [addMode, setAddMode] = useState<'master' | 'manual'>('master');
  const [selectedMasterIds, setSelectedMasterIds] = useState<number[]>([]);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if ((data.wargas || []).length === 0) {
      axios.get('/api/warga').then(res => setData((prev: AppData) => ({...prev, wargas: res.data}))).catch(err => console.error(err));
    }
    if ((data.keluargas || []).length === 0) {
      axios.get('/api/keluarga').then(res => setData((prev: AppData) => ({...prev, keluargas: res.data}))).catch(err => console.error(err));
    }
  }, []);

  const activePeriode = data.activePeriode || '2026-06';
  const activeProgram = data.jenisBantuan.find(j => j.id === data.activeJenisBantuanId);
  const targetPenerima = activeProgram?.target_penerima || 'keluarga';
  const filterTarget = (activeProgram?.filter_target || '').toLowerCase();
  const programName = (activeProgram?.nama_program || '').toLowerCase();
  
  const filtered = data.masyarakat.filter(m =>
    (!activePeriode || !m.periode || m.periode === activePeriode) &&
    (m.nama.toLowerCase().includes(search.toLowerCase()) ||
    m.nik.includes(search) ||
    m.alamat.toLowerCase().includes(search.toLowerCase()))
  );

  // IDs already registered for this period+program to prevent duplicates
  const registeredWargaIds = new Set(data.masyarakat.filter(m => m.periode === activePeriode && m.jenis_bantuan_id === data.activeJenisBantuanId).map(m => m.warga_id).filter(Boolean));
  const registeredKeluargaIds = new Set(data.masyarakat.filter(m => m.periode === activePeriode && m.jenis_bantuan_id === data.activeJenisBantuanId).map(m => m.keluarga_id).filter(Boolean));

  // Filter master data based on program type
  const filteredMasterKeluargas = (data.keluargas || []).filter(k => !registeredKeluargaIds.has(k.id));
  
  const filteredMasterWargas = (() => {
    let wargas = (data.wargas || []).filter(w => !registeredWargaIds.has(w.id));
    
    // Lansia: only age >= 60
    if (filterTarget === 'lansia' || programName.includes('lansia')) {
      wargas = wargas.filter(w => w.usia !== null && w.usia !== undefined && w.usia >= 60);
    }
    // Stunting: only women/perempuan (ibu)
    else if (filterTarget === 'stunting' || programName.includes('stunting')) {
      wargas = wargas.filter(w => w.jenis_kelamin === 'P');
    }
    // BLT, Sembako, RLTH: only Kepala Keluarga
    else if (targetPenerima === 'keluarga' || programName.includes('blt') || programName.includes('sembako') || programName.includes('rtlh') || programName.includes('rlth')) {
      wargas = wargas.filter(w => w.status_keluarga === 'Kepala Keluarga');
    }
    
    return wargas;
  })();

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
    setAddMode('master');
    setSelectedMasterIds([]);
    setShowModal(true);
  };

  const openEdit = (m: Masyarakat) => {
    setEditItem(m);
    setForm({ nik: m.nik, nama: m.nama, alamat: m.alamat, noHp: m.noHp, rtRw: m.rtRw, warga_id: m.warga_id || null, keluarga_id: m.keluarga_id || null });
    setErrors({});
    setShowModal(true);
  };

  const handleSelectMaster = (idStr: string) => {
    if (!idStr) {
      setForm(emptyForm);
      return;
    }
    
    if (targetPenerima === 'keluarga') {
      const k = data.keluargas?.find(x => x.id.toString() === idStr);
      if (k) {
        const kepala = k.wargas?.find(w => w.status_keluarga === 'Kepala Keluarga') || k.wargas?.[0];
        setForm({
          nik: kepala ? kepala.nik : '',
          nama: kepala ? kepala.nama : 'Kepala Keluarga Belum Diatur',
          alamat: k.alamat,
          rtRw: k.rt_rw || '',
          noHp: kepala?.no_hp || '',
          keluarga_id: k.id,
          warga_id: kepala?.id || null,
        });
      }
    } else {
      const w = data.wargas?.find(x => x.id.toString() === idStr);
      if (w) {
        setForm({
          nik: w.nik,
          nama: w.nama,
          alamat: w.keluarga?.alamat || '',
          rtRw: w.keluarga?.rt_rw || '',
          noHp: w.no_hp || '',
          warga_id: w.id,
          keluarga_id: w.keluarga_id || null,
        });
      }
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    
    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('periode', activePeriode);
    if (data.activeJenisBantuanId) {
      formData.append('jenis_bantuan_id', data.activeJenisBantuanId.toString());
    }
    
    setImporting(true);
    try {
      const res = await axios.post('/api/import-masyarakat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message || 'Data berhasil diimpor');
      setImportModalOpen(false);
      setImportFile(null);
      // Refresh
      const refreshParams = new URLSearchParams();
      if (activePeriode) refreshParams.append('periode', activePeriode);
      if (data.activeJenisBantuanId) refreshParams.append('jenis_bantuan_id', data.activeJenisBantuanId.toString());
      const refreshRes = await axios.get(`/api/init?${refreshParams.toString()}`);
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
        const payload = { 
          ...form, 
          tglDaftar: today, 
          periode: activePeriode,
          jenis_bantuan_id: data.activeJenisBantuanId
        };
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

  const saveBulk = async () => {
    if (selectedMasterIds.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const payload = [];

    for (const id of selectedMasterIds) {
      if (targetPenerima === 'keluarga') {
        const k = data.keluargas?.find(x => x.id === id);
        if (k) {
          const kepala = k.wargas?.find(w => w.status_keluarga === 'Kepala Keluarga') || k.wargas?.[0];
          payload.push({
            nik: kepala ? kepala.nik : '-',
            nama: kepala ? kepala.nama : 'Kepala Keluarga Belum Diatur',
            alamat: k.alamat || '-',
            rtRw: k.rt_rw || '-',
            noHp: kepala?.no_hp || '-',
            keluarga_id: k.id,
            warga_id: kepala?.id || null,
            tglDaftar: today, 
            periode: activePeriode,
            jenis_bantuan_id: data.activeJenisBantuanId
          });
        }
      } else {
        const w = filteredMasterWargas.find(x => x.id === id);
        if (w) {
          payload.push({
            nik: w.nik || '-',
            nama: w.nama || '-',
            alamat: w.keluarga?.alamat || '-',
            rtRw: w.keluarga?.rt_rw || '-',
            noHp: w.no_hp || '-',
            warga_id: w.id,
            keluarga_id: w.keluarga_id || null,
            tglDaftar: today, 
            periode: activePeriode,
            jenis_bantuan_id: data.activeJenisBantuanId
          });
        }
      }
    }

    try {
      const res = await axios.post('/api/masyarakat/bulk', { data: payload });
      toast.success(`${res.data.length} data masyarakat berhasil ditambahkan`);
      setShowModal(false);
      const refreshParams = new URLSearchParams();
      if (activePeriode) refreshParams.append('periode', activePeriode);
      if (data.activeJenisBantuanId) refreshParams.append('jenis_bantuan_id', data.activeJenisBantuanId.toString());
      const refreshRes = await axios.get(`/api/init?${refreshParams.toString()}`);
      setData({ ...data, masyarakat: refreshRes.data.masyarakat });
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan data');
    }
  };

  const deleteMasyarakat = async (id: number) => {
    try {
      const res = await axios.delete(`/api/masyarakat/${id}`);
      const hadSaw = res.data.had_saw_results;
      
      let updatedData: AppData = {
        ...data,
        masyarakat: data.masyarakat.filter(m => m.id !== id),
        penilaian: data.penilaian.filter(p => p.masyarakatId !== id),
      };

      if (hadSaw) {
        // Clean up orphan SAW results and related data
        const removedSawIds = updatedData.hasilSAW.filter(h => h.masyarakatId === id).map(h => h.id);
        updatedData = {
          ...updatedData,
          hasilSAW: updatedData.hasilSAW.filter(h => h.masyarakatId !== id),
          klaimBantuans: updatedData.klaimBantuans.filter(k => !removedSawIds.includes(k.hasil_saw_id)),
        };
        // If no more SAW results for this period+bantuan, reset sawProcessed and approvedIds
        const remainingHasil = updatedData.hasilSAW.filter(
          h => h.periode === (data.activePeriode || '2026-06') && h.jenis_bantuan_id == data.activeJenisBantuanId
        );
        if (remainingHasil.length === 0) {
          const approvalKey = (data.activePeriode || '2026-06') + (data.activeJenisBantuanId ? '_' + data.activeJenisBantuanId : '');
          const newApprovedIds = { ...updatedData.approvedIds };
          delete newApprovedIds[approvalKey];
          updatedData = { ...updatedData, sawProcessed: false, approvedIds: newApprovedIds };
        }
      }

      setData(updatedData);
      toast.success('Data masyarakat berhasil dihapus');
      setConfirmDelete(null);
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus data');
    }
  };

  const deleteBulkMasyarakat = async () => {
    try {
      const res = await axios.post('/api/masyarakat/bulk-delete', { ids: selectedIds });
      const hadSaw = res.data.had_saw_results;

      let updatedData: AppData = {
        ...data,
        masyarakat: data.masyarakat.filter(m => !selectedIds.includes(m.id)),
        penilaian: data.penilaian.filter(p => !selectedIds.includes(p.masyarakatId)),
      };

      if (hadSaw) {
        // Clean up orphan SAW results and related data
        const removedSawIds = updatedData.hasilSAW.filter(h => selectedIds.includes(h.masyarakatId)).map(h => h.id);
        updatedData = {
          ...updatedData,
          hasilSAW: updatedData.hasilSAW.filter(h => !selectedIds.includes(h.masyarakatId)),
          klaimBantuans: updatedData.klaimBantuans.filter(k => !removedSawIds.includes(k.hasil_saw_id)),
        };
        // If no more SAW results for this period+bantuan, reset sawProcessed and approvedIds
        const remainingHasil = updatedData.hasilSAW.filter(
          h => h.periode === (data.activePeriode || '2026-06') && h.jenis_bantuan_id == data.activeJenisBantuanId
        );
        if (remainingHasil.length === 0) {
          const approvalKey = (data.activePeriode || '2026-06') + (data.activeJenisBantuanId ? '_' + data.activeJenisBantuanId : '');
          const newApprovedIds = { ...updatedData.approvedIds };
          delete newApprovedIds[approvalKey];
          updatedData = { ...updatedData, sawProcessed: false, approvedIds: newApprovedIds };
        }
      }

      setData(updatedData);
      setSelectedIds([]);
      setConfirmBulkDelete(false);
      toast.success(`${selectedIds.length} data masyarakat berhasil dihapus`);
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus data terpilih');
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">DATA CALON PENERIMA BANSOS</h2>
          <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">KELOLA DATA BIODATA WARGA CALON PENERIMA</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {selectedIds.length > 0 && (
            <button onClick={() => setConfirmBulkDelete(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-none border-2 border-[#1E3A5F] bg-white text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors shadow-none">
              <Trash2 className="w-4 h-4" />
              <span>HAPUS {selectedIds.length}</span>
            </button>
          )}
          <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] text-xs font-black uppercase tracking-widest hover:bg-[#1E3A5F] hover:text-white transition-colors shadow-none">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">IMPORT CSV</span>
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-none border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#1E3A5F] transition-colors shadow-none">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">TAMBAH DATA</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none overflow-hidden">
        <div className="px-6 py-5 border-b-4 border-[#1E3A5F] flex flex-col sm:flex-row items-center gap-6 justify-between bg-[#FAFAFA]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
            <label className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest whitespace-nowrap">PERIODE:</label>
            <input 
              type="month" 
              value={activePeriode} 
              onChange={e => setData({...data, activePeriode: e.target.value})}
              className="px-4 py-3 border-2 border-[#1E3A5F] rounded-none text-sm font-bold uppercase focus:outline-none focus:border-[#2563EB] bg-white shadow-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1E3A5F]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="CARI NAMA, NIK, ATAU ALAMAT..."
                className="w-full pl-12 pr-4 py-3 rounded-none border-2 border-[#1E3A5F] text-sm font-bold uppercase placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] bg-white shadow-none transition-colors"
              />
            </div>
            <div className="px-4 py-3 border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white rounded-none text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-none">
              {filtered.length} DATA
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white border-b-4 border-[#1E3A5F]">
                <th className="px-3 py-3 w-8">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded-none border-2 border-[#1E3A5F] text-[#1E3A5F] focus:ring-0 cursor-pointer shadow-none transition-colors"
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
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest w-10">NO</th>
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest w-40">NIK</th>
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest min-w-[150px]">NAMA {targetPenerima === 'keluarga' ? 'KEPALA KELUARGA' : 'WARGA'}</th>
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest hidden lg:table-cell max-w-[200px]">ALAMAT</th>
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest hidden md:table-cell w-20">RT/RW</th>
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest hidden md:table-cell w-28">NO. HP</th>
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest w-24">STATUS</th>
                <th className="text-right px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest w-32">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#E2E8F0]">
              {filtered.map((m, i) => {
                const dinilai = data.penilaian.some(p => p.masyarakatId === m.id);
                return (
                  <tr key={m.id} className="hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded-none border-2 border-[#1E3A5F] text-[#1E3A5F] focus:ring-0 cursor-pointer shadow-none transition-colors"
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
                    <td className="px-3 py-3 font-black text-sm text-[#1E3A5F] text-center">{i + 1}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center px-2 py-1 border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] font-bold text-[10px] uppercase tracking-widest shadow-none">
                        {m.nik}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-black text-[#1E3A5F] uppercase tracking-widest text-xs leading-tight">{m.nama}</td>
                    <td className="px-3 py-3 text-[#64748B] font-bold text-[10px] uppercase tracking-widest hidden lg:table-cell max-w-[200px] truncate" title={m.alamat}>{m.alamat}</td>
                    <td className="px-3 py-3 font-bold text-[#1E3A5F] text-[10px] uppercase tracking-widest hidden md:table-cell">{m.rtRw}</td>
                    <td className="px-3 py-3 font-bold text-[#1E3A5F] text-[10px] uppercase tracking-widest hidden md:table-cell break-all">{m.noHp}</td>
                    <td className="px-3 py-3">
                      {dinilai ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 border-2 border-[#1E3A5F] bg-emerald-400 text-[#1E3A5F] text-[9px] font-black uppercase tracking-widest shadow-none">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>DINILAI</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 border-2 border-[#1E3A5F] bg-amber-400 text-[#1E3A5F] text-[9px] font-black uppercase tracking-widest shadow-none">
                          <Clock className="w-3.5 h-3.5" />
                          <span>BELUM</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => onNavigate && onNavigate('penilaian')} className="p-1.5 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors shadow-none" title="Beri Penilaian">
                          <ClipboardList className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(m)} className="p-1.5 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors shadow-none" title="Edit Data">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(m.id)} className="p-1.5 rounded-none border-2 border-[#1E3A5F] bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors shadow-none" title="Hapus Data">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center bg-[#FAFAFA]">
                    <div className="inline-flex flex-col items-center justify-center text-[#1E3A5F] opacity-30">
                      <Search className="w-12 h-12 mb-4" />
                      <p className="text-sm font-black uppercase tracking-widest">TIDAK ADA DATA DITEMUKAN</p>
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-none border-4 border-[#1E3A5F] shadow-none w-full max-w-lg z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b-4 border-[#1E3A5F] bg-[#FAFAFA]">
              <h3 className="font-black text-lg text-[#1E3A5F] uppercase tracking-widest">{editItem ? 'EDIT DATA MASYARAKAT' : 'TAMBAH DATA MASYARAKAT'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-none border-2 border-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white text-[#1E3A5F] transition-colors shadow-none">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-6">
              {!editItem && (
                <div className="flex border-b-2 border-[#1E3A5F] mb-6">
                  <button 
                    onClick={() => setAddMode('master')} 
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${addMode === 'master' ? 'bg-[#1E3A5F] text-white' : 'bg-[#FAFAFA] text-[#1E3A5F] hover:bg-gray-200'}`}
                  >
                    DARI MASTER DATA
                  </button>
                  <button 
                    onClick={() => setAddMode('manual')} 
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${addMode === 'manual' ? 'bg-[#1E3A5F] text-white' : 'bg-[#FAFAFA] text-[#1E3A5F] hover:bg-gray-200'}`}
                  >
                    INPUT MANUAL
                  </button>
                </div>
              )}

              {(!editItem && addMode === 'master') ? (
                <div className="border-2 border-[#1E3A5F]">
                  <div className="p-3 bg-[#FAFAFA] border-b-2 border-[#1E3A5F] flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">
                        PILIH {targetPenerima === 'keluarga' ? 'KELUARGA/KK' : 'WARGA'} UNTUK DITAMBAHKAN
                      </p>
                      <span className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest bg-white border border-[#1E3A5F] px-2 py-1">
                        {selectedMasterIds.length} TERPILIH
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest bg-amber-50 border border-amber-300 px-2 py-1">
                      FILTER: {programName.includes('lansia') ? 'HANYA WARGA USIA ≥ 60 TAHUN' : programName.includes('stunting') ? 'HANYA IBU / PEREMPUAN' : 'HANYA KEPALA KELUARGA'}
                      {' '}({targetPenerima === 'keluarga' ? filteredMasterKeluargas.length : filteredMasterWargas.length} TERSEDIA)
                    </p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-white shadow-sm border-b-2 border-[#1E3A5F] z-10">
                        <tr>
                          <th className="px-3 py-2 w-10 text-center border-r-2 border-[#1E3A5F]">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded-none border-2 border-[#1E3A5F] text-[#1E3A5F] focus:ring-0 cursor-pointer shadow-none"
                              checked={
                                targetPenerima === 'keluarga' 
                                  ? (filteredMasterKeluargas.length > 0 && selectedMasterIds.length === filteredMasterKeluargas.length)
                                  : (filteredMasterWargas.length > 0 && selectedMasterIds.length === filteredMasterWargas.length)
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMasterIds(
                                    targetPenerima === 'keluarga' 
                                      ? filteredMasterKeluargas.map(k => k.id) 
                                      : filteredMasterWargas.map(w => w.id)
                                  );
                                } else {
                                  setSelectedMasterIds([]);
                                }
                              }}
                            />
                          </th>
                          <th className="text-left px-3 py-2 font-black text-[#1E3A5F] uppercase tracking-widest">NAMA / IDENTITAS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-[#E2E8F0]">
                        {targetPenerima === 'keluarga' 
                          ? filteredMasterKeluargas.map(k => (
                              <tr key={k.id} className="hover:bg-[#FAFAFA] cursor-pointer" onClick={() => {
                                if (selectedMasterIds.includes(k.id)) setSelectedMasterIds(selectedMasterIds.filter(id => id !== k.id));
                                else setSelectedMasterIds([...selectedMasterIds, k.id]);
                              }}>
                                <td className="px-3 py-2 text-center border-r-2 border-[#E2E8F0]">
                                  <input type="checkbox" checked={selectedMasterIds.includes(k.id)} readOnly className="w-4 h-4 rounded-none border-2 border-[#1E3A5F] text-[#1E3A5F] focus:ring-0 cursor-pointer" />
                                </td>
                                <td className="px-3 py-2 font-bold uppercase text-[#1E3A5F]">{k.no_kk} - {k.wargas?.find(w=>w.status_keluarga==='Kepala Keluarga')?.nama || k.alamat}</td>
                              </tr>
                            ))
                          : filteredMasterWargas.map(w => (
                              <tr key={w.id} className="hover:bg-[#FAFAFA] cursor-pointer" onClick={() => {
                                if (selectedMasterIds.includes(w.id)) setSelectedMasterIds(selectedMasterIds.filter(id => id !== w.id));
                                else setSelectedMasterIds([...selectedMasterIds, w.id]);
                              }}>
                                <td className="px-3 py-2 text-center border-r-2 border-[#E2E8F0]">
                                  <input type="checkbox" checked={selectedMasterIds.includes(w.id)} readOnly className="w-4 h-4 rounded-none border-2 border-[#1E3A5F] text-[#1E3A5F] focus:ring-0 cursor-pointer" />
                                </td>
                                <td className="px-3 py-2 font-bold uppercase text-[#1E3A5F]">{w.nik} - {w.nama} {w.usia ? `(${w.usia} THN)` : ''} {w.jenis_kelamin === 'P' ? '♀' : '♂'}</td>
                              </tr>
                            ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NIK (16 DIGIT) <span className="text-red-600">*</span></label>
                    <input value={form.nik} onChange={e => setForm({ ...form, nik: e.target.value })} maxLength={16} placeholder="3271010101800001"
                      className={`w-full px-3 py-3 rounded-none border-2 text-sm font-bold uppercase transition-colors focus:outline-none ${errors.nik ? 'border-red-600 bg-red-50' : 'border-[#1E3A5F] bg-[#FAFAFA] focus:border-[#2563EB] focus:bg-white'}`} />
                    {errors.nik && <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-2">{errors.nik}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NAMA {targetPenerima === 'keluarga' ? 'KEPALA KELUARGA' : 'LENGKAP'} <span className="text-red-600">*</span></label>
                    <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="NAMA LENGKAP"
                      className={`w-full px-3 py-3 rounded-none border-2 text-sm font-bold uppercase transition-colors focus:outline-none ${errors.nama ? 'border-red-600 bg-red-50' : 'border-[#1E3A5F] bg-[#FAFAFA] focus:border-[#2563EB] focus:bg-white'}`} />
                    {errors.nama && <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-2">{errors.nama}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">ALAMAT LENGKAP <span className="text-red-600">*</span></label>
                    <textarea value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="JL. ..." rows={2}
                      className={`w-full px-3 py-3 rounded-none border-2 text-sm font-bold uppercase transition-colors focus:outline-none resize-none ${errors.alamat ? 'border-red-600 bg-red-50' : 'border-[#1E3A5F] bg-[#FAFAFA] focus:border-[#2563EB] focus:bg-white'}`} />
                    {errors.alamat && <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-2">{errors.alamat}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">RT/RW <span className="text-red-600">*</span></label>
                      <input value={form.rtRw} onChange={e => setForm({ ...form, rtRw: e.target.value })} placeholder="01/02"
                        className={`w-full px-3 py-3 rounded-none border-2 text-sm font-bold uppercase transition-colors focus:outline-none ${errors.rtRw ? 'border-red-600 bg-red-50' : 'border-[#1E3A5F] bg-[#FAFAFA] focus:border-[#2563EB] focus:bg-white'}`} />
                      {errors.rtRw && <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-2">{errors.rtRw}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NO. HP <span className="text-red-600">*</span></label>
                      <input value={form.noHp} onChange={e => setForm({ ...form, noHp: e.target.value })} placeholder="08XXXXXXXXXX"
                        className={`w-full px-3 py-3 rounded-none border-2 text-sm font-bold uppercase transition-colors focus:outline-none ${errors.noHp ? 'border-red-600 bg-red-50' : 'border-[#1E3A5F] bg-[#FAFAFA] focus:border-[#2563EB] focus:bg-white'}`} />
                      {errors.noHp && <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-2">{errors.noHp}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-4 px-6 py-5 border-t-4 border-[#1E3A5F] bg-[#FAFAFA]">
              <button onClick={() => setShowModal(false)} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] text-xs font-black text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white uppercase tracking-widest transition-colors shadow-none">BATAL</button>
              <button onClick={!editItem && addMode === 'master' ? saveBulk : save} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-xs font-black hover:bg-white hover:text-[#1E3A5F] uppercase tracking-widest transition-colors shadow-none">SIMPAN</button>
            </div>
          </div>
        </div>
      )}

      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !importing && setImportModalOpen(false)} />
          <div className="relative bg-white rounded-none border-4 border-[#1E3A5F] shadow-none w-full max-w-md z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b-4 border-[#1E3A5F] bg-[#FAFAFA]">
              <h3 className="font-black text-lg text-[#1E3A5F] uppercase tracking-widest">IMPORT DATA CSV</h3>
              <button onClick={() => !importing && setImportModalOpen(false)} disabled={importing} className="p-2 rounded-none border-2 border-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white text-[#1E3A5F] transition-colors shadow-none disabled:opacity-50"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleImport}>
              <div className="px-6 py-6 space-y-6">
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest leading-relaxed border-l-4 border-[#1E3A5F] pl-3">
                  UNGGAH FILE CSV YANG BERISI DATA MASYARAKAT. PASTIKAN FORMAT KOLOM SESUAI: <br/><br/>
                  <code className="text-xs font-black bg-[#FAFAFA] border-2 border-[#1E3A5F] px-2 py-1 rounded-none text-[#1E3A5F] shadow-none inline-block">nik, nama, alamat, rt_rw, no_hp</code>
                </p>
                <div>
                  <input type="file" accept=".csv" required onChange={e => setImportFile(e.target.files?.[0] || null)} className="w-full text-xs font-bold text-[#1E3A5F] uppercase file:mr-4 file:py-3 file:px-6 file:rounded-none file:border-2 file:border-[#1E3A5F] file:text-xs file:font-black file:bg-[#FAFAFA] file:text-[#1E3A5F] hover:file:bg-[#1E3A5F] hover:file:text-white file:transition-colors file:shadow-none cursor-pointer" />
                </div>
              </div>
              <div className="flex justify-end gap-4 px-6 py-5 border-t-4 border-[#1E3A5F] bg-[#FAFAFA]">
                <button type="button" onClick={() => setImportModalOpen(false)} disabled={importing} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] text-xs font-black text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white uppercase tracking-widest transition-colors shadow-none disabled:opacity-50">BATAL</button>
                <button type="submit" disabled={!importFile || importing} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] bg-emerald-500 text-[#1E3A5F] text-xs font-black hover:bg-[#1E3A5F] hover:text-white uppercase tracking-widest transition-colors shadow-none disabled:opacity-50 flex items-center gap-2">
                  {importing ? 'MENGIMPOR...' : <><Upload className="w-4 h-4" /> IMPORT</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="HAPUS DATA MASYARAKAT"
        message="APAKAH ANDA YAKIN INGIN MENGHAPUS DATA INI? DATA PENILAIAN TERKAIT JUGA AKAN IKUT TERHAPUS."
        onConfirm={() => confirmDelete !== null && deleteMasyarakat(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`HAPUS ${selectedIds.length} DATA MASYARAKAT`}
        message="APAKAH ANDA YAKIN INGIN MENGHAPUS DATA-DATA TERPILIH INI? DATA PENILAIAN TERKAIT JUGA AKAN IKUT TERHAPUS."
        onConfirm={deleteBulkMasyarakat}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  );
}
