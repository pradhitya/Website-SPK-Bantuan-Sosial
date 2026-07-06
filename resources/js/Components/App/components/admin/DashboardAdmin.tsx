import { Users, ClipboardList, CheckCircle2, Clock, AlertCircle, Database, Home, UserCheck, Heart } from 'lucide-react';
import { AppData } from '../../data';

interface Props {
  data: AppData;
}

export function DashboardAdmin({ data }: Props) {
  const currentPeriode = data.activePeriode;
  const currentProgramId = data.activeJenisBantuanId;

  const totalMasyarakat = data.masyarakat.filter(m => m.periode === currentPeriode && m.jenis_bantuan_id === currentProgramId).length;
  const totalPenilaian = new Set(
    data.penilaian
      .filter(p => {
        const m = data.masyarakat.find(masy => masy.id === p.masyarakatId);
        return m && m.periode === currentPeriode && m.jenis_bantuan_id === currentProgramId;
      })
      .map(p => p.masyarakatId)
  ).size;

  const hasilForCurrent = data.hasilSAW.filter(h => h.periode === currentPeriode && h.jenis_bantuan_id === currentProgramId);
  const sawProcessed = hasilForCurrent.length > 0;

  const approvalKey = currentPeriode + (currentProgramId ? '_' + currentProgramId : '');
  const approved = data.approvedIds[approvalKey] || [];
  const isApproved = approved.length > 0;

  // New metrics
  const sanggahanBaruCount = (data.sanggahans || []).filter(s => s.status === 'baru' && s.bantuan_id === currentProgramId).length;
  const klaimTerkirimCount = (data.klaimBantuans || []).filter(k => k.status_kirim_wa === 'terkirim' && k.hasil_saw?.jenis_bantuan_id === currentProgramId).length;
  const klaimGagalCount = (data.klaimBantuans || []).filter(k => k.status_kirim_wa === 'gagal' && k.hasil_saw?.jenis_bantuan_id === currentProgramId).length;
  const klaimDiambilCount = (data.klaimBantuans || []).filter(k => k.status_klaim === 'sudah_diambil' && k.hasil_saw?.jenis_bantuan_id === currentProgramId).length;

  // Master data stats
  const totalWargas = data.stats.totalWarga;
  const totalKeluargas = data.stats.totalKeluarga;
  const totalLansia = data.stats.totalLansia;
  const totalHamil = data.stats.totalHamil;

  const sawProgress = totalMasyarakat === 0 ? 0 : Math.round((totalPenilaian / totalMasyarakat) * 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-[#1E3A5F] pb-4">
        <div>
          <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">SELAMAT DATANG</h2>
          <p className="text-xs font-bold text-[#64748B] mt-1 uppercase tracking-widest">KELOLA DATA BANSOS & PERHITUNGAN SAW</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-none border-2 border-[#1E3A5F] shadow-none">
          <p className="text-[9px] font-black text-[#64748B] uppercase tracking-widest mb-0.5">PERIODE AKTIF</p>
          <p className="text-sm font-black text-[#1E3A5F]">{currentPeriode}</p>
        </div>
      </div>

      {/* Master Data Overview - Neo Brutalism */}
      <div className="bg-[#1E3A5F] rounded-none border-4 border-[#1E3A5F] p-5 shadow-none">
        <div className="flex items-center gap-2 mb-4 border-b-2 border-white/20 pb-2">
          <Database className="w-4 h-4 text-white" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest">MASTER DATA KEPENDUDUKAN</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-none p-4 border-2 border-[#1E3A5F] shadow-none">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-[#1E3A5F]" />
              <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">TOTAL WARGA</span>
            </div>
            <p className="text-3xl font-black text-[#1E3A5F]">{totalWargas}</p>
          </div>
          <div className="bg-white rounded-none p-4 border-2 border-[#1E3A5F] shadow-none">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-[#1E3A5F]" />
              <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">TOTAL KK</span>
            </div>
            <p className="text-3xl font-black text-[#1E3A5F]">{totalKeluargas}</p>
          </div>
          <div className="bg-white rounded-none p-4 border-2 border-[#1E3A5F] shadow-none">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#1E3A5F]" />
              <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">WARGA LANSIA</span>
            </div>
            <p className="text-3xl font-black text-[#1E3A5F]">{totalLansia}</p>
          </div>
          <div className="bg-white rounded-none p-4 border-2 border-[#1E3A5F] shadow-none">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-[#1E3A5F]" />
              <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">IBU HAMIL</span>
            </div>
            <p className="text-3xl font-black text-[#1E3A5F]">{totalHamil}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-none p-5 border-2 border-[#1E3A5F] shadow-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-[#1E3A5F]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">TOTAL PENDAFTAR</p>
              <h3 className="text-2xl font-black text-[#1E3A5F]">{totalMasyarakat}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border-2 border-[#1E3A5F] shadow-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-[#1E3A5F]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">DATA DINILAI</p>
              <h3 className="text-2xl font-black text-[#1E3A5F]">{totalPenilaian}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border-2 border-[#1E3A5F] shadow-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-[#1E3A5F]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">SANGGAHAN BARU</p>
              <h3 className="text-2xl font-black text-[#1E3A5F]">{sanggahanBaruCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border-2 border-[#1E3A5F] shadow-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none border-2 border-[#1E3A5F] bg-[#FAFAFA] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-[#1E3A5F]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">BANTUAN DIAMBIL</p>
              <h3 className="text-2xl font-black text-[#1E3A5F]">{klaimDiambilCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b-4 border-[#1E3A5F] flex items-center justify-between bg-[#FAFAFA]">
            <h3 className="font-black text-[#1E3A5F] uppercase tracking-widest">STATUS PROSES SAW</h3>
            <span className="px-3 py-1 rounded-none border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-[10px] font-black tracking-widest uppercase shadow-none">{sawProgress}% SELESAI</span>
          </div>
          <div className="px-6 pt-5 pb-3">
            <div className="w-full bg-[#E2E8F0] rounded-none h-4 border-2 border-[#1E3A5F]">
              <div className="bg-[#2563EB] h-full border-r-2 border-[#1E3A5F] transition-all duration-1000 ease-out" style={{ width: `${sawProgress}%` }}></div>
            </div>
          </div>
          <div className="p-6 flex-1">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 w-6 h-6 rounded-none border-2 flex items-center justify-center flex-shrink-0 ${totalMasyarakat > 0 ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white' : 'bg-[#FAFAFA] border-[#E2E8F0] text-[#E2E8F0]'}`}>
                  {totalMasyarakat > 0 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-none bg-[#E2E8F0]" />}
                </div>
                <div>
                  <h4 className={`font-black text-xs uppercase tracking-widest ${totalMasyarakat > 0 ? 'text-[#1E3A5F]' : 'text-[#64748B]'}`}>DATA CALON PENERIMA</h4>
                  <p className="text-[10px] font-bold text-[#64748B] mt-1 uppercase">{totalMasyarakat} DATA TERDAFTAR UNTUK PERIODE INI.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`mt-0.5 w-6 h-6 rounded-none border-2 flex items-center justify-center flex-shrink-0 ${totalPenilaian > 0 && totalPenilaian === totalMasyarakat ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white' : totalPenilaian > 0 ? 'bg-white border-[#1E3A5F] text-[#1E3A5F]' : 'bg-[#FAFAFA] border-[#E2E8F0] text-[#E2E8F0]'}`}>
                  {totalPenilaian > 0 && totalPenilaian === totalMasyarakat ? <CheckCircle2 className="w-4 h-4" /> : totalPenilaian > 0 ? <Clock className="w-4 h-4" /> : <div className="w-2 h-2 rounded-none bg-[#E2E8F0]" />}
                </div>
                <div>
                  <h4 className={`font-black text-xs uppercase tracking-widest ${totalPenilaian > 0 ? 'text-[#1E3A5F]' : 'text-[#64748B]'}`}>INPUT PENILAIAN KRITERIA</h4>
                  <p className="text-[10px] font-bold text-[#64748B] mt-1 uppercase">{totalPenilaian} DARI {totalMasyarakat} DATA TELAH DINILAI.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`mt-0.5 w-6 h-6 rounded-none border-2 flex items-center justify-center flex-shrink-0 ${sawProcessed ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white' : 'bg-[#FAFAFA] border-[#E2E8F0] text-[#E2E8F0]'}`}>
                  {sawProcessed ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-none bg-[#E2E8F0]" />}
                </div>
                <div>
                  <h4 className={`font-black text-xs uppercase tracking-widest ${sawProcessed ? 'text-[#1E3A5F]' : 'text-[#64748B]'}`}>PERHITUNGAN SAW</h4>
                  <p className="text-[10px] font-bold text-[#64748B] mt-1 uppercase">{sawProcessed ? 'PERHITUNGAN TELAH DIPROSES DAN SIAP DIVALIDASI.' : 'MENUNGGU PROSES PERHITUNGAN SAW.'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`mt-0.5 w-6 h-6 rounded-none border-2 flex items-center justify-center flex-shrink-0 ${isApproved ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white' : 'bg-[#FAFAFA] border-[#E2E8F0] text-[#E2E8F0]'}`}>
                  {isApproved ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-none bg-[#E2E8F0]" />}
                </div>
                <div>
                  <h4 className={`font-black text-xs uppercase tracking-widest ${isApproved ? 'text-[#1E3A5F]' : 'text-[#64748B]'}`}>VALIDASI KEPALA DESA</h4>
                  <p className="text-[10px] font-bold text-[#64748B] mt-1 uppercase">{isApproved ? 'DATA TELAH DIVALIDASI DAN DISAHKAN OLEH KADES.' : 'MENUNGGU VALIDASI KEPALA DESA.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b-4 border-[#1E3A5F] bg-[#FAFAFA]">
            <h3 className="font-black text-[#1E3A5F] uppercase tracking-widest">STATUS NOTIFIKASI WHATSAPP</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {isApproved ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-none bg-[#FAFAFA] border-2 border-[#1E3A5F]">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#1E3A5F] bg-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#1E3A5F]" />
                    </div>
                    <span className="text-xs font-black text-[#1E3A5F] uppercase tracking-widest">TOTAL WA TERKIRIM</span>
                  </div>
                  <span className="px-3 py-1 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] font-black text-sm">{klaimTerkirimCount}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-none bg-[#FAFAFA] border-2 border-[#1E3A5F]">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#1E3A5F] bg-white flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-[#1E3A5F]" />
                    </div>
                    <span className="text-xs font-black text-[#1E3A5F] uppercase tracking-widest">TOTAL WA GAGAL</span>
                  </div>
                  <span className="px-3 py-1 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] font-black text-sm">{klaimGagalCount}</span>
                </div>
                {klaimGagalCount > 0 && (
                  <p className="text-[10px] font-bold text-[#1E3A5F] uppercase tracking-widest mt-2 flex items-center gap-2 border-2 border-[#1E3A5F] p-2 bg-white">
                    <AlertCircle className="w-3.5 h-3.5" />
                    BUKA TAB "LOG WA" UNTUK MENGIRIM ULANG NOTIFIKASI.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center text-[#64748B] py-8 border-2 border-dashed border-[#E2E8F0]">
                <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1E3A5F]">BELUM ADA NOTIFIKASI WA</p>
                <p className="text-[9px] font-bold uppercase tracking-widest mt-2">NOTIFIKASI DIKIRIM SETELAH KADES MENGESAHKAN PENERIMA.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
