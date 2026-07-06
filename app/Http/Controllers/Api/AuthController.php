<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $throttleKey = Str::lower($request->input('username')) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => 'Terlalu banyak percobaan. Silakan coba kembali dalam ' . $seconds . ' detik.'
            ], 429);
        }

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60); // block for 60 seconds after 5 fails

            return response()->json([
                'message' => 'Username atau password salah. Silakan coba kembali.'
            ], 401);
        }

        RateLimiter::clear($throttleKey);

        // Create a session for the user so auth middleware passes
        \Illuminate\Support\Facades\Auth::login($user);

        // Return user data matching the frontend User interface
        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                // Do not return password hash
                'nama' => $user->nama,
                'jabatan' => $user->jabatan,
                'role' => $user->role,
            ]
        ]);
    }
}
