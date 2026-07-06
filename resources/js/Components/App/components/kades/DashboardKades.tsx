import { Users, FileText, CheckSquare, BarChart3, ChevronRight, AlertTriangle, MessageSquare, Activity, Package } from 'lucide-react';
import { AppData } from '../../data';

interface Props {
  data: AppData;
  onNavigate: (page: string) => void;
}

export function DashboardKades({ data, onNavigate }: Props) {
  const currentPeriode = data.activePeriode;
  const programs = data.jenisBantuan;

  const totalPenerimaDisetujui = Object.values(data.approvedIds)
    .reduce((acc, ids) => acc + (Array.isArray(ids) ? ids.length : 0), 0);

  const sanggahansBaru = (data.sanggahans || []).filter(s => s.status === 'baru');
  
  const klaimBantuans = data.klaimBantuans || [];
  const sudahDiambil = klaimBantuans.filter(k => k.status_klaim === 'sudah_diambil').length;
  const persentasePenyaluran = klaimBantuans.length > 0 ? Math.round((sudahDiambil / klaimBantuans.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b-4 border-[#1E3A5F] pb-4">
        <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">DASHBOARD KEPALA DESA</h2>
        <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">RINGKASAN PELAKSANAAN PROGRAM BANTUAN SOSIAL DESA SUKAMAJU</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-none p-5 border-2 border-[#1E3A5F] cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => onNavigate('statistik')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-blue-100 border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-[#1E3A5F]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#64748B] mb-1 uppercase tracking-widest">TOTAL PROGRAM</p>
              <h3 className="text-2xl font-black text-[#1E3A5F]">{programs.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border-2 border-[#1E3A5F] cursor-pointer hover:bg-emerald-50 transition-colors" onClick={() => onNavigate('validasi')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-emerald-100 border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-6 h-6 text-[#1E3A5F]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#64748B] mb-1 uppercase tracking-widest">PENERIMA DISETUJUI</p>
              <h3 className="text-2xl font-black text-[#1E3A5F]">{totalPenerimaDisetujui}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border-2 border-[#1E3A5F] cursor-pointer hover:bg-amber-50 transition-colors" onClick={() => onNavigate('sanggahan-kades')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-amber-100 border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-[#1E3A5F]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#64748B] mb-1 uppercase tracking-widest">SANGGAHAN BARU</p>
              <h3 className="text-2xl font-black text-[#1E3A5F]">{sanggahansBaru.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border-2 border-[#1E3A5F] cursor-pointer hover:bg-violet-50 transition-colors" onClick={() => onNavigate('pantau-penyaluran')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-violet-100 border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-[#1E3A5F]" />
            </div>
            <div className="w-full">
              <div className="flex justify-between items-end mb-1">
                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">PENYALURAN</p>
                <p className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">{persentasePenyaluran}%</p>
              </div>
              <div className="w-full bg-[#E2E8F0] rounded-none h-3 border-2 border-[#1E3A5F]">
                <div className="bg-[#1E3A5F] h-full border-r-2 border-[#1E3A5F] transition-all" style={{ width: `${persentasePenyaluran}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Validasi Card */}
        <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b-4 border-[#1E3A5F] bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-[#1E3A5F] border-2 border-[#1E3A5F] flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-black text-[#1E3A5F] uppercase tracking-widest">MENUNGGU VALIDASI</h3>
            </div>
            <button 
              onClick={() => onNavigate('validasi')}
              className="text-[10px] font-black text-[#2563EB] hover:text-[#1E3A5F] uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              LIHAT DETAIL <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {programs.some(p => {
              const hasSaw = data.hasilSAW.some(h => h.periode === currentPeriode && h.jenis_bantuan_id === p.id);
              const isAppr = (data.approvedIds[`${currentPeriode}_${p.id}`] || []).length > 0;
              return hasSaw && !isAppr;
            }) ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-400 border-4 border-[#1E3A5F] rounded-none flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-[#1E3A5F]" />
                </div>
                <h4 className="text-lg font-black text-[#1E3A5F] uppercase tracking-widest mb-2">VALIDASI DIPERLUKAN</h4>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-6 max-w-sm mx-auto leading-relaxed">
                  ADMIN TELAH MEMPROSES PERHITUNGAN SAW. SILAKAN LAKUKAN VALIDASI UNTUK MENENTUKAN PENERIMA BANTUAN BULAN INI.
                </p>
                <button 
                  onClick={() => onNavigate('validasi')}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#1E3A5F] transition-colors"
                >
                  MULAI VALIDASI
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 text-[#E2E8F0]" />
                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">TIDAK ADA DATA YANG MENUNGGU VALIDASI</p>
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-2">SEMUA DATA UNTUK PERIODE INI SUDAH DIVALIDASI ATAU BELUM DIPROSES ADMIN.</p>
              </div>
            )}
          </div>
        </div>

        {/* Laporan Card */}
        <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b-4 border-[#1E3A5F] bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-[#1E3A5F] border-2 border-[#1E3A5F] flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-black text-[#1E3A5F] uppercase tracking-widest">LAPORAN FINAL</h3>
            </div>
            <button 
              onClick={() => onNavigate('laporan-kades')}
              className="text-[10px] font-black text-[#2563EB] hover:text-[#1E3A5F] uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              LIHAT SEMUA <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {programs.slice(0, 3).map(program => {
                const approvalKey = `${currentPeriode}_${program.id}`;
                const isApproved = (data.approvedIds[approvalKey] || []).length > 0;
                return (
                  <div key={program.id} className="flex items-center justify-between p-4 border-2 border-[#1E3A5F] bg-white hover:bg-[#FAFAFA] transition-colors">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-[#1E3A5F]" />
                      <div>
                        <p className="font-black text-[#1E3A5F] text-xs uppercase tracking-widest">{program.nama_program}</p>
                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">PERIODE {currentPeriode}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 border-2 border-[#1E3A5F] text-[10px] font-black uppercase tracking-widest ${
                      isApproved ? 'bg-emerald-300 text-[#1E3A5F]' : 'bg-[#E2E8F0] text-[#64748B]'
                    }`}>
                      {isApproved ? 'DISAHKAN' : 'BELUM'}
                    </span>
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => onNavigate('laporan-kades')}
              className="w-full mt-6 py-3 border-2 border-[#1E3A5F] bg-[#FAFAFA] text-[#1E3A5F] text-xs font-black uppercase tracking-widest hover:bg-[#1E3A5F] hover:text-white transition-colors"
            >
              CETAK SK & REKAPITULASI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
