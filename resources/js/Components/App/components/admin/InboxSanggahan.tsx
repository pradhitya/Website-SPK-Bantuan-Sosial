import { useState } from 'react';
import axios from 'axios';
import { Inbox, CheckCircle2, XCircle, AlertTriangle, Eye, MessageSquare, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { AppData, Sanggahan } from '../../data';

interface Props {
  data: AppData;
  setData: (d: AppData) => void;
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  baru: { label: 'BARU', class: 'bg-blue-400 text-[#1E3A5F] border-[#1E3A5F]' },
  diverifikasi_valid: { label: 'VALID', class: 'bg-emerald-400 text-[#1E3A5F] border-[#1E3A5F]' },
  ditolak: { label: 'DITOLAK', class: 'bg-rose-400 text-[#1E3A5F] border-[#1E3A5F]' },
  perlu_cek_lapangan: { label: 'CEK LAPANGAN', class: 'bg-amber-400 text-[#1E3A5F] border-[#1E3A5F]' },
};

export function InboxSanggahan({ data, setData }: Props) {
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState<Sanggahan | null>(null);
  const [verifyModal, setVerifyModal] = useState<Sanggahan | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<string>('');
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [saving, setSaving] = useState(false);

  const sanggahans = (data.sanggahans || [])
    .filter(s => {
      if (data.activeJenisBantuanId && s.bantuan_id !== data.activeJenisBantuanId) return false;
      if (filterStatus !== 'semua' && s.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (s.warga_pelapor || '').toLowerCase().includes(q) ||
          (s.nama_warga_dilaporkan || '').toLowerCase().includes(q) ||
          (s.isi_sanggahan || '').toLowerCase().includes(q)
        );
      }
      return true;
    });

  const counts = {
    baru: (data.sanggahans || []).filter(s => s.status === 'baru' && (!data.activeJenisBantuanId || s.bantuan_id === data.activeJenisBantuanId)).length,
    total: (data.sanggahans || []).filter(s => !data.activeJenisBantuanId || s.bantuan_id === data.activeJenisBantuanId).length,
  };

  const openVerify = (s: Sanggahan) => {
    setVerifyModal(s);
    setVerifyStatus('');
    setCatatanAdmin(s.catatan_admin || '');
  };

  const handleVerify = async () => {
    if (!verifyModal || !verifyStatus) {
      toast.error('PILIH STATUS VERIFIKASI');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.patch(`/api/sanggahan/${verifyModal.id}/verify`, {
        status: verifyStatus,
        catatan_admin: catatanAdmin,
        user_id: 1, // Admin ID
      });
      // Update local state
      const updated = data.sanggahans.map(s =>
        s.id === verifyModal.id ? { ...s, status: verifyStatus as any, catatan_admin: catatanAdmin, tanggal_verifikasi: new Date().toISOString() } : s
      );
      setData({ ...data, sanggahans: updated });
      toast.success('SANGGAHAN BERHASIL DIVERIFIKASI');
      setVerifyModal(null);
    } catch (e) {
      toast.error('GAGAL MEMVERIFIKASI SANGGAHAN');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight flex items-center gap-3 uppercase">
            <div className="bg-amber-400 p-2 rounded-none border-4 border-[#1E3A5F] shadow-none"><Inbox className="w-6 h-6 text-[#1E3A5F]" /></div>
            INBOX SANGGAHAN
          </h2>
          <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-2">VERIFIKASI LAPORAN SANGGAHAN DARI MASYARAKAT</p>
        </div>
        {counts.baru > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-amber-400 border-4 border-[#1E3A5F] shadow-none rounded-none">
            <AlertTriangle className="w-5 h-5 text-[#1E3A5F]" />
            <span className="text-xs font-black text-[#1E3A5F] uppercase tracking-widest">{counts.baru} SANGGAHAN BARU</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="CARI PELAPOR ATAU WARGA DILAPORKAN..."
            className="w-full pl-12 pr-4 py-3 text-sm font-bold uppercase rounded-none border-4 border-[#1E3A5F] bg-white focus:outline-none focus:border-[#2563EB] shadow-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#1E3A5F] hidden sm:block mr-2" />
          {['semua', 'baru', 'diverifikasi_valid', 'ditolak', 'perlu_cek_lapangan'].map(st => (
            <button key={st} onClick={() => setFilterStatus(st)}
              className={`px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-colors border-2 shadow-none ${filterStatus === st ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white'}`}
            >
              {st === 'semua' ? 'SEMUA' : STATUS_LABELS[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {sanggahans.length === 0 ? (
        <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none p-12 text-center">
          <Inbox className="w-16 h-16 text-[#1E3A5F] mx-auto mb-4 opacity-50" />
          <p className="font-black text-lg text-[#1E3A5F] uppercase tracking-widest">TIDAK ADA SANGGAHAN</p>
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-2">BELUM ADA LAPORAN SANGGAHAN UNTUK FILTER YANG DIPILIH.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sanggahans.map(s => {
            const st = STATUS_LABELS[s.status] || STATUS_LABELS['baru'];
            return (
              <div key={s.id} className="bg-white rounded-none border-4 border-[#1E3A5F] p-4 hover:shadow-none shadow-none transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest border-2 shadow-none ${st.class}`}>{st.label}</span>
                      <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">{s.tanggal_lapor ? new Date(s.tanggal_lapor).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                    </div>
                    <p className="text-sm text-[#1E3A5F] font-bold line-clamp-2 uppercase leading-relaxed">{s.isi_sanggahan}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                      <span className="bg-[#FAFAFA] border-2 border-[#1E3A5F] px-2 py-1 shadow-none">PELAPOR: <strong className="text-[#1E3A5F] font-black">{s.warga_pelapor || '-'}</strong></span>
                      {s.nama_warga_dilaporkan && <span className="bg-[#FAFAFA] border-2 border-[#1E3A5F] px-2 py-1 shadow-none">DILAPORKAN: <strong className="text-[#1E3A5F] font-black">{s.nama_warga_dilaporkan}</strong></span>}
                      {s.jenis_bantuan && <span className="bg-[#FAFAFA] border-2 border-[#1E3A5F] px-2 py-1 shadow-none">PROGRAM: <strong className="text-[#1E3A5F] font-black">{s.jenis_bantuan.nama_program}</strong></span>}
                    </div>
                    {s.catatan_admin && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-none text-xs font-bold text-[#1E3A5F] border-2 border-[#1E3A5F] uppercase shadow-none">
                        <strong className="text-blue-700">CATATAN ADMIN:</strong> {s.catatan_admin}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button onClick={() => setDetailModal(s)} className="p-3 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors shadow-none" title="LIHAT DETAIL">
                      <Eye className="w-5 h-5" />
                    </button>
                    {s.status === 'baru' && (
                      <button onClick={() => openVerify(s)} className="px-4 py-3 rounded-none border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-[10px] font-black hover:bg-white hover:text-[#1E3A5F] transition-colors uppercase tracking-widest shadow-none">
                        VERIFIKASI
                      </button>
                    )}
                    {s.status !== 'baru' && (
                      <button onClick={() => openVerify(s)} className="px-4 py-3 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] text-[10px] font-black hover:bg-[#1E3A5F] hover:text-white transition-colors uppercase tracking-widest shadow-none">
                        UPDATE
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b-4 border-[#1E3A5F] bg-[#FAFAFA]">
              <h3 className="font-black text-lg text-[#1E3A5F] uppercase tracking-widest">DETAIL SANGGAHAN</h3>
            </div>
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="border-2 border-[#1E3A5F] p-3 shadow-none bg-white"><span className="text-[#1E3A5F] font-black text-[10px] uppercase tracking-widest block mb-1">PELAPOR</span><strong className="text-[#1E3A5F] uppercase">{detailModal.warga_pelapor || '-'}</strong></div>
                <div className="border-2 border-[#1E3A5F] p-3 shadow-none bg-white"><span className="text-[#1E3A5F] font-black text-[10px] uppercase tracking-widest block mb-1">NIK PELAPOR</span><strong className="font-mono text-[#1E3A5F]">{detailModal.nik_pelapor || '-'}</strong></div>
                <div className="border-2 border-[#1E3A5F] p-3 shadow-none bg-white"><span className="text-[#1E3A5F] font-black text-[10px] uppercase tracking-widest block mb-1">NO. HP</span><strong className="text-[#1E3A5F]">{detailModal.no_hp_pelapor || '-'}</strong></div>
                <div className="border-2 border-[#1E3A5F] p-3 shadow-none bg-white"><span className="text-[#1E3A5F] font-black text-[10px] uppercase tracking-widest block mb-1">WARGA DILAPORKAN</span><strong className="text-[#1E3A5F] uppercase">{detailModal.nama_warga_dilaporkan || '-'}</strong></div>
                <div className="border-2 border-[#1E3A5F] p-3 shadow-none bg-white"><span className="text-[#1E3A5F] font-black text-[10px] uppercase tracking-widest block mb-1">PROGRAM</span><strong className="text-[#1E3A5F] uppercase">{detailModal.jenis_bantuan?.nama_program || '-'}</strong></div>
                <div className="border-2 border-[#1E3A5F] p-3 shadow-none bg-white"><span className="text-[#1E3A5F] font-black text-[10px] uppercase tracking-widest block mb-2">STATUS</span><span className={`inline-flex items-center px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest border-2 shadow-none ${STATUS_LABELS[detailModal.status]?.class}`}>{STATUS_LABELS[detailModal.status]?.label}</span></div>
              </div>
              <div><span className="text-[#1E3A5F] font-black text-[10px] uppercase tracking-widest block mb-2">ISI SANGGAHAN</span><p className="text-sm font-bold text-[#1E3A5F] bg-[#FAFAFA] p-4 rounded-none border-2 border-[#1E3A5F] shadow-none uppercase leading-relaxed">{detailModal.isi_sanggahan}</p></div>
              {detailModal.bukti && <div><span className="text-[#1E3A5F] font-black text-[10px] uppercase tracking-widest block mb-2">BUKTI</span><img src={`/storage/${detailModal.bukti}`} alt="Bukti" className="rounded-none max-w-full max-h-48 object-cover border-4 border-[#1E3A5F] shadow-none" /></div>}
              {detailModal.catatan_admin && <div><span className="text-[#1E3A5F] font-black text-[10px] uppercase tracking-widest block mb-2">CATATAN ADMIN</span><p className="text-sm font-bold text-[#1E3A5F] bg-blue-50 p-4 rounded-none border-2 border-[#1E3A5F] shadow-none uppercase">{detailModal.catatan_admin}</p></div>}
            </div>
            <div className="px-6 py-5 border-t-4 border-[#1E3A5F] bg-[#FAFAFA] flex justify-end">
              <button onClick={() => setDetailModal(null)} className="px-6 py-3 rounded-none border-2 border-[#1E3A5F] text-[#1E3A5F] bg-white text-xs font-black uppercase tracking-widest hover:bg-[#1E3A5F] hover:text-white transition-colors shadow-none">TUTUP</button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setVerifyModal(null)}>
          <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b-4 border-[#1E3A5F] bg-blue-50">
              <h3 className="font-black text-lg text-[#1E3A5F] flex items-center gap-3 uppercase tracking-widest"><MessageSquare className="w-6 h-6 text-[#1E3A5F]" /> VERIFIKASI SANGGAHAN</h3>
              <p className="text-[10px] font-bold text-[#1E3A5F] mt-1.5 uppercase tracking-widest">DARI: {verifyModal.warga_pelapor}</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 bg-[#FAFAFA] rounded-none border-2 border-[#1E3A5F] text-sm font-bold text-[#1E3A5F] shadow-none uppercase leading-relaxed max-h-32 overflow-y-auto">{verifyModal.isi_sanggahan}</div>
              <div>
                <label className="block text-[10px] font-black text-[#1E3A5F] mb-3 uppercase tracking-widest">STATUS VERIFIKASI</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 'diverifikasi_valid', label: 'VALID', icon: CheckCircle2, cls: 'border-[#1E3A5F] bg-emerald-400 text-[#1E3A5F]' },
                    { val: 'ditolak', label: 'DITOLAK', icon: XCircle, cls: 'border-[#1E3A5F] bg-rose-400 text-[#1E3A5F]' },
                    { val: 'perlu_cek_lapangan', label: 'CEK LAPANGAN', icon: AlertTriangle, cls: 'border-[#1E3A5F] bg-amber-400 text-[#1E3A5F]' },
                  ].map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button key={opt.val} onClick={() => setVerifyStatus(opt.val)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-none border-2 text-[10px] font-black uppercase tracking-widest transition-all ${verifyStatus === opt.val ? opt.cls + ' shadow-none' : 'border-[#1E3A5F] bg-white text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white shadow-none'}`}
                      >
                        <Icon className="w-5 h-5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">CATATAN ADMIN</label>
                <textarea value={catatanAdmin} onChange={e => setCatatanAdmin(e.target.value)} rows={3}
                  placeholder="TAMBAHKAN CATATAN VERIFIKASI..."
                  className="w-full px-4 py-3 text-sm font-bold uppercase rounded-none border-2 border-[#1E3A5F] focus:outline-none focus:border-[#2563EB] shadow-none resize-none bg-[#FAFAFA] focus:bg-white transition-colors"
                />
              </div>
            </div>
            <div className="px-6 py-5 border-t-4 border-[#1E3A5F] bg-[#FAFAFA] flex justify-end gap-4">
              <button onClick={() => setVerifyModal(null)} className="px-6 py-3 rounded-none text-xs font-black text-[#1E3A5F] border-2 border-[#1E3A5F] bg-white hover:bg-[#1E3A5F] hover:text-white uppercase tracking-widest transition-colors shadow-none">BATAL</button>
              <button onClick={handleVerify} disabled={saving || !verifyStatus}
                className="px-6 py-3 rounded-none bg-[#1E3A5F] border-2 border-[#1E3A5F] text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#1E3A5F] disabled:opacity-50 transition-colors shadow-none"
              >
                {saving ? 'MENYIMPAN...' : 'SIMPAN VERIFIKASI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
