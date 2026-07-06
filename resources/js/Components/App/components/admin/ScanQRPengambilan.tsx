import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { QrCode, CheckCircle2, AlertTriangle, XCircle, Camera, Search } from 'lucide-react';
import { toast } from 'sonner';
import { AppData } from '../../data';

interface Props {
  data: AppData;
  setData: (d: AppData) => void;
}

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    kode_klaim: string;
    nama: string;
    bantuan: string;
    periode?: string;
    tanggal_diambil?: string;
  };
}

export function ScanQRPengambilan({ data, setData }: Props) {
  const [mode, setMode] = useState<'scan' | 'manual'>('manual');
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const scannerRef = useRef<any>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Load html5-qrcode from CDN
  useEffect(() => {
    if (mode === 'scan') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
      script.async = true;
      script.onload = () => {
        startScanner();
      };
      document.body.appendChild(script);
      return () => {
        stopScanner();
        document.body.removeChild(script);
      };
    }
  }, [mode]);

  const startScanner = () => {
    if (!(window as any).Html5Qrcode || !scannerContainerRef.current) return;
    
    const scanner = new (window as any).Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText: string) => {
        handleScan(decodedText);
        stopScanner();
        setMode('manual');
      },
      () => {}
    ).catch((err: any) => {
      console.error('Scanner error:', err);
      toast.error('GAGAL MENGAKSES KAMERA. GUNAKAN INPUT MANUAL.');
      setMode('manual');
    });
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop();
      } catch (e) {}
      scannerRef.current = null;
    }
  };

  const handleScan = async (code: string) => {
    setScanning(true);
    setResult(null);
    try {
      const res = await axios.post('/api/klaim-bantuan/scan', {
        kode_klaim: code,
        user_id: 1,
      });
      setResult(res.data);
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      setResult(errorData || { success: false, message: 'KODE KLAIM TIDAK VALID' });
      if (errorData?.message) {
        toast.error(errorData.message);
      }
    } finally {
      setScanning(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error('MASUKKAN KODE KLAIM');
      return;
    }
    handleScan(manualCode.trim());
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight flex items-center gap-3 uppercase">
          <div className="bg-violet-400 p-2 rounded-none border-4 border-[#1E3A5F] shadow-none"><QrCode className="w-6 h-6 text-[#1E3A5F]" /></div>
          SCAN QR PENGAMBILAN BANTUAN
        </h2>
        <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-2">VERIFIKASI PENGAMBILAN BANTUAN OLEH WARGA DI KANTOR DESA</p>
      </div>

      {/* Mode Toggle */}
      <div className="bg-white rounded-none border-4 border-[#1E3A5F] p-2 flex w-fit shadow-none">
        <button onClick={() => { stopScanner(); setMode('manual'); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'manual' ? 'bg-[#1E3A5F] text-white border-2 border-[#1E3A5F]' : 'bg-transparent text-[#1E3A5F] border-2 border-transparent hover:border-[#1E3A5F]'}`}
        >
          <Search className="w-4 h-4" /> INPUT MANUAL
        </button>
        <button onClick={() => setMode('scan')}
          className={`flex items-center gap-2 px-6 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'scan' ? 'bg-[#1E3A5F] text-white border-2 border-[#1E3A5F]' : 'bg-transparent text-[#1E3A5F] border-2 border-transparent hover:border-[#1E3A5F]'}`}
        >
          <Camera className="w-4 h-4" /> SCAN KAMERA
        </button>
      </div>

      {/* Scanner / Manual Input */}
      <div className="bg-white rounded-none border-4 border-[#1E3A5F] p-6 md:p-8 shadow-none">
        {mode === 'scan' ? (
          <div className="text-center">
            <div id="qr-reader" ref={scannerContainerRef} className="mx-auto max-w-md rounded-none overflow-hidden border-4 border-[#1E3A5F] shadow-none" style={{ minHeight: 300 }} />
            <p className="text-[10px] font-black text-[#1E3A5F] mt-6 uppercase tracking-widest">ARAHKAN KAMERA KE QR CODE PADA LAYAR HP WARGA</p>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="max-w-lg mx-auto">
            <label className="block text-[10px] font-black text-[#1E3A5F] mb-2 uppercase tracking-widest">KODE KLAIM / NIK</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text" value={manualCode} onChange={e => setManualCode(e.target.value.toUpperCase())}
                placeholder="CONTOH: BLT-2026 ATAU 16 DIGIT NIK"
                className="flex-1 px-4 py-3 text-sm rounded-none border-2 border-[#1E3A5F] bg-white focus:outline-none focus:border-[#2563EB] font-mono font-bold tracking-widest uppercase shadow-none transition-colors"
              />
              <button type="submit" disabled={scanning}
                className="px-6 py-3 rounded-none bg-[#1E3A5F] text-white font-black text-xs uppercase tracking-widest hover:bg-white hover:text-[#1E3A5F] border-2 border-[#1E3A5F] disabled:opacity-50 transition-colors shadow-none"
              >
                {scanning ? 'MEMPROSES...' : 'VERIFIKASI'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-none border-4 p-6 shadow-none ${result.success ? 'border-[#1E3A5F] bg-emerald-400' : result.message.toLowerCase().includes('sudah pernah') ? 'border-[#1E3A5F] bg-amber-400' : 'border-[#1E3A5F] bg-rose-400'}`}>
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="p-3 bg-white border-4 border-[#1E3A5F] shadow-none">
              {result.success ? <CheckCircle2 className="w-10 h-10 text-[#1E3A5F]" /> : result.message.toLowerCase().includes('sudah pernah') ? <AlertTriangle className="w-10 h-10 text-[#1E3A5F]" /> : <XCircle className="w-10 h-10 text-[#1E3A5F]" />}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-[#1E3A5F] uppercase tracking-widest">
                {result.success ? 'PENGAMBILAN BERHASIL!' : result.message.toLowerCase().includes('sudah pernah') ? 'SUDAH PERNAH DIAMBIL!' : 'VERIFIKASI GAGAL'}
              </h3>
              <p className="text-[10px] font-bold text-[#1E3A5F] mt-2 uppercase tracking-widest leading-relaxed bg-white/50 inline-block px-2 py-1 border border-[#1E3A5F]">{result.message}</p>
              {result.data && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border-4 border-[#1E3A5F] p-4 shadow-none">
                  <div><span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest block mb-1">NAMA</span><strong className="text-sm font-black text-[#1E3A5F] uppercase tracking-widest">{result.data.nama}</strong></div>
                  <div><span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest block mb-1">BANTUAN</span><strong className="text-sm font-black text-[#1E3A5F] uppercase tracking-widest">{result.data.bantuan}</strong></div>
                  <div><span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest block mb-1">KODE</span><strong className="font-mono font-bold text-[#2563EB] border-b-2 border-[#2563EB]">{result.data.kode_klaim}</strong></div>
                  {result.data.tanggal_diambil && <div><span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest block mb-1">DIAMBIL</span><strong className="text-[10px] font-bold text-[#1E3A5F] uppercase tracking-widest">{result.data.tanggal_diambil}</strong></div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
