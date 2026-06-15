import { Users, ListChecks, CheckCircle2, Clock, UserCheck, TrendingUp, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AppData } from '../../data';

interface Props { data: AppData; }

export function DashboardAdmin({ data }: Props) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentYear = new Date().getFullYear();

  const monthlyData = months.map((monthName, index) => {
    const monthNum = (index + 1).toString().padStart(2, '0');
    
    const pendaftar = data.masyarakat.filter(m => {
      if (!m.tglDaftar) return false;
      const d = new Date(m.tglDaftar);
      return d.getMonth() === index && d.getFullYear() === currentYear;
    }).length;

    const targetPeriode = `${currentYear}-${monthNum}`;
    const approvedInPeriode = data.approvedIds[targetPeriode] || [];
    const penerima = data.hasilSAW.filter(h => h.periode === targetPeriode && approvedInPeriode.includes(h.masyarakatId)).length;

    return { bulan: monthName, pendaftar, penerima };
  });

  const totalDinilai = [...new Set(data.penilaian.map(p => p.masyarakatId))].length;
  const totalBelumDinilai = data.masyarakat.length - totalDinilai;
  const currentApproved = data.approvedIds[data.activePeriode] || [];
  const validasiStatus = currentApproved.length > 0
    ? `Disetujui (${currentApproved.length} orang)`
    : data.sawProcessed
    ? 'Menunggu ACC Kepala Desa'
    : 'Belum Diproses';

  const recentMasyarakat = [...data.masyarakat].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Admin</h2>
        <p className="text-sm text-slate-500 mt-1">Selamat datang kembali. Berikut adalah ringkasan sistem SPK Bansos hari ini.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Calon Penerima',
            value: data.masyarakat.length,
            suffix: 'Orang',
            icon: Users,
            iconBg: 'bg-blue-50 text-blue-600',
            text: 'text-slate-800',
          },
          {
            label: 'Total Kriteria',
            value: data.kriteria.length,
            suffix: 'Kriteria',
            icon: ListChecks,
            iconBg: 'bg-emerald-50 text-emerald-600',
            text: 'text-slate-800',
          },
          {
            label: 'Kuota Bansos',
            value: data.kuotaBansos,
            suffix: 'Orang',
            icon: UserCheck,
            iconBg: 'bg-violet-50 text-violet-600',
            text: 'text-slate-800',
          },
          {
            label: 'Status Validasi',
            value: null,
            suffix: null,
            text2: validasiStatus,
            icon: currentApproved.length > 0 ? CheckCircle2 : Clock,
            iconBg: currentApproved.length > 0 ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600',
            text: currentApproved.length > 0 ? 'text-teal-700' : 'text-amber-700',
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Statistik Pendaftar & Penerima</h3>
            </div>
          </div>
          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={6} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)', fontWeight: 500 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: '20px', fontWeight: 500 }} />
                <Bar dataKey="pendaftar" name="Total Pendaftar" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="penerima" name="Penerima Bansos" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Status Penilaian Sistem</h3>
          
          <div className="space-y-6 flex-1">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sudah Dinilai</span>
                  <p className="text-2xl font-bold text-slate-800 leading-none mt-1">{totalDinilai}</p>
                </div>
                <span className="text-sm font-medium text-slate-500">dari {data.masyarakat.length}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 relative"
                  style={{ width: `${data.masyarakat.length ? (totalDinilai / data.masyarakat.length) * 100 : 0}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Belum Dinilai</span>
                  <p className="text-2xl font-bold text-slate-800 leading-none mt-1">{totalBelumDinilai}</p>
                </div>
                <span className="text-sm font-medium text-slate-500">dari {data.masyarakat.length}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${data.masyarakat.length ? (totalBelumDinilai / data.masyarakat.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Proses SAW Selesai</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${data.sawProcessed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {data.sawProcessed ? 'SUDAH' : 'BELUM'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Disetujui Kades</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${currentApproved.length > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {currentApproved.length > 0 ? `${currentApproved.length} ORANG` : 'BELUM'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Calon Penerima Terbaru</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pendaftar terakhir yang ditambahkan ke dalam sistem</p>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16">No</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">NIK</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Alamat</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentMasyarakat.map((m, i) => {
                const dinilai = data.penilaian.some(p => p.masyarakatId === m.id);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-slate-400 font-medium">{i + 1}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{m.nama}</td>
                    <td className="px-6 py-4 text-slate-500 hidden md:table-cell font-mono text-xs">{m.nik}</td>
                    <td className="px-6 py-4 text-slate-500 hidden lg:table-cell truncate max-w-[200px]">{m.alamat}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${dinilai ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {dinilai ? 'Sudah Dinilai' : 'Belum Dinilai'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recentMasyarakat.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Belum ada data pendaftar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
