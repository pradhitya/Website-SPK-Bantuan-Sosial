import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { AppData } from '../../data';
import { ConfirmDialog } from '../ConfirmDialog';

interface Props { data: AppData; setData: (d: AppData) => void; }

export function ValidasiKades({ data, setData }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set(data.approvedIds));
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  const toggleSelect = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const selectByKuota = () => {
    const top = data.hasilSAW.slice(0, data.kuotaBansos).map(r => r.masyarakatId);
    setSelected(new Set(top));
  };

  const selectAll = () => setSelected(new Set(data.hasilSAW.map(r => r.masyarakatId)));
  const clearAll = () => setSelected(new Set());

  const approve = () => {
    if (selected.size === 0) { toast.error('Pilih minimal 1 penerima untuk disetujui'); return; }
    setData({ ...data, approvedIds: Array.from(selected) });
    toast.success(`Berhasil menyetujui ${selected.size} penerima bansos!`);
    setConfirmApprove(false);
  };

  const reject = () => {
    setData({ ...data, approvedIds: [] });
    setSelected(new Set());
    toast.success('Semua persetujuan berhasil dibatalkan');
    setConfirmReject(false);
  };

  if (!data.sawProcessed || data.hasilSAW.length === 0) {
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
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900 font-semibold">Validasi Penerima Bansos</h2>
        <p className="text-sm text-muted-foreground">
          Tinjau hasil ranking dan berikan persetujuan (ACC) untuk penerima bansos
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-blue-600">Total Kandidat</p>
            <p className="font-bold text-blue-900">{data.hasilSAW.length} Orang</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-green-600">Kuota Tersedia</p>
            <p className="font-bold text-green-900">{data.kuotaBansos} Orang</p>
          </div>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-violet-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-violet-600">Dipilih Saat Ini</p>
            <p className="font-bold text-violet-900">{selected.size} Orang</p>
          </div>
        </div>
      </div>

      {data.approvedIds.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
          <span>Anda telah menyetujui <strong>{data.approvedIds.length} penerima</strong> bansos. Laporan sudah dapat dicetak oleh Admin.</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="font-semibold text-gray-900">Tabel Hasil Ranking SAW</h3>
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <button onClick={selectByKuota} className="px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 text-xs font-medium hover:bg-blue-50 transition-colors">
                Pilih {data.kuotaBansos} Teratas
              </button>
              <button onClick={selectAll} className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                Pilih Semua
              </button>
              <button onClick={clearAll} className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                Batal Semua
              </button>
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
                    checked={selected.size === data.hasilSAW.length}
                    onChange={() => selected.size === data.hasilSAW.length ? clearAll() : selectAll()}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ranking</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Kepala Keluarga</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Alamat</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nilai SAW</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rekomendasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.hasilSAW.map(r => {
                const isSelected = selected.has(r.masyarakatId);
                return (
                  <tr
                    key={r.masyarakatId}
                    onClick={() => toggleSelect(r.masyarakatId)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : r.ranking <= data.kuotaBansos ? 'bg-green-50/30 hover:bg-green-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(r.masyarakatId)}
                        onClick={e => e.stopPropagation()}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        r.ranking <= 3 ? 'bg-yellow-400 text-yellow-900' :
                        r.ranking <= data.kuotaBansos ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {r.ranking}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{r.namaMasyarakat}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[180px]">{r.alamat}</td>
                    <td className="px-5 py-3 text-center font-mono font-semibold text-blue-700">{r.nilaiAkhir.toFixed(4)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === 'Layak' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-border bg-gray-50 flex flex-col sm:flex-row items-center gap-3 justify-between">
          <p className="text-sm text-muted-foreground">
            <strong className="text-gray-900">{selected.size}</strong> dari {data.hasilSAW.length} kandidat dipilih
          </p>
          <div className="flex gap-3">
            {data.approvedIds.length > 0 && (
              <button
                onClick={() => setConfirmReject(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Batalkan ACC
              </button>
            )}
            <button
              onClick={() => setConfirmApprove(true)}
              disabled={selected.size === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              SETUJUI (ACC) DATA TERPILIH
            </button>
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
    </div>
  );
}
