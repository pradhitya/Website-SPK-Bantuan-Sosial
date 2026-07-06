import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  ShieldCheck, Search, Users, AlertTriangle, ChevronDown,
  MapPin, Calendar, Heart, FileText, ArrowRight, User, Award
} from 'lucide-react';
import { AppData, HasilSAWItem } from '../../data';
import { SanggahanModal } from './SanggahanModal';

interface Props {
  onLoginClick: () => void;
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
}

export function PublicPortal({ onLoginClick, data, setData }: Props) {
  const [isSanggahanOpen, setIsSanggahanOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Default to the first program if none selected
  useEffect(() => {
    if (!data.activeJenisBantuanId && data.jenisBantuan && data.jenisBantuan.length > 0) {
      setData(prev => ({ ...prev, activeJenisBantuanId: data.jenisBantuan[0].id }));
    }
  }, [data.jenisBantuan, data.activeJenisBantuanId, setData]);

  const approvalKey = data.activePeriode + (data.activeJenisBantuanId ? '_' + data.activeJenisBantuanId : '');
  const approvedIds = data.approvedIds[approvalKey] || [];

  const publicPenerima = data.hasilSAW
    .filter(h => h.periode === data.activePeriode && h.jenis_bantuan_id == data.activeJenisBantuanId && h.status_approval === 'disetujui')
    .filter(h => h.namaMasyarakat.toLowerCase().includes(search.toLowerCase()) || h.alamat.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.ranking - b.ranking);

  const activeProgramName = data.jenisBantuan?.find(j => j.id === data.activeJenisBantuanId)?.nama_program || 'Semua Program';

  const obscureNik = (nik?: string) => {
    if (!nik) return '-';
    if (nik.length < 16) return nik;
    return nik.substring(0, 6) + '******' + nik.substring(12);
  };

  const totalPenerimaAktif = publicPenerima.length;
  const formattedPeriode = data.activePeriode 
    ? new Date(data.activePeriode + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) 
    : '-';

  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif] selection:bg-[#E2E8F0] text-[#1E3A5F]">
      {/* Navigation */}
      <nav className="border-b border-[#E2E8F0] bg-white relative z-10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E3A5F] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-[#1E3A5F] tracking-tight leading-none uppercase text-sm mb-0.5">Pemdes Sukamaju</h1>
              <p className="text-[10px] font-bold text-[#64748B] tracking-widest uppercase">Portal Bansos</p>
            </div>
          </div>
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2563EB] transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Area Pegawai</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-20 pb-16 border-b border-[#E2E8F0] bg-white relative">
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-block mb-6 px-3 py-1 bg-[#1E3A5F] text-white text-[10px] font-bold uppercase tracking-widest">
              Portal Transparansi
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1E3A5F] tracking-tight mb-5 leading-[1.1]">
              Register Kelayakan<br />Bantuan Sosial
            </h2>
            <p className="text-base text-[#64748B] leading-relaxed max-w-xl mb-8">
              Dokumen publik digital yang memuat daftar penetapan penerima bantuan sosial Desa Sukamaju. Diperbarui secara real-time berdasarkan hasil validasi Sistem Pendukung Keputusan (SPK).
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#penerima" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2563EB] text-white text-sm font-bold hover:bg-[#1d4ed8] transition-colors">
                <Search className="w-4 h-4" />
                Akses Register Data
              </a>
              <button
                onClick={() => setIsSanggahanOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#1E3A5F] border-2 border-[#E2E8F0] text-sm font-bold hover:border-[#1E3A5F] transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-[#1E3A5F]" />
                Form Sanggahan
              </button>
            </div>
          </div>
          
          {/* Quick Stats Grid */}
          <div className="w-full lg:w-auto grid grid-cols-2 gap-px bg-[#E2E8F0] border border-[#E2E8F0]">
            <div className="p-6 bg-white flex flex-col justify-center min-w-[160px]">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Periode Aktif</p>
              <p className="text-2xl font-black text-[#1E3A5F] tabular-nums leading-none">{formattedPeriode}</p>
            </div>
            <div className="p-6 bg-white flex flex-col justify-center relative overflow-hidden min-w-[160px]">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]"></div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2 pl-2">Total Valid</p>
              <div className="flex items-baseline gap-1.5 pl-2">
                <p className="text-3xl font-black text-[#1E3A5F] tabular-nums leading-none">{totalPenerimaAktif}</p>
                <span className="text-xs font-bold text-[#64748B]">KPM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="penerima" className="max-w-6xl mx-auto px-6 py-16">
        <div className="border-t-2 border-[#1E3A5F]">
          {/* Header Register */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 border-b border-[#E2E8F0] gap-4">
            <div>
              <h3 className="text-xl font-black text-[#1E3A5F] uppercase tracking-tight">Dokumen Register</h3>
              <p className="text-sm text-[#64748B] mt-1">Data divalidasi dan disahkan oleh otoritas desa.</p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-0.5">Nomor Register</div>
              <div className="text-sm font-bold text-[#1E3A5F] tabular-nums">{new Date().getFullYear()}/BANSOS/{data.activePeriode?.replace('-', '') || 'XXXX'}</div>
            </div>
          </div>

          {/* Filters - Modern Form Style */}
          <div className="py-6 border-b border-[#E2E8F0]">
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Periode</label>
                <CustomMonthPicker
                  value={data.activePeriode || '2026-06'}
                  onChange={(val: string) => setData({ ...data, activePeriode: val })}
                />
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Program Bantuan</label>
                <CustomSelect
                  value={data.activeJenisBantuanId || ''}
                  onChange={(val: number) => setData({ ...data, activeJenisBantuanId: val })}
                  options={data.jenisBantuan.map(j => ({ value: j.id, label: j.nama_program }))}
                  placeholder="Pilih Program"
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Pencarian Penerima</label>
                <div className="relative">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Ketik nama atau alamat..."
                    className="w-full pl-7 pr-0 py-2 text-sm border-0 border-b-2 border-[#E2E8F0] focus:ring-0 focus:border-[#1E3A5F] font-bold text-[#1E3A5F] transition-colors rounded-none placeholder:font-medium placeholder:text-[#64748B]/50 bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* List of Recipients - Modern Ledger Style */}
          {publicPenerima.length > 0 ? (
            <div className="w-full pb-8">
              <div className="hidden md:grid grid-cols-12 gap-4 py-4 border-b border-[#E2E8F0] text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                <div className="col-span-1">No.</div>
                <div className="col-span-3">Nama Lengkap & NIK</div>
                <div className="col-span-4">Detail Alamat</div>
                <div className="col-span-2">Skor Kelayakan</div>
                <div className="col-span-2 text-right">Validasi</div>
              </div>
              <div className="flex flex-col">
                {publicPenerima.map((p, index) => {
                  const detail = data.masyarakat.find(m => m.id === p.masyarakatId);

                  return (
                    <div key={p.masyarakatId} className="group grid grid-cols-1 md:grid-cols-12 gap-4 py-5 border-b border-[#E2E8F0] hover:bg-[#FAFAFA] transition-colors items-center text-sm relative">
                      
                      {/* Active Row Indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB] scale-y-0 group-hover:scale-y-100 transition-transform origin-center"></div>

                      {/* Mobile Labels */}
                      <div className="md:hidden flex justify-between items-center mb-2 pl-4">
                        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">No. Urut</span>
                        <span className="font-bold tabular-nums text-[#1E3A5F]">{(index + 1).toString().padStart(3, '0')}</span>
                      </div>

                      <div className="hidden md:block col-span-1 font-bold tabular-nums text-[#64748B] pl-4">
                        {(index + 1).toString().padStart(3, '0')}
                      </div>
                      
                      <div className="col-span-1 md:col-span-3 pl-4 md:pl-0">
                        <div className="md:hidden text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Nama & NIK</div>
                        <div className="font-bold text-[#1E3A5F] text-base">{p.namaMasyarakat}</div>
                        <div className="text-xs text-[#64748B] mt-1 font-medium tabular-nums">{obscureNik(detail?.nik)}</div>
                      </div>

                      <div className="col-span-1 md:col-span-4 px-4 md:px-0">
                        <div className="md:hidden text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Alamat</div>
                        <div className="text-[#1E3A5F] leading-relaxed pr-4">{p.alamat}</div>
                      </div>

                      <div className="col-span-1 md:col-span-2 px-4 md:px-0">
                        <div className="md:hidden flex justify-between items-center">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Skor Kelayakan</span>
                          <span className="font-bold tabular-nums text-[#1E3A5F] bg-[#E2E8F0]/50 px-2 py-1">{(p.nilaiAkhir * 100).toFixed(1)}%</span>
                        </div>
                        <div className="hidden md:block font-bold tabular-nums text-[#1E3A5F]">
                          {(p.nilaiAkhir * 100).toFixed(1)}%
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 flex md:justify-end mt-3 md:mt-0 px-4 md:px-0 pr-4">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#2563EB] border-2 border-[#2563EB] px-2.5 py-1.5 uppercase tracking-widest">
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                          Tervalidasi
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="text-[#E2E8F0] mb-4">
                <FileText className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-base font-bold text-[#1E3A5F] uppercase tracking-widest">Register Kosong</p>
              <p className="text-sm text-[#64748B] mt-2 max-w-sm mx-auto">Data penerima belum tersedia atau belum disahkan untuk periode ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1E3A5F] text-[#E2E8F0] py-12 text-center text-sm border-t border-[#1E3A5F]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold uppercase tracking-widest text-xs">Pemdes Sukamaju</span>
          </div>
          <p className="text-xs text-white/50 font-medium tracking-wide">Â© {new Date().getFullYear()} Register Transparansi Bansos. Hak Cipta Dilindungi.</p>
        </div>
      </footer>

      {/* Sanggahan Modal */}
      {isSanggahanOpen && (
        <SanggahanModal
          onClose={() => setIsSanggahanOpen(false)}
          data={data}
        />
      )}
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function useClickOutside(ref: React.RefObject<any>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

function CustomSelect({ value, onChange, options, placeholder }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const selectedOption = options.find((o: any) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-0 py-2 text-sm border-0 border-b-2 border-[#E2E8F0] focus:ring-0 focus:border-[#1E3A5F] font-bold text-[#1E3A5F] bg-transparent text-left flex justify-between items-center transition-colors rounded-none outline-none cursor-pointer"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-[#1E3A5F] ml-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#1E3A5F] z-50 shadow-xl">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option: any) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors ${value === option.value ? 'bg-[#1E3A5F] text-white' : 'text-[#1E3A5F] hover:bg-[#FAFAFA]'}`}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomMonthPicker({ value, onChange }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const currentYear = parseInt(value.split('-')[0]) || new Date().getFullYear();
  const currentMonth = parseInt(value.split('-')[1]) || new Date().getMonth() + 1;

  const [viewYear, setViewYear] = useState(currentYear);

  useClickOutside(ref, () => setIsOpen(false));

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const formattedDisplay = `${months[currentMonth - 1]} ${currentYear}`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto min-w-[140px] px-0 py-2 text-sm border-0 border-b-2 border-[#E2E8F0] focus:ring-0 focus:border-[#1E3A5F] font-bold text-[#1E3A5F] bg-transparent text-left flex justify-between items-center transition-colors rounded-none outline-none cursor-pointer"
      >
        <span>{formattedDisplay}</span>
        <Calendar className={`w-4 h-4 text-[#1E3A5F] ml-4 transition-transform ${isOpen ? 'scale-110' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border-2 border-[#1E3A5F] z-50 shadow-xl p-4">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E2E8F0]">
            <button 
              type="button"
              onClick={() => setViewYear(viewYear - 1)}
              className="px-2 py-1 bg-[#FAFAFA] hover:bg-[#E2E8F0] text-[#1E3A5F] font-black transition-colors"
            >
              &laquo;
            </button>
            <div className="font-black text-[#1E3A5F] tracking-widest">{viewYear}</div>
            <button 
              type="button"
              onClick={() => setViewYear(viewYear + 1)}
              className="px-2 py-1 bg-[#FAFAFA] hover:bg-[#E2E8F0] text-[#1E3A5F] font-black transition-colors"
            >
              &raquo;
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((m, idx) => {
              const monthNum = idx + 1;
              const isSelected = currentYear === viewYear && currentMonth === monthNum;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    const mm = monthNum.toString().padStart(2, '0');
                    onChange(`${viewYear}-${mm}`);
                    setIsOpen(false);
                  }}
                  className={`py-2 text-[10px] uppercase tracking-widest font-bold transition-colors border ${isSelected ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-[#FAFAFA] text-[#1E3A5F] border-[#E2E8F0] hover:border-[#1E3A5F]'}`}
                >
                  {m.substring(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
