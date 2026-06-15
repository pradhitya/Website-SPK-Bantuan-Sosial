import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ListChecks, Users, ClipboardList, BarChart2,
  FileText, Settings, LogOut, ChevronDown, ChevronRight,
  Menu, X, CheckSquare, Bell
} from 'lucide-react';
import { User, AppData } from '../data';

type AdminPage = 'dashboard' | 'kriteria' | 'masyarakat' | 'penilaian' | 'hasil-saw' | 'pengaturan';
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
  { id: 'hasil-saw', label: 'Hasil Perhitungan SAW', icon: BarChart2 },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

const kadesNav: NavItem[] = [
  { id: 'dashboard-kades', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'validasi', label: 'Validasi Penerima Bansos', icon: CheckSquare },
  { id: 'laporan-kades', label: 'Cetak Laporan Final', icon: FileText },
];

export function Layout({ user, onLogout, activePage, setActivePage, data, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const nav = user.role === 'admin' ? adminNav : kadesNav;

  const currentApproved = data.approvedIds[data.activePeriode] || [];
  const pendingValidation = data.hasilSAW.length > 0 && currentApproved.length === 0 && data.sawProcessed;

  // Handle screen resize to reset mobile sidebar if moving to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setDesktopCollapsed(!desktopCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-[Inter,sans-serif]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${desktopCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
        style={{ background: '#1e3a6b' }}
      >
        <div className={`flex items-center ${desktopCollapsed ? 'justify-center lg:px-0' : ''} gap-3 px-5 py-5 border-b border-white/10 transition-all duration-300`}>
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0" title="SPK Bansos">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div className={`min-w-0 transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>
            <p className="text-white font-semibold text-sm leading-tight truncate">SPK Bansos</p>
            <p className="text-blue-300 text-xs truncate">Desa Sukamaju</p>
          </div>
          <button className="ml-auto lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`px-3 py-2 flex-1 overflow-y-auto overflow-x-hidden ${desktopCollapsed ? 'scrollbar-none' : ''}`}>
          <p className={`px-3 text-xs font-semibold text-blue-300/70 uppercase tracking-wider mb-2 mt-2 transition-all duration-300 ${desktopCollapsed ? 'lg:hidden' : ''}`}>
            {user.role === 'admin' ? 'Menu Admin' : 'Menu Kepala Desa'}
          </p>
          {desktopCollapsed && (
            <div className="hidden lg:flex justify-center mb-2 mt-2">
              <div className="w-8 border-b border-white/10" />
            </div>
          )}
          
          <nav className="space-y-0.5">
            {nav.map(item => {
              const Icon = item.icon;
              const active = activePage === item.id;
              const showBadge = item.id === 'validasi' && pendingValidation;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                  title={desktopCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${desktopCollapsed ? 'lg:justify-center lg:px-0' : ''} gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {showBadge && desktopCollapsed && (
                       <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse border-2 border-[#1e3a6b]" />
                    )}
                  </div>
                  <span className={`flex-1 text-left truncate transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>{item.label}</span>
                  {showBadge && !desktopCollapsed && (
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>


        </div>

        <div className={`px-3 py-3 border-t border-white/10 transition-all duration-300`}>
          <button 
            onClick={() => { setActivePage('pengaturan'); setSidebarOpen(false); }}
            className={`w-full flex items-center text-left ${desktopCollapsed ? 'lg:justify-center' : ''} gap-3 px-3 py-2 rounded-lg hover:bg-white/10 mb-2 transition-colors ${activePage === 'pengaturan' ? 'bg-white/10' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0" title={desktopCollapsed ? user.nama : undefined}>
              <span className="text-white text-xs font-bold">{user.nama.charAt(0)}</span>
            </div>
            <div className={`min-w-0 flex-1 transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>
              <p className="text-white text-xs font-semibold truncate">{user.nama}</p>
              <p className="text-blue-300 text-xs truncate">Pengaturan Akun</p>
            </div>
          </button>
          <button
            onClick={onLogout}
            title={desktopCollapsed ? "Keluar" : undefined}
            className={`w-full flex items-center ${desktopCollapsed ? 'lg:justify-center lg:px-0' : ''} gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all`}
          >
            <LogOut className="w-5 h-5" />
            <span className={`transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>Keluar</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex-shrink-0 h-14 bg-white border-b border-border flex items-center px-4 gap-4">
          <button 
            className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-md hover:bg-gray-100" 
            onClick={toggleSidebar}
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1" />
          {pendingValidation && user.role === 'kades' && (
            <button
              onClick={() => setActivePage('validasi')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ada hasil SAW menunggu validasi</span>
              <span className="sm:hidden">Validasi</span>
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
