import { CheckCircle2, Users, AlertTriangle, Award, BarChart2, ChevronRight } from 'lucide-react';
import { AppData } from '../../data';

interface Props { data: AppData; onNavigate: (page: string) => void; }

export function DashboardKades({ data, onNavigate }: Props) {
  const currentApproved = data.approvedIds[data.activePeriode] || [];
  const totalPenerima = currentApproved.length;
  const kuota = data.kuotaBansos;
  const pendingValidation = data.sawProcessed && currentApproved.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Kepala Desa</h2>
        <p className="text-sm text-slate-500 mt-1">Selamat datang, Bapak/Ibu Kepala Desa. Berikut ringkasan program bansos desa.</p>
      </div>

      {pendingValidation && (
        <div
          onClick={() => onNavigate('validasi')}
          className="cursor-pointer flex items-start gap-4 px-6 py-5 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300 group"
        >
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-amber-800 tracking-tight">Menunggu Validasi Anda</p>
            <p className="text-sm text-amber-700/80 mt-1">
              Admin telah menyelesaikan perhitungan SAW untuk {data.hasilSAW.length} calon penerima.
              Klik di sini untuk meninjau dan memberikan persetujuan (ACC).
            </p>
          </div>
          <div className="self-center p-2 text-amber-500 group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Kuota Bansos Tersedia',
            value: kuota,
            suffix: 'Orang',
            icon: Award,
            iconBg: 'bg-blue-50 text-blue-600',
            text: 'text-slate-800',
          },
          {
            label: 'Total Penerima Disahkan',
            value: totalPenerima,
            suffix: 'Orang',
            icon: CheckCircle2,
            iconBg: 'bg-emerald-50 text-emerald-600',
            text: 'text-slate-800',
          },
          {
            label: 'Total Kandidat Diajukan',
            value: data.hasilSAW.length,
            suffix: 'Orang',
            icon: Users,
            iconBg: 'bg-violet-50 text-violet-600',
            text: 'text-slate-800',
          },
          {
            label: 'Status Perhitungan',
            value: null,
            text2: data.sawProcessed ? 'Sudah Diproses' : 'Belum Ada',
            icon: BarChart2,
            iconBg: data.sawProcessed ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-500',
            text: data.sawProcessed ? 'text-teal-700' : 'text-slate-700',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white relative overflow-hidden rounded-2xl border border-slate-100 shadow-[0_2px_12px_-3px_rgba(6,81,237,0.05)] hover:shadow-md transition-all duration-300 p-6 group">
              <div className="flex flex-col justify-between h-full relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">{card.label}</p>
                  {card.value !== null ? (
                    <div className="flex items-baseline gap-1.5">
                      <h3 className={`text-3xl font-bold ${card.text} tracking-tight`}>{card.value}</h3>
                      <span className="text-sm font-medium text-slate-400">{card.suffix}</span>
                    </div>
                  ) : (
                    <h3 className={`text-lg font-bold ${card.text} leading-tight mt-1`}>{card.text2}</h3>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.sawProcessed && data.hasilSAW.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Ringkasan Hasil Perhitungan SAW</h3>
              <p className="text-xs text-slate-500 mt-0.5">Menampilkan 10 peringkat teratas kandidat penerima</p>
            </div>
            <button
              onClick={() => onNavigate('validasi')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              Lihat & Validasi Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ranking</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Kepala Keluarga</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai SAW</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rekomendasi</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.hasilSAW.slice(0, 10).map(r => (
                  <tr key={r.masyarakatId} className={`hover:bg-slate-50/80 transition-colors group ${r.ranking <= data.kuotaBansos ? 'bg-emerald-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shadow-sm ${
                        r.ranking <= 3 ? 'bg-amber-400 text-amber-900' : r.ranking <= data.kuotaBansos ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {r.ranking}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{r.namaMasyarakat}</td>
                    <td className="px-6 py-4 text-center font-mono text-blue-600 font-bold">{r.nilaiAkhir.toFixed(4)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${r.status === 'Layak' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {currentApproved.includes(r.masyarakatId) ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" /> Disetujui
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm bg-slate-100 text-slate-500">
                          Menunggu
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!data.sawProcessed && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-xl font-bold text-slate-700 tracking-tight">Belum Ada Hasil Perhitungan</p>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Admin belum melakukan proses perhitungan SAW. Laporan ini akan muncul setelah admin memproses data.</p>
        </div>
      )}
    </div>
  );
}
