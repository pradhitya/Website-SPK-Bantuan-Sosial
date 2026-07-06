import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle2, XCircle, AlertTriangle, ChevronDown, Loader2,
  ShieldCheck, Award, FileText, MessageSquare, Send, QrCode, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { AppData, Sanggahan, HasilSAWItem } from '../../data';
import { ConfirmDialog } from '../ConfirmDialog';

interface Props {
  data: AppData;
  setData: (d: AppData) => void;
}

export function ValidasiKades({ data, setData }: Props) {
  const [selectedBantuanId, setSelectedBantuanId] = useState<number | null>(data.activeJenisBantuanId || null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [resettingApproval, setResettingApproval] = useState(false);
  const [confirmResetApproval, setConfirmResetApproval] = useState(false);
  const [sanggahans, setSanggahans] = useState<Sanggahan[]>([]);
  const [sanggahanDetail, setSanggahanDetail] = useState<Sanggahan | null>(null);
  const [approvalResult, setApprovalResult] = useState<any>(null);

  // Load sanggahans for this bantuan+periode
  useEffect(() => {
    if (selectedBantuanId && data.activePeriode) {
      axios.get('/api/sanggahan/by-hasil-saw', {
        params: { bantuan_id: selectedBantuanId, periode: data.activePeriode }
      }).then(res => setSanggahans(res.data || []))
        .catch(() => setSanggahans([]));
    }
  }, [selectedBantuanId, data.activePeriode]);

  // Fetch data when category changes
  useEffect(() => {
    if (selectedBantuanId) {
      setData(prev => ({ ...prev, activeJenisBantuanId: selectedBantuanId }));
    }
  }, [selectedBantuanId]);

  const hasilForCategory = data.hasilSAW
    .filter(h => h.periode === data.activePeriode && h.jenis_bantuan_id == selectedBantuanId)
    .sort((a, b) => a.ranking - b.ranking);

  const approvalKey = data.activePeriode + (selectedBantuanId ? '_' + selectedBantuanId : '');
  const alreadyApproved = data.approvedIds[approvalKey] || [];
  const isApproved = alreadyApproved.length > 0;

  useEffect(() => {
    if (isApproved) {
      setSelectedIds(alreadyApproved);
    } else {
      // Pre-select all "Layak" entries
      setSelectedIds(hasilForCategory.filter(h => h.status === 'Layak').map(h => h.masyarakatId));
    }
  }, [hasilForCategory.length, isApproved, selectedBantuanId]);

  const toggleSelect = (id: number) => {
    if (isApproved) return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (isApproved) return;
    setSelectedIds(hasilForCategory.map(h => h.masyarakatId));
  };

  const deselectAll = () => {
    if (isApproved) return;
    setSelectedIds([]);
  };

  const getSanggahansForWarga = (masyarakatId: number): Sanggahan[] => {
    return sanggahans.filter(s => s.warga_dilaporkan_id === masyarakatId && s.status === 'diverifikasi_valid');
  };

  const handleApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error('PILIH MINIMAL 1 PENERIMA YANG DISETUJUI');
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post('/api/penilaian/approve', {
        periode: data.activePeriode,
        jenis_bantuan_id: selectedBantuanId,
        approvedIds: selectedIds,
      });

      // Update local state
      const newApproved = { ...data.approvedIds, [approvalKey]: selectedIds };
      setData({ ...data, approvedIds: newApproved });
      setApprovalResult(res.data);
      toast.success(`${res.data.total_approved} PENERIMA BERHASIL DISETUJUI!`);
    } catch (e: any) {
      toast.error('GAGAL MENYIMPAN PERSETUJUAN: ' + (e.response?.data?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleResetApproval = async () => {
    setResettingApproval(true);
    try {
      await axios.post('/api/penilaian/reset-approval', {
        periode: data.activePeriode,
        jenis_bantuan_id: selectedBantuanId,
      });
      // Reset approval state locally
      const newApproved = { ...data.approvedIds };
      delete newApproved[approvalKey];
      // Update hasilSAW status_approval back to 'pending'
      const newHasilSAW = data.hasilSAW.map(h => {
        if (h.periode === data.activePeriode && h.jenis_bantuan_id == selectedBantuanId) {
          return { ...h, status_approval: 'pending' as const };
        }
        return h;
      });
      // Remove klaim bantuans for this program
      const affectedHasilIds = hasilForCategory.map(h => h.id);
      const newKlaimBantuans = data.klaimBantuans.filter(k => !affectedHasilIds.includes(k.hasil_saw_id));
      setData({ ...data, approvedIds: newApproved, hasilSAW: newHasilSAW, klaimBantuans: newKlaimBantuans });
      setApprovalResult(null);
      setSelectedIds(hasilForCategory.filter(h => h.status === 'Layak').map(h => h.masyarakatId));
      toast.success('Pengesahan berhasil dibatalkan, status dikembalikan ke pending');
    } catch (e: any) {
      toast.error('GAGAL MEMBATALKAN PENGESAHAN: ' + (e.response?.data?.message || ''));
    } finally {
      setResettingApproval(false);
      setConfirmResetApproval(false);
    }
  };

  const currentProgram = data.jenisBantuan.find(j => j.id === selectedBantuanId);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white rounded-none border-4 border-[#1E3A5F] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight flex items-center gap-3 uppercase">
              <div className="bg-blue-200 border-2 border-[#1E3A5F] p-2 rounded-none"><ShieldCheck className="w-6 h-6 text-[#1E3A5F]" /></div>
              VALIDASI PENERIMA BANTUAN
            </h2>
            <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-2">SAHKAN HASIL PERHITUNGAN SAW DAN TENTUKAN PENERIMA BANTUAN</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col gap-2 min-w-[150px]">
              <label className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">PILIH PERIODE</label>
              <div className="relative">
                <select
                  value={data.activePeriode}
                  onChange={e => setData({ ...data, activePeriode: e.target.value })}
                  className="w-full px-4 py-3 text-xs font-bold uppercase rounded-none border-2 border-[#1E3A5F] bg-white appearance-none focus:outline-none focus:border-blue-600 transition-colors"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231E3A5F' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', backgroundRepeat: 'no-repeat' }}
                >
                  {(data.availablePeriods || ['2026-06']).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 min-w-[220px]">
              <label className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">PILIH PROGRAM</label>
              <div className="relative">
                <select
                  value={selectedBantuanId || ''}
                  onChange={e => setSelectedBantuanId(parseInt(e.target.value) || null)}
                  className="w-full px-4 py-3 text-xs font-bold uppercase rounded-none border-2 border-[#1E3A5F] bg-white appearance-none focus:outline-none focus:border-blue-600 transition-colors"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231E3A5F' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', backgroundRepeat: 'no-repeat' }}
                >
                  <option value="">-- PILIH PROGRAM --</option>
                  {data.jenisBantuan.map(j => (
                    <option key={j.id} value={j.id}>{j.nama_program.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!selectedBantuanId && (
        <div className="bg-white rounded-none border-4 border-[#1E3A5F] p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-[#E2E8F0] mx-auto mb-4" />
          <p className="font-black text-[#1E3A5F] uppercase tracking-widest text-lg">PILIH PROGRAM BANTUAN</p>
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-2 max-w-sm mx-auto">PILIH PROGRAM BANTUAN DI ATAS UNTUK MELIHAT HASIL SAW DAN MENVALIDASI PENERIMA.</p>
        </div>
      )}

      {selectedBantuanId && hasilForCategory.length === 0 && (
        <div className="bg-white rounded-none border-4 border-[#1E3A5F] p-12 text-center">
          <FileText className="w-12 h-12 text-[#E2E8F0] mx-auto mb-4" />
          <p className="font-black text-[#1E3A5F] uppercase tracking-widest text-lg">BELUM ADA HASIL SAW</p>
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-2 max-w-md mx-auto">ADMIN BELUM MEMPROSES PERHITUNGAN SAW UNTUK PROGRAM <strong className="text-[#1E3A5F]">{currentProgram?.nama_program.toUpperCase()}</strong> PERIODE {data.activePeriode}.</p>
        </div>
      )}

      {selectedBantuanId && hasilForCategory.length > 0 && (
        <>
          {/* Status Bar */}
          {isApproved && (
            <div className="bg-emerald-300 border-4 border-[#1E3A5F] rounded-none p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#1E3A5F] flex-shrink-0" />
                <div>
                  <p className="text-sm font-black text-[#1E3A5F] uppercase tracking-widest">DATA SUDAH DISAHKAN</p>
                  <p className="text-[10px] font-bold text-[#1E3A5F] mt-1 uppercase tracking-widest">{alreadyApproved.length} PENERIMA DISETUJUI UNTUK PERIODE {data.activePeriode}</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmResetApproval(true)}
                disabled={resettingApproval}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1E3A5F] bg-white text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white disabled:opacity-50 transition-colors"
              >
                {resettingApproval ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                BATALKAN PENGESAHAN
              </button>
            </div>
          )}

          {/* Sanggahan Alert */}
          {sanggahans.filter(s => s.status === 'diverifikasi_valid').length > 0 && (
            <div className="bg-amber-300 border-4 border-[#1E3A5F] rounded-none p-4 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[#1E3A5F] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-[#1E3A5F] uppercase tracking-widest">ADA {sanggahans.filter(s => s.status === 'diverifikasi_valid').length} SANGGAHAN TERVERIFIKASI VALID</p>
                <p className="text-[10px] font-bold text-[#1E3A5F] mt-1 uppercase tracking-widest">PERHATIKAN CALON PENERIMA YANG MEMILIKI SANGGAHAN VALID SEBELUM MENYETUJUI.</p>
              </div>
            </div>
          )}

          {/* Approval Result */}
          {approvalResult && (
            <div className="bg-blue-100 border-4 border-[#1E3A5F] rounded-none p-6">
              <div className="flex items-center gap-3 mb-4">
                <Send className="w-6 h-6 text-[#1E3A5F]" />
                <h3 className="text-sm font-black text-[#1E3A5F] uppercase tracking-widest">NOTIFIKASI WHATSAPP</h3>
              </div>
              {approvalResult.klaim_results?.length > 0 ? (
                <div className="space-y-3">
                  {approvalResult.klaim_results.map((kr: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 text-xs bg-white rounded-none p-4 border-2 border-[#1E3A5F]">
                      <QrCode className="w-5 h-5 text-[#1E3A5F] flex-shrink-0" />
                      <span className="flex-1 font-black text-[#1E3A5F] uppercase tracking-wider">{kr.nama}</span>
                      <span className="font-bold text-blue-600">{kr.kode_klaim}</span>
                      <span className={`px-3 py-1 border-2 border-[#1E3A5F] text-[10px] font-black uppercase tracking-widest ${kr.status_kirim_wa === 'terkirim' ? 'bg-emerald-300 text-[#1E3A5F]' : 'bg-rose-300 text-[#1E3A5F]'}`}>
                        WA: {kr.status_kirim_wa}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">KODE KLAIM SUDAH DIBUAT SEBELUMNYA.</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {!isApproved && (
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button onClick={selectAll} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors">PILIH SEMUA</button>
                <button onClick={deselectAll} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors">HAPUS SEMUA</button>
              </div>
              <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest"><strong className="text-[#1E3A5F] text-sm">{selectedIds.length}</strong> DARI {hasilForCategory.length} DIPILIH</p>
            </div>
          )}

          {/* Results Table */}
          <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b-4 border-[#1E3A5F]">
                    <th className="text-center px-4 py-4 w-12 border-r-2 border-[#1E3A5F]">
                      <span className="text-[10px] font-black text-[#1E3A5F]">{isApproved ? 'âœ“' : 'â˜ '}</span>
                    </th>
                    <th className="text-center px-4 py-4 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest border-r-2 border-[#1E3A5F]">RANK</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest border-r-2 border-[#1E3A5F]">NAMA CALON</th>
                    <th className="text-center px-4 py-4 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest border-r-2 border-[#1E3A5F]">NILAI SAW</th>
                    <th className="text-center px-4 py-4 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest border-r-2 border-[#1E3A5F]">STATUS</th>
                    <th className="text-center px-4 py-4 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest border-r-2 border-[#1E3A5F]">SANGGAHAN</th>
                    <th className="text-center px-4 py-4 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">KEPUTUSAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#1E3A5F]">
                  {hasilForCategory.map(h => {
                    const isSelected = selectedIds.includes(h.masyarakatId);
                    const wargaSanggahans = getSanggahansForWarga(h.masyarakatId);
                    const hasSanggahan = wargaSanggahans.length > 0;
                    const isLayak = h.status === 'Layak';
                    
                    return (
                      <tr key={h.masyarakatId} className={`transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-[#FAFAFA]'}`}>
                        <td className={`text-center px-4 py-4 border-r-2 border-[#1E3A5F] ${hasSanggahan ? 'border-l-8 border-l-amber-400' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(h.masyarakatId)}
                            disabled={isApproved}
                            className="w-5 h-5 rounded-none border-2 border-[#1E3A5F] text-[#1E3A5F] focus:ring-0 focus:ring-offset-0 disabled:opacity-50 transition-all cursor-pointer"
                          />
                        </td>
                        <td className="text-center px-4 py-4 border-r-2 border-[#1E3A5F]">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-none border-2 border-[#1E3A5F] text-xs font-black ${
                            h.ranking <= 3 ? 'bg-amber-300 text-[#1E3A5F]' : 'bg-[#FAFAFA] text-[#1E3A5F]'
                          }`}>
                            {h.ranking}
                          </span>
                        </td>
                        <td className="px-5 py-4 border-r-2 border-[#1E3A5F]">
                          <p className="font-black text-[#1E3A5F] text-sm uppercase tracking-wider">{h.namaMasyarakat}</p>
                          <p className="text-[10px] font-bold text-[#64748B] mt-1 uppercase tracking-widest">{h.alamat}</p>
                        </td>
                        <td className="text-center px-4 py-4 border-r-2 border-[#1E3A5F]">
                          <span className="font-black text-[#1E3A5F] text-lg">{(h.nilaiAkhir * 100).toFixed(1)}%</span>
                        </td>
                        <td className="text-center px-4 py-4 border-r-2 border-[#1E3A5F]">
                          <span className={`inline-flex items-center px-3 py-1 border-2 border-[#1E3A5F] rounded-none text-[10px] font-black uppercase tracking-widest ${isLayak ? 'bg-emerald-300 text-[#1E3A5F]' : 'bg-rose-300 text-[#1E3A5F]'}`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="text-center px-4 py-4 border-r-2 border-[#1E3A5F]">
                          {hasSanggahan ? (
                            <button onClick={() => setSanggahanDetail(wargaSanggahans[0])}
                              className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#1E3A5F] bg-amber-300 text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-colors"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {wargaSanggahans.length} LAPORAN
                            </button>
                          ) : (
                            <span className="text-[10px] font-black text-[#64748B]">-</span>
                          )}
                        </td>
                        <td className="text-center px-4 py-4">
                          {isApproved ? (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 border-2 border-[#1E3A5F] rounded-none text-[10px] font-black uppercase tracking-widest ${
                              isSelected ? 'bg-emerald-300 text-[#1E3A5F]' : 'bg-rose-300 text-[#1E3A5F]'
                            }`}>
                              {isSelected ? <><CheckCircle2 className="w-3 h-3" />DISETUJUI</> : <><XCircle className="w-3 h-3" />DITOLAK</>}
                            </span>
                          ) : (
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                              {isSelected ? 'AKAN DISETUJUI' : 'AKAN DITOLAK'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approve Button */}
          {!isApproved && (
            <div className="flex justify-end pt-4">
              <button onClick={handleApprove} disabled={saving || selectedIds.length === 0}
                className="flex items-center gap-2 px-8 py-4 border-4 border-[#1E3A5F] bg-[#1E3A5F] text-white text-sm font-black uppercase tracking-widest hover:bg-white hover:text-[#1E3A5F] transition-colors disabled:opacity-50 disabled:hover:bg-[#1E3A5F] disabled:hover:text-white"
              >
                {saving ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />MEMPROSES & MENGIRIM WA...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5" />SAHKAN {selectedIds.length} PENERIMA</>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Sanggahan Detail Modal */}
      {sanggahanDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E3A5F]/80 p-4" onClick={() => setSanggahanDetail(null)}>
          <div className="bg-white rounded-none border-4 border-[#1E3A5F] w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b-4 border-[#1E3A5F] bg-amber-300">
              <h3 className="font-black text-[#1E3A5F] uppercase tracking-widest flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-[#1E3A5F]" />
                DETAIL SANGGAHAN TERVERIFIKASI
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-[10px] font-black text-[#64748B] block mb-1 uppercase tracking-widest">PELAPOR</span><strong className="text-sm font-black text-[#1E3A5F] uppercase tracking-wider">{sanggahanDetail.warga_pelapor || '-'}</strong></div>
                <div><span className="text-[10px] font-black text-[#64748B] block mb-1 uppercase tracking-widest">WARGA DILAPORKAN</span><strong className="text-sm font-black text-[#1E3A5F] uppercase tracking-wider">{sanggahanDetail.nama_warga_dilaporkan || sanggahanDetail.warga_dilaporkan?.nama || '-'}</strong></div>
              </div>
              <div><span className="text-[10px] font-black text-[#64748B] block mb-2 uppercase tracking-widest">ISI SANGGAHAN</span><p className="text-xs font-bold text-[#1E3A5F] bg-[#FAFAFA] p-4 border-2 border-[#1E3A5F] leading-relaxed">{sanggahanDetail.isi_sanggahan}</p></div>
              {sanggahanDetail.catatan_admin && (
                <div><span className="text-[10px] font-black text-[#2563EB] block mb-2 uppercase tracking-widest">CATATAN VERIFIKASI ADMIN</span><p className="text-xs font-bold text-[#1E3A5F] bg-blue-50 p-4 border-2 border-[#1E3A5F] leading-relaxed">{sanggahanDetail.catatan_admin}</p></div>
              )}
            </div>
            <div className="px-6 py-4 border-t-4 border-[#1E3A5F] bg-[#FAFAFA] flex justify-end">
              <button onClick={() => setSanggahanDetail(null)} className="px-6 py-3 border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A5F] hover:text-white transition-colors">TUTUP</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmResetApproval}
        title="BATALKAN PENGESAHAN"
        message={`Yakin ingin membatalkan pengesahan untuk program ${currentProgram?.nama_program || ''} periode ${data.activePeriode}? Status akan dikembalikan ke 'pending' dan klaim bantuan yang sudah dibuat akan dihapus.`}
        confirmLabel="YA, BATALKAN"
        onConfirm={handleResetApproval}
        onCancel={() => setConfirmResetApproval(false)}
      />
    </div>
  );
}
