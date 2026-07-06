import { useState } from 'react';
import { Settings, Users, ClipboardList, BarChart2, Inbox, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AppData } from '../../data';
import { DataKriteria } from './DataKriteria';
import { DataMasyarakat } from './DataMasyarakat';
import { InputPenilaian } from './InputPenilaian';
import { HasilSAW } from './HasilSAW';
import { InboxSanggahan } from './InboxSanggahan';
import { LogWA } from './LogWA';

interface Props {
  data: AppData;
  setData: (d: AppData) => void;
}

type TabType = 'kriteria' | 'masyarakat' | 'penilaian' | 'hasil-saw' | 'sanggahan' | 'log-wa';

export function ProgramManager({ data, setData }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('kriteria');

  const currentProgram = data.jenisBantuan.find(j => j.id === data.activeJenisBantuanId);
  const sanggahanBaruCount = (data.sanggahans || []).filter(
    s => s.status === 'baru' && s.bantuan_id === data.activeJenisBantuanId
  ).length;

  const hasilForCurrent = data.hasilSAW.filter(h => h.periode === data.activePeriode && h.jenis_bantuan_id === data.activeJenisBantuanId);
  const sawProcessed = hasilForCurrent.length > 0;

  if (!currentProgram) {
    return (
      <div className="flex items-center justify-center h-64 border-4 border-[#1E3A5F] bg-white shadow-none">
        <p className="text-[#1E3A5F] font-black uppercase tracking-widest">PROGRAM BANTUAN TIDAK DITEMUKAN.</p>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'kriteria', label: 'KRITERIA & BOBOT', icon: Settings },
    { id: 'masyarakat', label: 'CALON PENERIMA', icon: Users },
    { id: 'penilaian', label: 'INPUT PENILAIAN', icon: ClipboardList },
    { id: 'hasil-saw', label: 'HASIL SAW', icon: BarChart2 },
    { id: 'sanggahan', label: 'SANGGAHAN', icon: Inbox, badge: sanggahanBaruCount },
    { id: 'log-wa', label: 'LOG WA', icon: Send },
  ];

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Program Header */}
      <div className="bg-white rounded-none p-6 md:p-8 border-4 border-[#1E3A5F] shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1.5 rounded-none bg-blue-400 text-[#1E3A5F] border-2 border-[#1E3A5F] text-[10px] font-black tracking-widest uppercase shadow-none">
                PROGRAM AKTIF
              </span>
              {currentProgram.periode_evaluasi && (
                <span className="px-3 py-1.5 rounded-none bg-violet-400 text-[#1E3A5F] border-2 border-[#1E3A5F] text-[10px] font-black tracking-widest uppercase shadow-none">
                  {currentProgram.periode_evaluasi}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1E3A5F] tracking-tight uppercase">{currentProgram.nama_program}</h1>
            <p className="text-[#64748B] text-xs font-bold tracking-widest mt-3 uppercase leading-relaxed max-w-3xl">{currentProgram.deskripsi}</p>
            {currentProgram.filter_target && (
              <p className="text-[10px] font-black text-[#2563EB] mt-3 uppercase tracking-widest bg-blue-50 border-2 border-blue-200 inline-block px-3 py-1">TARGET: {currentProgram.filter_target}</p>
            )}
          </div>
        </div>

        {currentProgram.periode_evaluasi?.toLowerCase() === 'bulanan' && (
          <div className={`mt-6 p-5 rounded-none border-4 border-[#1E3A5F] shadow-none flex items-start gap-4 ${sawProcessed ? 'bg-emerald-400' : 'bg-amber-400'}`}>
            {sawProcessed ? (
              <>
                <div className="bg-white p-2 border-2 border-[#1E3A5F] shadow-none"><CheckCircle2 className="w-6 h-6 text-[#1E3A5F] flex-shrink-0" /></div>
                <div>
                  <h4 className="text-sm font-black text-[#1E3A5F] uppercase tracking-widest">PERHITUNGAN SELESAI</h4>
                  <p className="text-[10px] font-bold text-[#1E3A5F] mt-1.5 uppercase tracking-widest leading-relaxed">PERHITUNGAN PENERIMA BANTUAN UNTUK PERIODE <span className="font-black bg-white px-1.5 py-0.5 border border-[#1E3A5F]">{data.activePeriode}</span> SUDAH DILAKUKAN. BANTUAN SIAP DISALURKAN.</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-2 border-2 border-[#1E3A5F] shadow-none"><AlertTriangle className="w-6 h-6 text-[#1E3A5F] flex-shrink-0" /></div>
                <div>
                  <h4 className="text-sm font-black text-[#1E3A5F] uppercase tracking-widest">PERHITUNGAN BELUM DILAKUKAN</h4>
                  <p className="text-[10px] font-bold text-[#1E3A5F] mt-1.5 uppercase tracking-widest leading-relaxed">SISTEM MENDETEKSI PERHITUNGAN PENERIMA BANTUAN UNTUK PERIODE <span className="font-black bg-white px-1.5 py-0.5 border border-[#1E3A5F]">{data.activePeriode}</span> BELUM DILAKUKAN. HARAP LENGKAPI PENILAIAN DAN JALANKAN PERHITUNGAN SAW BULAN INI.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#1E3A5F] p-2 md:p-3 border-4 border-[#1E3A5F] shadow-none flex overflow-x-auto hide-scrollbar gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                isActive
                  ? 'bg-white text-[#1E3A5F] border-[#1E3A5F] shadow-none'
                  : 'bg-[#1E3A5F] text-white border-transparent hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#1E3A5F]' : 'text-slate-300'}`} />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className={`ml-2 w-6 h-6 border-2 border-[#1E3A5F] rounded-none text-[10px] font-black flex items-center justify-center shadow-none ${isActive ? 'bg-amber-400 text-[#1E3A5F]' : 'bg-rose-400 text-white border-white'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'kriteria' && <DataKriteria data={data} setData={setData} />}
        {activeTab === 'masyarakat' && <DataMasyarakat data={data} setData={setData} onNavigate={() => setActiveTab('penilaian')} />}
        {activeTab === 'penilaian' && <InputPenilaian data={data} setData={setData} onNavigate={() => setActiveTab('hasil-saw')} />}
        {activeTab === 'hasil-saw' && <HasilSAW data={data} setData={setData} />}
        {activeTab === 'sanggahan' && <InboxSanggahan data={data} setData={setData} />}
        {activeTab === 'log-wa' && <LogWA data={data} setData={setData} />}
      </div>
    </div>
  );
}
