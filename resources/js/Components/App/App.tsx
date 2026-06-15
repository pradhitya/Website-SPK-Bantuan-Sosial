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
import { DashboardKades } from './components/kades/DashboardKades';
import { ValidasiKades } from './components/kades/ValidasiKades';
import { LaporanKades } from './components/kades/LaporanKades';
import { PengaturanAkun } from './components/shared/PengaturanAkun';
import { PengaturanAdmin } from './components/admin/PengaturanAdmin';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('spk_bansos_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  
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
    axios.get('/api/init').then(res => {
      setData(prev => ({
        ...prev,
        kriteria: res.data.kriteria,
        subKriteria: res.data.subKriteria,
        masyarakat: res.data.masyarakat,
        penilaian: res.data.penilaian,
        hasilSAW: res.data.hasilSAW,
        sawProcessed: res.data.sawProcessed,
        kuotaBansos: res.data.kuotaBansos || 8,
        approvedIds: res.data.approvedIds || {},
      }));
    }).catch(err => {
      console.error('Failed to load data', err);
    }).finally(() => {
      setLoadingData(false);
    });
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActivePage(user.role === 'admin' ? 'dashboard' : 'dashboard-kades');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('dashboard');
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
        <Login onLogin={handleLogin} />
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
      switch (activePage) {
        case 'dashboard': return <DashboardAdmin data={data} />;
        case 'kriteria': return <DataKriteria data={data} setData={setData} />;
        case 'masyarakat': return <DataMasyarakat data={data} setData={setData} onNavigate={(p) => setActivePage(p as any)} />;
        case 'penilaian': return <InputPenilaian data={data} setData={setData} onNavigate={(p) => setActivePage(p as any)} />;
        case 'hasil-saw': return <HasilSAW data={data} setData={setData} />;
        default: return <DashboardAdmin data={data} />;
      }
    } else {
      switch (activePage) {
        case 'dashboard-kades': return <DashboardKades data={data} onNavigate={(p) => setActivePage(p as PageId)} />;
        case 'validasi': return <ValidasiKades data={data} setData={setData} />;
        case 'laporan-kades': return <LaporanKades data={data} />;
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
      >
        {renderPage()}
      </Layout>
      <Toaster position="top-right" richColors />
    </>
  );
}
