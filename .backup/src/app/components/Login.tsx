import { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { USERS, User } from '../data';

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const user = USERS.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Username atau password salah. Silakan coba kembali.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1e3a6b 0%, #2563eb 60%, #1d4ed8 100%)' }}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="px-8 pt-10 pb-6 text-center" style={{ background: 'linear-gradient(135deg, #1e3a6b, #1d4ed8)' }}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/30">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-white text-xl font-semibold leading-snug">
                Sistem Pendukung Keputusan
              </h1>
              <p className="text-blue-200 text-sm mt-1">Penerima Bantuan Sosial (Bansos)</p>
              <p className="text-blue-300 text-xs mt-1 font-medium tracking-wide">DESA SUKAMAJU — METODE SAW</p>
            </div>

            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      required
                      className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-white transition-all disabled:opacity-70"
                  style={{ background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e3a6b, #2563eb)' }}
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
              </form>

              <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-2">Akun Demo:</p>
                <div className="space-y-1">
                  <p className="text-xs text-blue-600">
                    <span className="font-medium">Admin:</span> username: <code className="bg-blue-100 px-1 rounded">admin</code> / password: <code className="bg-blue-100 px-1 rounded">admin123</code>
                  </p>
                  <p className="text-xs text-blue-600">
                    <span className="font-medium">Kepala Desa:</span> username: <code className="bg-blue-100 px-1 rounded">kades</code> / password: <code className="bg-blue-100 px-1 rounded">kades123</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-blue-200 text-xs mt-6">
            © 2025 Sistem Informasi Desa Sukamaju. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}
