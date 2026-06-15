import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk Sistem" />

            <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Masuk ke Akun Anda</h3>
                <p className="text-sm text-gray-500">Silakan masukkan kredensial Anda untuk melanjutkan.</p>
            </div>

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-800 border border-green-200 flex items-center gap-3">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="username" value="Username" className="text-gray-700 font-semibold mb-1.5" />

                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                        </div>
                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            className="block w-full rounded-lg border-gray-300 pl-10 py-2.5 text-sm focus:border-blue-700 focus:ring-blue-700 transition-colors"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('username', e.target.value)}
                            placeholder="Masukkan username"
                        />
                    </div>
                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-gray-700 font-semibold mb-1.5" />

                    <div className="relative">
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full rounded-lg border-gray-300 pl-10 py-2.5 text-sm focus:border-blue-700 focus:ring-blue-700 transition-colors"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-gray-300 text-blue-700 shadow-sm focus:ring-blue-700"
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Ingat saya
                        </span>
                    </label>
                    
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                        >
                            Lupa sandi?
                        </Link>
                    )}
                </div>

                <div>
                    <PrimaryButton 
                        className="w-full justify-center py-2.5 text-sm font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-700/30 active:bg-blue-900 transition-all shadow-md shadow-blue-700/20" 
                        disabled={processing}
                    >
                        MASUK
                    </PrimaryButton>
                </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Informasi Akses Demo</p>
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/50 px-4 py-3 rounded-lg border border-gray-100">
                        <span className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">Administrator</span>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span className="bg-white px-2 py-1 rounded text-blue-700 font-medium border border-gray-200">admin</span>
                            <span className="text-gray-300">/</span>
                            <span className="bg-white px-2 py-1 rounded text-gray-600 border border-gray-200">admin123</span>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/50 px-4 py-3 rounded-lg border border-gray-100">
                        <span className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">Kepala Desa</span>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span className="bg-white px-2 py-1 rounded text-blue-700 font-medium border border-gray-200">kades</span>
                            <span className="text-gray-300">/</span>
                            <span className="bg-white px-2 py-1 rounded text-gray-600 border border-gray-200">kades123</span>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
