import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Save, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AppData, Penilaian } from '../../data';

interface Props { data: AppData; setData: (d: AppData) => void; onNavigate?: (page: string) => void; }

function CustomSelect({ value, onChange, options, hasError, placeholder }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o: any) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-4 pr-12 py-4 rounded-none border-2 text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-between ${hasError ? 'border-red-600 text-red-900 bg-red-50' : 'border-[#1E3A5F] text-[#1E3A5F] bg-[#FAFAFA] hover:bg-white'} ${isOpen && !hasError ? 'border-[#2563EB]' : ''}`}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} ${hasError ? 'text-red-600' : 'text-[#1E3A5F]'}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-[#1E3A5F] shadow-none max-h-60 overflow-y-auto">
          <div 
            onClick={() => { onChange(''); setIsOpen(false); }}
            className="px-4 py-3 text-xs font-bold uppercase text-[#64748B] hover:bg-[#FAFAFA] hover:text-[#1E3A5F] cursor-pointer border-b-2 border-[#E2E8F0] transition-colors"
          >
            {placeholder}
          </div>
          {options.map((o: any) => (
            <div 
              key={o.value}
              onClick={() => { onChange(o.value); setIsOpen(false); }}
              className={`px-4 py-3 text-xs font-bold uppercase cursor-pointer transition-colors border-b-2 border-[#E2E8F0] last:border-b-0 ${value === o.value ? 'bg-[#1E3A5F] text-white' : 'text-[#1E3A5F] bg-white hover:bg-[#FAFAFA]'}`}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function InputPenilaian({ data, setData, onNavigate }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [tempPenilaian, setTempPenilaian] = useState<Record<number, Record<number, { subKriteriaId: number; nilai: number }>>>({});
  const [formErrors, setFormErrors] = useState<Record<number, number[]>>({});

  const getExistingPenilaian = (masyarakatId: number) =>
    data.penilaian.filter(p => p.masyarakatId === masyarakatId);

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const existing = getExistingPenilaian(id);
      const map: Record<number, { subKriteriaId: number; nilai: number }> = {};
      for (const p of existing) {
        map[p.kriteriaId] = { subKriteriaId: p.subKriteriaId, nilai: p.nilai };
      }
      setTempPenilaian(prev => ({ ...prev, [id]: map }));
      setFormErrors(prev => ({ ...prev, [id]: [] }));
    }
  };

  const setNilai = (masyarakatId: number, kriteriaId: number, subKriteriaId: number, nilai: number) => {
    setTempPenilaian(prev => ({
      ...prev,
      [masyarakatId]: {
        ...(prev[masyarakatId] || {}),
        [kriteriaId]: { subKriteriaId, nilai },
      },
    }));
    setFormErrors(prev => ({
      ...prev,
      [masyarakatId]: (prev[masyarakatId] || []).filter(k => k !== kriteriaId),
    }));
  };

  const savePenilaian = async (masyarakatId: number) => {
    const temp = tempPenilaian[masyarakatId] || {};
    const missing: number[] = [];
    for (const k of data.kriteria) {
      if (!temp[k.id]) missing.push(k.id);
    }
    if (missing.length > 0) {
      setFormErrors(prev => ({ ...prev, [masyarakatId]: missing }));
      toast.error(`Masih ada ${missing.length} kriteria yang belum diisi!`);
      return;
    }

    try {
      const newPenilaian: Penilaian[] = Object.entries(temp).map(([kId, val]) => ({
        masyarakatId,
        kriteriaId: Number(kId),
        subKriteriaId: val.subKriteriaId,
        nilai: val.nilai,
      }));

      const filtered = data.penilaian.filter(p => p.masyarakatId !== masyarakatId);
      const updatedPenilaian = [...filtered, ...newPenilaian];

      await axios.post('/api/penilaian/save-all', { 
        penilaian: updatedPenilaian, 
        periode: data.activePeriode || '2026-06',
        jenis_bantuan_id: data.activeJenisBantuanId
      });

      const approvalKey = (data.activePeriode || '2026-06') + (data.activeJenisBantuanId ? '_' + data.activeJenisBantuanId : '');
      const newHasilSAW = data.hasilSAW.filter(h => !(h.periode === (data.activePeriode || '2026-06') && h.jenis_bantuan_id == data.activeJenisBantuanId));
      const newApprovedIds = { ...data.approvedIds };
      delete newApprovedIds[approvalKey];

      setData({ ...data, penilaian: updatedPenilaian, sawProcessed: false, hasilSAW: newHasilSAW, approvedIds: newApprovedIds });
      toast.success('Penilaian berhasil disimpan!');
      setExpandedId(null);
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan penilaian');
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          {onNavigate && (
            <button
              onClick={() => onNavigate('masyarakat')}
              className="mt-1 sm:mt-0 p-3 rounded-none border-4 border-[#1E3A5F] bg-white text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-colors shadow-none"
              title="KEMBALI KE DATA MASYARAKAT"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">BERI PENILAIAN WARGA</h2>
            <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">
              MASUKKAN NILAI KRITERIA UNTUK SETIAP CALON PENERIMA. GUNAKAN DROPDOWN UNTUK MEMILIH NILAI.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest whitespace-nowrap">PERIODE:</label>
          <input 
            type="month" 
            value={data.activePeriode || '2026-06'} 
            onChange={e => setData({...data, activePeriode: e.target.value})}
            className="px-4 py-3 border-2 border-[#1E3A5F] rounded-none text-sm font-bold uppercase focus:outline-none focus:border-[#2563EB] bg-white shadow-none transition-colors"
          />
        </div>
      </div>

      <div className="flex items-start gap-4 px-6 py-5 bg-amber-400 border-4 border-[#1E3A5F] shadow-none text-[#1E3A5F] rounded-none">
        <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0 text-[#1E3A5F]" />
        <span className="font-bold text-[10px] uppercase tracking-widest leading-relaxed">
          SEMUA KRITERIA WAJIB DIISI SEBELUM MENYIMPAN. JIKA ADA YANG TERLEWAT, SISTEM AKAN MENOLAK MENYIMPAN DATA.
        </span>
      </div>

      <div className="space-y-6">
        {data.masyarakat.filter(m => (!m.periode || m.periode === (data.activePeriode || '2026-06')) && (!data.activeJenisBantuanId || m.jenis_bantuan_id == data.activeJenisBantuanId)).map((m) => {
          const isExpanded = expandedId === m.id;
          const existing = getExistingPenilaian(m.id);
          const isDinilai = existing.length === data.kriteria.length;
          const errors = formErrors[m.id] || [];

          return (
            <div key={m.id} className={`bg-white rounded-none border-4 border-[#1E3A5F] transition-all duration-300 overflow-hidden ${isExpanded ? 'shadow-none' : 'shadow-none hover:shadow-none'}`}>
              <button
                onClick={() => toggleExpand(m.id)}
                className="w-full flex items-center gap-4 px-4 py-4 bg-[#FAFAFA] text-left transition-colors border-b-4 border-transparent"
                style={{ borderBottomColor: isExpanded ? '#1E3A5F' : 'transparent' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4">
                    <span className="font-black text-lg text-[#1E3A5F] uppercase tracking-widest">{m.nama}</span>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-none border-2 border-[#1E3A5F] text-[10px] font-black uppercase tracking-widest shadow-none ${isDinilai ? 'bg-emerald-400 text-[#1E3A5F]' : 'bg-amber-400 text-[#1E3A5F]'}`}>
                      {isDinilai ? <><CheckCircle2 className="w-4 h-4" /> LENGKAP</> : `${existing.length}/${data.kriteria.length} KRITERIA`}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-2">{m.nik} <span className="mx-2 text-[#1E3A5F] font-black">•</span> {m.alamat}</p>
                </div>
                <div className={`p-2 rounded-none border-2 border-[#1E3A5F] transition-colors shadow-none ${isExpanded ? 'bg-[#1E3A5F] text-white' : 'bg-white text-[#1E3A5F]'}`}>
                  {isExpanded ? <ChevronUp className="w-5 h-5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 flex-shrink-0" />}
                </div>
              </button>

              {isExpanded && (
                <div className="bg-white px-4 pb-6 pt-4">
                  <div className="space-y-4">
                    {data.kriteria.map((k) => {
                      const subs = data.subKriteria.filter(s => s.kriteriaId === k.id).sort((a, b) => a.nilai - b.nilai);
                      const current = (tempPenilaian[m.id] || {})[k.id];
                      const hasError = errors.includes(k.id);

                      return (
                        <div key={k.id} className={`rounded-none border-4 p-4 transition-all shadow-none ${hasError ? 'border-red-600 bg-red-50' : 'border-[#1E3A5F] bg-white'}`}>
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap mb-4">
                                <span className="inline-block font-black text-[10px] text-white bg-[#1E3A5F] px-3 py-1.5 rounded-none uppercase tracking-widest shadow-none">
                                  {k.kode}
                                </span>
                                <span className="text-sm font-black text-[#1E3A5F] uppercase tracking-widest">{k.nama}</span>
                                <span className={`text-[10px] px-3 py-1.5 rounded-none font-black uppercase tracking-widest border-2 border-[#1E3A5F] shadow-none ${k.atribut === 'Benefit' ? 'bg-emerald-400 text-[#1E3A5F]' : 'bg-rose-400 text-[#1E3A5F]'}`}>
                                  {k.atribut}
                                </span>
                                <span className="text-[10px] font-black text-[#1E3A5F] bg-[#FAFAFA] border-2 border-[#1E3A5F] px-3 py-1.5 rounded-none uppercase tracking-widest shadow-none">BOBOT: {k.bobot}%</span>
                              </div>
                              <CustomSelect
                                value={current ? current.subKriteriaId : ''}
                                onChange={(val: string | number) => {
                                  const sub = subs.find(s => s.id === Number(val));
                                  if (sub) setNilai(m.id, k.id, sub.id, sub.nilai);
                                }}
                                options={subs.map(s => ({ value: s.id, label: `[${s.nilai}] ${s.nama}` }))}
                                hasError={hasError}
                                placeholder="-- PILIH KONDISI UNTUK KRITERIA INI --"
                              />
                              {hasError && <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> PILIHAN INI WAJIB DIISI</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end mt-8 pt-6 border-t-4 border-[#1E3A5F]">
                    <button
                      onClick={() => savePenilaian(m.id)}
                      className="flex items-center gap-2 px-6 py-4 rounded-none bg-[#1E3A5F] border-2 border-[#1E3A5F] text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#1E3A5F] transition-colors shadow-none"
                    >
                      <Save className="w-5 h-5" />
                      SIMPAN PENILAIAN
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
