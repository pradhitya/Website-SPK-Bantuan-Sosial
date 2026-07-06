import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Shield, Search } from 'lucide-react';
import { toast } from 'sonner';
import { User, UserRole } from '../../data';
import { ConfirmDialog } from '../ConfirmDialog';

export function ManajemenPengguna() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama: '',
    jabatan: '',
    role: 'admin' as UserRole
  });

  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (e) {
      toast.error('GAGAL MEMUAT DATA PENGGUNA');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '', // Keep empty unless changing
        nama: user.nama,
        jabatan: user.jabatan,
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        nama: '',
        jabatan: '',
        role: 'admin'
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete (payload as any).password;
        await axios.put(`/api/users/${editingUser.id}`, payload);
        toast.success('PENGGUNA BERHASIL DIPERBARUI');
      } else {
        await axios.post('/api/users', formData);
        toast.success('PENGGUNA BERHASIL DITAMBAHKAN');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('TERJADI KESALAHAN SAAT MENYIMPAN DATA');
      }
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete(`/api/users/${confirmDelete.id}`);
      toast.success('PENGGUNA BERHASIL DIHAPUS');
      fetchUsers();
    } catch (e) {
      toast.error('GAGAL MENGHAPUS PENGGUNA');
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-[#1E3A5F] font-black uppercase tracking-widest animate-pulse">MEMUAT DATA...</div>;

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight uppercase">MANAJEMEN PENGGUNA</h2>
          <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-1">KELOLA HAK AKSES ADMIN DAN KEPALA DESA PADA SISTEM</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1E3A5F] border-2 border-[#1E3A5F] text-white rounded-none text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#1E3A5F] transition-colors shadow-none"
        >
          <Plus className="w-5 h-5" />
          TAMBAH PENGGUNA
        </button>
      </div>

      <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden shadow-none">
        <div className="px-6 py-5 border-b-4 border-[#1E3A5F] flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#FAFAFA]">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]" />
            <input
              type="text"
              placeholder="CARI NAMA, USERNAME, ATAU JABATAN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-[#1E3A5F] rounded-none text-sm font-bold uppercase focus:outline-none focus:border-[#2563EB] shadow-none transition-colors bg-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white border-b-4 border-[#1E3A5F]">
                <th className="text-left px-6 py-4 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">NAMA LENGKAP</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest border-l-2 border-[#E2E8F0]">USERNAME</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest border-l-2 border-[#E2E8F0]">JABATAN</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest border-l-2 border-[#E2E8F0]">HAK AKSES (ROLE)</th>
                <th className="text-right px-6 py-4 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest w-24 border-l-2 border-[#E2E8F0]">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#E2E8F0]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-6 py-4 font-black text-[#1E3A5F] uppercase tracking-widest">{u.nama}</td>
                    <td className="px-6 py-4 font-mono font-bold text-blue-700 border-l-2 border-[#E2E8F0]">@{u.username}</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest border-l-2 border-[#E2E8F0]">{u.jabatan}</td>
                    <td className="px-6 py-4 border-l-2 border-[#E2E8F0]">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest border-2 shadow-none ${u.role === 'admin' ? 'bg-blue-400 text-[#1E3A5F] border-[#1E3A5F]' : 'bg-purple-400 text-[#1E3A5F] border-[#1E3A5F]'}`}>
                        <Shield className="w-3.5 h-3.5" />
                        {u.role === 'admin' ? 'OPERATOR' : 'KEPALA DESA'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right border-l-2 border-[#E2E8F0]">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openModal(u)} className="p-2 text-[#1E3A5F] bg-white border-2 border-[#1E3A5F] shadow-none hover:bg-[#1E3A5F] hover:text-white transition-colors" title="EDIT">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(u)} className="p-2 text-rose-700 bg-white border-2 border-[#1E3A5F] shadow-none hover:bg-rose-600 hover:text-white transition-colors" title="HAPUS">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex flex-col items-center justify-center text-[#64748B]">
                      <Search className="w-10 h-10 mb-4 text-[#CBD5E1]" />
                      <p className="text-sm font-black uppercase tracking-widest">TIDAK ADA PENGGUNA YANG DITEMUKAN.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-none border-4 border-[#1E3A5F] shadow-none w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b-4 border-[#1E3A5F] flex items-center justify-between bg-[#FAFAFA]">
              <h3 className="font-black text-[#1E3A5F] text-lg uppercase tracking-widest">{editingUser ? 'EDIT PENGGUNA' : 'TAMBAH PENGGUNA'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">NAMA LENGKAP</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={e => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-[#1E3A5F] rounded-none text-sm font-bold uppercase focus:outline-none focus:border-[#2563EB] shadow-none transition-colors bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">USERNAME</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-[#1E3A5F] rounded-none text-sm font-bold uppercase focus:outline-none focus:border-[#2563EB] shadow-none transition-colors bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">JABATAN</label>
                  <input
                    type="text"
                    required
                    value={formData.jabatan}
                    onChange={e => setFormData({...formData, jabatan: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-[#1E3A5F] rounded-none text-sm font-bold uppercase focus:outline-none focus:border-[#2563EB] shadow-none transition-colors bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">HAK AKSES</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    className="w-full px-4 py-3 border-2 border-[#1E3A5F] rounded-none text-sm font-bold uppercase focus:outline-none focus:border-[#2563EB] shadow-none transition-colors bg-white cursor-pointer"
                  >
                    <option value="admin">OPERATOR / ADMIN</option>
                    <option value="kades">KEPALA DESA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">PASSWORD {editingUser && <span className="text-[9px] font-bold text-[#64748B]">(OPSIONAL)</span>}</label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-[#1E3A5F] rounded-none text-sm font-bold focus:outline-none focus:border-[#2563EB] shadow-none transition-colors bg-white"
                  />
                </div>
              </div>
              
              <div className="pt-6 flex justify-end gap-4 border-t-4 border-[#1E3A5F] mt-8">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-3 text-xs font-black text-[#1E3A5F] bg-white border-2 border-[#1E3A5F] rounded-none hover:bg-[#1E3A5F] hover:text-white transition-colors uppercase tracking-widest shadow-none"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-xs font-black text-white bg-[#1E3A5F] border-2 border-[#1E3A5F] rounded-none hover:bg-white hover:text-[#1E3A5F] transition-colors uppercase tracking-widest shadow-none"
                >
                  SIMPAN DATA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="HAPUS PENGGUNA"
        message={`APAKAH ANDA YAKIN INGIN MENGHAPUS AKUN ${confirmDelete?.nama}?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="YA, HAPUS"
        confirmClass="px-6 py-3 rounded-none text-xs font-black uppercase tracking-widest text-white bg-rose-600 border-2 border-[#1E3A5F] shadow-none hover:bg-white hover:text-rose-600 transition-colors"
      />
    </div>
  );
}
