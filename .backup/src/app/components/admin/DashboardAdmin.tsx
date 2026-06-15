import { Users, ListChecks, CheckCircle2, Clock, UserCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AppData } from '../../data';

interface Props { data: AppData; }

const monthlyData = [
  { bulan: 'Jan', pendaftar: 28, penerima: 18 },
  { bulan: 'Feb', pendaftar: 35, penerima: 22 },
  { bulan: 'Mar', pendaftar: 42, penerima: 28 },
  { bulan: 'Apr', pendaftar: 31, penerima: 20 },
  { bulan: 'Mei', pendaftar: 38, penerima: 25 },
  { bulan: 'Jun', pendaftar: 45, penerima: 30 },
];

export function DashboardAdmin({ data }: Props) {
  const totalDinilai = [...new Set(data.penilaian.map(p => p.masyarakatId))].length;
  const totalBelumDinilai = data.masyarakat.length - totalDinilai;
  const validasiStatus = data.approvedIds.length > 0
    ? `Disetujui (${data.approvedIds.length} orang)`
    : data.sawProcessed
    ? 'Menunggu ACC Kepala Desa'
    : 'Belum Diproses';

  const recentMasyarakat = [...data.masyarakat].reverse().slice(0, 5);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900 font-semibold">Dashboard Admin</h2>
        <p className="text-sm text-muted-foreground">Selamat datang, Admin. Berikut ringkasan sistem hari ini.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Calon Penerima',
            value: data.masyarakat.length,
            suffix: 'Orang',
            icon: Users,
            color: 'bg-blue-500',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
          },
          {
            label: 'Total Kriteria',
            value: data.kriteria.length,
            suffix: 'Kriteria',
            icon: ListChecks,
            color: 'bg-emerald-500',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
          },
          {
            label: 'Kuota Bansos',
            value: data.kuotaBansos,
            suffix: 'Orang',
            icon: UserCheck,
            color: 'bg-violet-500',
            bg: 'bg-violet-50',
            text: 'text-violet-600',
          },
          {
            label: 'Status Validasi',
            value: null,
            suffix: null,
            text2: validasiStatus,
            icon: data.approvedIds.length > 0 ? CheckCircle2 : Clock,
            color: data.approvedIds.length > 0 ? 'bg-green-500' : 'bg-amber-500',
            bg: data.approvedIds.length > 0 ? 'bg-green-50' : 'bg-amber-50',
            text: data.approvedIds.length > 0 ? 'text-green-600' : 'text-amber-600',
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
                  <p className={`text-xs font-semibold mt-0.5 ${card.text}`}>{card.text2}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Statistik Pendaftar & Penerima Bansos</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#556b8a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#556b8a' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                cursor={{ fill: '#f0f4f8' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="pendaftar" name="Total Pendaftar" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="penerima" name="Penerima Bansos" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Status Penilaian</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Sudah Dinilai</span>
                <span className="font-medium text-gray-900">{totalDinilai}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${data.masyarakat.length ? (totalDinilai / data.masyarakat.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Belum Dinilai</span>
                <span className="font-medium text-gray-900">{totalBelumDinilai}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-amber-400 transition-all"
                  style={{ width: `${data.masyarakat.length ? (totalBelumDinilai / data.masyarakat.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SAW Diproses</span>
                <span className={`font-medium text-sm ${data.sawProcessed ? 'text-green-600' : 'text-gray-400'}`}>
                  {data.sawProcessed ? 'Ya' : 'Belum'}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Disetujui Kades</span>
                <span className={`font-medium text-sm ${data.approvedIds.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {data.approvedIds.length > 0 ? `${data.approvedIds.length} orang` : 'Belum'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-gray-900">Data Terbaru — Calon Penerima</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">No</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">NIK</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Alamat</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentMasyarakat.map((m, i) => {
                const dinilai = data.penilaian.some(p => p.masyarakatId === m.id);
                return (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{m.nama}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden md:table-cell font-mono text-xs">{m.nik}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell truncate max-w-[200px]">{m.alamat}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${dinilai ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {dinilai ? 'Sudah Dinilai' : 'Belum Dinilai'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
