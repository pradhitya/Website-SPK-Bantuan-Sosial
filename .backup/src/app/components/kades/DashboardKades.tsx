import { CheckCircle2, Users, AlertTriangle, Award, BarChart2 } from 'lucide-react';
import { AppData } from '../../data';

interface Props { data: AppData; onNavigate: (page: string) => void; }

export function DashboardKades({ data, onNavigate }: Props) {
  const totalPenerima = data.approvedIds.length;
  const kuota = data.kuotaBansos;
  const pendingValidation = data.sawProcessed && data.approvedIds.length === 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900 font-semibold">Dashboard Kepala Desa</h2>
        <p className="text-sm text-muted-foreground">Selamat datang, Bapak/Ibu Kepala Desa. Berikut ringkasan program bansos desa.</p>
      </div>

      {pendingValidation && (
        <div
          onClick={() => onNavigate('validasi')}
          className="cursor-pointer flex items-start gap-4 px-5 py-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl hover:bg-yellow-100 transition-colors"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-800">Terdapat Hasil Perhitungan yang Menunggu Validasi Anda</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Admin telah menyelesaikan perhitungan SAW untuk {data.hasilSAW.length} calon penerima.
              Klik di sini untuk meninjau dan memberikan persetujuan.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Kuota Bansos Tersedia',
            value: kuota,
            suffix: 'Orang',
            icon: Award,
            color: 'bg-blue-500',
          },
          {
            label: 'Total Penerima Disahkan',
            value: totalPenerima,
            suffix: 'Orang',
            icon: CheckCircle2,
            color: 'bg-green-500',
          },
          {
            label: 'Total Kandidat Diajukan',
            value: data.hasilSAW.length,
            suffix: 'Orang',
            icon: Users,
            color: 'bg-violet-500',
          },
          {
            label: 'Status Perhitungan',
            value: null,
            text2: data.sawProcessed ? 'Sudah Diproses' : 'Belum Ada',
            icon: BarChart2,
            color: data.sawProcessed ? 'bg-emerald-500' : 'bg-gray-400',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-border p-4 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
                {card.value !== null ? (
                  <p className="font-bold text-gray-900 mt-0.5">
                    {card.value} <span className="text-xs font-normal text-muted-foreground">{card.suffix}</span>
                  </p>
                ) : (
                  <p className={`text-xs font-semibold mt-0.5 ${data.sawProcessed ? 'text-green-600' : 'text-gray-500'}`}>{card.text2}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {data.sawProcessed && data.hasilSAW.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Ringkasan Hasil Perhitungan SAW</h3>
            <button
              onClick={() => onNavigate('validasi')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat & Validasi →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ranking</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Kepala Keluarga</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nilai SAW</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rekomendasi</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.hasilSAW.slice(0, 10).map(r => (
                  <tr key={r.masyarakatId} className={`hover:bg-gray-50 ${r.ranking <= data.kuotaBansos ? 'bg-green-50/30' : ''}`}>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        r.ranking <= 3 ? 'bg-yellow-400 text-yellow-900' : r.ranking <= data.kuotaBansos ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {r.ranking}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{r.namaMasyarakat}</td>
                    <td className="px-5 py-3 text-center font-mono text-blue-700 font-semibold">{r.nilaiAkhir.toFixed(4)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === 'Layak' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {data.approvedIds.includes(r.masyarakatId) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3" /> Disetujui
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
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
        <div className="bg-white rounded-xl border border-border p-10 text-center">
          <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-600">Belum Ada Hasil Perhitungan</p>
          <p className="text-sm text-muted-foreground mt-1">Admin belum melakukan proses perhitungan SAW. Silakan hubungi operator sistem.</p>
        </div>
      )}
    </div>
  );
}
