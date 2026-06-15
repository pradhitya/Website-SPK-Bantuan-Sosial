import { useState } from 'react';
import {
  LayoutDashboard, ListChecks, Users, ClipboardList, BarChart2,
  FileText, Settings, LogOut, ChevronDown, ChevronRight,
  Menu, X, CheckSquare, Bell
} from 'lucide-react';
import { User, AppData } from '../data';

type AdminPage = 'dashboard' | 'kriteria' | 'masyarakat' | 'penilaian' | 'hasil-saw' | 'laporan-admin' | 'pengaturan';
type KadesPage = 'dashboard-kades' | 'validasi' | 'laporan-kades' | 'pengaturan';
export type PageId = AdminPage | KadesPage;

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activePage: PageId;
  setActivePage: (p: PageId) => void;
  data: AppData;
  children: React.ReactNode;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const adminNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kriteria', label: 'Data Kriteria & Bobot', icon: ListChecks },
  { id: 'masyarakat', label: 'Data Calon Penerima', icon: Users },
  { id: 'penilaian', label: 'Input Penilaian', icon: ClipboardList },
  { id: 'hasil-saw', label: 'Hasil Perhitungan SAW', icon: BarChart2 },
  { id: 'laporan-admin', label: 'Laporan', icon: FileText },
];

const kadesNav: NavItem[] = [
  { id: 'dashboard-kades', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'validasi', label: 'Validasi Penerima Bansos', icon: CheckSquare },
  { id: 'laporan-kades', label: 'Cetak Laporan Final', icon: FileText },
];

export function Layout({ user, onLogout, activePage, setActivePage, data, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = user.role === 'admin' ? adminNav : kadesNav;

  const pendingValidation = data.hasilSAW.length > 0 && data.approvedIds.length === 0 && data.sawProcessed;

  return (
    <div className="flex h-screen overflow-hidden bg-background font-[Inter,sans-serif]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: '#1e3a6b' }}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">SPK Bansos</p>
            <p className="text-blue-300 text-xs truncate">Desa Sukamaju</p>
          </div>
          <button className="ml-auto lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-2 flex-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-blue-300/70 uppercase tracking-wider mb-2 mt-2">
            {user.role === 'admin' ? 'Menu Admin' : 'Menu Kepala Desa'}
          </p>
          <nav className="space-y-0.5">
            {nav.map(item => {
              const Icon = item.icon;
              const active = activePage === item.id;
              const showBadge = item.id === 'validasi' && pendingValidation;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {showBadge && (
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="px-3 text-xs font-semibold text-blue-300/70 uppercase tracking-wider mb-2">Akun</p>
            <button
              onClick={() => { setActivePage('pengaturan'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                activePage === 'pengaturan'
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>Pengaturan Akun</span>
            </button>
          </div>
        </div>

        <div className="px-3 py-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user.nama.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">{user.nama}</p>
              <p className="text-blue-300 text-xs truncate">{user.jabatan}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex-shrink-0 h-14 bg-white border-b border-border flex items-center px-4 gap-4">
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {pendingValidation && user.role === 'kades' && (
            <button
              onClick={() => setActivePage('validasi')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Ada hasil SAW menunggu validasi</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.nama.charAt(0)}</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-tight">{user.nama}</p>
              <p className="text-xs text-gray-500">{user.jabatan}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
