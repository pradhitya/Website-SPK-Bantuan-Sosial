<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>403 - Akses Ditolak</title>
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="antialiased bg-[#FAFAFA] font-[Inter,sans-serif] text-[#1E3A5F] selection:bg-[#E2E8F0]">
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Background Grid -->
        <div class="absolute inset-0" style="background-image: radial-gradient(#1E3A5F 1px, transparent 1px); background-size: 32px 32px; opacity: 0.1;"></div>

        <div class="relative z-10 w-full max-w-md bg-white border-4 border-[#1E3A5F] p-8 text-center shadow-[8px_8px_0_0_#1E3A5F]">
            <div class="mb-6">
                <h1 class="text-7xl sm:text-8xl font-black leading-none text-[#1E3A5F] tracking-tighter drop-shadow-[4px_4px_0_rgba(249,115,22,0.5)]">
                    403
                </h1>
            </div>

            <h2 class="text-xl sm:text-2xl font-black text-[#1E3A5F] uppercase tracking-widest mb-3">
                AKSES DITOLAK
            </h2>
            <p class="text-[#64748B] text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">
                ANDA TIDAK MEMILIKI IZIN UNTUK MENGAKSES HALAMAN INI.
            </p>

            <a href="/" class="flex justify-center items-center gap-2 px-6 py-3 mx-auto bg-[#1E3A5F] text-white text-[10px] font-black uppercase tracking-widest border-2 border-[#1E3A5F] hover:bg-white hover:text-[#1E3A5F] transition-colors w-full shadow-[4px_4px_0_0_#2563EB] hover:shadow-[2px_2px_0_0_#2563EB] hover:translate-y-[2px] hover:translate-x-[2px]">
                KEMBALI KE BERANDA
            </a>
        </div>
    </div>
</body>
</html>
