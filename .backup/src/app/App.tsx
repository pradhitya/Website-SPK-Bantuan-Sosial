import { useState } from 'react';
import { Toaster } from 'sonner';
import { User, AppData, initialData } from './data';
import { Login } from './components/Login';
import { Layout, PageId } from './components/Layout';
import { DashboardAdmin } from './components/admin/DashboardAdmin';
import { DataKriteria } from './components/admin/DataKriteria';
import { DataMasyarakat } from './components/admin/DataMasyarakat';
import { InputPenilaian } from './components/admin/InputPenilaian';
import { HasilSAW } from './components/admin/HasilSAW';
import { LaporanAdmin } from './components/admin/LaporanAdmin';
import { DashboardKades } from './components/kades/DashboardKades';
import { ValidasiKades } from './components/kades/ValidasiKades';
import { LaporanKades } from './components/kades/LaporanKades';
import { PengaturanAkun } from './components/shared/PengaturanAkun';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [data, setData] = useState<AppData>(initialData);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActivePage(user.role === 'admin' ? 'dashboard' : 'dashboard-kades');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('dashboard');
  };

  if (!currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  const renderPage = () => {
    if (activePage === 'pengaturan') return <PengaturanAkun user={currentUser} />;

    if (currentUser.role === 'admin') {
      switch (activePage) {
        case 'dashboard': return <DashboardAdmin data={data} />;
        case 'kriteria': return <DataKriteria data={data} setData={setData} />;
        case 'masyarakat': return <DataMasyarakat data={data} setData={setData} />;
        case 'penilaian': return <InputPenilaian data={data} setData={setData} />;
        case 'hasil-saw': return <HasilSAW data={data} setData={setData} />;
        case 'laporan-admin': return <LaporanAdmin data={data} />;
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
