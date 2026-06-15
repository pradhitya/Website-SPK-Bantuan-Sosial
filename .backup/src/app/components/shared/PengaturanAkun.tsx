import { useState } from 'react';
import { Eye, EyeOff, Save, User, Lock, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { User as UserType, USERS } from '../../data';

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

  const saveProfile = () => {
    if (!nama.trim()) { toast.error('Nama tidak boleh kosong'); return; }
    toast.success('Profil berhasil diperbarui!');
  };

  const savePassword = () => {
    const actualUser = USERS.find(u => u.id === user.id);
    if (!actualUser || oldPass !== actualUser.password) {
      toast.error('Password lama tidak sesuai!');
      return;
    }
    if (newPass.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('Konfirmasi password tidak cocok!');
      return;
    }
    actualUser.password = newPass;
    toast.success('Password berhasil diubah!');
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-gray-900 font-semibold">Pengaturan Akun</h2>
        <p className="text-sm text-muted-foreground">Perbarui informasi profil dan keamanan akun Anda</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <User className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Informasi Profil</h3>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">{user.nama.charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.nama}</p>
              <p className="text-sm text-muted-foreground">{user.jabatan}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {user.role === 'admin' ? 'Admin / Operator' : 'Kepala Desa'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              value={nama}
              onChange={e => setNama(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
            <input
              value={jabatan}
              onChange={e => setJabatan(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              value={user.username}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Username tidak dapat diubah</p>
          </div>
          <div className="flex justify-end">
            <button onClick={saveProfile} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4" />
              Simpan Profil
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <Lock className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Ubah Password</h3>
        </div>
        <div className="px-6 py-5 space-y-4">
          {[
            { label: 'Password Lama', value: oldPass, set: setOldPass, show: showOld, toggle: () => setShowOld(!showOld) },
            { label: 'Password Baru', value: newPass, set: setNewPass, show: showNew, toggle: () => setShowNew(!showNew) },
            { label: 'Konfirmasi Password Baru', value: confirmPass, set: setConfirmPass, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <div className="relative">
                <input
                  type={field.show ? 'text' : 'password'}
                  value={field.value}
                  onChange={e => field.set(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Password minimal 6 karakter</p>
          <div className="flex justify-end">
            <button onClick={savePassword} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4" />
              Ubah Password
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center gap-3 mb-3">
          <Settings2 className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Informasi Sistem</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Nama Sistem', value: 'SPK Bansos – Metode SAW' },
            { label: 'Versi', value: 'v1.0.0' },
            { label: 'Desa', value: 'Desa Sukamaju' },
            { label: 'Kecamatan', value: 'Sukajadi, Kab. Bandung' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="font-medium text-gray-900 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
