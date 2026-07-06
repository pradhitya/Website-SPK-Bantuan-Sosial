import { useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle2, XCircle, RefreshCw, MessageSquare, Filter, Printer, Smartphone, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { AppData, KlaimBantuan } from '../../data';

interface Props {
  data: AppData;
  setData: (d: AppData) => void;
}

export function LogWA({ data, setData }: Props) {
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [resending, setResending] = useState<number | null>(null);
  const [simulasiWa, setSimulasiWa] = useState<KlaimBantuan | null>(null);

  const klaimList = (data.klaimBantuans || [])
    .filter(k => {
      if (filterStatus === 'semua') return true;
      return k.status_kirim_wa === filterStatus;
    });

  const counts = {
    terkirim: (data.klaimBantuans || []).filter(k => k.status_kirim_wa === 'terkirim').length,
    gagal: (data.klaimBantuans || []).filter(k => k.status_kirim_wa === 'gagal').length,
    belum: (data.klaimBantuans || []).filter(k => k.status_kirim_wa === 'belum_dikirim').length,
  };

  const resendWA = async (klaim: KlaimBantuan) => {
    setResending(klaim.id);
    try {
      const res = await axios.post(`/api/klaim-bantuan/${klaim.id}/resend-wa`);
      if (res.data.success) {
        toast.success('WHATSAPP BERHASIL DIKIRIM ULANG');
        const updated = data.klaimBantuans.map(k =>
          k.id === klaim.id ? { ...k, status_kirim_wa: 'terkirim' as const, tanggal_kirim_wa: new Date().toISOString() } : k
        );
        setData({ ...data, klaimBantuans: updated });
      } else {
        toast.error(res.data.message || 'GAGAL MENGIRIM ULANG');
      }
    } catch (e) {
      toast.error('ERROR MENGIRIM ULANG WA');
    } finally {
      setResending(null);
    }
  };

  const printQR = (k: KlaimBantuan) => {
    const printWindow = window.open('', '', 'width=600,height=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak QR Code Bantuan</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 40px; }
              .card { border: 4px solid #1E3A5F; padding: 20px; max-width: 400px; margin: 0 auto; box-shadow: 8px 8px 0px #1E3A5F; }
              .qr { max-width: 100%; height: auto; margin: 20px 0; border: 2px solid #1E3A5F; padding: 10px; }
              h2 { color: #1E3A5F; text-transform: uppercase; margin-bottom: 5px; font-weight: 900; }
              p { color: #64748B; font-size: 14px; text-transform: uppercase; font-weight: bold; }
              .kode { font-family: monospace; font-size: 18px; font-weight: bold; background: #FAFAFA; padding: 10px; border: 2px solid #1E3A5F; margin-top: 10px; display: block; color: #1E3A5F; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>KARTU PENGAMBILAN BANTUAN</h2>
              <p>${(k.hasil_saw as any)?.jenis_bantuan?.nama_program || 'BANTUAN SOSIAL'}</p>
              <img src="${k.qr_code_url}" class="qr" onload="window.print()" />
              <p style="margin-top:20px; color:#1E3A5F; font-size:12px;">NAMA PENERIMA:</p>
              <h3 style="margin-top:5px; margin-bottom: 20px; color:#1E3A5F; text-transform:uppercase; font-weight: 900; font-size: 24px;">${(k.hasil_saw as any)?.masyarakat?.nama || '-'}</h3>
              <span class="kode">${k.kode_klaim}</span>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'terkirim': return <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest bg-emerald-400 text-[#1E3A5F] border-2 border-[#1E3A5F] shadow-none"><CheckCircle2 className="w-3.5 h-3.5" />TERKIRIM</span>;
      case 'gagal': return <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest bg-rose-400 text-[#1E3A5F] border-2 border-[#1E3A5F] shadow-none"><XCircle className="w-3.5 h-3.5" />GAGAL</span>;
      default: return <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest bg-white text-[#1E3A5F] border-2 border-[#1E3A5F] shadow-none">BELUM DIKIRIM</span>;
    }
  };

  const handleDownloadQR = (url: string, filename: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1E3A5F] tracking-tight flex items-center gap-3 uppercase">
            <div className="bg-green-400 p-2 rounded-none border-4 border-[#1E3A5F] shadow-none"><Send className="w-6 h-6 text-[#1E3A5F]" /></div>
            LOG PENGIRIMAN WHATSAPP
          </h2>
          <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest mt-2">MONITOR STATUS PENGIRIMAN NOTIFIKASI WA KE PENERIMA BANTUAN</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-400 border-4 border-[#1E3A5F] rounded-none p-5 text-center shadow-none transform transition-transform hover:-translate-y-1">
          <p className="text-3xl font-black text-[#1E3A5F]">{counts.terkirim}</p>
          <p className="text-xs font-black text-[#1E3A5F] uppercase tracking-widest mt-1">TERKIRIM</p>
        </div>
        <div className="bg-rose-400 border-4 border-[#1E3A5F] rounded-none p-5 text-center shadow-none transform transition-transform hover:-translate-y-1">
          <p className="text-3xl font-black text-[#1E3A5F]">{counts.gagal}</p>
          <p className="text-xs font-black text-[#1E3A5F] uppercase tracking-widest mt-1">GAGAL</p>
        </div>
        <div className="bg-white border-4 border-[#1E3A5F] rounded-none p-5 text-center shadow-none transform transition-transform hover:-translate-y-1">
          <p className="text-3xl font-black text-[#1E3A5F]">{counts.belum}</p>
          <p className="text-xs font-black text-[#1E3A5F] uppercase tracking-widest mt-1">BELUM DIKIRIM</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-5 h-5 text-[#1E3A5F] hidden sm:block mr-1" />
        {['semua', 'terkirim', 'gagal', 'belum_dikirim'].map(st => (
          <button key={st} onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-none text-[10px] font-black uppercase tracking-widest transition-colors border-2 shadow-none ${filterStatus === st ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white'}`}
          >
            {st === 'semua' ? 'SEMUA' : st === 'belum_dikirim' ? 'BELUM' : st === 'terkirim' ? 'TERKIRIM' : 'GAGAL'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-none border-4 border-[#1E3A5F] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAFAFA] border-b-4 border-[#1E3A5F]">
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest">NAMA PENERIMA</th>
                <th className="text-left px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest hidden md:table-cell border-l-2 border-[#E2E8F0]">KODE KLAIM</th>
                <th className="text-center px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest border-l-2 border-[#E2E8F0]">STATUS WA</th>
                <th className="text-center px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest hidden sm:table-cell border-l-2 border-[#E2E8F0]">STATUS KLAIM</th>
                <th className="text-center px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest hidden md:table-cell border-l-2 border-[#E2E8F0]">WAKTU KIRIM</th>
                <th className="text-center px-3 py-3 text-[10px] font-black text-[#1E3A5F] uppercase tracking-widest border-l-2 border-[#E2E8F0]">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#E2E8F0]">
              {klaimList.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-[#64748B]">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 text-[#CBD5E1]" />
                  <p className="font-black text-sm uppercase tracking-widest">BELUM ADA LOG PENGIRIMAN WA</p>
                </td></tr>
              ) : klaimList.map(k => (
                <tr key={k.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-3 py-3">
                    <p className="font-black text-[#1E3A5F] text-sm uppercase tracking-widest">{(k.hasil_saw as any)?.masyarakat?.nama || '-'}</p>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">{(k.hasil_saw as any)?.jenis_bantuan?.nama_program || '-'}</p>
                  </td>
                  <td className="px-3 py-3 font-mono font-bold text-sm text-[#2563EB] hidden md:table-cell border-l-2 border-[#E2E8F0]">{k.kode_klaim}</td>
                  <td className="px-3 py-3 text-center border-l-2 border-[#E2E8F0]">{statusBadge(k.status_kirim_wa)}</td>
                  <td className="px-3 py-3 text-center hidden sm:table-cell border-l-2 border-[#E2E8F0]">
                    <span className={`inline-flex items-center px-2 py-1 rounded-none text-[10px] font-black uppercase tracking-widest border-2 shadow-none ${k.status_klaim === 'sudah_diambil' ? 'bg-emerald-400 text-[#1E3A5F] border-[#1E3A5F]' : 'bg-white text-[#1E3A5F] border-[#1E3A5F]'}`}>
                      {k.status_klaim === 'sudah_diambil' ? 'SUDAH DIAMBIL' : 'BELUM DIAMBIL'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-[10px] font-bold text-[#64748B] hidden md:table-cell border-l-2 border-[#E2E8F0] uppercase tracking-widest">
                    {k.tanggal_kirim_wa ? new Date(k.tanggal_kirim_wa).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="px-3 py-3 text-center border-l-2 border-[#E2E8F0] w-40">
                    <div className="flex flex-col gap-2 w-full">
                      <button onClick={() => setSimulasiWa(k)}
                        className="w-full flex justify-center items-center gap-1.5 px-2 py-1.5 rounded-none border-2 border-[#1E3A5F] bg-blue-400 text-[#1E3A5F] text-[10px] font-black hover:bg-[#1E3A5F] hover:text-white transition-colors uppercase tracking-widest shadow-none"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        SIMULASI
                      </button>
                      <button onClick={() => printQR(k)}
                        className="w-full flex justify-center items-center gap-1.5 px-2 py-1.5 rounded-none border-2 border-[#1E3A5F] bg-emerald-400 text-[#1E3A5F] text-[10px] font-black hover:bg-[#1E3A5F] hover:text-white transition-colors uppercase tracking-widest shadow-none"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        CETAK QR
                      </button>
                      {(k.status_kirim_wa === 'gagal' || k.status_kirim_wa === 'belum_dikirim') && (
                        <button onClick={() => resendWA(k)} disabled={resending === k.id}
                          className="w-full flex justify-center items-center gap-1.5 px-2 py-1.5 rounded-none border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] text-[10px] font-black hover:bg-[#1E3A5F] hover:text-white disabled:opacity-50 transition-colors uppercase tracking-widest shadow-none"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${resending === k.id ? 'animate-spin' : ''}`} />
                          KIRIM ULANG
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Simulasi WA */}
      {simulasiWa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSimulasiWa(null)} />
          <div className="relative bg-[#efeae2] rounded-none border-4 border-[#1E3A5F] shadow-[8px_8px_0px_#1E3A5F] w-full max-w-sm z-10 flex flex-col animate-in zoom-in-95 duration-200" style={{ maxHeight: '90vh' }}>
            
            {/* Header WA */}
            <div className="bg-[#00a884] px-4 py-3 border-b-4 border-[#1E3A5F] flex items-center gap-3">
              <button onClick={() => setSimulasiWa(null)} className="text-white hover:bg-black/10 p-1 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-white rounded-full border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-[#00a884]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">Admin Bantuan Sosial</h3>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>

            {/* Content Chat */}
            <div className="p-4 overflow-y-auto" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat' }}>
              <div className="bg-white p-2 rounded-lg rounded-tl-none border-2 border-[#1E3A5F] shadow-sm max-w-[90%] mb-4 relative">
                <p className="text-sm text-[#111b21] whitespace-pre-wrap font-medium">
                  Halo *{(simulasiWa.hasil_saw as any)?.masyarakat?.nama}*,
                  <br /><br />
                  Berikut adalah QR Code untuk pengambilan Bantuan Sosial program *{(simulasiWa.hasil_saw as any)?.jenis_bantuan?.nama_program}*.
                  <br /><br />
                  Kode Klaim Anda: *{simulasiWa.kode_klaim}*
                  <br /><br />
                  Silakan tunjukkan QR Code ini kepada petugas penyalur saat mengambil bantuan.
                </p>
                <span className="text-[10px] text-gray-500 float-right mt-1 font-bold">10:00</span>
              </div>

              <div className="bg-white p-2 rounded-lg rounded-tl-none border-2 border-[#1E3A5F] shadow-sm max-w-[90%] relative">
                <div className="bg-[#f0f2f5] p-2 mb-2 flex justify-center border-2 border-dashed border-[#1E3A5F]">
                  <img src={simulasiWa.qr_code_url} alt="QR Code" className="w-48 h-48 object-contain mix-blend-multiply" />
                </div>
                <button
                  onClick={() => handleDownloadQR(simulasiWa.qr_code_url, `QR_${simulasiWa.kode_klaim}.png`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#00a884] text-white text-xs font-black uppercase tracking-widest hover:bg-[#008f6f] transition-colors border-2 border-[#1E3A5F] shadow-[4px_4px_0px_#1E3A5F] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD QR CODE
                </button>
                <span className="text-[10px] text-gray-500 float-right mt-2 font-bold">10:01</span>
              </div>
            </div>
            
            {/* Input WA */}
            <div className="bg-[#f0f2f5] p-3 border-t-4 border-[#1E3A5F] flex gap-2">
              <div className="flex-1 bg-white border-2 border-[#1E3A5F] rounded-full px-4 py-2 text-sm text-gray-400 font-bold">
                Ketik pesan...
              </div>
              <div className="w-10 h-10 bg-[#00a884] rounded-full border-2 border-[#1E3A5F] flex items-center justify-center text-white">
                <Send className="w-5 h-5 ml-1" />
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
