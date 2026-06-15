import { useState } from 'react';
import axios from 'axios';
import { CheckCircle2, XCircle, AlertCircle, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { AppData, HasilSAWItem } from '../../data';
import { ConfirmDialog } from '../ConfirmDialog';

interface Props { data: AppData; setData: (d: AppData) => void; }

export function ValidasiKades({ data, setData }: Props) {
  const [periode, setPeriode] = useState(data.activePeriode || '2026-06');
  const [selected, setSelected] = useState<Set<number>>(new Set(data.approvedIds[data.activePeriode || '2026-06'] || []));
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  
  // Catatan State
  const [catatanModalOpen, setCatatanModalOpen] = useState(false);
  const [selectedHasil, setSelectedHasil] = useState<HasilSAWItem | null>(null);
  const [catatanText, setCatatanText] = useState('');
  const [savingCatatan, setSavingCatatan] = useState(false);

  const filteredHasilSAW = data.hasilSAW.filter(h => h.periode === periode);
  const sawProcessed = filteredHasilSAW.length > 0;
  
  const currentApproved = data.approvedIds[periode] || [];
  const approvedInPeriode = filteredHasilSAW.filter(r => currentApproved.some(id => String(id) === String(r.masyarakatId)));
  const isPeriodeApproved = approvedInPeriode.length > 0;

  const toggleSelect = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const selectByKuota = () => {
    const top = filteredHasilSAW.slice(0, data.kuotaBansos).map(r => r.masyarakatId);
    setSelected(new Set(top));
  };

  const selectAll = () => setSelected(new Set(filteredHasilSAW.map(r => r.masyarakatId)));
  const clearAll = () => setSelected(new Set());

  const approve = async () => {
    if (selected.size === 0) { toast.error('Pilih minimal 1 penerima untuk disetujui'); return; }
    const approvedList = Array.from(selected);
    try {
      await axios.post('/api/penilaian/approve', { periode, approvedIds: approvedList });
      setData({ ...data, approvedIds: { ...data.approvedIds, [periode]: approvedList } });
      toast.success(`Berhasil menyetujui ${selected.size} penerima bansos!`);
      setConfirmApprove(false);
    } catch (e) {
      toast.error('Gagal menyimpan persetujuan.');
    }
  };

  const reject = async () => {
    try {
      await axios.post('/api/penilaian/approve', { periode, approvedIds: [] });
      setData({ ...data, approvedIds: { ...data.approvedIds, [periode]: [] } });
      setSelected(new Set());
      toast.success('Semua persetujuan berhasil dibatalkan');
      setConfirmReject(false);
    } catch (e) {
      toast.error('Gagal membatalkan persetujuan.');
    }
  };

  const openCatatan = (item: HasilSAWItem) => {
    setSelectedHasil(item);
    setCatatanText(item.catatan || '');
    setCatatanModalOpen(true);
  };

  const saveCatatan = async () => {
    if (!selectedHasil) return;
    setSavingCatatan(true);
    try {
      await axios.post('/api/penilaian/save-catatan', {
        masyarakatId: selectedHasil.masyarakatId,
        periode: periode,
        catatan: catatanText
      });
      
      const newData = { ...data };
      const idx = newData.hasilSAW.findIndex(h => h.masyarakatId === selectedHasil.masyarakatId && h.periode === periode);
      if (idx !== -1) {
        newData.hasilSAW[idx].catatan = catatanText;
        setData(newData);
      }
      
      toast.success('Catatan berhasil disimpan');
      setCatatanModalOpen(false);
    } catch (e) {
      toast.error('Gagal menyimpan catatan');
    } finally {
      setSavingCatatan(false);
    }
  };

  if (!sawProcessed) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-gray-900 font-semibold">Validasi Penerima Bansos</h2>
          <p className="text-sm text-muted-foreground">Tinjau dan sahkan hasil ranking dari sistem SPK</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-10 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-600">Belum Ada Data untuk Divalidasi</p>
          <p className="text-sm text-muted-foreground mt-1">Admin belum menyelesaikan perhitungan SAW. Silakan hubungi operator sistem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Validasi Penerima Bansos</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tinjau hasil ranking dan berikan persetujuan (ACC) untuk penerima bansos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-600 whitespace-nowrap">Periode:</label>
          <input 
            type="month" 
            value={periode} 
            onChange={e => {
              setPeriode(e.target.value);
              setSelected(new Set(data.approvedIds[e.target.value] || []));
            }}
            className="px-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 border border-blue-200/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-blue-100/80 p-3 rounded-xl">
            <Users className="w-7 h-7 text-blue-600 flex-shrink-0" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600/80 mb-0.5">Total Kandidat</p>
            <p className="text-2xl font-bold text-blue-900">{filteredHasilSAW.length} <span className="text-base font-medium text-blue-700/70">Orang</span></p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 border border-emerald-200/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-emerald-100/80 p-3 rounded-xl">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600/80 mb-0.5">Kuota Tersedia</p>
            <p className="text-2xl font-bold text-emerald-900">{data.kuotaBansos} <span className="text-base font-medium text-emerald-700/70">Orang</span></p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-violet-100/30 border border-violet-200/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-violet-100/80 p-3 rounded-xl">
            <CheckCircle2 className="w-7 h-7 text-violet-600 flex-shrink-0" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600/80 mb-0.5">Dipilih Saat Ini</p>
            <p className="text-2xl font-bold text-violet-900">{selected.size} <span className="text-base font-medium text-violet-700/70">Orang</span></p>
          </div>
        </div>
      </div>

      {isPeriodeApproved && (
        <div className="flex items-start gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl text-sm text-emerald-800 shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-600" />
          <span className="leading-relaxed">Anda telah menyetujui <strong>{approvedInPeriode.length} penerima</strong> bansos untuk periode ini. Laporan sudah dapat dicetak oleh Admin.</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Tabel Hasil Ranking SAW</h3>
              <p className="text-sm text-slate-500 mt-1">Pilih warga yang memenuhi syarat untuk menerima bansos</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isPeriodeApproved && (
                <>
                  <button onClick={selectByKuota} className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors">
                    Pilih {data.kuotaBansos} Teratas
                  </button>
                  <button onClick={selectAll} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">
                    Pilih Semua
                  </button>
                  <button onClick={clearAll} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">
                    Batal Semua
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-12">
                  <input
                    type="checkbox"
                    checked={selected.size > 0 && selected.size === filteredHasilSAW.length}
                    onChange={() => { if (!isPeriodeApproved) { selected.size === filteredHasilSAW.length ? clearAll() : selectAll() } }}
                    disabled={isPeriodeApproved}
                    className="w-4 h-4 accent-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ranking</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Kepala Keluarga</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Alamat</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nilai SAW</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rekomendasi</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHasilSAW.map(r => {
                const isSelected = selected.has(r.masyarakatId);
                return (
                  <tr
                    key={r.masyarakatId}
                    onClick={() => { if (!isPeriodeApproved) toggleSelect(r.masyarakatId) }}
                    className={`transition-colors ${!isPeriodeApproved ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-50/50' : r.ranking <= data.kuotaBansos ? 'bg-emerald-50/20 hover:bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { if (!isPeriodeApproved) toggleSelect(r.masyarakatId) }}
                        onClick={e => e.stopPropagation()}
                        disabled={isPeriodeApproved}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        r.ranking <= 3 ? 'bg-amber-100 text-amber-700' :
                        r.ranking <= data.kuotaBansos ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {r.ranking}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">{r.namaMasyarakat}</td>
                    <td className="px-5 py-4 text-slate-500 hidden md:table-cell truncate max-w-[180px]" title={r.alamat}>{r.alamat}</td>
                    <td className="px-5 py-4 text-center font-mono font-bold text-blue-700">{r.nilaiAkhir.toFixed(4)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${r.status === 'Layak' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openCatatan(r); }}
                        className={`p-2 rounded-xl transition-colors ${r.catatan ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                        title={r.catatan ? 'Lihat/Edit Catatan' : 'Beri Catatan'}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <p className="text-sm text-slate-500 font-medium">
            <strong className="text-slate-800 text-base">{selected.size}</strong> dari {filteredHasilSAW.length} kandidat dipilih
          </p>
          <div className="flex gap-3">
            {isPeriodeApproved ? (
              <button
                onClick={() => setConfirmReject(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-sm font-bold hover:bg-rose-100 transition-colors shadow-sm"
              >
                <XCircle className="w-4 h-4" />
                Batalkan Validasi
              </button>
            ) : (
              <button
                onClick={() => setConfirmApprove(true)}
                disabled={selected.size === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <CheckCircle2 className="w-5 h-5" />
                VALIDASI (ACC) DATA TERPILIH
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmApprove}
        title="Konfirmasi Persetujuan"
        message={`Anda akan menyetujui ${selected.size} penerima bansos. Setelah disetujui, laporan dapat dicetak. Lanjutkan?`}
        onConfirm={approve}
        onCancel={() => setConfirmApprove(false)}
        confirmLabel="Ya, Setujui"
        confirmClass="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
      />
      <ConfirmDialog
        open={confirmReject}
        title="Batalkan Persetujuan"
        message="Apakah Anda yakin ingin membatalkan semua persetujuan? Laporan tidak akan bisa dicetak sebelum disetujui kembali."
        onConfirm={reject}
        onCancel={() => setConfirmReject(false)}
        confirmLabel="Ya, Batalkan"
      />
      
      {/* Catatan Modal */}
      {catatanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-blue-50/50">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Catatan Validasi</h3>
                <p className="text-xs text-gray-500">Beri catatan untuk {selectedHasil?.namaMasyarakat}</p>
              </div>
            </div>
            
            <div className="p-6">
              <textarea
                value={catatanText}
                onChange={(e) => setCatatanText(e.target.value)}
                placeholder="Contoh: Dibatalkan karena warga sudah pindah domisili..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setCatatanModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={saveCatatan}
                disabled={savingCatatan}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {savingCatatan ? 'Menyimpan...' : 'Simpan Catatan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
