import { useState, useMemo } from 'react';
import { AppData } from '../../data';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Activity, Target, Map, Calendar, Heart, Baby } from 'lucide-react';

interface Props {
  data: AppData;
}

export function StatistikKades({ data }: Props) {
  // Extract available periods
  const availablePeriods = useMemo(() => {
    const periods = new Set([data.activePeriode]);
    Object.keys(data.approvedIds).forEach(key => {
      const parts = key.split('-');
      if (parts.length >= 3) {
        periods.add(`${parts[1]}-${parts[2]}`);
      }
    });
    return Array.from(periods).sort().reverse();
  }, [data.activePeriode, data.approvedIds]);

  const [selectedPeriode, setSelectedPeriode] = useState(data.activePeriode);
  const programs = data.jenisBantuan;

  // Data Warga by Gender
  const lakiLaki = (data.wargas || []).filter(w => w.jenis_kelamin === 'L').length;
  const perempuan = (data.wargas || []).filter(w => w.jenis_kelamin === 'P').length;
  const genderData = [
    { name: 'LAKI-LAKI', value: lakiLaki },
    { name: 'PEREMPUAN', value: perempuan }
  ];
  const GENDER_COLORS = ['#3b82f6', '#f43f5e'];

  // Data Umur (Rentang Umur)
  const calculateAgeGroup = (min: number, max: number) => {
    return (data.wargas || []).filter(w => {
      const age = w.usia;
      return age !== null && age >= min && age <= max;
    }).length;
  };
  const ageData = [
    { name: 'ANAK (0-14)', jumlah: calculateAgeGroup(0, 14) },
    { name: 'PEMUDA (15-24)', jumlah: calculateAgeGroup(15, 24) },
    { name: 'DEWASA (25-54)', jumlah: calculateAgeGroup(25, 54) },
    { name: 'LANSIA (55+)', jumlah: calculateAgeGroup(55, 120) }
  ];

  // Data Penyaluran Bantuan
  const distributionData = programs.map(p => {
    // Approved count based on selected periode and this program id
    const key = Object.keys(data.approvedIds).find(k => k.includes(p.id.toString()) && k.includes(selectedPeriode));
    const count = key ? data.approvedIds[key].length : 0;
    return { name: p.nama_program.toUpperCase(), disetujui: count };
  });

  const totalPenerima = useMemo(() => {
    return programs.reduce((acc, p) => {
      const key = Object.keys(data.approvedIds).find(k => k.includes(p.id.toString()) && k.includes(selectedPeriode));
      return acc + (key ? data.approvedIds[key].length : 0);
    }, 0);
  }, [programs, data.approvedIds, selectedPeriode]);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-[#1E3A5F] pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">STATISTIK & DEMOGRAFI DESA</h2>
          <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">PANTAU PERKEMBANGAN DEMOGRAFI DAN PERSENTASE PENERIMA BANTUAN DI DESA.</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#1E3A5F]" />
          <select
            value={selectedPeriode}
            onChange={(e) => setSelectedPeriode(e.target.value)}
            className="border-2 border-[#1E3A5F] text-[#1E3A5F] font-bold py-2 px-4 rounded-none focus:ring-0 focus:outline-none focus:border-[#1E3A5F] bg-white cursor-pointer uppercase text-sm"
          >
            {availablePeriods.map(periode => (
              <option key={periode} value={periode}>PERIODE: {periode}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-none p-5 border-4 border-[#1E3A5F] flex items-center gap-4 hover:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-none bg-blue-200 border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-[#1E3A5F]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#64748B] mb-0.5 uppercase tracking-widest">TOTAL WARGA</p>
            <h3 className="text-3xl font-black text-[#1E3A5F]">{data.stats.totalWarga}</h3>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border-4 border-[#1E3A5F] flex items-center gap-4 hover:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-none bg-indigo-200 border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
            <Map className="w-6 h-6 text-[#1E3A5F]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#64748B] mb-0.5 uppercase tracking-widest">KEPALA KELUARGA</p>
            <h3 className="text-3xl font-black text-[#1E3A5F]">{data.stats.totalKeluarga}</h3>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border-4 border-[#1E3A5F] flex items-center gap-4 hover:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-none bg-orange-200 border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-[#1E3A5F]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#64748B] mb-0.5 uppercase tracking-widest">TOTAL LANSIA</p>
            <h3 className="text-3xl font-black text-[#1E3A5F]">{data.stats.totalLansia}</h3>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border-4 border-[#1E3A5F] flex items-center gap-4 hover:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-none bg-pink-200 border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
            <Baby className="w-6 h-6 text-[#1E3A5F]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#64748B] mb-0.5 uppercase tracking-widest">TOTAL IBU HAMIL</p>
            <h3 className="text-3xl font-black text-[#1E3A5F]">{data.stats.totalHamil}</h3>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border-4 border-[#1E3A5F] flex items-center gap-4 hover:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-none bg-emerald-200 border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-[#1E3A5F]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#64748B] mb-0.5 uppercase tracking-widest">CALON PENERIMA (MASYARAKAT)</p>
            <h3 className="text-3xl font-black text-[#1E3A5F]">{data.masyarakat?.length || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border-4 border-[#1E3A5F] flex items-center gap-4 hover:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-none bg-violet-200 border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-[#1E3A5F]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#64748B] mb-0.5 uppercase tracking-widest">PENERIMA BANTUAN {selectedPeriode}</p>
            <h3 className="text-3xl font-black text-[#1E3A5F]">{totalPenerima}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="bg-white rounded-none p-6 border-4 border-[#1E3A5F]">
          <div className="border-b-4 border-[#1E3A5F] pb-4 mb-6">
            <h3 className="font-black text-[#1E3A5F] uppercase tracking-widest">PENERIMA DISETUJUI PER PROGRAM</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={{ stroke: '#1E3A5F', strokeWidth: 2 }} tickLine={false} tick={{ fontSize: 10, fill: '#1E3A5F', fontWeight: 'bold' }} />
                <YAxis axisLine={{ stroke: '#1E3A5F', strokeWidth: 2 }} tickLine={false} tick={{ fontSize: 10, fill: '#1E3A5F', fontWeight: 'bold' }} />
                <RechartsTooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '0', border: '4px solid #1E3A5F', boxShadow: 'none', fontWeight: 'bold', fontSize: '12px' }} />
                <Bar dataKey="disetujui" fill="#1E3A5F" stroke="#1E3A5F" strokeWidth={2} radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-none p-6 border-4 border-[#1E3A5F]">
          <div className="border-b-4 border-[#1E3A5F] pb-4 mb-6">
            <h3 className="font-black text-[#1E3A5F] uppercase tracking-widest">DISTRIBUSI UMUR WARGA</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" axisLine={{ stroke: '#1E3A5F', strokeWidth: 2 }} tickLine={false} tick={{ fontSize: 10, fill: '#1E3A5F', fontWeight: 'bold' }} />
                <YAxis dataKey="name" type="category" axisLine={{ stroke: '#1E3A5F', strokeWidth: 2 }} tickLine={false} tick={{ fontSize: 10, fill: '#1E3A5F', fontWeight: 'bold' }} width={120} />
                <RechartsTooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '0', border: '4px solid #1E3A5F', boxShadow: 'none', fontWeight: 'bold', fontSize: '12px' }} />
                <Bar dataKey="jumlah" fill="#10B981" stroke="#1E3A5F" strokeWidth={2} radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-none p-6 border-4 border-[#1E3A5F] lg:col-span-2">
          <div className="border-b-4 border-[#1E3A5F] pb-4 mb-6">
            <h3 className="font-black text-[#1E3A5F] uppercase tracking-widest">KOMPOSISI GENDER WARGA</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#1E3A5F"
                  strokeWidth={2}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '0', border: '4px solid #1E3A5F', boxShadow: 'none', fontWeight: 'bold', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1E3A5F' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
