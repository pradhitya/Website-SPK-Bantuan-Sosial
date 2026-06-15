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
      toast.error('Kuota harus berupa angka yang lebih dari 0.');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post('/api/settings', { kuotaBansos: val });
      setData({ ...data, kuotaBansos: val });
      toast.success(response.data.message || 'Pengaturan berhasil disimpan.');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Pengaturan Sistem
        </h1>
        <p className="text-slate-500 mt-1">Atur parameter dan konfigurasi global sistem bansos.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="kuota" className="block text-sm font-medium text-slate-700 mb-1">
                Kuota Penerima Bansos
              </label>
              <input
                id="kuota"
                type="number"
                min="1"
                value={kuota}
                onChange={e => setKuota(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Masukkan kuota (contoh: 8)"
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                Tentukan batas jumlah orang yang akan mendapatkan status "Layak" pada hasil akhir perhitungan SAW.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Simpan Pengaturan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
