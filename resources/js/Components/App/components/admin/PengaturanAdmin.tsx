import { useState } from 'react';
import { User, AppData } from '../../data';
import { ManajemenPengguna } from './ManajemenPengguna';
import { PengaturanSistem } from './PengaturanSistem';
import { PengaturanAkun } from '../shared/PengaturanAkun';
import { UserCog, Settings, Shield } from 'lucide-react';

interface Props {
  user: User;
  data: AppData;
  setData: (d: AppData) => void;
}

export function PengaturanAdmin({ user, data, setData }: Props) {
  const [activeTab, setActiveTab] = useState<'sistem' | 'pengguna' | 'akun'>('sistem');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola sistem, pengguna, dan profil akun Anda</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('sistem')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'sistem' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Settings className="w-4 h-4" />
          Sistem & Periode
        </button>
        <button
          onClick={() => setActiveTab('pengguna')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'pengguna' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Shield className="w-4 h-4" />
          Manajemen Pengguna
        </button>
        <button
          onClick={() => setActiveTab('akun')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'akun' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <UserCog className="w-4 h-4" />
          Akun Saya
        </button>
      </div>

      <div className="pt-2">
        {activeTab === 'sistem' && <PengaturanSistem data={data} setData={setData} />}
        {activeTab === 'pengguna' && <ManajemenPengguna />}
        {activeTab === 'akun' && <PengaturanAkun user={user} />}
      </div>
    </div>
  );
}
