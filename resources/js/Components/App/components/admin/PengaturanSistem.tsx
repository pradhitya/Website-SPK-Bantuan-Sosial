import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppData } from '../../data';
import { Settings, Save } from 'lucide-react';

interface Props {
  data: AppData;
  setData: (data: AppData) => void;
}

export function PengaturanSistem({ data, setData }: Props) {
  const [kuota, setKuota] = useState(data.kuotaBansos.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(kuota, 10);
    if (isNaN(val) || val < 1) {
      toast.error('KUOTA HARUS BERUPA ANGKA YANG LEBIH DARI 0.');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post('/api/settings', { kuotaBansos: val });
      setData({ ...data, kuotaBansos: val });
      toast.success(response.data.message || 'PENGATURAN BERHASIL DISIMPAN.');
    } catch (err) {
      console.error(err);
      toast.error('GAGAL MENYIMPAN PENGATURAN.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-black text-[#1E3A5F] tracking-tight flex items-center gap-3 uppercase">
          <div className="bg-[#1E3A5F] p-2 rounded-none"><Settings className="w-6 h-6 text-white" /></div>
          PENGATURAN SISTEM
        </h1>
        <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-2">ATUR PARAMETER DAN KONFIGURASI GLOBAL SISTEM BANSOS.</p>
      </div>

      <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden shadow-none">
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6 max-w-md">
            <div>
              <label htmlFor="kuota" className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">
                KUOTA PENERIMA BANSOS
              </label>
              <input
                id="kuota"
                type="number"
                min="1"
                value={kuota}
                onChange={e => setKuota(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#1E3A5F] rounded-none text-sm font-bold uppercase focus:outline-none focus:border-[#2563EB] shadow-none transition-colors bg-white"
                placeholder="MASUKKAN KUOTA (CONTOH: 8)"
                required
              />
              <p className="mt-3 text-[10px] font-bold text-[#64748B] uppercase tracking-widest leading-relaxed">
                TENTUKAN BATAS JUMLAH ORANG YANG AKAN MENDAPATKAN STATUS "LAYAK" PADA HASIL AKHIR PERHITUNGAN SAW.
              </p>
            </div>

            <div className="pt-4 border-t-4 border-[#1E3A5F]">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1E3A5F] border-2 border-[#1E3A5F] text-white rounded-none text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#1E3A5F] transition-colors shadow-none disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                SIMPAN PENGATURAN
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
