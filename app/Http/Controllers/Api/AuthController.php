<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends ApiController
{
    /**
     * Authenticate user and issue API bearer token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return $this->errorResponse('Invalid email or password credentials.', null, 401);
        }

        if ($user->status !== 'active') {
            return $this->errorResponse('Account is currently inactive or suspended.', null, 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $this->logActivity("User {$user->name} logged in", 'Authentication');

        return $this->successResponse([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 'Login successful.');
    }

    /**
     * Register a new user account.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] = $validated['role'] ?? 'student';
        $validated['status'] = 'active';

        $user = User::create($validated);

        // Automatically initialize role profile
        if ($user->role === 'student') {
            \App\Models\StudentProfile::create([
                'user_id'          => $user->id,
                'admission_number' => 'ADM-' . date('Y') . '-' . str_pad((string)$user->id, 4, '0', STR_PAD_LEFT),
                'roll_number'      => 'R-' . str_pad((string)$user->id, 3, '0', STR_PAD_LEFT),
                'admission_date'   => now()->toDateString(),
            ]);
        } elseif ($user->role === 'teacher') {
            \App\Models\TeacherProfile::create([
                'user_id'      => $user->id,
                'employee_id'  => 'EMP-' . str_pad((string)$user->id, 4, '0', STR_PAD_LEFT),
                'joining_date' => now()->toDateString(),
            ]);
        } elseif ($user->role === 'parent') {
            \App\Models\ParentProfile::create([
                'user_id' => $user->id,
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $this->logActivity("Registered new user {$user->name} with role {$user->role}", 'Authentication');

        return $this->successResponse([
            'user'  => new UserResource($user->fresh(['studentProfile', 'teacherProfile', 'parentProfile'])),
            'token' => $token,
        ], 'Registration successful.', 201);
    }

    /**
     * Invalidate current token and log out.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        $this->logActivity("User {$user->name} logged out", 'Authentication');

        return $this->successResponse(null, 'Successfully logged out.');
    }

    /**
     * Retrieve the authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['studentProfile', 'teacherProfile', 'parentProfile']);
        return $this->successResponse(new UserResource($user), 'Current user profile retrieved.');
    }
}
