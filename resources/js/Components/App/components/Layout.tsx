import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Settings, LogOut, ChevronDown, ChevronRight,
  Menu, X, CheckSquare, Bell, Folder, FileText, QrCode, Gift, Wallet, Package, Heart, Home,
  Database, UserCheck, BarChart3, MessageSquare
} from 'lucide-react';
import { User, AppData } from '../data';

export type PageId = string;

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activePage: PageId;
  setActivePage: (p: PageId) => void;
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  children: React.ReactNode;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const getIconForProgram = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('blt')) return Wallet;
  if (n.includes('sembako') || n.includes('pangan')) return Package;
  if (n.includes('lansia')) return Users;
  if (n.includes('stunting') || n.includes('balita')) return Heart;
  if (n.includes('rtlh')) return Home;
  return Folder;
};

export function Layout({ user, onLogout, activePage, setActivePage, data, setData, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [isBantuanMenuOpen, setIsBantuanMenuOpen] = useState(true);

  const currentApproved = data.approvedIds[data.activePeriode] || [];
  const pendingValidation = data.hasilSAW.length > 0 && currentApproved.length === 0 && data.sawProcessed;

  // Count new sanggahans for badge
  const sanggahanBaruCount = (data.sanggahans || []).filter(s => s.status === 'baru').length;

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

  const kadesNav: NavItem[] = [
    { id: 'dashboard-kades', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'statistik', label: 'Statistik & Demografi', icon: BarChart3 },
    { id: 'sanggahan-kades', label: 'Pantau Sanggahan', icon: MessageSquare, badge: sanggahanBaruCount },
    { id: 'validasi', label: 'Validasi Penerima Bansos', icon: CheckSquare, badge: pendingValidation ? 1 : 0 },
    { id: 'pantau-penyaluran', label: 'Progress Penyaluran', icon: Package },
    { id: 'laporan-kades', label: 'Cetak Laporan Final', icon: FileText },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA] font-[Inter,sans-serif] selection:bg-[#E2E8F0]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-[#1E3A5F]/80 z-20 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 border-r-4 border-[#1E3A5F]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${desktopCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72`}
        style={{ background: '#1E3A5F' }}
      >
        <div className={`flex items-center ${desktopCollapsed ? 'justify-center lg:px-0' : ''} gap-3 px-5 py-5 border-b-4 border-white/20 transition-all duration-300`}>
          <div className="w-8 h-8 rounded-none border-2 border-white flex items-center justify-center flex-shrink-0 bg-transparent" title="SPK Bansos">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div className={`min-w-0 transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>
            <p className="text-white font-black text-xs leading-none uppercase tracking-widest truncate">SPK Bansos</p>
            <p className="text-white/60 font-bold text-[9px] uppercase tracking-widest truncate mt-1">Desa Sukamaju</p>
          </div>
          <button className="ml-auto lg:hidden text-white/60 hover:text-white p-1 rounded-none border border-transparent hover:border-white transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`px-4 py-4 flex-1 overflow-y-auto overflow-x-hidden ${desktopCollapsed ? 'scrollbar-none' : ''}`}>
          <p className={`text-[10px] font-black text-white/50 uppercase tracking-widest mb-4 mt-2 transition-all duration-300 ${desktopCollapsed ? 'lg:hidden text-center' : 'px-2'}`}>
            {user.role === 'admin' ? 'MENU ADMIN' : 'MENU KADES'}
          </p>
          {desktopCollapsed && (
            <div className="hidden lg:flex justify-center mb-4 mt-2">
              <div className="w-8 border-b-2 border-white/20" />
            </div>
          )}
          
          <nav className="space-y-2">
            {user.role === 'admin' ? (
              <>
                <button
                  onClick={() => { setActivePage('dashboard'); setSidebarOpen(false); }}
                  title={desktopCollapsed ? 'Dashboard' : undefined}
                  className={`w-full flex items-center ${desktopCollapsed ? 'lg:justify-center lg:px-0' : ''} gap-3 px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-colors border-2 ${
                    activePage === 'dashboard' ? 'bg-white text-[#1E3A5F] border-white shadow-none' : 'text-white border-transparent hover:border-white hover:bg-white/10'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                  <span className={`flex-1 text-left truncate transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>DASHBOARD</span>
                </button>

                {/* Master Data Section */}
                {!desktopCollapsed && (
                  <div className="mt-8 mb-3 px-3">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest border-b-2 border-white/10 pb-2">
                      MASTER DATA
                    </p>
                  </div>
                )}
                {desktopCollapsed && (
                  <div className="hidden lg:flex justify-center my-4">
                    <div className="w-8 border-b-2 border-white/20" />
                  </div>
                )}
                <div className="space-y-2">
                  <button
                    onClick={() => { setActivePage('data-keluarga'); setSidebarOpen(false); }}
                    title={desktopCollapsed ? 'Data Keluarga (KK)' : undefined}
                    className={`w-full flex items-center ${desktopCollapsed ? 'lg:justify-center lg:px-0' : ''} gap-3 px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-colors border-2 ${
                      activePage === 'data-keluarga' ? 'bg-white text-[#1E3A5F] border-white shadow-none' : 'text-white border-transparent hover:border-white hover:bg-white/10'
                    }`}
                  >
                    <Home className="w-4 h-4 flex-shrink-0" />
                    <span className={`flex-1 text-left truncate transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>DATA KELUARGA</span>
                  </button>
                  <button
                    onClick={() => { setActivePage('data-warga'); setSidebarOpen(false); }}
                    title={desktopCollapsed ? 'Data Warga' : undefined}
                    className={`w-full flex items-center ${desktopCollapsed ? 'lg:justify-center lg:px-0' : ''} gap-3 px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-colors border-2 ${
                      activePage === 'data-warga' ? 'bg-white text-[#1E3A5F] border-white shadow-none' : 'text-white border-transparent hover:border-white hover:bg-white/10'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 flex-shrink-0" />
                    <span className={`flex-1 text-left truncate transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>DATA WARGA</span>
                  </button>
                </div>

                {/* Bantuan Desa Section */}
                {!desktopCollapsed && (
                  <div className="mt-8 mb-3 px-3">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest border-b-2 border-white/10 pb-2">
                      PROGRAM BANTUAN
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  {data.jenisBantuan.map(jb => {
                    const pageId = `program-${jb.id}`;
                    const isActive = activePage === pageId;
                    const jbSanggahanCount = (data.sanggahans || []).filter(s => s.status === 'baru' && s.bantuan_id === jb.id).length;
                    const ProgramIcon = getIconForProgram(jb.nama_program);
                    
                    return (
                      <button
                        key={jb.id}
                        onClick={() => { 
                          setData(prev => ({ ...prev, activeJenisBantuanId: jb.id }));
                          setActivePage(pageId); 
                          setSidebarOpen(false); 
                        }}
                        title={desktopCollapsed ? jb.nama_program : undefined}
                        className={`w-full flex items-center ${desktopCollapsed ? 'lg:justify-center lg:px-0' : ''} gap-3 px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-colors border-2 ${
                          isActive ? 'bg-white text-[#1E3A5F] border-white shadow-none' : 'text-white border-transparent hover:border-white hover:bg-white/10'
                        }`}
                      >
                        <ProgramIcon className={`w-4 h-4 flex-shrink-0`} />
                        
                        <span className={`flex-1 text-left truncate transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>
                          {jb.nama_program}
                        </span>
                        {jbSanggahanCount > 0 && !desktopCollapsed && (
                          <span className="w-5 h-5 rounded-none border border-[#1E3A5F] bg-white text-[#1E3A5F] text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-none">{jbSanggahanCount}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* System Section */}
                {!desktopCollapsed && (
                  <div className="mt-8 mb-3 px-3">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest border-b-2 border-white/10 pb-2">
                      SISTEM
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => { setActivePage('scan-qr'); setSidebarOpen(false); }}
                    title={desktopCollapsed ? 'Scan QR Pengambilan' : undefined}
                    className={`w-full flex items-center ${desktopCollapsed ? 'lg:justify-center lg:px-0' : ''} gap-3 px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-colors border-2 ${
                      activePage === 'scan-qr' ? 'bg-white text-[#1E3A5F] border-white shadow-none' : 'text-white border-transparent hover:border-white hover:bg-white/10'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4 flex-shrink-0" />
                    <span className={`flex-1 text-left truncate transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>SCAN PENGAMBILAN</span>
                  </button>

                  <button
                    onClick={() => { setActivePage('pengaturan'); setSidebarOpen(false); }}
                    title={desktopCollapsed ? 'Pengaturan Sistem' : undefined}
                    className={`w-full flex items-center ${desktopCollapsed ? 'lg:justify-center lg:px-0' : ''} gap-3 px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-colors border-2 ${
                      activePage === 'pengaturan' ? 'bg-white text-[#1E3A5F] border-white shadow-none' : 'text-white border-transparent hover:border-white hover:bg-white/10'
                    }`}
                  >
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span className={`flex-1 text-left truncate transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>PENGATURAN</span>
                  </button>
                </div>
              </>
            ) : (
              // Kades Navigation
              kadesNav.map(item => {
                const Icon = item.icon;
                const active = activePage === item.id;
                const showBadge = item.id === 'validasi' && pendingValidation;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                    title={desktopCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${desktopCollapsed ? 'lg:justify-center lg:px-0' : ''} gap-3 px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-colors border-2 ${
                      active ? 'bg-white text-[#1E3A5F] border-white shadow-none' : 'text-white border-transparent hover:border-white hover:bg-white/10'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {showBadge && desktopCollapsed && (
                         <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-none border border-[#1E3A5F] bg-white animate-pulse" />
                      )}
                    </div>
                    <span className={`flex-1 text-left truncate transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>{item.label}</span>
                    {showBadge && !desktopCollapsed && (
                      <span className="flex-shrink-0 w-3 h-3 rounded-none border border-[#1E3A5F] bg-white animate-pulse" />
                    )}
                  </button>
                );
              })
            )}
          </nav>
        </div>

        <div className={`px-4 py-4 border-t-4 border-white/20 transition-all duration-300 bg-[#1E3A5F]`}>
          <button 
            onClick={() => { setActivePage('pengaturan'); setSidebarOpen(false); }}
            className={`w-full flex items-center text-left ${desktopCollapsed ? 'lg:justify-center' : ''} gap-3 px-2 py-2 rounded-none hover:bg-white/10 mb-3 transition-colors ${activePage === 'pengaturan' && user.role !== 'admin' ? 'bg-white/10' : ''}`}
          >
            <div className="w-8 h-8 rounded-none border-2 border-white flex items-center justify-center flex-shrink-0 bg-transparent" title={desktopCollapsed ? user.nama : undefined}>
              <span className="text-white text-[10px] font-black">{user.nama.charAt(0).toUpperCase()}</span>
            </div>
            <div className={`min-w-0 flex-1 transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>
              <p className="text-white text-[10px] font-black uppercase tracking-widest truncate">{user.nama}</p>
              <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest truncate">{user.role}</p>
            </div>
          </button>
          <button
            onClick={onLogout}
            title={desktopCollapsed ? "Keluar" : undefined}
            className={`w-full flex items-center ${desktopCollapsed ? 'lg:justify-center lg:px-0' : ''} gap-3 px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-widest text-white border-2 border-transparent hover:border-white hover:bg-white/10 transition-colors`}
          >
            <LogOut className="w-4 h-4" />
            <span className={`transition-all duration-300 ${desktopCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>KELUAR</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAFAFA]">
        <header className="flex-shrink-0 h-16 bg-white border-b-4 border-[#1E3A5F] flex items-center px-4 sm:px-6 gap-4 z-10 relative">
          <button 
            className="text-[#1E3A5F] hover:text-white transition-colors p-2 rounded-none border-2 border-transparent hover:border-[#1E3A5F] hover:bg-[#1E3A5F]" 
            onClick={toggleSidebar}
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex justify-end items-center gap-4">
            {pendingValidation && user.role === 'kades' && (
              <button
                onClick={() => setActivePage('validasi')}
                className="flex items-center gap-2 px-4 py-2 rounded-none bg-white border-2 border-[#1E3A5F] shadow-none text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A5F] hover:text-white transition-colors group"
              >
                <Bell className="w-4 h-4 animate-pulse group-hover:text-white text-[#1E3A5F]" />
                <span className="hidden sm:inline">VALIDASI MENUNGGU</span>
                <span className="sm:hidden">VALIDASI</span>
              </button>
            )}
            {sanggahanBaruCount > 0 && user.role === 'admin' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-none bg-white border-2 border-[#1E3A5F] shadow-none text-[#1E3A5F] text-[10px] font-black uppercase tracking-widest">
                <Bell className="w-4 h-4 animate-pulse text-[#1E3A5F]" />
                <span>{sanggahanBaruCount} SANGGAHAN BARU</span>
              </div>
            )}
            {user.role === 'admin' && activePage.startsWith('program-') && (
              <div className="flex items-center gap-2 text-[10px] font-black text-[#1E3A5F] bg-white px-4 py-2 rounded-none border-2 border-[#E2E8F0] uppercase tracking-widest">
                <Folder className="w-4 h-4 text-[#1E3A5F]" />
                <span className="hidden sm:inline text-[#64748B]">WORKSPACE AKTIF: </span>
                <span>{data.jenisBantuan.find(j => j.id === data.activeJenisBantuanId)?.nama_program}</span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FAFAFA]">
          {children}
        </main>
      </div>
    </div>
  );
}
