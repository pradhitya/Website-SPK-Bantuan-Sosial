import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload, AlertTriangle, FileText, Send, CheckCircle2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { AppData } from '../../data';

interface Props {
  onClose: () => void;
  data: AppData;
}

export function SanggahanModal({ onClose, data }: Props) {
  const [form, setForm] = useState({
    nama_pelapor: '',
    nik_pelapor: '',
    no_hp_pelapor: '',
    nama_warga_dilaporkan: '',
    pesan: '',
    jenis_bantuan_id: data.activeJenisBantuanId || '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_pelapor || !form.nik_pelapor || !form.pesan || !form.jenis_bantuan_id) {
      toast.error('Mohon lengkapi semua kolom yang wajib diisi');
      return;
    }

    if (form.nik_pelapor.length !== 16) {
      toast.error('NIK harus 16 digit');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('nama_pelapor', form.nama_pelapor);
    formData.append('nik_pelapor', form.nik_pelapor);
    formData.append('pesan', form.pesan);
    formData.append('jenis_bantuan_id', form.jenis_bantuan_id.toString());
    
    if (form.no_hp_pelapor) {
      formData.append('no_hp_pelapor', form.no_hp_pelapor);
    }

    if (form.nama_warga_dilaporkan) {
      formData.append('nama_warga_dilaporkan', form.nama_warga_dilaporkan);
    }
    
    if (file) {
      formData.append('bukti', file);
    }

    try {
      await axios.post('/api/sanggahan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal mengirim sanggahan';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E3A5F]/80 backdrop-blur-sm">
        <div className="bg-white border-4 border-[#1E3A5F] shadow-none rounded-none w-full max-w-md p-8 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-[#FAFAFA] border-2 border-[#1E3A5F] text-[#1E3A5F] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-[#1E3A5F] mb-2 uppercase tracking-tight">Laporan Diterima</h3>
          <p className="text-[#64748B] mb-8 font-bold text-sm">
            Terima kasih atas kepedulian Anda. Laporan sanggahan telah kami terima dan akan segera diproses oleh petugas verifikasi desa.
          </p>
          <button 
            onClick={onClose}
            className="w-full py-4 rounded-none bg-[#1E3A5F] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#2563EB] transition-colors border-2 border-[#1E3A5F] hover:border-[#2563EB]"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-[#1E3A5F]/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border-2 border-[#1E3A5F] shadow-none rounded-none w-full max-w-lg my-2 relative animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#1E3A5F] bg-white">
          <div>
            <h3 className="text-base font-black text-[#1E3A5F] uppercase tracking-tight leading-none">Form Sanggahan Publik</h3>
            <p className="text-[8px] font-bold text-[#64748B] uppercase tracking-widest mt-1">Laporan Ketidaksesuaian Penerima Bansos</p>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center bg-transparent border border-transparent hover:border-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white text-[#1E3A5F] transition-colors rounded-none"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-start gap-2 p-2 bg-[#FAFAFA] text-[#1E3A5F] border border-[#1E3A5F] mb-4">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#1E3A5F]" />
            <div className="text-[9px] font-bold leading-relaxed">
              <span className="uppercase tracking-widest font-black block mb-0.5">Status Rahasia</span>
              Identitas pelapor akan dijaga kerahasiaannya.
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[8px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Nama Lengkap Pelapor <span className="text-[#2563EB] text-sm leading-none">*</span></label>
                <input 
                  type="text" required
                  value={form.nama_pelapor} onChange={e => setForm({...form, nama_pelapor: e.target.value})}
                  className="w-full px-2 py-1.5 text-[10px] rounded-none border-2 border-[#E2E8F0] bg-transparent focus:bg-white focus:outline-none focus:ring-0 focus:border-[#1E3A5F] font-bold text-[#1E3A5F] transition-colors"
                  placeholder="SESUAI KTP"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-[#64748B] uppercase tracking-widest mb-1">NIK Pelapor <span className="text-[#2563EB] text-sm leading-none">*</span></label>
                <input 
                  type="text" required maxLength={16}
                  value={form.nik_pelapor} onChange={e => setForm({...form, nik_pelapor: e.target.value.replace(/\D/g, '')})}
                  className="w-full px-2 py-1.5 text-[10px] rounded-none border-2 border-[#E2E8F0] bg-transparent focus:bg-white focus:outline-none focus:ring-0 focus:border-[#1E3A5F] font-black tracking-widest text-[#1E3A5F] transition-colors"
                  placeholder="16 DIGIT NIK"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[8px] font-bold text-[#64748B] uppercase tracking-widest mb-1">No. HP / WhatsApp</label>
                <input 
                  type="text" 
                  value={form.no_hp_pelapor} onChange={e => setForm({...form, no_hp_pelapor: e.target.value.replace(/\D/g, '')})}
                  className="w-full px-2 py-1.5 text-[10px] rounded-none border-2 border-[#E2E8F0] bg-transparent focus:bg-white focus:outline-none focus:ring-0 focus:border-[#1E3A5F] font-black tracking-widest text-[#1E3A5F] transition-colors"
                  placeholder="08XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Program Bansos <span className="text-[#2563EB] text-sm leading-none">*</span></label>
                <div className="relative">
                  <select 
                    required
                    value={form.jenis_bantuan_id} onChange={e => setForm({...form, jenis_bantuan_id: e.target.value})}
                    className="w-full px-2 py-1.5 pr-6 text-[10px] rounded-none border-2 border-[#E2E8F0] bg-transparent focus:bg-white focus:outline-none focus:ring-0 focus:border-[#1E3A5F] font-bold text-[#1E3A5F] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">-- PILIH PROGRAM --</option>
                    {data.jenisBantuan.map(j => (
                      <option key={j.id} value={j.id}>{j.nama_program.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#1E3A5F] pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Nama Warga yang Disanggah (Opsional)</label>
              <input 
                type="text" 
                value={form.nama_warga_dilaporkan} onChange={e => setForm({...form, nama_warga_dilaporkan: e.target.value})}
                className="w-full px-2 py-1.5 text-[10px] rounded-none border-2 border-[#E2E8F0] bg-transparent focus:bg-white focus:outline-none focus:ring-0 focus:border-[#1E3A5F] font-bold text-[#1E3A5F] transition-colors"
                placeholder="NAMA WARGA YANG DINILAI TIDAK LAYAK"
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Isi Laporan / Sanggahan <span className="text-[#2563EB] text-sm leading-none">*</span></label>
              <textarea 
                required rows={2}
                value={form.pesan} onChange={e => setForm({...form, pesan: e.target.value})}
                className="w-full px-2 py-1.5 text-[10px] rounded-none border-2 border-[#E2E8F0] bg-transparent focus:bg-white focus:outline-none focus:ring-0 focus:border-[#1E3A5F] font-bold text-[#1E3A5F] transition-colors resize-none leading-relaxed"
                placeholder="Jelaskan alasan sanggahan secara detail..."
              />
            </div>

            <div>
              <label className="block text-[8px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Bukti Pendukung (Foto/Gambar)</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`w-full px-3 py-3 rounded-none border-2 border-dashed flex flex-col items-center justify-center transition-colors ${file ? 'border-[#1E3A5F] bg-[#FAFAFA]' : 'border-[#E2E8F0] bg-transparent group-hover:border-[#1E3A5F] group-hover:bg-[#FAFAFA]'}`}>
                  {file ? (
                    <>
                      <FileText className="w-4 h-4 text-[#1E3A5F] mb-1" />
                      <p className="text-[10px] font-black text-[#1E3A5F] tracking-tight">{file.name}</p>
                      <p className="text-[8px] font-bold text-[#64748B] uppercase tracking-widest mt-0.5">KLIK MENGGANTI</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#64748B] mb-1 group-hover:text-[#1E3A5F] transition-colors" />
                      <p className="text-[10px] font-bold text-[#1E3A5F] uppercase tracking-widest">KLIK/DROP GAMBAR</p>
                      <p className="text-[8px] font-bold text-[#64748B] uppercase tracking-widest mt-0.5">MAKS. 5MB (JPG/PNG)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t-2 border-[#E2E8F0]">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-none font-bold text-[#1E3A5F] uppercase tracking-widest text-[9px] border-2 border-transparent hover:border-[#1E3A5F] transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-none bg-[#1E3A5F] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#2563EB] transition-colors border-2 border-[#1E3A5F] hover:border-[#2563EB] disabled:opacity-70 disabled:hover:bg-[#1E3A5F] disabled:hover:border-[#1E3A5F]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  MENGIRIM...
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  KIRIM
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
