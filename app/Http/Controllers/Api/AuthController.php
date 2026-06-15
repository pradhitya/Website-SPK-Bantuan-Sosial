<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Username atau password salah. Silakan coba kembali.'
            ], 401);
        }

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
