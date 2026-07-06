<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>500 - Terjadi Kesalahan Server</title>
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="antialiased bg-[#FAFAFA] font-[Inter,sans-serif] text-[#1E3A5F] selection:bg-rose-200 selection:text-rose-900">
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Background Grid -->
        <div class="absolute inset-0" style="background-image: radial-gradient(#1E3A5F 1px, transparent 1px); background-size: 32px 32px; opacity: 0.1;"></div>

        <div class="relative z-10 w-full max-w-md bg-white border-4 border-[#1E3A5F] p-8 text-center shadow-[8px_8px_0_0_#1E3A5F]">
            <div class="mb-6">
                <h1 class="text-7xl sm:text-8xl font-black leading-none text-[#1E3A5F] tracking-tighter drop-shadow-[4px_4px_0_rgba(225,29,72,0.5)]">
                    500
                </h1>
            </div>

            <h2 class="text-xl sm:text-2xl font-black text-[#1E3A5F] uppercase tracking-widest mb-3">
                SERVER SIBUK
            </h2>
            <p class="text-[#64748B] text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">
                TERJADI KESALAHAN INTERNAL PADA SERVER KAMI. SILAKAN COBA LAGI NANTI.
            </p>

            <button onclick="window.location.reload()" class="group flex justify-center items-center gap-2 px-6 py-3 mx-auto bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest border-2 border-[#1E3A5F] hover:bg-white hover:text-rose-600 transition-colors w-full shadow-[4px_4px_0_0_#1E3A5F] hover:shadow-[2px_2px_0_0_#1E3A5F] hover:translate-y-[2px] hover:translate-x-[2px]">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                MUAT ULANG HALAMAN
            </button>
        </div>
    </div>
</body>
</html>
