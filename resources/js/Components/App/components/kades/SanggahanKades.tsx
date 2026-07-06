import { AppData, Sanggahan } from '../../data';
import { AlertTriangle, UserX, CheckCircle, XCircle, Search, Filter, Eye } from 'lucide-react';
import { useState } from 'react';

interface Props {
  data: AppData;
}

export function SanggahanKades({ data }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSanggahan, setSelectedSanggahan] = useState<Sanggahan | null>(null);

  const getStatusBadge = (status: Sanggahan['status']) => {
    switch (status) {
      case 'baru':
        return <span className="px-3 py-1 border-2 border-[#1E3A5F] bg-blue-300 text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> BARU MASUK</span>;
      case 'diverifikasi_valid':
        return <span className="px-3 py-1 border-2 border-[#1E3A5F] bg-emerald-300 text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle className="w-3 h-3" /> VALID</span>;
      case 'ditolak':
        return <span className="px-3 py-1 border-2 border-[#1E3A5F] bg-rose-300 text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><XCircle className="w-3 h-3" /> DITOLAK</span>;
      case 'perlu_cek_lapangan':
        return <span className="px-3 py-1 border-2 border-[#1E3A5F] bg-amber-300 text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><UserX className="w-3 h-3" /> CEK LAPANGAN</span>;
      default:
        return null;
    }
  };

  const filteredData = (data.sanggahans || []).filter(s => {
    const matchSearch = s.nama_warga_dilaporkan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.nik_pelapor?.includes(searchTerm);
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b-4 border-[#1E3A5F] pb-4">
        <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">PANTAU SANGGAHAN WARGA</h2>
        <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">LAPORAN DARI WARGA MENGENAI POTENSI SALAH SASARAN PENYALURAN BANTUAN.</p>
      </div>

      <div className="bg-white rounded-none p-6 border-4 border-[#1E3A5F] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]" />
          <input 
            type="text" 
            placeholder="CARI NAMA ATAU NIK..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-[#1E3A5F] rounded-none focus:outline-none focus:ring-0 focus:border-blue-600 text-xs font-bold uppercase transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-5 h-5 text-[#1E3A5F]" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-auto border-2 border-[#1E3A5F] py-3 pl-4 pr-10 rounded-none focus:outline-none focus:ring-0 focus:border-blue-600 text-xs font-bold uppercase transition-colors appearance-none bg-white"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231E3A5F' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', backgroundRepeat: 'no-repeat' }}
          >
            <option value="all">SEMUA STATUS</option>
            <option value="baru">BARU MASUK</option>
            <option value="perlu_cek_lapangan">CEK LAPANGAN</option>
            <option value="diverifikasi_valid">VALID</option>
            <option value="ditolak">DITOLAK</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredData.length === 0 ? (
          <div className="bg-white p-8 rounded-none border-4 border-[#1E3A5F] text-center">
            <CheckCircle className="w-12 h-12 text-[#E2E8F0] mx-auto mb-4" />
            <h3 className="text-lg font-black text-[#1E3A5F] uppercase tracking-widest">TIDAK ADA SANGGAHAN</h3>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-2">BELUM ADA DATA LAPORAN WARGA YANG COCOK DENGAN FILTER.</p>
          </div>
        ) : (
          filteredData.map(sanggahan => (
            <div key={sanggahan.id} className="bg-white rounded-none p-0 border-4 border-[#1E3A5F] flex flex-col md:flex-row items-stretch">
              <div className="flex-1 p-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {getStatusBadge(sanggahan.status)}
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">DILAPORKAN {new Date(sanggahan.tanggal_lapor).toLocaleDateString('id-ID')}</span>
                </div>
                <h3 className="font-black text-[#1E3A5F] text-lg mb-2 uppercase tracking-wide">TERLAPOR: {sanggahan.nama_warga_dilaporkan}</h3>
                <div className="text-sm font-bold text-[#1E3A5F] mb-4 bg-[#FAFAFA] p-4 border-2 border-[#1E3A5F] leading-relaxed">
                  <span className="font-black block mb-2 text-[10px] uppercase tracking-widest text-[#64748B]">ISI LAPORAN:</span>
                  {sanggahan.isi_sanggahan}
                </div>
                
                {sanggahan.catatan_admin && (
                  <div className="text-sm font-bold text-[#1E3A5F] bg-blue-50 p-4 border-2 border-[#1E3A5F] leading-relaxed">
                    <span className="font-black block mb-2 text-[10px] uppercase tracking-widest text-[#2563EB]">CATATAN TINDAK LANJUT ADMIN:</span>
                    {sanggahan.catatan_admin}
                  </div>
                )}
              </div>
              <div className="w-full md:w-72 bg-[#FAFAFA] p-6 border-t-4 md:border-t-0 md:border-l-4 border-[#1E3A5F] flex flex-col justify-center flex-shrink-0">
                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-3">PELAPOR</p>
                <p className="font-black text-[#1E3A5F] text-sm uppercase tracking-wider mb-2">{sanggahan.warga_pelapor || 'ANONIM'}</p>
                <p className="text-xs font-bold text-[#64748B] mt-1 uppercase tracking-widest">NIK: {sanggahan.nik_pelapor || '-'}</p>
                <p className="text-xs font-bold text-[#64748B] mt-1 uppercase tracking-widest">HP: {sanggahan.no_hp_pelapor || '-'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
