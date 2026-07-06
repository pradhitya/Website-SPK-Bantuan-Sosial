import { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster } from 'sonner';
import { User, AppData, initialData } from './data';
import { Login } from './components/Login';
import { Layout, PageId } from './components/Layout';
import { DashboardAdmin } from './components/admin/DashboardAdmin';
import { DataKriteria } from './components/admin/DataKriteria';
import { DataMasyarakat } from './components/admin/DataMasyarakat';
import { InputPenilaian } from './components/admin/InputPenilaian';
import { HasilSAW } from './components/admin/HasilSAW';
import { ProgramManager } from './components/admin/ProgramManager';
import { ScanQRPengambilan } from './components/admin/ScanQRPengambilan';
import { DataWarga } from './components/admin/DataWarga';
import { DataKeluarga } from './components/admin/DataKeluarga';
import { DashboardKades } from './components/kades/DashboardKades';
import { ValidasiKades } from './components/kades/ValidasiKades';
import { LaporanKades } from './components/kades/LaporanKades';
import { StatistikKades } from './components/kades/StatistikKades';
import { SanggahanKades } from './components/kades/SanggahanKades';
import { PantauPenyaluranKades } from './components/kades/PantauPenyaluranKades';
import { PengaturanAkun } from './components/shared/PengaturanAkun';
import { PengaturanAdmin } from './components/admin/PengaturanAdmin';
import { PublicPortal } from './components/public/PublicPortal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('spk_bansos_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [showLogin, setShowLogin] = useState(false);
  
  const [activePage, setActivePage] = useState<PageId>(() => {
    try {
      const savedPage = localStorage.getItem('spk_bansos_active_page');
      return (savedPage as PageId) || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('spk_bansos_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('spk_bansos_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (activePage) {
      localStorage.setItem('spk_bansos_active_page', activePage);
    }
  }, [activePage]);
  const [data, setData] = useState<AppData>(initialData);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setLoadingData(true);
    const params = new URLSearchParams();
    if (data.activePeriode) {
      params.append('periode', data.activePeriode);
    }
    if (data.activeJenisBantuanId) {
      params.append('jenis_bantuan_id', data.activeJenisBantuanId.toString());
    }
    
    axios.get(`/api/init?${params.toString()}`).then(res => {
      setData(prev => ({
        ...prev,
        jenisBantuan: res.data.jenisBantuan || [],
        kriteria: res.data.kriteria,
        subKriteria: res.data.subKriteria,
        masyarakat: res.data.masyarakat,
        penilaian: res.data.penilaian,
        hasilSAW: res.data.hasilSAW,
        sawProcessed: res.data.sawProcessed,
        kuotaBansos: res.data.kuotaBansos || 8,
        approvedIds: res.data.approvedIds || {},
        sanggahans: res.data.sanggahans || [],
        klaimBantuans: res.data.klaimBantuans || [],
        wargas: res.data.wargas || [],
        keluargas: res.data.keluargas || [],
        availablePeriods: res.data.availablePeriods || ['2026-06'],
        stats: res.data.stats || initialData.stats,
      }));
    }).catch(err => {
      console.error('Failed to load data', err);
    }).finally(() => {
      setLoadingData(false);
    });
  }, [data.activePeriode, data.activeJenisBantuanId]);

  // Adjust activePeriode to first available period if current has no data
  useEffect(() => {
    if (data.availablePeriods.length > 0 && !data.availablePeriods.includes(data.activePeriode)) {
      setData(prev => ({ ...prev, activePeriode: data.availablePeriods[0] }));
    }
  }, [data.availablePeriods]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActivePage(user.role === 'admin' ? 'dashboard' : 'dashboard-kades');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('dashboard');
    setShowLogin(false);
  };

  if (loadingData) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium animate-pulse">Menghubungkan ke database...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        {showLogin ? (
          <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />
        ) : (
          <PublicPortal onLoginClick={() => setShowLogin(true)} data={data} setData={setData} />
        )}
        <Toaster position="top-right" richColors />
      </>
    );
  }

  const renderPage = () => {
    if (activePage === 'pengaturan') {
      return currentUser.role === 'admin' 
        ? <PengaturanAdmin user={currentUser} data={data} setData={setData} />
        : <PengaturanAkun user={currentUser} />;
    }

    if (currentUser.role === 'admin') {
      if (activePage.startsWith('program-')) {
        return <ProgramManager data={data} setData={setData} />;
      }
      if (activePage === 'scan-qr') {
        return <ScanQRPengambilan data={data} setData={setData} />;
      }
      if (activePage === 'data-warga') {
        return <DataWarga data={data} setData={setData} />;
      }
      if (activePage === 'data-keluarga') {
        return <DataKeluarga data={data} setData={setData} />;
      }
      
      switch (activePage) {
        case 'dashboard': return <DashboardAdmin data={data} />;
        default: return <DashboardAdmin data={data} />;
      }
    } else {
      switch (activePage) {
        case 'dashboard-kades': return <DashboardKades data={data} onNavigate={(p) => setActivePage(p as PageId)} />;
        case 'validasi': return <ValidasiKades data={data} setData={setData} />;
        case 'laporan-kades': return <LaporanKades data={data} />;
        case 'statistik': return <StatistikKades data={data} />;
        case 'sanggahan-kades': return <SanggahanKades data={data} />;
        case 'pantau-penyaluran': return <PantauPenyaluranKades data={data} />;
        default: return <DashboardKades data={data} onNavigate={(p) => setActivePage(p as PageId)} />;
      }
    }
  };

  return (
    <>
      <Layout
        user={currentUser}
        onLogout={handleLogout}
        activePage={activePage}
        setActivePage={setActivePage}
        data={data}
        setData={setData}
      >
        {renderPage()}
      </Layout>
      <Toaster position="top-right" richColors />
    </>
  );
}
