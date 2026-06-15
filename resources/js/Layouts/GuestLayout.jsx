import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            {/* Left side - Branding (hidden on small screens) */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-900 relative overflow-hidden flex-col justify-center items-center">
                {/* Formal geometric background */}
                <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                
                <div className="z-10 px-12 text-center text-white max-w-lg">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8 shadow-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-4">Sistem Pendukung Keputusan</h1>
                    <p className="text-lg text-blue-200 font-medium mb-2">Penerima Bantuan Sosial</p>
                    <div className="mt-8 pt-8 border-t border-blue-800/50">
                        <p className="text-sm text-blue-300">Pemerintah Desa Sukamaju &mdash; Metode Simple Additive Weighting (SAW)</p>
                    </div>
                </div>
            </div>

            {/* Right side - Form container */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                <div className="w-full max-w-md">
                    {/* Mobile Branding (only visible on small screens) */}
                    <div className="lg:hidden mb-10 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-900 mb-4 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">SPK Bansos</h2>
                        <p className="text-sm text-gray-500 mt-1">Desa Sukamaju</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
                        {children}
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} SPK Bansos Desa Sukamaju.<br />Hak Cipta Dilindungi.
                    </div>
                </div>
            </div>
        </div>
    );
}
