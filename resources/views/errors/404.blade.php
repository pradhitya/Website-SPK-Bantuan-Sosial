<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - Halaman Tidak Ditemukan</title>
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="antialiased bg-slate-50 text-slate-800 selection:bg-blue-200 selection:text-blue-900">
    <div class="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
        <!-- Background Decorations -->
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3"></div>

        <div class="relative z-10 max-w-2xl w-full text-center">
            <div class="mb-8 flex flex-col items-center">
                <h1 class="text-[150px] sm:text-[200px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-800 drop-shadow-sm select-none">
                    404
                </h1>
            </div>

            <h2 class="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight mb-4">Ups! Kehilangan Arah?</h2>
            <p class="text-slate-500 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
                Halaman yang Anda cari mungkin telah dihapus, diubah namanya, atau tidak pernah ada sejak awal.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/" class="group flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali ke Beranda
                </a>
                <button onclick="window.history.back()" class="flex items-center gap-2 px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-blue-600 hover:-translate-y-1 transition-all duration-300">
                    Halaman Sebelumnya
                </button>
            </div>

            <div class="mt-16 text-slate-400 font-medium text-sm">
                SPK Bansos - Desa Sukamaju &copy; {{ date('Y') }}
            </div>
        </div>
    </div>
</body>
</html>
