<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends ApiController
{
    /**
     * Authenticate user and issue API bearer token.
     * Protected by per-email+IP rate limiting (5 attempts / 5 min window).
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        // --- Rate Limiting (FLAW 2 & 8 fix) ---
        $email = trim(strtolower($credentials['email']));
        $throttleKey = 'login:' . $email . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return $this->errorResponse(
                "Too many login attempts. Please try again in {$seconds} seconds.",
                null,
                429
            );
        }

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            // Increment the failed attempt counter (decays after 5 minutes)
            RateLimiter::hit($throttleKey, 300);
            return $this->errorResponse('Invalid email or password credentials.', null, 401);
        }

        if ($user->status !== 'active') {
            return $this->errorResponse('Account is currently inactive or suspended.', null, 403);
        }

        // Clear failed attempts on successful login
        RateLimiter::clear($throttleKey);

        // --- Named device token with 24-hour expiry (FLAW 4 & 10 fix) ---
        $deviceName = $request->input('device_name', 'web');
        $token = $user->createToken($deviceName, ['*'], now()->addHours(24))->plainTextToken;

        $this->logActivity("User {$user->name} logged in", 'Authentication', $user->id);

        return $this->successResponse([
            'user'       => new UserResource($user),
            'token'      => $token,
            'expires_in' => 86400, // seconds (24 h)
        ], 'Login successful.');
    }

    /**
     * Register a new user account.
     * Role is always forced to 'student' — admins assign roles via the admin panel.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();
        // FLAW 1 fix: role is NEVER accepted from the client; always default to student.
        $validated['role']   = 'student';
        $validated['status'] = 'active';
        // Password is auto-hashed by the User model's 'hashed' cast — no manual Hash::make() needed.

        $user = User::create($validated);

        // Automatically initialize student profile
        \App\Models\StudentProfile::create([
            'user_id'          => $user->id,
            'admission_number' => 'ADM-' . date('Y') . '-' . str_pad((string) $user->id, 4, '0', STR_PAD_LEFT),
            'roll_number'      => 'R-' . str_pad((string) $user->id, 3, '0', STR_PAD_LEFT),
            'admission_date'   => now()->toDateString(),
        ]);

        $this->logActivity("Registered new user {$user->name}", 'Authentication', $user->id);

        return $this->successResponse([
            'user' => new UserResource($user->fresh(['studentProfile'])),
        ], 'Registration successful. Please sign in with your credentials.', 201);
    }

    /**
     * Invalidate current token and log out.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        $this->logActivity("User {$user->name} logged out", 'Authentication', $user->id);

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

    /**
     * Set/Reset password using the email verification token.
     */
    public function setPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => ['required', 'string'],
            'email'    => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $email = trim(strtolower($request->input('email')));
        $token = $request->input('token');

        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record || !Hash::check($token, $record->token)) {
            return $this->errorResponse('Invalid or expired password setup link. Please contact administration.', null, 400);
        }

        // Token expiry: 60 minutes
        if (now()->subMinutes(60)->greaterThan($record->created_at)) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return $this->errorResponse('This password setup link has expired. Please ask administration to re-invite you.', null, 400);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            return $this->notFoundResponse('User account not found.');
        }

        // Password is automatically hashed by User model casts
        $user->password = $request->input('password');
        $user->status = 'active';
        $user->email_verified_at = now();
        $user->save();

        // Delete used token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Issue bearer token so the student can immediately proceed to dashboard
        $deviceName = $request->input('device_name', 'student-portal');
        $authToken = $user->createToken($deviceName, ['*'], now()->addHours(24))->plainTextToken;

        $this->logActivity("User {$user->name} set their password and activated account", 'Authentication', $user->id);

        return $this->successResponse([
            'user'       => new UserResource($user->fresh(['studentProfile'])),
            'token'      => $authToken,
            'expires_in' => 86400,
        ], 'Password configured successfully. Welcome to your student dashboard!');
    }
}
