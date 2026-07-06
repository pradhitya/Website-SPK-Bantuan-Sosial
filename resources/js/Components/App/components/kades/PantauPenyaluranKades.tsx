import { AppData } from '../../data';
import { Package, CheckCircle2, Clock, Search, QrCode } from 'lucide-react';
import { useState } from 'react';

interface Props {
  data: AppData;
}

export function PantauPenyaluranKades({ data }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const klaimBantuans = data.klaimBantuans || [];
  
  const totalKlaim = klaimBantuans.length;
  const sudahDiambil = klaimBantuans.filter(k => k.status_klaim === 'sudah_diambil').length;
  const belumDiambil = klaimBantuans.filter(k => k.status_klaim === 'belum_diambil').length;
  
  const persentase = totalKlaim > 0 ? Math.round((sudahDiambil / totalKlaim) * 100) : 0;

  const filteredData = klaimBantuans.filter(k => {
    const nama = k.hasil_saw?.namaMasyarakat?.toLowerCase() || '';
    const noHp = k.hasil_saw?.noHp || '';
    return nama.includes(searchTerm.toLowerCase()) || noHp.includes(searchTerm);
  });

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b-4 border-[#1E3A5F] pb-4">
        <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">PROGRESS PENYALURAN BANSOS</h2>
        <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">PANTAU PROSES PENGAMBILAN BANTUAN SOSIAL SECARA REAL-TIME.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-none p-5 border-4 border-[#1E3A5F] flex items-center gap-4">
          <div className="w-12 h-12 rounded-none bg-blue-200 border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-[#1E3A5F]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#64748B] mb-0.5 uppercase tracking-widest">TARGET PENERIMA (BULAN INI)</p>
            <h3 className="text-2xl font-black text-[#1E3A5F]">{totalKlaim}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-none p-5 border-4 border-[#1E3A5F] flex items-center gap-4">
          <div className="w-12 h-12 rounded-none bg-emerald-200 border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#1E3A5F]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#64748B] mb-0.5 uppercase tracking-widest">SUDAH DIAMBIL</p>
            <h3 className="text-2xl font-black text-[#1E3A5F]">{sudahDiambil}</h3>
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border-4 border-[#1E3A5F] flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">PROGRESS TOTAL</p>
            <span className="text-sm font-black text-[#1E3A5F] px-2 py-1 bg-blue-200 border-2 border-[#1E3A5F]">{persentase}%</span>
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-none h-4 border-2 border-[#1E3A5F]">
            <div 
              className="bg-[#10B981] h-full transition-all duration-1000 border-r-2 border-[#1E3A5F]" 
              style={{ width: `${persentase}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b-4 border-[#1E3A5F] bg-[#FAFAFA] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h3 className="font-black text-[#1E3A5F] uppercase tracking-widest">DAFTAR PENERIMA</h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]" />
            <input 
              type="text" 
              placeholder="CARI NAMA PENERIMA..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-[#1E3A5F] rounded-none focus:outline-none focus:ring-0 focus:border-blue-600 text-xs font-bold uppercase transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1E3A5F] border-b-4 border-[#1E3A5F]">
                <th className="px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest border-r-2 border-[#1E3A5F]/20">NAMA & PROGRAM</th>
                <th className="px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest border-r-2 border-[#1E3A5F]/20">KODE KLAIM</th>
                <th className="px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest border-r-2 border-[#1E3A5F]/20">STATUS</th>
                <th className="px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest">WAKTU AMBIL</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1E3A5F]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center bg-[#FAFAFA]">
                    <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">TIDAK ADA DATA PENYALURAN YANG DITEMUKAN.</span>
                  </td>
                </tr>
              ) : (
                filteredData.map(k => (
                  <tr key={k.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 border-r-2 border-[#1E3A5F]">
                      <p className="font-black text-[#1E3A5F] text-sm uppercase tracking-wider">{k.hasil_saw?.namaMasyarakat || '-'}</p>
                      <p className="text-[10px] font-bold text-[#64748B] mt-1 uppercase tracking-widest">{k.hasil_saw?.jenis_bantuan?.nama_program || 'BANTUAN SOSIAL'}</p>
                    </td>
                    <td className="px-6 py-4 border-r-2 border-[#1E3A5F]">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-[#1E3A5F]" />
                        <span className="text-xs font-bold text-[#1E3A5F] bg-blue-100 border-2 border-[#1E3A5F] px-3 py-1">{k.kode_klaim}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r-2 border-[#1E3A5F]">
                      {k.status_klaim === 'sudah_diambil' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#1E3A5F] bg-emerald-300 text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> SUDAH DIAMBIL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#1E3A5F] bg-amber-300 text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> BELUM DIAMBIL
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {k.tanggal_diambil ? (
                        <span className="text-[10px] font-bold text-[#1E3A5F] uppercase tracking-widest bg-slate-100 px-3 py-1 border-2 border-[#1E3A5F]">{new Date(k.tanggal_diambil).toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-[10px] font-black text-[#64748B]">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
