<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>500 - Terjadi Kesalahan Server</title>
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="antialiased bg-slate-50 text-slate-800 selection:bg-rose-200 selection:text-rose-900">
    <div class="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
        <!-- Background Decorations -->
        <div class="absolute top-0 left-0 w-[500px] h-[500px] bg-rose-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 -translate-x-1/3"></div>
        <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-3xl opacity-50 translate-y-1/3 translate-x-1/3"></div>

        <div class="relative z-10 max-w-2xl w-full text-center">
            <div class="mb-8 flex flex-col items-center">
                <h1 class="text-[150px] sm:text-[200px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-rose-500 to-red-800 drop-shadow-sm select-none">
                    500
                </h1>
            </div>

            <h2 class="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight mb-4">Waduh! Server Sedang Sibuk</h2>
            <p class="text-slate-500 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
                Terjadi kesalahan internal pada server kami. Teknisi kami mungkin sudah mengetahui hal ini dan sedang memperbaikinya.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onclick="window.location.reload()" class="group flex items-center gap-2 px-8 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-600/30 hover:bg-rose-700 hover:shadow-rose-600/40 hover:-translate-y-1 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Muat Ulang Halaman
                </button>
                <a href="/" class="flex items-center gap-2 px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-rose-600 hover:-translate-y-1 transition-all duration-300">
                    Kembali ke Beranda
                </a>
            </div>

            <div class="mt-16 text-slate-400 font-medium text-sm">
                SPK Bansos - Desa Sukamaju &copy; {{ date('Y') }}
            </div>
        </div>
    </div>
</body>
</html>
