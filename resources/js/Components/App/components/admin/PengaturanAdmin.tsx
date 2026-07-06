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
    <div className="space-y-6 pb-10 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">PENGATURAN</h2>
          <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">KELOLA SISTEM, PENGGUNA, DAN PROFIL AKUN ANDA</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-b-4 border-[#1E3A5F] pb-0">
        <button
          onClick={() => setActiveTab('sistem')}
          className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'sistem' ? 'bg-[#1E3A5F] text-white border-4 border-[#1E3A5F] border-b-0 translate-y-1' : 'bg-[#FAFAFA] text-[#64748B] border-4 border-transparent hover:text-[#1E3A5F] hover:border-[#1E3A5F] hover:border-b-0 hover:translate-y-1'
          }`}
        >
          <Settings className="w-4 h-4" />
          SISTEM & PERIODE
        </button>
        <button
          onClick={() => setActiveTab('pengguna')}
          className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'pengguna' ? 'bg-[#1E3A5F] text-white border-4 border-[#1E3A5F] border-b-0 translate-y-1' : 'bg-[#FAFAFA] text-[#64748B] border-4 border-transparent hover:text-[#1E3A5F] hover:border-[#1E3A5F] hover:border-b-0 hover:translate-y-1'
          }`}
        >
          <Shield className="w-4 h-4" />
          MANAJEMEN PENGGUNA
        </button>
        <button
          onClick={() => setActiveTab('akun')}
          className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'akun' ? 'bg-[#1E3A5F] text-white border-4 border-[#1E3A5F] border-b-0 translate-y-1' : 'bg-[#FAFAFA] text-[#64748B] border-4 border-transparent hover:text-[#1E3A5F] hover:border-[#1E3A5F] hover:border-b-0 hover:translate-y-1'
          }`}
        >
          <UserCog className="w-4 h-4" />
          AKUN SAYA
        </button>
      </div>

      <div className="pt-4">
        {activeTab === 'sistem' && <PengaturanSistem data={data} setData={setData} />}
        {activeTab === 'pengguna' && <ManajemenPengguna />}
        {activeTab === 'akun' && <PengaturanAkun user={user} />}
      </div>
    </div>
  );
}
