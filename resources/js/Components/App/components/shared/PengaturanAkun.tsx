import React, { useState } from 'react';
import { Eye, EyeOff, Save, User, Lock, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { User as UserType } from '../../data';
import axios from 'axios';

interface Props { user: UserType; }

export function PengaturanAkun({ user }: Props) {
  const [nama, setNama] = useState(user.nama);
  const [jabatan, setJabatan] = useState(user.jabatan);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const saveProfile = async () => {
    if (!nama.trim()) { toast.error('NAMA TIDAK BOLEH KOSONG'); return; }
    try {
      await axios.put(`/api/users/${user.id}`, { nama, jabatan });
      toast.success('PROFIL BERHASIL DIPERBARUI!');
    } catch (e) {
      toast.error('GAGAL MEMPERBARUI PROFIL');
    }
  };

  const savePassword = async () => {
    if (newPass.length < 6) {
      toast.error('PASSWORD BARU MINIMAL 6 KARAKTER');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('KONFIRMASI PASSWORD TIDAK COCOK!');
      return;
    }
    try {
      await axios.put(`/api/users/${user.id}`, { password: newPass });
      toast.success('PASSWORD BERHASIL DIUBAH!');
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (e) {
      toast.error('GAGAL MENGUBAH PASSWORD');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">PENGATURAN AKUN</h2>
        <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">PERBARUI INFORMASI PROFIL DAN KEAMANAN AKUN ANDA</p>
      </div>

      <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden">
        <div className="px-6 py-4 border-b-4 border-[#1E3A5F] flex items-center gap-3 bg-[#FAFAFA]">
          <User className="w-5 h-5 text-[#1E3A5F]" />
          <h3 className="font-black text-[#1E3A5F] uppercase tracking-widest">INFORMASI PROFIL</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-5 pb-6 border-b-4 border-[#1E3A5F]">
            <div className="w-16 h-16 rounded-none bg-blue-400 border-4 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
              <span className="text-[#1E3A5F] text-2xl font-black">{user.nama.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="font-black text-xl text-[#1E3A5F] uppercase tracking-tight">{user.nama}</p>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mt-1">{user.jabatan}</p>
              <span className={`inline-block border-2 border-[#1E3A5F] px-3 py-1 text-[10px] font-black uppercase tracking-widest mt-2 ${user.role === 'admin' ? 'bg-blue-300 text-[#1E3A5F]' : 'bg-emerald-300 text-[#1E3A5F]'}`}>
                {user.role === 'admin' ? 'ADMIN / OPERATOR' : 'KEPALA DESA'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NAMA LENGKAP</label>
              <input
                value={nama}
                onChange={e => setNama(e.target.value)}
                className="w-full px-4 py-3 rounded-none border-2 border-[#1E3A5F] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">JABATAN</label>
              <input
                value={jabatan}
                onChange={e => setJabatan(e.target.value)}
                className="w-full px-4 py-3 rounded-none border-2 border-[#1E3A5F] text-sm font-bold focus:outline-none focus:border-[#2563EB] uppercase transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">USERNAME</label>
              <input
                value={user.username}
                disabled
                className="w-full px-4 py-3 rounded-none border-2 border-[#64748B] text-sm font-bold bg-[#E2E8F0] text-[#64748B] cursor-not-allowed uppercase"
              />
              <p className="text-[10px] font-bold text-[#64748B] mt-2 uppercase tracking-widest">USERNAME TIDAK DAPAT DIUBAH</p>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button onClick={saveProfile} className="flex items-center gap-2 px-6 py-3 border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#1E3A5F] transition-colors">
              <Save className="w-4 h-4" />
              SIMPAN PROFIL
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden">
        <div className="px-6 py-4 border-b-4 border-[#1E3A5F] flex items-center gap-3 bg-[#FAFAFA]">
          <Lock className="w-5 h-5 text-[#1E3A5F]" />
          <h3 className="font-black text-[#1E3A5F] uppercase tracking-widest">UBAH PASSWORD</h3>
        </div>
        <div className="p-6 space-y-5">
          {[
            { label: 'PASSWORD LAMA', value: oldPass, set: setOldPass, show: showOld, toggle: () => setShowOld(!showOld) },
            { label: 'PASSWORD BARU', value: newPass, set: setNewPass, show: showNew, toggle: () => setShowNew(!showNew) },
            { label: 'KONFIRMASI PASSWORD BARU', value: confirmPass, set: setConfirmPass, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">{field.label}</label>
              <div className="relative">
                <input
                  type={field.show ? 'text' : 'password'}
                  value={field.value}
                  onChange={e => field.set(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-none border-2 border-[#1E3A5F] text-sm font-bold focus:outline-none focus:border-[#2563EB] transition-colors"
                />
                <button type="button" onClick={field.toggle} className="absolute right-0 top-0 h-full px-4 flex items-center justify-center border-l-2 border-transparent text-[#64748B] hover:text-[#1E3A5F]">
                  {field.show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest pt-1">PASSWORD MINIMAL 6 KARAKTER</p>
          <div className="flex justify-end pt-2">
            <button onClick={savePassword} className="flex items-center gap-2 px-6 py-3 border-2 border-[#1E3A5F] bg-[#1E3A5F] text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#1E3A5F] transition-colors">
              <Save className="w-4 h-4" />
              UBAH PASSWORD
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden">
        <div className="px-6 py-4 border-b-4 border-[#1E3A5F] flex items-center gap-3 bg-[#FAFAFA]">
          <Settings2 className="w-5 h-5 text-[#1E3A5F]" />
          <h3 className="font-black text-[#1E3A5F] uppercase tracking-widest">INFORMASI SISTEM</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'NAMA SISTEM', value: 'SPK BANSOS â€“ METODE SAW' },
              { label: 'VERSI', value: 'V1.0.0' },
              { label: 'DESA', value: 'DESA SUKAMAJU' },
              { label: 'KECAMATAN', value: 'SUKAJADI, KAB. BANDUNG' },
            ].map((item, i) => (
              <div key={i} className="bg-[#FAFAFA] border-2 border-[#1E3A5F] p-4">
                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">{item.label}</p>
                <p className="font-black text-sm text-[#1E3A5F] uppercase tracking-wider">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
