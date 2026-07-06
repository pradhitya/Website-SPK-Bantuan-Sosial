import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { User } from '../data';

interface LoginProps {
  onLogin: (user: User) => void;
  onBack?: () => void;
}

export function Login({ onLogin, onBack }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('/api/login', { username, password });
      if (response.data && response.data.user) {
        onLogin(response.data.user);
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Terjadi kesalahan. Silakan coba kembali.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative font-[Inter,sans-serif] p-4 overflow-hidden selection:bg-[#E2E8F0]">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 md:top-8 md:left-8 z-50 text-[#1E3A5F] hover:text-[#2563EB] flex items-center gap-2 text-[10px] font-bold transition-colors uppercase tracking-widest"
        >
          &laquo; KEMBALI KE PORTAL
        </button>
      )}

      {/* Form container */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 relative z-10 animate-fade-in-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#1E3A5F] border-2 border-[#1E3A5F] mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1E3A5F] uppercase mb-2 leading-none">SPK Bansos</h1>
          <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest">PEMERINTAH DESA SUKAMAJU</p>
        </div>

        <div className="bg-white border-4 border-[#1E3A5F] p-8 sm:p-10 relative z-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="mb-8 text-center border-b-2 border-[#E2E8F0] pb-4">
            <h3 className="text-lg font-black text-[#1E3A5F] uppercase tracking-widest">Login Pegawai</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-none border-2 border-[#E2E8F0] bg-transparent text-[#1E3A5F] font-bold focus:bg-white focus:outline-none focus:ring-0 focus:border-[#1E3A5F] transition-colors"
                placeholder="MASUKKAN USERNAME"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-11 rounded-none border-2 border-[#E2E8F0] bg-transparent text-[#1E3A5F] font-bold focus:bg-white focus:outline-none focus:ring-0 focus:border-[#1E3A5F] transition-colors"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E3A5F] transition-colors focus:outline-none"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[#FAFAFA] border-2 border-[#1E3A5F] text-[#1E3A5F] p-4 text-xs font-bold uppercase tracking-widest flex items-start gap-3">
                <svg className="w-5 h-5 text-[#1E3A5F] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="mt-0.5">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-none font-bold text-white uppercase tracking-widest text-xs transition-colors disabled:opacity-70 bg-[#1E3A5F] hover:bg-[#2563EB] border-2 border-[#1E3A5F] hover:border-[#2563EB] flex justify-center items-center mt-4"
            >
              {loading ? 'MEMPROSES...' : 'MASUK KE SISTEM'}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center text-[10px] font-bold text-[#64748B] uppercase tracking-widest relative z-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          &copy; {new Date().getFullYear()} PEMERINTAH DESA SUKAMAJU
        </div>
      </div>
    </div>
  );
}
